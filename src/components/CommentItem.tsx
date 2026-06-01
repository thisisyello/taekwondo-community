import { useState } from "react";
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

    const handleToggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const handleSubmitEdit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!content.trim()) return;

        onUpdateComment(comment.id, content);
        setIsEditing(false);
        setIsMenuOpen(false);
    };

    const handleCancelEdit = () => {
        setContent(comment.content);
        setIsEditing(false);
    };

    const handleStartEdit = () => {
        setIsMenuOpen(false);
        setIsEditing(true);
    };

    const handleDelete = () => {
        setIsMenuOpen(false);

        const confirmed = window.confirm("댓글을 삭제하시겠습니까?");

        if (!confirmed) return;

        onDeleteComment(comment.id);
    };

    return (
        <li className="py-4">
            {isEditing ? (
                <form className="flex flex-col gap-2" onSubmit={handleSubmitEdit}>
                    <textarea
                        className="min-h-24 rounded-kta-md border border-kta-border px-3 py-2 text-sm outline-none focus:border-kta-navy"
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                    />
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
                <p className="text-sm leading-6 text-kta-text">
                    {comment.content}
                </p>
            )}
            <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-kta-muted">
                    {comment.author} · {formatDate(comment.createdAt)}
                    {isEdited(comment.createdAt, comment.updatedAt) &&
                        " (수정됨)"}
                </p>
                <div className="relative">
                    <button
                        className="rounded-full bg-kta-subtle px-3 py-1 text-xs font-bold text-kta-muted"
                        onClick={handleToggleMenu}
                    >
                        메뉴
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
        </li>
    );
}
