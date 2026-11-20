import assert from "node:assert/strict";
import { test } from "node:test";
import { getBoardPageInfo, mergeBoardPostsPages, POSTS_PER_PAGE } from "../src/utils/boardPagination.ts";

test("board pages request five rows and stop at partial, empty and exact final pages", () => {
    assert.equal(POSTS_PER_PAGE, 5);
    assert.deepEqual(getBoardPageInfo(0, 5, 13), { totalCount: 13, nextOffset: 5, hasMore: true });
    assert.deepEqual(getBoardPageInfo(5, 5, 13), { totalCount: 13, nextOffset: 10, hasMore: true });
    assert.deepEqual(getBoardPageInfo(10, 3, 13), { totalCount: 13, nextOffset: 13, hasMore: false });
    assert.equal(getBoardPageInfo(0, 0, 0).hasMore, false);
    assert.equal(getBoardPageInfo(0, 3, 3).hasMore, false);
    assert.equal(getBoardPageInfo(0, 5, 5).hasMore, false);
    assert.equal(getBoardPageInfo(5, 5, 10).hasMore, false);
    assert.equal(getBoardPageInfo(10, 0, 10).hasMore, false);
});

test("missing total count falls back to the received page size", () => {
    assert.deepEqual(getBoardPageInfo(0, 5, null), { totalCount: null, nextOffset: 5, hasMore: true });
    assert.equal(getBoardPageInfo(5, 2, null).hasMore, false);
    assert.equal(getBoardPageInfo(5, 0, null).hasMore, false);
});

test("invalid page metadata is rejected", () => {
    for (const args of [[-1, 5, 10], [0.5, 5, 10], [0, 6, 10], [0, -1, 10], [0, 1.5, 10], [0, 5, -1], [0, 5, NaN]]) {
        assert.throws(() => getBoardPageInfo(...args));
    }
});

test("page merging preserves order, replaces duplicate data and advances by raw rows", () => {
    const previous = {
        posts: [{ id: "a", title: "First" }, { id: "b", title: "Old" }],
        commentCountsByPostId: { a: 1, b: 2 }, totalCount: 12, nextOffset: 5, hasMore: true,
    };
    const next = {
        posts: [{ id: "b", title: "Updated" }, { id: "c", title: "Third" }],
        commentCountsByPostId: { b: 3, c: 4 }, totalCount: 13, nextOffset: 10, hasMore: true,
    };
    const snapshot = structuredClone(previous);
    const merged = mergeBoardPostsPages(previous, next);
    assert.deepEqual(merged.posts.map((post) => post.id), ["a", "b", "c"]);
    assert.equal(merged.posts[1].title, "Updated");
    assert.deepEqual(merged.commentCountsByPostId, { a: 1, b: 3, c: 4 });
    assert.equal(merged.totalCount, 13);
    assert.equal(merged.nextOffset, 10);
    assert.equal(merged.hasMore, true);
    assert.deepEqual(previous, snapshot);
    const last = mergeBoardPostsPages(merged, { posts: [], commentCountsByPostId: {}, ...getBoardPageInfo(10, 0, null) });
    assert.equal(last.posts.length, 3);
    assert.equal(last.totalCount, 13);
    assert.equal(last.hasMore, false);
});
