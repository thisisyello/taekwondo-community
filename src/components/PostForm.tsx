import { BOARD_OPTIONS } from "../types/board";
import type { BoardType } from "../types/board";
import { useState } from "react";

type PostFormProps = {
  mode: "create" | "edit";
  title: string;
  content: string;
  author: string;
  board: BoardType;
  onChangeTitle: (value: string) => void;
  onChangeContent: (value: string) => void;
  onChangeAuthor: (value: string) => void;
  onChangeBoard: (value: BoardType) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export default function PostForm({
  mode,
  title,
  content,
  author,
  board,
  onChangeTitle,
  onChangeContent,
  onChangeAuthor,
  onChangeBoard,
  onSubmit,
  onCancel,
}: PostFormProps) {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const titleError = hasSubmitted && !title.trim();
  const contentError = hasSubmitted && !content.trim();
  const authorError = hasSubmitted && !author.trim();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setHasSubmitted(true);

    if (titleError || contentError || authorError) {
      return;
    }

    if (!title.trim() || !content.trim() || !author.trim()) {
      return;
    }

    onSubmit();
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1">
        <input
          className={
            titleError
              ? "h-12 rounded-kta-md border border-kta-red px-3 text-sm outline-none placeholder:text-kta-muted focus:border-kta-red"
              : "h-12 rounded-kta-md border border-kta-border px-3 text-sm outline-none placeholder:text-kta-muted focus:border-kta-navy"
          }
          placeholder="제목"
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
        />
        {titleError && (
          <p className="text-xs font-semibold text-kta-red">
            제목을 입력해주세요.
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
          value={content}
          onChange={(e) => onChangeContent(e.target.value)}
        />
        {contentError && (
          <p className="text-xs font-semibold text-kta-red">
            내용을 입력해주세요.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <input
          className={
            authorError
              ? "h-12 rounded-kta-md border border-kta-red px-3 text-sm outline-none placeholder:text-kta-muted focus:border-kta-red"
              : "h-12 rounded-kta-md border border-kta-border px-3 text-sm outline-none placeholder:text-kta-muted focus:border-kta-navy"
          }
          placeholder="작성자"
          value={author}
          onChange={(e) => onChangeAuthor(e.target.value)}
        />
        {authorError && (
          <p className="text-xs font-semibold text-kta-red">
            작성자를 입력해주세요.
          </p>
        )}
      </div>

      <select
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
          className="h-12 flex-1 rounded-kta-md bg-kta-navy text-sm font-bold text-white"
          type="submit"
        >
          {mode === "create" ? "글 등록" : "수정 완료"}
        </button>
        <button
          className="h-12 flex-1 rounded-kta-md bg-kta-subtle text-sm font-bold text-kta-muted"
          type="button"
          onClick={onCancel}
        >
          취소
        </button>
      </div>
    </form>
  );
}
