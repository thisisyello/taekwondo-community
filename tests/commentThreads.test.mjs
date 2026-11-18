import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { flattenCommentThreads, removeCommentBranch } from "../src/utils/commentThreads.ts";
import { mapComment } from "../src/utils/boardData.ts";

const comment = (id, parentId = null, createdAt = "2026-11-18T00:00:00Z") => ({
    id, parentId, postId: "post", content: id, author: { id: "member", nickname: id }, createdAt, updatedAt: createdAt,
});

test("thread ordering keeps branches together, labels direct parents and removes only descendants", () => {
    const comments = [comment("root"), comment("reply", "root"), comment("nested", "reply"), comment("sibling", "root"), comment("other")];
    const rows = flattenCommentThreads(comments);
    assert.deepEqual(rows.map(({ comment }) => comment.id), ["other", "root", "reply", "nested", "sibling"]);
    assert.deepEqual(rows.map(({ depth }) => depth), [0, 0, 1, 2, 1]);
    assert.equal(rows[3].parentAuthor, "reply");
    assert.deepEqual(removeCommentBranch(comments, "reply").map(({ id }) => id), ["root", "sibling", "other"]);
    assert.deepEqual(removeCommentBranch(comments, "root").map(({ id }) => id), ["other"]);
    assert.equal(removeCommentBranch(comments, "missing").length, 5);
    const row = { id: "id", post_id: "post", parent_id: "parent", author_id: null, author: null, content: "Content", created_at: "date", updated_at: "date" };
    assert.equal(mapComment(row).parentId, "parent");
    assert.equal(flattenCommentThreads([comment("orphan", "missing")])[0].depth, 0);
    const deep = Array.from({ length: 3000 }, (_, index) => comment(String(index), index ? String(index - 1) : null));
    assert.equal(flattenCommentThreads(deep).at(-1).depth, 2999);
    assert.equal(removeCommentBranch(deep, "0").length, 0);
});

test("thread migration preserves comments, enforces ownership and cascades across different authors", async () => {
    const db = new PGlite();
    const firstId = "00000000-0000-0000-0000-000000000001";
    const secondId = "00000000-0000-0000-0000-000000000002";
    const missingId = "00000000-0000-0000-0000-000000000099";
    const asMember = async (id) => {
        await db.exec("reset role; set role authenticated");
        await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
    };
    const insert = async (postId, parentId = null, content = "Comment") => (await db.query(
        "insert into public.comments(post_id,parent_id,content) values($1,$2,$3) returning *", [postId, parentId, content],
    )).rows[0];
    const deleteRow = async (id) => (await db.query("delete from public.comments where id=$1 returning id", [id])).rows;
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
        `);
        for (const file of ["202610070001_member_profiles.sql", "202610130001_board_posts_comments.sql"]) {
            await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), "utf8"));
        }
        for (const [id, nickname] of [[firstId, "First"], [secondId, "Second"]]) {
            await db.query("insert into auth.users values($1,$2)", [id, JSON.stringify({ nickname, name: nickname, birth_date: "2000-01-01", phone_number: "01012345678" })]);
        }
        await asMember(firstId);
        const post = (await db.query("insert into public.posts(board,title,content) values('free','Title','Content') returning id")).rows[0];
        const otherPost = (await db.query("insert into public.posts(board,title,content) values('free','Other','Content') returning id")).rows[0];
        const legacy = (await db.query("insert into public.comments(post_id,content) values($1,'Legacy') returning *", [post.id])).rows[0];
        await db.exec("reset role");
        await db.exec(await readFile(new URL("../supabase/migrations/202611180001_comment_threads.sql", import.meta.url), "utf8"));
        const preserved = (await db.query("select * from public.comments where id=$1", [legacy.id])).rows[0];
        assert.equal(preserved.content, "Legacy");
        assert.equal(preserved.parent_id, null);
        assert.equal(preserved.updated_at.getTime(), legacy.updated_at.getTime());

        await asMember(firstId);
        const siblingRoot = await insert(post.id);
        const otherRoot = await insert(otherPost.id);
        await asMember(secondId);
        const child = await insert(post.id, legacy.id, "Child by another member");
        const siblingChild = await insert(post.id, siblingRoot.id);
        assert.equal(child.author_id, secondId);
        await assert.rejects(insert(post.id, otherRoot.id));
        await assert.rejects(insert(post.id, missingId));
        await assert.rejects(db.query("update public.comments set parent_id=$1 where id=$2", [siblingRoot.id, child.id]));
        assert.equal((await db.query("update public.comments set content='Hijacked' where id=$1 returning id", [legacy.id])).rows.length, 0);
        assert.equal((await deleteRow(legacy.id)).length, 0);

        await asMember(firstId);
        const grandchild = await insert(post.id, child.id);
        await asMember(secondId);
        const greatGrandchild = await insert(post.id, grandchild.id);
        const unchanged = (await db.query("update public.comments set content=content where id=$1 returning updated_at", [child.id])).rows[0];
        assert.equal(unchanged.updated_at.getTime(), child.updated_at.getTime());
        const edited = (await db.query("update public.comments set content='Edited' where id=$1 returning *", [child.id])).rows[0];
        assert.equal(edited.parent_id, legacy.id);
        assert.ok(edited.updated_at > child.updated_at);
        assert.equal(edited.created_at.getTime(), child.created_at.getTime());
        await assert.rejects(db.query("update public.comments set content=' ' where id=$1", [child.id]));
        assert.equal((await deleteRow(child.id)).length, 1);
        for (const id of [child.id, grandchild.id, greatGrandchild.id]) {
            assert.equal((await db.query("select id from public.comments where id=$1", [id])).rows.length, 0);
        }
        assert.equal((await db.query("select id from public.comments where id=$1", [legacy.id])).rows.length, 1);
        const secondChild = await insert(post.id, legacy.id);
        await asMember(firstId);
        await insert(post.id, secondChild.id);
        assert.equal((await deleteRow(legacy.id)).length, 1);
        assert.equal((await db.query("select id from public.comments where post_id=$1", [post.id])).rows.length, 2);
        assert.equal((await db.query("select id from public.comments where id=$1", [siblingChild.id])).rows.length, 1);
        await assert.rejects(insert(post.id, secondChild.id));

        await db.exec("reset role; set role anon");
        assert.equal((await db.query("select * from public.comments")).rows.length, 3);
        await assert.rejects(insert(post.id, siblingRoot.id));
        await assert.rejects(deleteRow(siblingRoot.id));
        await db.exec("reset role");
        await assert.rejects(db.query("update public.comments set parent_id=$1 where id=$2", [siblingChild.id, siblingRoot.id]));
        await assert.rejects(db.query("update public.comments set post_id=$1 where id=$2", [otherPost.id, siblingRoot.id]));
        await assert.rejects(db.query("insert into public.comments(id,post_id,parent_id,content) values($1,$2,$1,'Self')", [missingId, post.id]));
        await assert.rejects(db.query("insert into public.comments(id,post_id,parent_id,content) values($1,$3,$2,'Cycle'),($2,$3,$1,'Cycle')", [missingId, legacy.id, post.id]));
        await asMember(firstId);
        await db.query("delete from public.posts where id=$1", [post.id]);
        assert.equal((await db.query("select * from public.comments where post_id=$1", [post.id])).rows.length, 0);
        assert.equal((await db.query("select * from public.comments where post_id=$1", [otherPost.id])).rows.length, 1);
    } finally { await db.close(); }
});
