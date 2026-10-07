import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { getEmailError, getSignupErrors } from "../src/utils/authValidation.ts";
import { formatMobilePhoneNumber } from "../src/utils/phone.ts";

const validSignup = {
    email: "member@example.com",
    password: "example password",
    name: "Member",
    birthDate: "2000-01-01",
    phoneNumber: "010-1234-5678",
    nickname: "Member One",
};

test("signup validation accepts complete data and rejects invalid values", () => {
    assert.equal(Object.values(getSignupErrors(validSignup, validSignup.password)).some(Boolean), false);
    assert.ok(getEmailError("member"));
    assert.ok(getSignupErrors({ ...validSignup, birthDate: "2000-02-30" }, validSignup.password).birthDate);
    assert.ok(getSignupErrors({ ...validSignup, birthDate: "2999-01-01" }, validSignup.password).birthDate);
    assert.ok(getSignupErrors({ ...validSignup, phoneNumber: "010abc12345678" }, validSignup.password).phoneNumber);
    assert.ok(getSignupErrors({ ...validSignup, nickname: " " }, validSignup.password).nickname);
    assert.ok(getSignupErrors({ ...validSignup, password: "short" }, "short").password);
    assert.ok(getSignupErrors({ ...validSignup, password: "        " }, "        ").password);
    assert.ok(getSignupErrors(validSignup, "wrong password").passwordConfirm);
    assert.equal(getSignupErrors(validSignup, validSignup.password).password, undefined);
    assert.equal(getSignupErrors({ ...validSignup, phoneNumber: "010-402-3617" }, validSignup.password).phoneNumber, undefined);
});

test("mobile number formatting handles 10 and 11 digits and transitions between them", () => {
    assert.equal(formatMobilePhoneNumber("0104023617"), "010-402-3617");
    assert.equal(formatMobilePhoneNumber("010-402-3617"), "010-402-3617");
    assert.equal(formatMobilePhoneNumber("01040236178"), "010-4023-6178");
    assert.equal(formatMobilePhoneNumber("010-402-36178"), "010-4023-6178");
    assert.equal(formatMobilePhoneNumber("010-4023-617"), "010-402-3617");
    assert.equal(formatMobilePhoneNumber("010123456789"), "010-1234-5678");
});

test("member migration enforces privacy, uniqueness, and server-managed roles", async () => {
    const db = new PGlite();
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
            grant execute on function auth.uid() to authenticated;
        `);
        await db.exec(await readFile(new URL("../supabase/migrations/202610070001_member_profiles.sql", import.meta.url), "utf8"));
        const firstId = "00000000-0000-0000-0000-000000000001";
        const secondId = "00000000-0000-0000-0000-000000000002";
        const thirdId = "00000000-0000-0000-0000-000000000003";
        const metadata = { nickname: "Member One", name: "Private Name", birth_date: "2000-01-01", phone_number: "010-1234-5678", role: "admin" };
        await db.query("insert into auth.users values ($1, $2)", [firstId, JSON.stringify(metadata)]);
        await db.query("insert into auth.users values ($1, $2)", [secondId, JSON.stringify({ ...metadata, nickname: "Member Two" })]);
        const { rows } = await db.query("select role from public.profiles where id = $1", [firstId]);
        assert.equal(rows[0].role, "member");

        await assert.rejects(db.query("insert into auth.users values ($1, $2)", [thirdId, JSON.stringify({ ...metadata, nickname: " member ONE " })]));
        assert.equal((await db.query("select * from auth.users where id = $1", [thirdId])).rows.length, 0);
        await assert.rejects(db.query("insert into auth.users values ($1, $2)", [thirdId, JSON.stringify({ ...metadata, nickname: "Member Three", birth_date: "2999-01-01" })]));
        assert.equal((await db.query("select * from public.profiles where id = $1", [thirdId])).rows.length, 0);

        await db.exec("set role anon");
        assert.equal((await db.query("select nickname from public.profiles")).rows.length, 2);
        await assert.rejects(db.query("select * from public.account_details"));
        await db.exec("reset role; set role authenticated");
        await db.query("select set_config('request.jwt.claim.sub', $1, false)", [firstId]);
        const personalDetails = (await db.query("select * from public.account_details")).rows;
        assert.equal(personalDetails.length, 1);
        assert.equal(personalDetails[0].user_id, firstId);
        await assert.rejects(db.query("update public.profiles set role = 'admin' where id = $1", [firstId]));
        await assert.rejects(db.query("insert into public.account_details(user_id, name, birth_date, phone_number) values ($1, 'Other', '2000-01-01', '01012345678')", [thirdId]));
        await db.exec("reset role");
        await db.query("delete from auth.users where id = $1", [firstId]);
        assert.equal((await db.query("select * from public.account_details where user_id = $1", [firstId])).rows.length, 0);
    } finally {
        await db.close();
    }
});
