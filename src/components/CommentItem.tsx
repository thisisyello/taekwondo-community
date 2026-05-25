import { useState } from "react";
import type { Comment } from "../types/board";

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

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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

    const handleDelete = () => {
        const confirmed = window.confirm("댓글을 삭제하시겠습니까?");

        if (!confirmed) return;

        onDeleteComment(comment.id);
    };

    return (
        <li>
            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                    />
                    <button type="submit">수정 완료</button>
                    <button type="button" onClick={handleCancelEdit}>
                        취소
                    </button>
                </form>
            ) : (
                <p>{comment.content}</p>
            )}
            <p>작성자: {comment.author}</p>
            <button onClick={() => setIsMenuOpen((prev) => !prev)}>
                메뉴
            </button>

            {isMenuOpen && (
                <div>
                    <button onClick={() => setIsEditing(true)}>수정</button>
                    <button onClick={handleDelete}>삭제</button>
                </div>
            )}
        </li>
    );
}
