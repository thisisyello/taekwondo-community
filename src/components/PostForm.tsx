import type { BoardType } from "../types/board";

type PostFormProps = {
  title: string;
  author: string;
  board: BoardType;
  onChangeTitle: (value: string) => void;
  onChangeAuthor: (value: string) => void;
  onChangeBoard: (value: BoardType) => void;
  onAddPost: () => void;
};

export default function PostForm({
  title,
  author,
  board,
  onChangeTitle,
  onChangeAuthor,
  onChangeBoard,
  onAddPost,
}: PostFormProps) {
  return (
    <div>
      <input
        placeholder="제목"
        value={title}
        onChange={(e) => onChangeTitle(e.target.value)}
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
        <option value="free">자유</option>
        <option value="parent">학부모</option>
        <option value="coach">지도진</option>
        <option value="student">관원생</option>
        <option value="question">질문</option>
      </select>

      <button onClick={onAddPost}>글 등록</button>
    </div>
  );
}
