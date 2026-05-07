export type BoardType = "free" | "parent" | "coach" | "student" | "question";

export type BoardFilterType = BoardType | "all";

export type Post = {
    id: number;
    title: string;
    author: string;
    board: BoardType;
};
