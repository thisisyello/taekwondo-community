import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

test("server board search filters literal title/content/nickname text and respects RLS", async () => {
    const db = new PGlite();
    const authorId = "00000000-0000-0000-0000-000000000001";
    const otherId = "00000000-0000-0000-0000-000000000002";
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
        for (const file of ["202610070001_member_profiles.sql", "202610130001_board_posts_comments.sql", "202611200001_board_search.sql"]) {
            await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), "utf8"));
        }
        for (const [id, nickname] of [[authorId, "Coach Han"], [otherId, "학부모 Kim"]]) {
            await db.query("insert into auth.users values($1,$2)", [id, JSON.stringify({ nickname, name: nickname, birth_date: "2000-01-01", phone_number: "01012345678" })]);
        }
        const rows = [];
        for (const values of [[authorId, "free", "품새 Alpha 100%_연습", "기본 동작"], [otherId, "question", "도복 문의", "ALPHA 연습 질문"], [null, "parent", "문의", "서로 다른 내용"], [authorId, "coach", 'a,b.(c) "quoted"', "수업 기록"]]) {
            rows.push((await db.query("insert into public.posts(author_id,board,title,content) values($1,$2,$3,$4) returning id", values)).rows[0].id);
        }
        const search = async (board, target, keyword) => (await db.query("select id from public.search_board_posts($1,$2,$3)", [board, target, keyword])).rows.map(({ id }) => id).sort();
        await db.exec("set role anon");
        assert.deepEqual(await search("all", "all", "  aLpHa  "), [rows[0], rows[1]].sort());
        assert.deepEqual(await search("free", "all", "alpha"), [rows[0]]);
        assert.deepEqual(await search("all", "title", "alpha"), [rows[0]]);
        assert.deepEqual(await search("all", "content", "alpha"), [rows[1]]);
        assert.deepEqual(await search("all", "author", "coach"), [rows[0], rows[3]].sort());
        assert.deepEqual(await search("question", "author", "kim"), [rows[1]]);
        assert.deepEqual(await search("all", "all", "Kim"), [rows[1]]);
        assert.deepEqual(await search("all", "author", "탈퇴한 회원"), [rows[2]]);
        assert.deepEqual(await search("all", "all", "%"), [rows[0]]);
        assert.deepEqual(await search("all", "all", "_"), [rows[0]]);
        assert.deepEqual(await search("all", "all", 'a,b.(c) "quoted"'), [rows[3]]);
        assert.deepEqual(await search("all", "all", "%' or true --"), []);
        assert.deepEqual(await search("all", "all", "No match"), []);
        assert.deepEqual(await search("coach", "all", ""), [rows[3]]);
        assert.deepEqual(await search("invalid", "all", ""), []);
        assert.deepEqual(await search("all", "invalid", "alpha"), []);
        assert.equal((await search(null, null, null)).length, 4);
        await assert.rejects(db.query("select * from public.account_details"));
        await db.exec("reset role; set role authenticated");
        await db.query("select set_config('request.jwt.claim.sub', $1, false)", [authorId]);
        assert.deepEqual(await search("all", "author", "Kim"), [rows[1]]);
        await db.exec("reset role");
        const functionInfo = (await db.query("select prosecdef, provolatile from pg_proc where oid='public.search_board_posts(text,text,text)'::regprocedure")).rows[0];
        assert.equal(functionInfo.prosecdef, false);
        assert.equal(functionInfo.provolatile, "s");
        await db.exec(`alter policy "Public posts are readable" on public.posts using (board = 'free'); set role anon;`);
        assert.deepEqual(await search("all", "all", ""), [rows[0]]);
        assert.deepEqual(await search("all", "content", "alpha"), []);
    } finally { await db.close(); }
});
