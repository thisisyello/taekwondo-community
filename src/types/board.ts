export type BoardType = "free" | "parent" | "coach" | "student" | "question";

export type BoardFilterType = BoardType | "all";

export type SearchTarget = "all" | "title" | "content" | "author";

export type PostSortType = "latest" | "oldest" | "mostCommented";

export type BoardOption = {
    type: BoardType;
    label: string;
};

export type BoardFilterOption = {
    type: BoardFilterType;
    label: string;
};

export const BOARD_LABELS: Record<BoardType, string> = {
    free: "자유게시판",
    parent: "학부모게시판",
    coach: "지도진게시판",
    student: "관원생게시판",
    question: "질문게시판",
};

export const BOARD_OPTIONS: BoardOption[] = [
    { type: "free", label: BOARD_LABELS.free },
    { type: "parent", label: BOARD_LABELS.parent },
    { type: "coach", label: BOARD_LABELS.coach },
    { type: "student", label: BOARD_LABELS.student },
    { type: "question", label: BOARD_LABELS.question },
];

export const BOARD_FILTER_OPTIONS: BoardFilterOption[] = [
    { type: "all", label: "전체" },
    ...BOARD_OPTIONS,
];

export type Post = {
    id: number;
    title: string;
    content: string;
    author: string;
    board: BoardType;
    likeCount: number;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
};

export type PostFormData = Omit<
    Post,
    "id" | "likeCount" | "viewCount" | "createdAt" | "updatedAt"
>;

export type Comment = {
    id: number;
    postId: number;
    content: string;
    author: string;
    createdAt: string;
    updatedAt: string;
};

export type CommentFormData = Omit<
    Comment,
    "id" | "postId" | "createdAt" | "updatedAt"
>;
