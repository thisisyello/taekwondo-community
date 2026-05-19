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
    <form onSubmit={handleSubmit}>
      <input
        placeholder="제목"
        value={title}
        onChange={(e) => onChangeTitle(e.target.value)}
      />

      <textarea
        placeholder="내용"
        value={content}
        onChange={(e) => onChangeContent(e.target.value)}
      />

      <input
        placeholder="작성자"
        value={author}
        onChange={(e) => onChangeAuthor(e.target.value)}
      />

      <select
        value={board}
        onChange={(e) => onChangeBoard(e.target.value as BoardType)}
      >
        {BOARD_OPTIONS.map((option) => (
          <option key={option.type} value={option.type}>
            {option.label}
          </option>
        ))}
      </select>

      <button type="submit">
        {mode === "create" ? "글 등록" : "수정 완료"}
      </button>
      <button type="button" onClick={onCancel}>
        취소
      </button>
    </form>
  );
}
