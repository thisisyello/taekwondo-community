import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { parsePostLikeState } from "../src/utils/boardData.ts";

test("like responses validate counts and own state", () => {
    const state = { post_id: "00000000-0000-0000-0000-000000000001", like_count: 2, is_liked: true };
    assert.deepEqual(parsePostLikeState(state), state);
    for (const value of [null, { ...state, like_count: -1 }, { ...state, like_count: 1.5 }, { ...state, is_liked: "true" }, { ...state, post_id: "1" }]) {
        assert.throws(() => parsePostLikeState(value));
    }
});

test("likes enforce per-member uniqueness, private identities, idempotent states and cascades", async () => {
    const db = new PGlite();
    const firstId = "00000000-0000-0000-0000-000000000001";
    const secondId = "00000000-0000-0000-0000-000000000002";
    const missingId = "00000000-0000-0000-0000-000000000099";
    const asMember = async (id) => {
        await db.exec("reset role; set role authenticated");
        await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
    };
    const setLike = async (id, liked) => (await db.query("select * from public.set_post_like($1, $2)", [id, liked])).rows[0];
    const state = async (id) => (await db.query("select * from public.get_post_like_states(array[$1::uuid])", [id])).rows[0];
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
        for (const filename of ["202610070001_member_profiles.sql", "202610130001_board_posts_comments.sql", "202610140001_post_view_count.sql", "202610140002_post_likes.sql"]) {
            await db.exec(await readFile(new URL(`../supabase/migrations/${filename}`, import.meta.url), "utf8"));
        }
        for (const [id, nickname] of [[firstId, "First"], [secondId, "Second"]]) {
            await db.query("insert into auth.users values ($1, $2)", [id, JSON.stringify({ nickname, name: nickname, birth_date: "2000-01-01", phone_number: "010-1234-5678" })]);
        }
        await asMember(firstId);
        const post = (await db.query("insert into public.posts(board,title,content) values ('free','Title','Content') returning *")).rows[0];
        assert.equal(String((await state(post.id)).like_count), "0");
        assert.equal((await setLike(post.id, true)).is_liked, true);
        assert.equal(String((await setLike(post.id, true)).like_count), "1");
        await Promise.all([setLike(post.id, true), setLike(post.id, true)]);
        assert.equal((await db.query("select * from public.post_likes")).rows.length, 1);
        await assert.rejects(db.query("insert into public.post_likes(post_id,user_id) values ($1,$2)", [post.id, secondId]));
        await assert.rejects(db.query("delete from public.post_likes where post_id=$1", [post.id]));
        await assert.rejects(setLike(missingId, true));
        await assert.rejects(setLike(post.id, null));

        await asMember(secondId);
        assert.equal((await state(post.id)).is_liked, false);
        assert.equal(String((await setLike(post.id, true)).like_count), "2");
        const ownLikes = (await db.query("select * from public.post_likes")).rows;
        assert.equal(ownLikes.length, 1);
        assert.equal(ownLikes[0].user_id, secondId);
        assert.equal(String((await setLike(post.id, false)).like_count), "1");
        assert.equal((await setLike(post.id, false)).is_liked, false);
        assert.equal(String((await state(post.id)).like_count), "1");
        await db.exec("reset role; set role anon");
        await db.query("select set_config('request.jwt.claim.sub', '', false)");
        assert.equal(String((await state(post.id)).like_count), "1");
        assert.equal((await state(post.id)).is_liked, false);
        await assert.rejects(db.query("select * from public.post_likes"));
        await assert.rejects(setLike(post.id, true));
        assert.equal(await state(missingId), undefined);

        await asMember("");
        await assert.rejects(setLike(post.id, true));
        await asMember(firstId);
        assert.equal((await state(post.id)).is_liked, true);
        assert.equal((await db.query("select updated_at from public.posts where id=$1", [post.id])).rows[0].updated_at.getTime(), post.updated_at.getTime());
        await db.exec("reset role");
        await assert.rejects(db.query("insert into public.post_likes(post_id,user_id) values($1,$2)", [post.id, firstId]));
        await db.query("delete from auth.users where id=$1", [firstId]);
        assert.equal(String((await state(post.id)).like_count), "0");
        await asMember(secondId);
        await setLike(post.id, true);
        await db.exec("reset role");
        await db.query("delete from public.posts where id=$1", [post.id]);
        assert.equal((await db.query("select * from public.post_likes")).rows.length, 0);
    } finally { await db.close(); }
});
