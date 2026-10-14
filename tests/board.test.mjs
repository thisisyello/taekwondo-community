import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { isPostId, mapComment, mapPost } from "../src/utils/boardData.ts";
import { filterPostsBySearch, sortPosts } from "../src/utils/postList.ts";
import { getCommentContentError, getPostFormErrors } from "../src/utils/boardValidation.ts";

test("comment validation rejects blank and overlong content", () => {
    assert.ok(getCommentContentError(" \n\t"));
    assert.ok(getCommentContentError("a".repeat(2001)));
    assert.equal(getCommentContentError("a".repeat(2000)), undefined);
    assert.equal(getCommentContentError("  Comment  "), undefined);
    assert.equal(getCommentContentError("\u{1f600}".repeat(2000)), undefined);
});

test("post validation matches database length limits and rejects blank values", () => {
    assert.ok(getPostFormErrors(" \n\t", "Content").title);
    assert.ok(getPostFormErrors("Title", " \n\t").content);
    assert.ok(getPostFormErrors("a".repeat(201), "Content").title);
    assert.ok(getPostFormErrors("Title", "a".repeat(20001)).content);
    assert.equal(getPostFormErrors("a".repeat(200), "a".repeat(20000)).title, undefined);
    assert.equal(getPostFormErrors("a".repeat(200), "a".repeat(20000)).content, undefined);
    assert.equal(getPostFormErrors("  Title  ", "  Content  ").title, undefined);
    assert.equal(getPostFormErrors("\u{1f600}".repeat(200), "Content").title, undefined);
});

test("board rows map UUIDs, deleted authors, dates and stored counts to UI data", () => {
    const id = "00000000-0000-0000-0000-000000000001";
    const row = {
        id, author_id: id, board: "free", title: "Title", content: "Content", view_count: 12,
        created_at: "2026-10-13T00:00:00Z", updated_at: "2026-10-13T00:00:00Z",
        author: { id, nickname: "Member" }, comments: [{ count: 2 }],
    };
    const post = mapPost(row);
    assert.equal(post.id, id);
    assert.equal(post.viewCount, 12);
    assert.equal(post.likeCount, 0);
    assert.equal(post.isLiked, false);
    assert.equal(mapPost(row, { post_id: id, like_count: 3, is_liked: true }).likeCount, 3);
    assert.equal(mapPost(row, { post_id: id, like_count: 3, is_liked: true }).isLiked, true);
    assert.equal(post.author.nickname, "Member");
    assert.deepEqual(mapPost({ ...row, author_id: null, author: null }).author, { id: null, nickname: "탈퇴한 회원" });
    assert.equal(mapComment({ ...row, post_id: id }).postId, id);
    assert.equal(mapComment({ ...row, post_id: id, author_id: null, author: null }).author.id, null);
    assert.equal(isPostId(id), true);
    assert.equal(isPostId("1"), false);
    assert.equal(isPostId("new"), false);
    assert.equal(filterPostsBySearch([post], "author", "member").length, 1);
    const other = { ...post, id: "00000000-0000-0000-0000-000000000002" };
    assert.equal(sortPosts([post, other], "mostCommented", { [id]: 1, [other.id]: 3 })[0].id, other.id);
});

