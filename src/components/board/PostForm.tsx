import { useState } from "react";
import { BOARD_OPTIONS } from "../../types/board";
import type { BoardType } from "../../types/board";
import { getPostFormErrors } from "../../utils/boardValidation";

type PostFormProps = {
  mode: "create" | "edit";
  title: string;
  content: string;
  board: BoardType;
  onChangeTitle: (value: string) => void;
  onChangeContent: (value: string) => void;
  onChangeBoard: (value: BoardType) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
};

export default function PostForm({
  mode,
  title,
  content,
  board,
  onChangeTitle,
  onChangeContent,
  onChangeBoard,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: PostFormProps) {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const errors = getPostFormErrors(title, content);
  const titleError = hasSubmitted ? errors.title : undefined;
  const contentError = hasSubmitted ? errors.content : undefined;

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setHasSubmitted(true);

    if (isSubmitting || errors.title || errors.content) {
      return;
    }

    onSubmit();
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-1">
        <input
          className={
            titleError
              ? "h-12 rounded-kta-md border border-kta-red px-3 text-sm outline-none placeholder:text-kta-muted focus:border-kta-red"
              : "h-12 rounded-kta-md border border-kta-border px-3 text-sm outline-none placeholder:text-kta-muted focus:border-kta-navy"
          }
          placeholder="제목"
          aria-label="제목"
          aria-invalid={Boolean(titleError)}
          aria-describedby={titleError ? "post-title-error" : undefined}
          disabled={isSubmitting}
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
        />
        {titleError && (
          <p id="post-title-error" role="alert" className="text-xs font-semibold text-kta-red">
            {titleError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <textarea
          className={
            contentError
              ? "min-h-52 rounded-kta-md border border-kta-red px-3 py-3 text-sm leading-6 outline-none placeholder:text-kta-muted focus:border-kta-red"
              : "min-h-52 rounded-kta-md border border-kta-border px-3 py-3 text-sm leading-6 outline-none placeholder:text-kta-muted focus:border-kta-navy"
          }
          placeholder="내용"
          aria-label="내용"
          aria-invalid={Boolean(contentError)}
          aria-describedby={contentError ? "post-content-error" : undefined}
          disabled={isSubmitting}
          value={content}
          onChange={(e) => onChangeContent(e.target.value)}
        />
        {contentError && (
          <p id="post-content-error" role="alert" className="text-xs font-semibold text-kta-red">
            {contentError}
          </p>
        )}
      </div>

      <select
        aria-label="게시판"
        disabled={isSubmitting}
        className="h-12 rounded-kta-md border border-kta-border bg-white px-3 text-sm outline-none focus:border-kta-navy"
        value={board}
        onChange={(e) => onChangeBoard(e.target.value as BoardType)}
      >
        {BOARD_OPTIONS.map((option) => (
          <option key={option.type} value={option.type}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="mt-2 flex gap-2">
        <button
          className="h-12 flex-1 rounded-kta-md bg-kta-navy text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "저장 중…" : mode === "create" ? "글 등록" : "수정 완료"}
        </button>
        <button
          className="h-12 flex-1 rounded-kta-md bg-kta-subtle text-sm font-bold text-kta-muted"
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          취소
        </button>
      </div>
    </form>
  );
}
