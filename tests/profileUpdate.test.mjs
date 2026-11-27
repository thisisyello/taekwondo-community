import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

test("profile updates are authenticated, own-account only and atomic across public/private data", async () => {
    const db = new PGlite();
    const first = "00000000-0000-0000-0000-000000000001";
    const second = "00000000-0000-0000-0000-000000000002";
    const save = (id, nickname = "Updated", name = "Updated Name", phone = "010-402-3617") =>
        db.query("select * from public.update_member_profile($1,$2,$3,$4)", [id, nickname, name, phone]);
    try {
        await db.exec(`
            create role anon;
            create role authenticated;
            create schema auth;
            create table auth.users (id uuid primary key, raw_user_meta_data jsonb);
            create function auth.uid() returns uuid language sql stable as $$
                select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
            $$;
            grant usage on schema public,auth to anon,authenticated;
            grant execute on function auth.uid() to anon,authenticated;
        `);
        for (const file of ["202610070001_member_profiles.sql", "202611270001_member_profile_update.sql"]) {
            await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), "utf8"));
        }
        for (const [id, nickname] of [[first, "First"], [second, "Second"]]) {
            await db.query("insert into auth.users values($1,$2)", [id, JSON.stringify({ nickname, name: "Original Name", birth_date: "2000-01-01", phone_number: "010-1234-5678" })]);
        }
        await db.exec("set role anon");
        await assert.rejects(save(first), { code: "42501" });
        await db.exec("reset role; set role authenticated");
        await assert.rejects(save(first), { code: "42501" });
        await db.query("select set_config('request.jwt.claim.sub',$1,false)", [first]);
        await assert.rejects(save(second), { code: "42501" });
        const result = (await save(first, " Updated ", " Updated Name ", " 010-402-3617 ")).rows[0];
        assert.equal(result.id, first);
        assert.equal(result.nickname, "Updated");
        assert.equal(result.name, "Updated Name");
        assert.equal(result.phone_number, "010-402-3617");
        const profile = (await db.query("select * from public.profiles where id=$1", [first])).rows[0];
        const details = (await db.query("select * from public.account_details where user_id=$1", [first])).rows[0];
        assert.equal(profile.role, "member");
        assert.equal(profile.profile_image_url, null);
        assert.equal(details.birth_date.toISOString().slice(0, 10), "2000-01-01");
        assert.equal(profile.updated_at.getTime(), details.updated_at.getTime());
        assert.equal(result.updated_at.getTime(), profile.updated_at.getTime());
        assert.equal((await db.query("select nickname from public.profiles where id=$1", [second])).rows[0].nickname, "Second");
        assert.equal((await db.query("select * from public.account_details")).rows.length, 1);

        await assert.rejects(save(first, " second ", "Must not save", "010-9999-9999"), { code: "23505" });
        assert.equal((await db.query("select name from public.account_details")).rows[0].name, "Updated Name");
        assert.equal((await db.query("select nickname from public.profiles where id=$1", [first])).rows[0].nickname, "Updated");
        for (const args of [[null, "Name", "01012345678"], [" ", "Name", "01012345678"], ["a".repeat(31), "Name", "01012345678"], ["Valid", null, "01012345678"], ["Valid", " ", "01012345678"], ["Valid", "a".repeat(81), "01012345678"], ["Valid", "Name", null], ["Valid", "Name", "010abc12345678"], ["Valid", "Name", "010"], ["Valid", "Name", "1".repeat(16)]]) {
            await assert.rejects(save(first, ...args), { code: "22023" });
        }
        // Direct writes remain closed, including role, birth date and timestamp changes.
        for (const sql of ["update public.profiles set nickname='Bypass'", "update public.profiles set role='admin'", "update public.profiles set updated_at=now()", "update public.account_details set name='Bypass'", "update public.account_details set birth_date='1990-01-01'"]) {
            await assert.rejects(db.exec(sql), { code: "42501" });
        }

        await db.exec("reset role");
        await db.query("delete from public.account_details where user_id=$1", [first]);
        await db.exec("set role authenticated");
        await assert.rejects(save(first, "Must roll back"), { code: "P0002" });
        assert.equal((await db.query("select nickname from public.profiles where id=$1", [first])).rows[0].nickname, "Updated");
        await db.exec("reset role");
        await db.query("delete from public.profiles where id=$1", [second]);
        await db.exec("set role authenticated");
        await db.query("select set_config('request.jwt.claim.sub',$1,false)", [second]);
        await assert.rejects(save(second), { code: "P0002" });
        assert.equal((await db.query("select name from public.account_details")).rows[0].name, "Original Name");
        await db.exec("reset role; set role anon");
        await assert.rejects(db.query("select * from public.account_details"), { code: "42501" });
    } finally { await db.close(); }
});
