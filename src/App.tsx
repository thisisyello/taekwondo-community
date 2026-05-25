import { useState } from "react";
import { Navigate, Route, Routes, useParams } from "react-router";
import BoardPage from "./pages/BoardPage";
import PostDetailPage from "./pages/PostDetailPage";
import PostEditorPage from "./pages/PostEditorPage";
import type {
    BoardFilterType,
    Comment,
    CommentFormData,
    Post,
    PostFormData,
} from "./types/board";

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
    const [comments, setComments] = useState<Comment[]>([
        {
            id: 1,
            postId: 1,
            content: "저희 아이는 와이어 줄넘기를 쓰고 있어요.",
            author: "학부모2",
        },
        {
            id: 2,
            postId: 2,
            content: "상담 전에 질문 목록을 적어가면 좋더라고요.",
            author: "학부모3",
        },
    ]);

    const [selectedBoardType, setSelectedBoardType] =
        useState<BoardFilterType>("all");

    const filteredPosts =
        selectedBoardType === "all"
            ? posts
            : posts.filter((post) => post.board === selectedBoardType);

    const handleCreatePost = (post: PostFormData) => {
        const newPost: Post = {
            id: Date.now(),
            ...post,
        };

        setPosts((prev) => [...prev, newPost]);

        return newPost;
    };

    const handleUpdatePost = (id: number, updatedPost: PostFormData) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.id === id ? { ...post, ...updatedPost } : post,
            ),
        );
    };

    const handleDeletePost = (id: number) => {
        setPosts((prev) => prev.filter((post) => post.id !== id));
        setComments((prev) => prev.filter((comment) => comment.postId !== id));
    };

    const handleAddComment = (postId: number, comment: CommentFormData) => {
        const newComment: Comment = {
            id: Date.now(),
            postId,
            ...comment,
        };

        setComments((prev) => [...prev, newComment]);
    };

    const handleUpdateComment = (id: number, content: string) => {
        setComments((prev) =>
            prev.map((comment) =>
                comment.id === id ? { ...comment, content } : comment,
            ),
        );
    };

    const handleDeleteComment = (id: number) => {
        setComments((prev) => prev.filter((comment) => comment.id !== id));
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
                        comments={comments}
                        onAddComment={handleAddComment}
                        onUpdateComment={handleUpdateComment}
                        onDeleteComment={handleDeleteComment}
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
    comments: Comment[];
    onAddComment: (postId: number, comment: CommentFormData) => void;
    onUpdateComment: (id: number, content: string) => void;
    onDeleteComment: (id: number) => void;
    onDeletePost: (id: number) => void;
};

function PostDetailRoute({
    posts,
    comments,
    onAddComment,
    onUpdateComment,
    onDeleteComment,
    onDeletePost,
}: PostDetailRouteProps) {
    const { postId } = useParams();
    const post = posts.find((item) => item.id === Number(postId));

    if (!post) {
        return <Navigate to="/" replace />;
    }

    const postComments = comments.filter((comment) => comment.postId === post.id);

    return (
        <PostDetailPage
            post={post}
            comments={postComments}
            onAddComment={onAddComment}
            onUpdateComment={onUpdateComment}
            onDeleteComment={onDeleteComment}
            onDeletePost={onDeletePost}
        />
    );
}

type PostEditRouteProps = PostRouteProps & {
    onUpdatePost: (id: number, post: PostFormData) => void;
};

function PostEditRoute({ posts, onUpdatePost }: PostEditRouteProps) {
    const { postId } = useParams();
    const post = posts.find((item) => item.id === Number(postId));

    if (!post) {
        return <Navigate to="/" replace />;
    }

    return (
        <PostEditorPage
            key={post.id}
            mode="edit"
            post={post}
            onSubmitPost={(updatedPost) => onUpdatePost(post.id, updatedPost)}
        />
    );
}
