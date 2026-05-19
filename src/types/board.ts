export type BoardType = "free" | "parent" | "coach" | "student" | "question";

export type BoardFilterType = BoardType | "all";

export type Post = {
    id: number;
    title: string;
    content: string;
    author: string;
    board: BoardType;
};

export type PostFormData = Omit<Post, "id">;
