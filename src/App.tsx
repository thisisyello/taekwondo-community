import { useState } from "react";
import { Navigate, Route, Routes, useParams } from "react-router";
import BoardPage from "./pages/BoardPage";
import PostDetailPage from "./pages/PostDetailPage";
import PostEditorPage from "./pages/PostEditorPage";
import type { BoardFilterType, Post } from "./types/board";

export default function App() {
    const [posts, setPosts] = useState<Post[]>([
        {
            id: 1,
            title: "줄넘기 추천 부탁드려요",
            content: "줄넘기 처음 사보는데 어떤 제품이 괜찮을까요?",
            author: "학부모1",
            board: "question",
        },
        {
            id: 2,
            title: "학부모 상담 팁 공유합니다",
            content: "상담 전에 아이의 최근 변화부터 정리하면 대화가 훨씬 좋아집니다.",
            author: "사범님",
            board: "coach",
        },
        {
            id: 3,
            title: "승급심사 준비 중입니다",
            content: "이번 달 승급심사를 앞두고 기본 동작을 다시 점검하고 있습니다.",
            author: "관원생",
            board: "free",
        },
    ]);

    const [selectedBoardType, setSelectedBoardType] =
        useState<BoardFilterType>("all");

    const filteredPosts =
        selectedBoardType === "all"
            ? posts
            : posts.filter((post) => post.board === selectedBoardType);

    const handleCreatePost = (post: Omit<Post, "id">) => {
        const newPost: Post = {
            id: Date.now(),
            ...post,
        };

        setPosts((prev) => [...prev, newPost]);
    };

    const handleUpdatePost = (id: number, updatedPost: Omit<Post, "id">) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.id === id ? { ...post, ...updatedPost } : post,
            ),
        );
    };

    const handleDeletePost = (id: number) => {
        setPosts((prev) => prev.filter((post) => post.id !== id));
    };

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <BoardPage
                        posts={filteredPosts}
                        selectedBoardType={selectedBoardType}
                        onSelectBoardType={setSelectedBoardType}
                    />
                }
            />
            <Route
                path="/posts/new"
                element={
                    <PostEditorPage
                        mode="create"
                        onSubmitPost={handleCreatePost}
                    />
                }
            />
            <Route
                path="/posts/:postId"
                element={
                    <PostDetailRoute
                        posts={posts}
                        onDeletePost={handleDeletePost}
                    />
                }
            />
            <Route
                path="/posts/:postId/edit"
                element={
                    <PostEditRoute
                        posts={posts}
                        onUpdatePost={handleUpdatePost}
                    />
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

type PostRouteProps = {
    posts: Post[];
};

type PostDetailRouteProps = PostRouteProps & {
    onDeletePost: (id: number) => void;
};

function PostDetailRoute({ posts, onDeletePost }: PostDetailRouteProps) {
    const { postId } = useParams();
    const post = posts.find((item) => item.id === Number(postId));

    if (!post) {
        return <Navigate to="/" replace />;
    }

    return <PostDetailPage post={post} onDeletePost={onDeletePost} />;
}

type PostEditRouteProps = PostRouteProps & {
    onUpdatePost: (id: number, post: Omit<Post, "id">) => void;
};

function PostEditRoute({ posts, onUpdatePost }: PostEditRouteProps) {
    const { postId } = useParams();
    const post = posts.find((item) => item.id === Number(postId));

    if (!post) {
        return <Navigate to="/" replace />;
    }

    return (
        <PostEditorPage
            mode="edit"
            post={post}
            onSubmitPost={(updatedPost) => onUpdatePost(post.id, updatedPost)}
        />
    );
}