test("board migration enforces public reads, ownership, protected columns and deletion rules", async () => {
    const db = new PGlite();
    const firstId = "00000000-0000-0000-0000-000000000001";
    const secondId = "00000000-0000-0000-0000-000000000002";
    const missingId = "00000000-0000-0000-0000-000000000099";
    const asMember = async (id) => {
        await db.exec("reset role; set role authenticated");
        await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
    };

    try {
        await db.exec(`
            create role anon;
            create role authenticated;
            create schema auth;
            create table auth.users (id uuid primary key, raw_user_meta_data jsonb);
            create function auth.uid() returns uuid language sql stable as $$
                select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
            $$;
            grant usage on schema public, auth to anon, authenticated;
            grant execute on function auth.uid() to anon, authenticated;
            alter default privileges in schema public grant all on tables to anon, authenticated;
        `);
        for (const filename of ["202610070001_member_profiles.sql", "202610130001_board_posts_comments.sql", "202610140001_post_view_count.sql"]) {
            await db.exec(await readFile(new URL(`../supabase/migrations/${filename}`, import.meta.url), "utf8"));
        }
        for (const [id, nickname] of [[firstId, "First"], [secondId, "Second"]]) {
            await db.query("insert into auth.users values ($1, $2)", [id, JSON.stringify({ nickname, name: nickname, birth_date: "2000-01-01", phone_number: "010-1234-5678" })]);
        }

        await asMember(firstId);
        const post = (await db.query("insert into public.posts(board, title, content) values ('free', 'Title', 'Content') returning *")).rows[0];
        assert.match(post.id, /^[0-9a-f-]{36}$/);
        assert.equal(post.author_id, firstId);
        assert.equal(post.view_count, 0);
        assert.equal(post.created_at.getTime(), post.updated_at.getTime());
        const ownComment = (await db.query("insert into public.comments(post_id, content) values ($1, 'Comment') returning *", [post.id])).rows[0];
        assert.equal(ownComment.author_id, firstId);

        await assert.rejects(db.query("insert into public.posts(author_id, board, title, content) values ($1, 'free', 'Fake', 'Fake')", [secondId]));
        await assert.rejects(db.query("insert into public.comments(post_id, author_id, content) values ($1, $2, 'Fake')", [post.id, secondId]));
        await assert.rejects(db.query("insert into public.posts(author_id, board, title, content) values (null, 'free', 'Fake', 'Fake')"));
        for (const values of [["all", "Title", "Content"], ["free", " \n\t", "Content"], ["free", "Title", " \n\t"], ["free", "x".repeat(201), "Content"], ["free", "Title", "x".repeat(20001)]]) {
            await assert.rejects(db.query("insert into public.posts(board, title, content) values ($1, $2, $3)", values));
        }
        await assert.rejects(db.query("insert into public.comments(post_id, content) values ($1, 'Missing')", [missingId]));
        await assert.rejects(db.query("insert into public.comments(post_id, content) values ($1, ' \n\t')", [post.id]));
        await assert.rejects(db.query("insert into public.comments(post_id, content) values ($1, $2)", [post.id, "x".repeat(2001)]));
        await assert.rejects(db.query("insert into public.posts(board, title, content, view_count) values ('free', 'Title', 'Content', 100)"));
        await assert.rejects(db.query("insert into public.posts(board, title, content, created_at) values ('free', 'Title', 'Content', '2000-01-01')"));
        for (const column of ["id", "author_id"]) {
            await assert.rejects(db.query(`update public.posts set ${column} = $1 where id = $2`, [secondId, post.id]));
        }
        await assert.rejects(db.query("update public.posts set view_count = 100 where id = $1", [post.id]));
        await assert.rejects(db.query("update public.posts set updated_at = '2000-01-01' where id = $1", [post.id]));
        await assert.rejects(db.query("update public.comments set post_id = $1 where id = $2", [post.id, ownComment.id]));
        await assert.rejects(db.query("update public.comments set author_id = $1 where id = $2", [secondId, ownComment.id]));
        await assert.rejects(db.query("update public.comments set updated_at = '2000-01-01' where id = $1", [ownComment.id]));
        await assert.rejects(db.query("truncate public.posts cascade"));

        const unchanged = (await db.query("update public.posts set title = title where id = $1 returning updated_at", [post.id])).rows[0];
        assert.equal(unchanged.updated_at.getTime(), post.updated_at.getTime());
        const changed = (await db.query("update public.posts set title = 'Edited', board = 'question' where id = $1 returning *", [post.id])).rows[0];
        assert.ok(changed.updated_at > post.updated_at);
        assert.equal(changed.created_at.getTime(), post.created_at.getTime());
        const editedComment = (await db.query("update public.comments set content = 'Edited comment' where id = $1 returning *", [ownComment.id])).rows[0];
        assert.ok(editedComment.updated_at > ownComment.updated_at);

        await asMember(secondId);
        assert.equal((await db.query("update public.posts set title = 'Hijacked' where id = $1 returning id", [post.id])).rows.length, 0);
        assert.equal((await db.query("delete from public.posts where id = $1 returning id", [post.id])).rows.length, 0);
        assert.equal((await db.query("update public.comments set content = 'Hijacked' where id = $1 returning id", [ownComment.id])).rows.length, 0);
        assert.equal((await db.query("delete from public.comments where id = $1 returning id", [ownComment.id])).rows.length, 0);
        const otherComment = (await db.query("insert into public.comments(post_id, content) values ($1, 'Other member') returning id", [post.id])).rows[0];
        assert.equal((await db.query("delete from public.comments where id = $1 returning id", [otherComment.id])).rows.length, 1);
        await db.query("insert into public.comments(post_id, content) values ($1, 'Other member retained')", [post.id]);

        await db.exec("reset role; set role anon");
        assert.equal((await db.query("select * from public.posts")).rows.length, 1);
        assert.equal((await db.query("select * from public.comments")).rows.length, 2);
        const firstView = (await db.query("select public.increment_post_view_count($1) as count", [post.id])).rows[0];
        assert.equal(firstView.count, 1);
        assert.equal((await db.query("select public.increment_post_view_count($1) as count", [post.id])).rows[0].count, 2);
        assert.equal((await db.query("select public.increment_post_view_count($1) as count", [missingId])).rows[0].count, null);
        assert.equal((await db.query("select updated_at from public.posts where id = $1", [post.id])).rows[0].updated_at.getTime(), changed.updated_at.getTime());
        await assert.rejects(db.query("update public.posts set view_count = 100 where id = $1", [post.id]));
        await assert.rejects(db.query("insert into public.posts(board, title, content) values ('free', 'Anonymous', 'Anonymous')"));
        await assert.rejects(db.query("insert into public.comments(post_id, content) values ($1, 'Anonymous')", [post.id]));
        await assert.rejects(db.query("update public.posts set title = 'Anonymous'"));
        await assert.rejects(db.query("delete from public.comments"));
        await assert.rejects(db.query("select * from public.account_details"));
        await asMember("");
        await assert.rejects(db.query("insert into public.posts(board, title, content) values ('free', 'No session', 'No session')"));

        await db.exec("reset role");
        await assert.rejects(db.query("update public.posts set view_count = -1 where id = $1", [post.id]));
        const countUpdated = (await db.query("update public.posts set view_count = view_count + 1 where id = $1 returning updated_at", [post.id])).rows[0];
        assert.equal(countUpdated.updated_at.getTime(), changed.updated_at.getTime());
        await db.query("delete from auth.users where id = $1", [firstId]);
        const retainedPost = (await db.query("select * from public.posts where id = $1", [post.id])).rows[0];
        assert.equal(retainedPost.author_id, null);
        assert.equal(retainedPost.updated_at.getTime(), changed.updated_at.getTime());
        assert.equal((await db.query("select author_id from public.comments where id = $1", [ownComment.id])).rows[0].author_id, null);
        await asMember(secondId);
        assert.equal((await db.query("select public.increment_post_view_count($1) as count", [post.id])).rows[0].count, 4);
        assert.equal((await db.query("delete from public.posts where id = $1 returning id", [post.id])).rows.length, 0);
        await db.exec("reset role");
        await db.query("delete from public.posts where id = $1", [post.id]);
        assert.equal((await db.query("select * from public.comments")).rows.length, 0);

        await asMember(secondId);
        const deletablePost = (await db.query("insert into public.posts(board, title, content) values ('parent', 'Delete', 'Delete') returning id")).rows[0];
        await db.query("insert into public.comments(post_id, content) values ($1, 'Delete')", [deletablePost.id]);
        assert.equal((await db.query("delete from public.posts where id = $1 returning id", [deletablePost.id])).rows.length, 1);
        assert.equal((await db.query("select * from public.comments")).rows.length, 0);
    } finally {
        await db.close();
    }
});
