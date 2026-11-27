import assert from "node:assert/strict";
import { test } from "node:test";
import { isPublicRoute } from "../src/utils/authRoutes.ts";

test("public content does not wait for auth, while protected and callback routes do", () => {
    const id = "00000000-0000-0000-0000-000000000001";
    for (const path of ["/", "/search", "/search/", "/SEARCH", "/dojang", "/forgot-password", `/posts/${id}`, `/posts/${id}/`]) {
        assert.equal(isPublicRoute(path), true, path);
    }
    for (const path of ["/login", "/signup", "/auth/callback", "/reset-password", "/home", "/chats", "/me", "/me/edit", "/posts/new", "/posts/new/", "/posts/NEW", "/posts/%6eew", `/posts/${id}/edit`, "/unknown"]) {
        assert.equal(isPublicRoute(path), false, path);
    }
});
