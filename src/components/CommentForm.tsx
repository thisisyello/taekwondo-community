import { useState } from "react";
import type { CommentFormData } from "../types/board";

type CommentFormProps = {
    onAddComment: (comment: CommentFormData) => void;
};

export default function CommentForm({ onAddComment }: CommentFormProps) {
    const [content, setContent] = useState("");
    const [author, setAuthor] = useState("");

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!content.trim() || !author.trim()) return;

        onAddComment({
            content,
            author,
        });

        setContent("");
        setAuthor("");
    };

    return (
        <form onSubmit={handleSubmit}>
            <textarea
                placeholder="댓글 내용"
                value={content}
                onChange={(event) => setContent(event.target.value)}
            />
            <input
                placeholder="작성자"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
            />
            <button type="submit">댓글 등록</button>
        </form>
    );
}
