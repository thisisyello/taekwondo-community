import type { BoardPostsPage } from "../types/board.ts";

export const POSTS_PER_PAGE = 5;

export function getBoardPageInfo(offset: number, receivedCount: number, totalCount: number | null) {
    if (!Number.isSafeInteger(offset) || offset < 0 ||
        !Number.isInteger(receivedCount) || receivedCount < 0 || receivedCount > POSTS_PER_PAGE ||
        (totalCount !== null && (!Number.isSafeInteger(totalCount) || totalCount < 0))) {
        throw new Error("게시글 페이지 응답을 확인하지 못했습니다.");
    }
    const nextOffset = offset + receivedCount;
    return {
        totalCount,
        nextOffset,
        hasMore: receivedCount === POSTS_PER_PAGE && (totalCount === null || nextOffset < totalCount),
    };
}

export function mergeBoardPostsPages(previous: BoardPostsPage, next: BoardPostsPage): BoardPostsPage {
    const posts = new Map(previous.posts.map((post) => [post.id, post]));
    for (const post of next.posts) posts.set(post.id, post);
    return {
        posts: [...posts.values()],
        commentCountsByPostId: { ...previous.commentCountsByPostId, ...next.commentCountsByPostId },
        totalCount: next.totalCount ?? previous.totalCount,
        // Advance by server rows consumed, not the deduplicated list length.
        nextOffset: next.nextOffset,
        hasMore: next.hasMore,
    };
}
