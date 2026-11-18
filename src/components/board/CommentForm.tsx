import { useEffect, useId, useRef, useState } from "react";
import type { CommentFormData } from "../../types/board";
import { getCommentContentError } from "../../utils/boardValidation";
import { useToast } from "../../hooks/useToast";

type CommentFormProps = {
    onAddComment: (comment: CommentFormData) => Promise<void>;
    onCancel?: () => void;
    onSuccess?: () => void;
    isReply?: boolean;
};

export default function CommentForm({ onAddComment, onCancel, onSuccess, isReply = false }: CommentFormProps) {
    const [content, setContent] = useState("");
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const submissionLock = useRef(false);
    const isActive = useRef(true);
    const showToast = useToast();
    const errorId = useId();
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
            showToast(isReply ? "답글이 등록되었습니다." : "댓글이 등록되었습니다.");
            onSuccess?.();
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
                    placeholder={isReply ? "답글 내용" : "댓글 내용"}
                    aria-label={isReply ? "답글 내용" : "댓글 내용"}
                    aria-invalid={Boolean(contentError)}
                    aria-describedby={contentError ? errorId : undefined}
                    disabled={isSubmitting}
                    value={content}
                    onChange={(event) => {
                        setContent(event.target.value);
                        setSubmitError(null);
                    }}
                />
                {contentError && (
                    <p id={errorId} role="alert" className="text-xs font-semibold text-kta-red">
                        {contentError}
                    </p>
                )}
            </div>
            {submitError && <p role="alert" className="text-sm text-kta-red">{submitError}</p>}
            <div className="flex gap-2">
                <button
                    className="h-11 flex-1 rounded-kta-md bg-kta-navy text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "저장 중…" : isReply ? "답글 등록" : "댓글 등록"}
                </button>
                {onCancel && <button type="button" disabled={isSubmitting} onClick={onCancel} className="h-11 rounded-kta-md bg-kta-subtle px-4 text-sm font-semibold text-kta-muted">취소</button>}
            </div>
        </form>
    );
}
