import { BOARD_OPTIONS } from "../types/board";
import type { BoardType } from "../types/board";

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
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <input
        className="h-12 rounded-kta-md border border-kta-border px-3 text-sm outline-none placeholder:text-kta-muted focus:border-kta-navy"
        placeholder="제목"
        value={title}
        onChange={(e) => onChangeTitle(e.target.value)}
      />

      <textarea
        className="min-h-52 rounded-kta-md border border-kta-border px-3 py-3 text-sm leading-6 outline-none placeholder:text-kta-muted focus:border-kta-navy"
        placeholder="내용"
        value={content}
        onChange={(e) => onChangeContent(e.target.value)}
      />

      <input
        className="h-12 rounded-kta-md border border-kta-border px-3 text-sm outline-none placeholder:text-kta-muted focus:border-kta-navy"
        placeholder="작성자"
        value={author}
        onChange={(e) => onChangeAuthor(e.target.value)}
      />

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
