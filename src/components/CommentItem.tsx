import { useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import type { Comment } from "../types/board";
import { formatDate, isEdited } from "../utils/date";

type CommentItemProps = {
    comment: Comment;
    onUpdateComment: (id: number, content: string) => void;
    onDeleteComment: (id: number) => void;
};

export default function CommentItem({
    comment,
    onUpdateComment,
    onDeleteComment,
}: CommentItemProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(comment.content);
    const [hasSubmittedEdit, setHasSubmittedEdit] = useState(false);
    const contentError = hasSubmittedEdit && !content.trim();

    const handleToggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const handleSubmitEdit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setHasSubmittedEdit(true);

        if (!content.trim()) return;

        onUpdateComment(comment.id, content);
        setIsEditing(false);
        setIsMenuOpen(false);
        setHasSubmittedEdit(false);
    };

    const handleCancelEdit = () => {
        setContent(comment.content);
        setIsEditing(false);
        setHasSubmittedEdit(false);
    };

    const handleStartEdit = () => {
        setIsMenuOpen(false);
        setIsEditing(true);
        setHasSubmittedEdit(false);
    };

    const handleDelete = () => {
        setIsMenuOpen(false);

        const confirmed = window.confirm("댓글을 삭제하시겠습니까?");

        if (!confirmed) return;

        onDeleteComment(comment.id);
    };

    return (
        <li className="py-4">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-kta-muted">
                    <span className="font-extrabold text-kta-text">
                        {comment.author}
                    </span>{" "}
                    · {formatDate(comment.createdAt)}
                    {isEdited(comment.createdAt, comment.updatedAt) &&
                        " (수정됨)"}
                </p>
                <div className="relative">
                    <button
                        className="rounded-full bg-kta-subtle px-3 py-1 text-xs font-bold text-kta-muted"
                        onClick={handleToggleMenu}
                    >
                        <FiMoreVertical aria-hidden="true" />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 top-8 z-10 flex min-w-24 flex-col overflow-hidden rounded-kta-md border border-kta-border bg-kta-surface shadow-kta-md">
                            <button
                                className="px-3 py-2 text-left text-sm font-semibold text-kta-text hover:bg-kta-subtle"
                                onClick={handleStartEdit}
                            >
                                수정
                            </button>
                            <button
                                className="px-3 py-2 text-left text-sm font-semibold text-kta-red hover:bg-red-50"
                                onClick={handleDelete}
                            >
                                삭제
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isEditing ? (
                <form
                    className="mt-3 flex flex-col gap-2"
                    onSubmit={handleSubmitEdit}
                >
                    <textarea
                        className={
                            contentError
                                ? "min-h-24 rounded-kta-md border border-kta-red px-3 py-2 text-sm outline-none focus:border-kta-red"
                                : "min-h-24 rounded-kta-md border border-kta-border px-3 py-2 text-sm outline-none focus:border-kta-navy"
                        }
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                    />
                    {contentError && (
                        <p className="text-xs font-semibold text-kta-red">
                            댓글 내용을 입력해주세요.
                        </p>
                    )}
                    <div className="flex gap-2">
                        <button
                            className="rounded-kta-md bg-kta-navy px-3 py-2 text-sm font-bold text-white"
                            type="submit"
                        >
                            수정 완료
                        </button>
                        <button
                            className="rounded-kta-md bg-kta-subtle px-3 py-2 text-sm font-bold text-kta-muted"
                            type="button"
                            onClick={handleCancelEdit}
                        >
                            취소
                        </button>
                    </div>
                </form>
            ) : (
                <p className="mt-2 text-sm leading-6 text-kta-text">
                    {comment.content}
                </p>
            )}
        </li>
    );
}
