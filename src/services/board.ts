import { getSupabase } from "../lib/supabase";
import { isPostId, mapComment, mapPost } from "../utils/boardData";
import type { CommentRow, PostRow } from "../utils/boardData";
import type { CommentFormData, PostFormData } from "../types/board";
import { getCommentContentError, getPostFormErrors } from "../utils/boardValidation";

const pageSize = 100;
const postSelect = "id,author_id,board,title,content,view_count,created_at,updated_at,author:profiles!posts_author_id_fkey(id,nickname),comments(count)";
const commentSelect = "id,post_id,author_id,content,created_at,updated_at,author:profiles!comments_author_id_fkey(id,nickname)";

export async function incrementPostViewCount(postId: string): Promise<number | null> {
    if (!isPostId(postId)) throw new Error("유효하지 않은 게시글입니다.");
    const { data, error } = await getSupabase().rpc("increment_post_view_count", { p_post_id: postId });
    if (error) throw new Error("조회수를 갱신하지 못했습니다.");
    if (data === null) return null;
    if (typeof data !== "number" || !Number.isInteger(data) || data < 0) {
        throw new Error("조회수 응답을 확인하지 못했습니다.");
    }
    return data;
}

export async function createComment(postId: string, form: CommentFormData) {
    if (!isPostId(postId)) throw new Error("유효하지 않은 게시글입니다.");
    const contentError = getCommentContentError(form.content);
    if (contentError) throw new Error(contentError);
    const { data, error } = await getSupabase().from("comments")
        .insert({ post_id: postId, content: form.content.trim() })
        .select(commentSelect).single<CommentRow>();
    if (error) {
        if (error.code === "23503") throw new Error("게시글이 없거나 삭제되었습니다.");
        if (["42501", "PGRST301", "PGRST302"].includes(error.code)) {
            throw new Error("댓글을 작성할 권한이 없거나 로그인이 만료되었습니다. 다시 로그인해주세요.");
        }
        throw new Error("댓글을 저장하지 못했습니다. 연결 상태를 확인하고 다시 시도해주세요.");
    }
    return mapComment(data);
}

export async function createPost(form: PostFormData): Promise<{ id: string }> {
    const errors = getPostFormErrors(form.title, form.content);
    if (errors.title || errors.content) throw new Error(errors.title ?? errors.content);
    const { data, error } = await getSupabase().from("posts")
        .insert({ title: form.title.trim(), content: form.content.trim(), board: form.board })
        .select("id").single<{ id: string }>();
    if (error) {
        if (error.code === "42501" || error.code === "PGRST301" || error.code === "PGRST302") {
            throw new Error("글을 작성할 권한이 없거나 로그인이 만료되었습니다. 다시 로그인해주세요.");
        }
        throw new Error("게시글을 저장하지 못했습니다. 입력 내용과 연결 상태를 확인하고 다시 시도해주세요.");
    }
    return data;
}

export async function getBoardPosts(signal: AbortSignal) {
    const client = getSupabase();
    const rows: PostRow[] = [];
    for (let offset = 0; ; offset += pageSize) {
        const { data, error } = await client.from("posts").select(postSelect)
            .order("created_at", { ascending: false }).order("id", { ascending: false })
            .range(offset, offset + pageSize - 1).abortSignal(signal).returns<PostRow[]>();
        if (error) throw new Error("게시글 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
        rows.push(...data);
        if (data.length < pageSize) break;
    }
    return {
        posts: rows.map(mapPost),
        commentCountsByPostId: Object.fromEntries(rows.map((row) => [row.id, row.comments[0]?.count ?? 0])),
    };
}

export async function getPostDetail(id: string, signal: AbortSignal) {
    if (!isPostId(id)) return null;
    const client = getSupabase();
    const { data: post, error } = await client.from("posts").select(postSelect)
        .eq("id", id).abortSignal(signal).maybeSingle<PostRow>();
    if (error) throw new Error("게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    if (!post) return null;
    const comments: CommentRow[] = [];
    for (let offset = 0; ; offset += pageSize) {
        const { data, error: commentError } = await client.from("comments").select(commentSelect)
            .eq("post_id", id).order("created_at", { ascending: true }).order("id", { ascending: true })
            .range(offset, offset + pageSize - 1).abortSignal(signal).returns<CommentRow[]>();
        if (commentError) throw new Error("댓글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
        comments.push(...data);
        if (data.length < pageSize) break;
    }
    return { post: mapPost(post), comments: comments.map(mapComment) };
}
