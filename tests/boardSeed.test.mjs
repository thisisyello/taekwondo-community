import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

test("sample posts require an existing author, insert ten distinct posts and are safe to rerun", async () => {
    const db = new PGlite();
    try {
        await db.exec(`
            create role anon;
            create role authenticated;
            create schema auth;
            create table auth.users (id uuid primary key, raw_user_meta_data jsonb);
            create function auth.uid() returns uuid language sql stable as $$ select null::uuid; $$;
        `);
        for (const file of ["202610070001_member_profiles.sql", "202610130001_board_posts_comments.sql"]) {
            await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), "utf8"));
        }
        const seed = await readFile(new URL("../supabase/seeds/board_sample_posts.sql", import.meta.url), "utf8");
        await assert.rejects(db.exec(seed));
        await db.exec("rollback");
        assert.equal((await db.query("select * from public.posts")).rows.length, 0);

        const authorId = "00000000-0000-0000-0000-000000000001";
        await db.query("insert into auth.users values ($1,$2)", [authorId, JSON.stringify({ nickname: "Seed Writer", name: "Writer", birth_date: "2000-01-01", phone_number: "01012345678" })]);
        await db.query("insert into public.posts(author_id,board,title,content) values($1,'free','Existing post','Existing content')", [authorId]);
        const previousBatchId = "c0de0000-0000-4000-8000-000000000001";
        await db.query("insert into public.posts(id,author_id,board,title,content) values($1,$2,'free','Earlier sample','Earlier content')", [previousBatchId, authorId]);
        const configuredSeed = seed.replace("'작성자 닉네임'", "'Seed Writer'");
        await db.exec(configuredSeed);
        const posts = (await db.query("select * from public.posts order by created_at, id")).rows;
        const samples = posts.filter((post) => post.title.startsWith("[샘플]"));
        assert.equal(posts.length, 12);
        assert.equal(samples.length, 10);
        assert.equal(new Set(samples.map((post) => post.id)).size, 10);
        assert.equal(new Set(samples.map((post) => post.created_at.getTime())).size, 10);
        for (const board of ["free", "parent", "coach", "student", "question"]) {
            assert.equal(samples.filter((post) => post.board === board).length, 2);
        }
        for (const post of samples) {
            assert.equal(post.author_id, authorId);
            assert.equal(post.view_count, 0);
            assert.equal(post.created_at.getTime(), post.updated_at.getTime());
        }
        await db.query("update public.posts set title='Edited sample' where id=$1", [samples[0].id]);
        await db.exec(configuredSeed);
        assert.equal((await db.query("select id from public.posts")).rows.length, 12);
        assert.equal((await db.query("select title from public.posts where id=$1", [samples[0].id])).rows[0].title, "Edited sample");
        assert.equal((await db.query("select id from public.posts where title='Existing post' and content='Existing content'")).rows.length, 1);
        assert.equal((await db.query("select title from public.posts where id=$1", [previousBatchId])).rows[0].title, "Earlier sample");
    } finally { await db.close(); }
});
