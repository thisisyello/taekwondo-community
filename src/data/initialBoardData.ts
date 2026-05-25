import type { Comment, Post } from "../types/board";

export const initialPosts: Post[] = [
    {
        id: 1,
        title: "줄넘기 추천 부탁드려요",
        content: "줄넘기 처음 사보는데 어떤 제품이 괜찮을까요?",
        author: "학부모1",
        board: "question",
        createdAt: "2026-05-20T09:30:00.000Z",
        updatedAt: "2026-05-20T09:30:00.000Z",
    },
    {
        id: 2,
        title: "학부모 상담 팁 공유합니다",
        content: "상담 전에 아이의 최근 변화부터 정리하면 대화가 훨씬 좋아집니다.",
        author: "사범님",
        board: "coach",
        createdAt: "2026-05-21T12:10:00.000Z",
        updatedAt: "2026-05-21T12:10:00.000Z",
    },
    {
        id: 3,
        title: "승급심사 준비 중입니다",
        content: "이번 달 승급심사를 앞두고 기본 동작을 다시 점검하고 있습니다.",
        author: "관원생",
        board: "free",
        createdAt: "2026-05-22T15:45:00.000Z",
        updatedAt: "2026-05-22T15:45:00.000Z",
    },
];

export const initialComments: Comment[] = [
    {
        id: 1,
        postId: 1,
        content: "저희 아이는 와이어 줄넘기를 쓰고 있어요.",
        author: "학부모2",
        createdAt: "2026-05-20T10:00:00.000Z",
        updatedAt: "2026-05-20T10:00:00.000Z",
    },
    {
        id: 2,
        postId: 2,
        content: "상담 전에 질문 목록을 적어가면 좋더라고요.",
        author: "학부모3",
        createdAt: "2026-05-21T13:20:00.000Z",
        updatedAt: "2026-05-21T13:20:00.000Z",
    },
];
