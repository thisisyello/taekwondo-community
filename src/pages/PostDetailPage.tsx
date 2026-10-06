import { useState } from "react";
import { FiEye, FiHeart, FiLogIn, FiMoreVertical } from "react-icons/fi";
import { Link, useNavigate } from "react-router";
import CommentForm from "../components/CommentForm";
import CommentList from "../components/CommentList";
import { BOARD_LABELS } from "../types/board";
import type { Comment, CommentFormData, Post } from "../types/board";
import { formatDate, isEdited } from "../utils/date";

type PostDetailPageProps = {
    post: Post;
    comments: Comment[];
    currentUserId: string | null;
    onAddComment: (postId: number, comment: CommentFormData) => void;
    onUpdateComment: (id: number, content: string) => void;
    onDeleteComment: (id: number) => void;
    onLikePost: (id: number) => void;
    onDeletePost: (id: number) => void;
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const canManagePost = currentUserId === post.author.id;

    const handleStartEdit = () => {
        setIsMenuOpen(false);
    };

    const handleDelete = () => {
        setIsMenuOpen(false);

        const confirmed = window.confirm("게시글을 삭제하시겠습니까?");

        if (!confirmed) return;

        onDeletePost(post.id);
        navigate("/");
    };

    return (
        <>
            {canManagePost && (
                <div className="flex justify-end">
                    <div className="relative">
                        <button
                            className="rounded-full bg-kta-surface px-4 py-2 text-sm font-bold text-kta-navy shadow-kta-sm"
                            onClick={() => setIsMenuOpen((prev) => !prev)}
                        >
                            <FiMoreVertical aria-hidden="true" />
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
                                <button
                                    className="px-4 py-3 text-left text-sm font-semibold text-kta-red hover:bg-red-50"
                                    onClick={handleDelete}
                                >
                                    삭제
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <article className="rounded-kta-lg border border-kta-border bg-kta-surface p-5 shadow-kta-sm">
                <p className="text-xs font-bold text-kta-red">
                    {BOARD_LABELS[post.board]}
                </p>
                <div className="mt-2 flex items-start justify-between gap-3">
                    <h1 className="min-w-0 text-2xl font-black leading-tight text-kta-text">
                        {post.title}
                    </h1>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-kta-subtle px-3 py-1 text-sm font-bold text-kta-navy">
                        <FiEye aria-hidden="true" />
                        조회 {post.viewCount}
                    </span>
                </div>
                <p className="mt-3 text-sm text-kta-muted">
                    {post.author.nickname} · {formatDate(post.createdAt)}
                    {isEdited(post.createdAt, post.updatedAt) && " (수정됨)"}
                </p>
                <p className="mt-6 whitespace-pre-wrap text-base leading-8 text-kta-text">
                    {post.content}
                </p>
                <button
                    className="mt-6 rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-kta-red"
                    onClick={() => {
                        if (!currentUserId) {
                            navigate("/login", {
                                state: {
                                    from: `/posts/${post.id}`,
                                    showLoginNotice: true,
                                },
                            });
                            return;
                        }
                        onLikePost(post.id);
                    }}
                >
                    <FiHeart aria-hidden="true" className="inline" /> 공감{" "}
                    {post.likeCount}
                </button>
            </article>

            <section className="rounded-kta-lg border border-kta-border bg-kta-surface p-5 shadow-kta-sm">
                <h2 className="text-lg font-black text-kta-navy">
                    댓글 {comments.length}
                </h2>
                <div className="mt-4">
                    {currentUserId ? (
                        <CommentForm
                            onAddComment={(comment) =>
                                onAddComment(post.id, comment)
                            }
                        />
                    ) : (
                        <Link
                            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-kta-md border border-kta-border bg-kta-subtle px-4 py-3 text-sm font-semibold text-kta-navy transition-colors hover:border-kta-navy hover:bg-kta-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kta-navy"
                            to="/login"
                        >
                            <FiLogIn aria-hidden="true" className="shrink-0 text-lg" />
                            <span>로그인하고 댓글 작성하기</span>
                        </Link>
                    )}
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
