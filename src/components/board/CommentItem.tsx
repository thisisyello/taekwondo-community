import { useEffect, useId, useRef, useState } from "react";
import { FiCornerDownRight, FiMessageCircle, FiMoreVertical } from "react-icons/fi";
import { useNavigate } from "react-router";
import type { Comment, CommentFormData } from "../../types/board";
import { formatDate, isEdited } from "../../utils/date";
import { getCommentContentError } from "../../utils/boardValidation";
import { useToast } from "../../hooks/useToast";
import CommentForm from "./CommentForm";

type CommentItemProps = {
    comment: Comment;
    currentUserId: string | null;
    depth: number;
    parentAuthor: string | null;
    onUpdateComment?: (id: string, content: string) => Promise<void>;
    onDeleteComment?: (id: string) => Promise<void>;
    onAddReply?: (parentId: string, form: CommentFormData) => Promise<void>;
};

export default function CommentItem({
    comment, currentUserId, depth, parentAuthor, onUpdateComment, onDeleteComment, onAddReply,
}: CommentItemProps) {
    const navigate = useNavigate();
    const showToast = useToast();
    const errorId = useId();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [content, setContent] = useState(comment.content);
    const [hasSubmittedEdit, setHasSubmittedEdit] = useState(false);
    const [pending, setPending] = useState<"update" | "delete" | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const actionLock = useRef(false);
    const isActive = useRef(true);
    useEffect(() => {
        isActive.current = true;
        return () => { isActive.current = false; };
    }, []);
    const contentError = hasSubmittedEdit ? getCommentContentError(content) : undefined;
    const canManage = currentUserId !== null && currentUserId === comment.author.id;

    const handleSubmitEdit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setHasSubmittedEdit(true);
        if (!canManage || !onUpdateComment || actionLock.current || getCommentContentError(content)) return;
        actionLock.current = true;
        setPending("update");
        setSubmitError(null);
        try {
            await onUpdateComment(comment.id, content);
            if (!isActive.current) return;
            setIsEditing(false);
            setHasSubmittedEdit(false);
            showToast("댓글이 수정되었습니다.");
        } catch (error) {
            if (isActive.current) setSubmitError(error instanceof Error ? error.message : "댓글을 수정하지 못했습니다.");
        } finally {
            actionLock.current = false;
            if (isActive.current) setPending(null);
        }
    };

    const handleDelete = async () => {
        if (!canManage || !onDeleteComment || actionLock.current) return;
        setIsMenuOpen(false);
        if (!window.confirm("댓글을 삭제하시겠습니까? 연결된 모든 답글도 함께 삭제됩니다.")) return;
        actionLock.current = true;
        setPending("delete");
        setIsReplying(false);
        setSubmitError(null);
        try {
            await onDeleteComment(comment.id);
            showToast("댓글과 연결된 답글이 삭제되었습니다.");
        } catch (error) {
            if (isActive.current) setSubmitError(error instanceof Error ? error.message : "댓글을 삭제하지 못했습니다.");
        } finally {
            actionLock.current = false;
            if (isActive.current) setPending(null);
        }
    };

    const handleReply = () => {
        if (!currentUserId) {
            showToast("로그인이 필요한 서비스입니다.");
            navigate("/login", { state: { from: `/posts/${comment.postId}` } });
            return;
        }
        setIsEditing(false);
        setIsMenuOpen(false);
        setSubmitError(null);
        setIsReplying((value) => !value);
    };

    return (
        <li data-comment-id={comment.id} data-comment-depth={depth} className={`min-w-0 py-4 ${depth > 0 ? "ml-3 border-l-2 border-kta-border pl-4" : ""}`}>
            <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 break-words text-xs text-kta-muted [overflow-wrap:anywhere]">
                    <span className="font-extrabold text-kta-text">{comment.author.nickname}</span>
                    {" · "}{formatDate(comment.createdAt)}
                    {isEdited(comment.createdAt, comment.updatedAt) && " (수정됨)"}
                </p>
                {canManage && (onUpdateComment || onDeleteComment) && (
                    <div className="relative shrink-0">
                        <button
                            type="button" aria-label="댓글 관리" title="댓글 관리" aria-expanded={isMenuOpen}
                            disabled={pending !== null}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-kta-muted hover:bg-kta-subtle disabled:opacity-60"
                            onClick={() => setIsMenuOpen((value) => !value)}
                        >
                            <FiMoreVertical aria-hidden="true" />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 top-9 z-10 flex min-w-24 flex-col overflow-hidden rounded-kta-md border border-kta-border bg-kta-surface shadow-kta-sm">
                                {onUpdateComment && <button type="button" className="px-3 py-3 text-left text-sm text-kta-text hover:bg-kta-subtle" onClick={() => {
                                    setContent(comment.content);
                                    setIsEditing(true);
                                    setIsReplying(false);
                                    setIsMenuOpen(false);
                                    setHasSubmittedEdit(false);
                                    setSubmitError(null);
                                }}>수정</button>}
                                {onDeleteComment && <button type="button" className="px-3 py-3 text-left text-sm text-kta-red hover:bg-red-50" onClick={() => void handleDelete()}>삭제</button>}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {depth > 0 && parentAuthor && (
                <p className="mt-1 flex min-w-0 items-start gap-1 text-xs font-semibold text-kta-navy">
                    <FiCornerDownRight aria-hidden="true" className="mt-0.5 shrink-0" />
                    <span className="break-words [overflow-wrap:anywhere]">@{parentAuthor}</span>
                </p>
            )}
            {isEditing ? (
                <form className="mt-3 flex flex-col gap-2" onSubmit={handleSubmitEdit} noValidate>
                    <textarea
                        aria-label="댓글 수정" aria-invalid={Boolean(contentError)}
                        aria-describedby={contentError ? errorId : undefined}
                        disabled={pending !== null} value={content}
                        onChange={(event) => { setContent(event.target.value); setSubmitError(null); }}
                        className={`min-h-24 w-full rounded-kta-md border px-3 py-2 text-sm outline-none ${contentError ? "border-kta-red" : "border-kta-border focus:border-kta-navy"}`}
                    />
                    {contentError && <p id={errorId} role="alert" className="text-xs font-semibold text-kta-red">{contentError}</p>}
                    <div className="flex gap-2">
                        <button type="submit" disabled={pending !== null} className="min-h-11 rounded-kta-md bg-kta-navy px-3 text-sm font-bold text-white disabled:opacity-60">
                            {pending === "update" ? "저장 중…" : "수정 완료"}
                        </button>
                        <button type="button" disabled={pending !== null} onClick={() => { setIsEditing(false); setSubmitError(null); }} className="min-h-11 rounded-kta-md bg-kta-subtle px-3 text-sm font-semibold text-kta-muted">취소</button>
                    </div>
                </form>
            ) : (
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-kta-text [overflow-wrap:anywhere]">{comment.content}</p>
            )}
            {pending === "delete" && <p role="status" className="mt-2 text-sm text-kta-muted">삭제 중…</p>}
            {submitError && <p role="alert" className="mt-2 text-sm text-kta-red">{submitError}</p>}
            {!isEditing && onAddReply && (
                <button type="button" disabled={pending !== null} aria-expanded={isReplying}
                    onClick={handleReply} className="mt-1 inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-kta-muted disabled:opacity-60">
                    <FiMessageCircle aria-hidden="true" />답글
                </button>
            )}
            {isReplying && onAddReply && (
                <div className="mt-2">
                    <p className="mb-2 break-words text-xs text-kta-muted [overflow-wrap:anywhere]">{comment.author.nickname}님에게 답글</p>
                    <CommentForm isReply onAddComment={(form) => onAddReply(comment.id, form)}
                        onCancel={() => setIsReplying(false)} onSuccess={() => setIsReplying(false)} />
                </div>
            )}
        </li>
    );
}
