import type { BoardAuthor, BoardType, Comment, Post } from "../types/board.ts";

type AuthorRow = { id: string; nickname: string } | null;

export type PostLikeState = { post_id: string; like_count: number; is_liked: boolean };

export function parsePostLikeState(value: unknown): PostLikeState {
    if (typeof value !== "object" || value === null ||
        !("post_id" in value) || typeof value.post_id !== "string" || !isPostId(value.post_id) ||
        !("like_count" in value) || typeof value.like_count !== "number" || !Number.isSafeInteger(value.like_count) || value.like_count < 0 ||
        !("is_liked" in value) || typeof value.is_liked !== "boolean") {
        throw new Error("공감 응답을 확인하지 못했습니다.");
    }
    return { post_id: value.post_id, like_count: value.like_count, is_liked: value.is_liked };
}

export type PostRow = {
    id: string;
    author_id: string | null;
    board: BoardType;
    title: string;
    content: string;
    view_count: number;
    created_at: string;
    updated_at: string;
    author: AuthorRow;
    comments: { count: number }[];
};

export type CommentRow = {
    id: string;
    post_id: string;
    author_id: string | null;
    content: string;
    created_at: string;
    updated_at: string;
    author: AuthorRow;
};

const mapAuthor = (id: string | null, author: AuthorRow): BoardAuthor => ({
    id,
    nickname: author?.nickname ?? "탈퇴한 회원",
});

export function mapPost(row: PostRow, likes?: PostLikeState): Post {
    return {
        id: row.id,
        author: mapAuthor(row.author_id, row.author),
        board: row.board,
        title: row.title,
        content: row.content,
        viewCount: row.view_count,
        likeCount: likes?.like_count ?? 0,
        isLiked: likes?.is_liked ?? false,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function mapComment(row: CommentRow): Comment {
    return {
        id: row.id,
        postId: row.post_id,
        author: mapAuthor(row.author_id, row.author),
        content: row.content,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function isPostId(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
