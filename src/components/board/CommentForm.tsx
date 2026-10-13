import { useEffect, useRef, useState } from "react";
import type { CommentFormData } from "../../types/board";
import { getCommentContentError } from "../../utils/boardValidation";
import { useToast } from "../../hooks/useToast";

type CommentFormProps = {
    onAddComment: (comment: CommentFormData) => Promise<void>;
};

export default function CommentForm({ onAddComment }: CommentFormProps) {
    const [content, setContent] = useState("");
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const submissionLock = useRef(false);
    const isActive = useRef(true);
    const showToast = useToast();
    const contentError = hasSubmitted ? getCommentContentError(content) : undefined;
    useEffect(() => {
        isActive.current = true;
        return () => { isActive.current = false; };
    }, []);

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        setHasSubmitted(true);

        if (submissionLock.current || getCommentContentError(content)) return;
        submissionLock.current = true;
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await onAddComment({ content });
            if (!isActive.current) return;
            setContent("");
            setHasSubmitted(false);
            showToast("댓글이 등록되었습니다.");
        } catch (error) {
            if (isActive.current) setSubmitError(error instanceof Error ? error.message : "댓글을 저장하지 못했습니다. 다시 시도해주세요.");
        } finally {
            submissionLock.current = false;
            if (isActive.current) setIsSubmitting(false);
        }
    };

    return (
        <form className="flex flex-col gap-2" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-1">
                <textarea
                    className={
                        contentError
                            ? "min-h-24 rounded-kta-md border border-kta-red px-3 py-2 text-sm outline-none placeholder:text-kta-muted focus:border-kta-red"
                            : "min-h-24 rounded-kta-md border border-kta-border px-3 py-2 text-sm outline-none placeholder:text-kta-muted focus:border-kta-navy"
                    }
                    placeholder="댓글 내용"
                    aria-label="댓글 내용"
                    aria-invalid={Boolean(contentError)}
                    aria-describedby={contentError ? "comment-content-error" : undefined}
                    disabled={isSubmitting}
                    value={content}
                    onChange={(event) => {
                        setContent(event.target.value);
                        setSubmitError(null);
                    }}
                />
                {contentError && (
                    <p id="comment-content-error" role="alert" className="text-xs font-semibold text-kta-red">
                        {contentError}
                    </p>
                )}
            </div>
            {submitError && <p role="alert" className="text-sm text-kta-red">{submitError}</p>}
            <button
                className="h-11 rounded-kta-md bg-kta-navy text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
                type="submit"
                disabled={isSubmitting}
            >
                {isSubmitting ? "저장 중…" : "댓글 등록"}
            </button>
        </form>
    );
}
