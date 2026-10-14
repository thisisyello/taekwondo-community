import { useEffect, useRef, useState } from "react";
import { FiEye, FiHeart, FiLogIn, FiMoreVertical } from "react-icons/fi";
import { Link, useNavigate } from "react-router";
import CommentForm from "../../components/board/CommentForm";
import CommentList from "../../components/board/CommentList";
import { useToast } from "../../hooks/useToast";
import { BOARD_LABELS } from "../../types/board";
import type { Comment, CommentFormData, Post } from "../../types/board";
import { formatDate, isEdited } from "../../utils/date";

type PostDetailPageProps = {
    post: Post;
    comments: Comment[];
    currentUserId: string | null;
    onAddComment?: (postId: string, comment: CommentFormData) => Promise<void>;
    onUpdateComment?: (id: string, content: string) => void;
    onDeleteComment?: (id: string) => void;
    onLikePost?: (id: string, liked: boolean) => Promise<void>;
    onDeletePost?: (id: string) => Promise<void>;
};

export default function PostDetailPage({
    post,
    comments,
    currentUserId,
    onAddComment,
    onUpdateComment,
    onDeleteComment,
    onLikePost,
    onDeletePost,
}: PostDetailPageProps) {
    const navigate = useNavigate();
    const showToast = useToast();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [likeError, setLikeError] = useState<string | null>(null);
    const likeLock = useRef(false);
    const deleteLock = useRef(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const isActive = useRef(true);
    useEffect(() => {
        isActive.current = true;
        return () => { isActive.current = false; };
    }, []);
    const canManagePost = currentUserId !== null && currentUserId === post.author.id;

    const handleStartEdit = () => {
        setIsMenuOpen(false);
    };

    const handleLike = async () => {
        if (likeLock.current) return;
        if (!currentUserId) {
            showToast("로그인이 필요한 서비스입니다.");
            navigate("/login", { state: { from: `/posts/${post.id}` } });
            return;
        }
        if (!onLikePost) return;
        likeLock.current = true;
        setIsLiking(true);
        setLikeError(null);
        try {
            await onLikePost(post.id, !post.isLiked);
        } catch (error) {
            if (isActive.current) setLikeError(error instanceof Error ? error.message : "공감을 저장하지 못했습니다. 다시 시도해주세요.");
        } finally {
            likeLock.current = false;
            if (isActive.current) setIsLiking(false);
        }
    };

    const handleDelete = async () => {
        if (!onDeletePost || !canManagePost || deleteLock.current) return;
        setIsMenuOpen(false);

        const confirmed = window.confirm("게시글을 삭제하시겠습니까? 댓글과 공감도 함께 삭제됩니다.");

        if (!confirmed) return;

        deleteLock.current = true;
        setIsDeleting(true);
        setDeleteError(null);
        try {
            await onDeletePost(post.id);
            if (!isActive.current) return;
            showToast("게시글이 삭제되었습니다.");
            navigate("/", { replace: true });
        } catch (error) {
            if (isActive.current) setDeleteError(error instanceof Error ? error.message : "게시글을 삭제하지 못했습니다. 다시 시도해주세요.");
        } finally {
            deleteLock.current = false;
            if (isActive.current) setIsDeleting(false);
        }
    };

    return (
        <>
            <article className="rounded-kta-lg border border-kta-border bg-kta-surface p-5 shadow-kta-sm">
                <p className="text-xs font-bold text-kta-red">
                    {BOARD_LABELS[post.board]}
                </p>
                <div className="mt-2 flex items-start justify-between gap-3">
                    <h1 className="min-w-0 flex-1 break-words text-2xl font-black leading-tight text-kta-text [overflow-wrap:anywhere]">
                        {post.title}
                    </h1>
                    {canManagePost && (
                        <div className="relative shrink-0">
                            <button
                                type="button"
                                aria-label="게시글 관리"
                                aria-expanded={isMenuOpen}
                                aria-busy={isDeleting}
                                disabled={isDeleting}
                                title="게시글 관리"
                                className="flex h-10 w-10 items-center justify-center rounded-full text-kta-muted hover:bg-kta-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kta-navy"
                                onClick={() => setIsMenuOpen((prev) => !prev)}
                            >
                                <FiMoreVertical aria-hidden="true" className="text-xl" />
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 top-11 z-10 flex min-w-28 flex-col overflow-hidden rounded-kta-md border border-kta-border bg-kta-surface shadow-kta-md">
                                    <Link
                                        className="px-4 py-3 text-sm font-semibold text-kta-text hover:bg-kta-subtle"
                                        to={`/posts/${post.id}/edit`}
                                        onClick={handleStartEdit}
                                    >
                                        수정
                                    </Link>
                                    {onDeletePost && (
                                        <button
                                            type="button"
                                            className="px-4 py-3 text-left text-sm font-semibold text-kta-red hover:bg-red-50"
                                            onClick={() => void handleDelete()}
                                        >
                                            삭제
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <p className="mt-3 text-sm text-kta-muted">
                    {post.author.nickname} · {formatDate(post.createdAt)}
                    {isEdited(post.createdAt, post.updatedAt) && " (수정됨)"}
                </p>
                <p className="mt-6 whitespace-pre-wrap text-base leading-8 text-kta-text">
                    {post.content}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        disabled={isDeleting || isLiking || (Boolean(currentUserId) && !onLikePost)}
                        aria-pressed={post.isLiked}
                        aria-busy={isLiking}
                        title={post.isLiked ? "공감 취소" : "공감"}
                        className={`inline-flex h-10 min-w-24 items-center justify-center gap-1 rounded-full px-4 text-sm font-bold disabled:cursor-wait disabled:opacity-60 ${post.isLiked ? "bg-kta-red text-white" : "bg-red-50 text-kta-red"}`}
                        onClick={() => void handleLike()}
                    >
                        <FiHeart aria-hidden="true" fill={post.isLiked ? "currentColor" : "none"} /> 공감{" "}
                        {post.likeCount}
                    </button>
                    <span className="inline-flex h-10 shrink-0 items-center gap-1 rounded-full bg-kta-subtle px-3 text-sm font-bold text-kta-navy">
                        <FiEye aria-hidden="true" />
                        조회 {post.viewCount}
                    </span>
                </div>
                {likeError && <p role="alert" className="mt-2 text-sm text-kta-red">{likeError}</p>}
                {isDeleting && <p role="status" className="mt-2 text-sm text-kta-muted">삭제 중…</p>}
                {deleteError && <p role="alert" className="mt-2 text-sm text-kta-red">{deleteError}</p>}
            </article>

            <section className="rounded-kta-lg border border-kta-border bg-kta-surface p-5 shadow-kta-sm">
                <h2 className="text-lg font-black text-kta-navy">
                    댓글 {comments.length}
                </h2>
                <div className="mt-4">
                    {currentUserId && onAddComment ? (
                        <CommentForm
                            onAddComment={(comment) =>
                                onAddComment(post.id, comment)
                            }
                        />
                    ) : !currentUserId ? (
                        <Link
                            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-kta-md border border-kta-border bg-kta-subtle px-4 py-3 text-sm font-semibold text-kta-navy transition-colors hover:border-kta-navy hover:bg-kta-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kta-navy"
                            to="/login"
                            state={{ from: `/posts/${post.id}` }}
                        >
                            <FiLogIn aria-hidden="true" className="shrink-0 text-lg" />
                            <span>로그인하고 댓글 작성하기</span>
                        </Link>
                    ) : null}
                </div>
                <div className="mt-5 border-t border-kta-border pt-5">
                    <CommentList
                        comments={comments}
                        currentUserId={currentUserId}
                        onUpdateComment={onUpdateComment}
                        onDeleteComment={onDeleteComment}
                    />
                </div>
            </section>
        </>
    );
}
