import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

test("server ordering uses global comment totals, stable ties and caller RLS", async () => {
    const db = new PGlite();
    const uuid = (value) => `00000000-0000-0000-0000-${String(value).padStart(12, "0")}`;
    const member = uuid(1), other = uuid(2);
    const a = uuid(10), b = uuid(20), c = uuid(30), d = uuid(40);
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
        for (const file of ["202610070001_member_profiles.sql", "202610130001_board_posts_comments.sql", "202611180001_comment_threads.sql", "202611200001_board_search.sql", "202611200002_board_sort.sql"]) {
            await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), "utf8"));
        }
        for (const [id, nickname] of [[member, "Member"], [other, "Other"]]) {
            await db.query("insert into auth.users values($1,$2)", [id, JSON.stringify({ nickname, name: nickname, birth_date: "2000-01-01", phone_number: "01012345678" })]);
        }
        for (const [id, board, content, createdAt] of [[a, "free", "Alpha", "2026-01-03"], [b, "free", "Alpha", "2026-01-03"], [c, "coach", "Alpha", "2026-01-01"], [d, "question", "Beta", "2026-01-02"]]) {
            await db.query("insert into public.posts(id,author_id,board,title,content,created_at,updated_at) values($1,$2,$3,$6,$4,$5,$5)", [id, member, board, content, createdAt, id]);
        }
        const root = (await db.query("insert into public.comments(post_id,author_id,content) values($1,$2,'Root') returning id", [a, member])).rows[0].id;
        await db.query("insert into public.comments(post_id,parent_id,author_id,content) values($1,$2,$3,'Reply')", [a, root, other]);
        for (const postId of [b, b, c, c, c, c, c]) {
            await db.query("insert into public.comments(post_id,author_id,content) values($1,$2,'Comment')", [postId, postId === c ? member : other]);
        }
        const sorted = async (order, board = "all", keyword = "") => (await db.query(`
            select p.id, public.comment_count(p) as count
            from public.search_board_posts($1,'all',$2) p
            order by ${order}
        `, [board, keyword])).rows;
        const latest = "p.created_at desc, p.id desc";
        const oldest = "p.created_at asc, p.id asc";
        const most = "public.comment_count(p) desc, p.created_at desc, p.id desc";
        await db.exec("set role anon");
        assert.deepEqual((await sorted(latest)).map(({ id }) => id), [b, a, d, c]);
        assert.deepEqual((await sorted(oldest)).map(({ id }) => id), [c, d, a, b]);
        const ranked = await sorted(most);
        assert.deepEqual(ranked.map(({ id }) => id), [c, b, a, d]);
        assert.deepEqual(ranked.map(({ count }) => String(count)), ["5", "2", "2", "0"]);
        assert.deepEqual((await sorted(most, "free")).map(({ id }) => id), [b, a]);
        assert.deepEqual((await sorted(most, "all", "Alpha")).map(({ id }) => id), [c, b, a]);
        assert.deepEqual((await db.query(`select p.id from (select * from public.search_board_posts('all','all','Alpha')) p order by ${most}`)).rows.map(({ id }) => id), [c, b, a]);
        assert.deepEqual((await db.query(`select p.id from public.posts p order by ${most} limit 2`)).rows.map(({ id }) => id), [c, b]);
        await assert.rejects(db.query("update public.posts set view_count=100 where id=$1", [a]));
        await db.exec("reset role; set role authenticated");
        await db.query("select set_config('request.jwt.claim.sub',$1,false)", [member]);
        assert.deepEqual((await sorted(most)).map(({ id }) => id), [c, b, a, d]);
        const before = (await db.query("select updated_at from public.posts where id=$1", [a])).rows[0].updated_at;
        await db.query("delete from public.comments where id=$1", [root]);
        assert.deepEqual((await sorted(most)).map(({ id }) => id), [c, b, a, d]);
        assert.equal(String((await sorted(most)).find(({ id }) => id === a).count), "0");
        assert.equal((await db.query("select updated_at from public.posts where id=$1", [a])).rows[0].updated_at.getTime(), before.getTime());
        await db.exec("reset role");
        const info = (await db.query("select prosecdef,provolatile,proargnames from pg_proc where oid='public.comment_count(public.posts)'::regprocedure")).rows[0];
        assert.equal(info.prosecdef, false);
        assert.equal(info.provolatile, "s");
        assert.equal(info.proargnames, null);
        await db.exec(`alter policy "Public comments are readable" on public.comments using (author_id=(select auth.uid())); set role anon;`);
        await db.query("select set_config('request.jwt.claim.sub','',false)");
        assert.ok((await sorted(most)).every(({ count }) => String(count) === "0"));
        await db.exec("reset role; set role authenticated");
        await db.query("select set_config('request.jwt.claim.sub',$1,false)", [member]);
        const ownOnly = await sorted(most);
        assert.equal(String(ownOnly.find(({ id }) => id === b).count), "0");
        assert.equal(String(ownOnly.find(({ id }) => id === c).count), "5");
    } finally { await db.close(); }
});
