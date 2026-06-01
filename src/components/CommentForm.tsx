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
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <textarea
                className="min-h-24 rounded-kta-md border border-kta-border px-3 py-2 text-sm outline-none placeholder:text-kta-muted focus:border-kta-navy"
                placeholder="댓글 내용"
                value={content}
                onChange={(event) => setContent(event.target.value)}
            />
            <input
                className="h-11 rounded-kta-md border border-kta-border px-3 text-sm outline-none placeholder:text-kta-muted focus:border-kta-navy"
                placeholder="작성자"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
            />
            <button
                className="h-11 rounded-kta-md bg-kta-navy text-sm font-bold text-white"
                type="submit"
            >
                댓글 등록
            </button>
        </form>
    );
}
