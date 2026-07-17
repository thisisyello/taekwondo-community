import { useState } from "react";
import type { CommentFormData } from "../types/board";

type CommentFormProps = {
    onAddComment: (comment: CommentFormData) => void;
};

export default function CommentForm({ onAddComment }: CommentFormProps) {
    const [content, setContent] = useState("");
    const [author, setAuthor] = useState("");
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const contentError = hasSubmitted && !content.trim();
    const authorError = hasSubmitted && !author.trim();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setHasSubmitted(true);

        if (!content.trim() || !author.trim()) return;

        onAddComment({
            content,
            author,
        });

        setContent("");
        setAuthor("");
        setHasSubmitted(false);
    };

    return (
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
                <textarea
                    className={
                        contentError
                            ? "min-h-24 rounded-kta-md border border-kta-red px-3 py-2 text-sm outline-none placeholder:text-kta-muted focus:border-kta-red"
                            : "min-h-24 rounded-kta-md border border-kta-border px-3 py-2 text-sm outline-none placeholder:text-kta-muted focus:border-kta-navy"
                    }
                    placeholder="댓글 내용"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                />
                {contentError && (
                    <p className="text-xs font-semibold text-kta-red">
                        댓글 내용을 입력해주세요.
                    </p>
                )}
            </div>
            <div className="flex flex-col gap-1">
                <input
                    className={
                        authorError
                            ? "h-11 rounded-kta-md border border-kta-red px-3 text-sm outline-none placeholder:text-kta-muted focus:border-kta-red"
                            : "h-11 rounded-kta-md border border-kta-border px-3 text-sm outline-none placeholder:text-kta-muted focus:border-kta-navy"
                    }
                    placeholder="작성자"
                    value={author}
                    onChange={(event) => setAuthor(event.target.value)}
                />
                {authorError && (
                    <p className="text-xs font-semibold text-kta-red">
                        작성자를 입력해주세요.
                    </p>
                )}
            </div>
            <button
                className="h-11 rounded-kta-md bg-kta-navy text-sm font-bold text-white"
                type="submit"
            >
                댓글 등록
            </button>
        </form>
    );
}
