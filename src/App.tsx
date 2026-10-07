import { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router";
import AppLayout from "./components/layout/AppLayout";
import { initialComments, initialPosts } from "./data/initialBoardData";
import BoardPage from "./pages/board/BoardPage";
import ChatsPage from "./pages/chat/ChatsPage";
import DojangPage from "./pages/dojang/DojangPage";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import MyPage from "./pages/account/MyPage";
import PostDetailPage from "./pages/board/PostDetailPage";
import PostEditorPage from "./pages/board/PostEditorPage";
import SearchPage from "./pages/board/SearchPage";
import SignupPage from "./pages/auth/SignupPage";
import { useToast } from "./hooks/useToast";
import {
    filterPostsByBoard,
    getCommentCountsByPostId,
    sortPosts,
} from "./utils/postList";
import type {
    BoardAuthor,
    BoardFilterType,
    Comment,
    CommentFormData,
    Post,
    PostFormData,
    PostSortType,
} from "./types/board";
import type { CurrentUser, SignupFormData } from "./types/user";

const getBoardAuthor = (user: CurrentUser): BoardAuthor => ({
    id: user.id,
    nickname: user.nickname,
});

export default function App() {
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const requestedPath: unknown = location.state?.from;
    const returnTo = typeof requestedPath === "string" && (
        ["/dojang", "/home", "/chats", "/me"].includes(requestedPath) ||
        posts.some((post) => requestedPath === `/posts/${post.id}`)
    ) ? requestedPath : "/";

    const [selectedBoardType, setSelectedBoardType] =
        useState<BoardFilterType>("all");
    const [postSortType, setPostSortType] = useState<PostSortType>("latest");

    const commentCountsByPostId = getCommentCountsByPostId(comments);
    const visiblePosts = sortPosts(
        filterPostsByBoard(posts, selectedBoardType),
        postSortType,
        commentCountsByPostId,
    );

    const handleLogin = (loginId: string) => {
        const now = new Date().toISOString();

        setCurrentUser({
            id: `user-${Date.now()}`,
            loginId,
            name: loginId,
            birthDate: "",
            phoneNumber: "",
            nickname: loginId,
            role: "member",
            createdAt: now,
            updatedAt: now,
        });
    };

    const handleSignup = (signupData: SignupFormData) => {
        const now = new Date().toISOString();

        setCurrentUser({
            id: `user-${Date.now()}`,
            loginId: signupData.loginId,
            name: signupData.name,
            birthDate: signupData.birthDate,
            phoneNumber: signupData.phoneNumber,
            nickname: signupData.nickname,
            role: "member",
            createdAt: now,
            updatedAt: now,
        });
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };

    const handleCreatePost = (post: PostFormData) => {
        if (!currentUser) {
            throw new Error("로그인이 필요합니다.");
        }

        const now = new Date().toISOString();
        const newPost: Post = {
            id: Date.now(),
            ...post,
            author: getBoardAuthor(currentUser),
            likeCount: 0,
            viewCount: 0,
            createdAt: now,
            updatedAt: now,
        };

        setPosts((prev) => [...prev, newPost]);

        return newPost;
    };

    const handleUpdatePost = (id: number, updatedPost: PostFormData) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.id === id
                    ? {
                          ...post,
                          ...updatedPost,
                          updatedAt: new Date().toISOString(),
                      }
                    : post,
            ),
        );
    };

    const handleDeletePost = (id: number) => {
        setPosts((prev) => prev.filter((post) => post.id !== id));
        setComments((prev) => prev.filter((comment) => comment.postId !== id));
    };

    const handleLikePost = (id: number) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.id === id
                    ? { ...post, likeCount: post.likeCount + 1 }
                    : post,
            ),
        );
    };

    const handleViewPost = (id: number) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.id === id
                    ? { ...post, viewCount: post.viewCount + 1 }
                    : post,
            ),
        );
    };

    const handleAddComment = (postId: number, comment: CommentFormData) => {
        if (!currentUser) {
            throw new Error("로그인이 필요합니다.");
        }

        const now = new Date().toISOString();
        const newComment: Comment = {
            id: Date.now(),
            postId,
            ...comment,
            author: getBoardAuthor(currentUser),
            createdAt: now,
            updatedAt: now,
        };

        setComments((prev) => [...prev, newComment]);
    };

    const handleUpdateComment = (id: number, content: string) => {
        setComments((prev) =>
            prev.map((comment) =>
                comment.id === id
                    ? {
                          ...comment,
                          content,
                          updatedAt: new Date().toISOString(),
                      }
                    : comment,
            ),
        );
    };

    const handleDeleteComment = (id: number) => {
        setComments((prev) => prev.filter((comment) => comment.id !== id));
    };

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    currentUser ? (
                        <Navigate to={returnTo} replace />
                    ) : (
                        <LoginPage
                            onLogin={handleLogin}
                            returnTo={returnTo}
                        />
                    )
                }
            />
            <Route
                path="/signup"
                element={
                    currentUser ? (
                        <Navigate to="/" replace />
                    ) : (
                        <SignupPage onSignup={handleSignup} />
                    )
                }
            />
            <Route
                path="/"
                element={
                        <AppLayout
                            title="태권도 커뮤니티"
                            showSearchButton
                        >
                            <BoardPage
                                posts={visiblePosts}
                                commentCountsByPostId={commentCountsByPostId}
                                postSortType={postSortType}
                                onChangePostSortType={setPostSortType}
                                selectedBoardType={selectedBoardType}
                                onSelectBoardType={setSelectedBoardType}
                            />
                        </AppLayout>
                }
            />
            <Route
                path="/search"
                element={
                        <AppLayout title="검색" showBackButton>
                            <SearchPage
                                posts={posts}
                                commentCountsByPostId={commentCountsByPostId}
                            />
                        </AppLayout>
                }
            />
            <Route
                path="/dojang"
                element={
                    <AppLayout title="찾기">
                        <DojangPage />
                    </AppLayout>
                }
            />
            <Route
                path="/home"
                element={
                    <AppLayout title="홈">
                        <HomePage isLoggedIn={currentUser !== null} />
                    </AppLayout>
                }
            />
            <Route
                path="/chats"
                element={
                    currentUser ? (
                        <AppLayout title="채팅" showBackButton>
                            <ChatsPage />
                        </AppLayout>
                    ) : (
                        <LoginRequiredRedirect />
                    )
                }
            />
            <Route
                path="/me"
                element={
                    currentUser ? (
                        <AppLayout title="내정보" showBackButton>
                            <MyPage
                                currentUser={currentUser}
                                onLogout={handleLogout}
                            />
                        </AppLayout>
                    ) : (
                        <LoginRequiredRedirect />
                    )
                }
            />
            <Route
                path="/posts/new"
                element={
                    currentUser ? (
                        <AppLayout title="글쓰기" showBackButton>
                            <PostEditorPage
                                mode="create"
                                onSubmitPost={handleCreatePost}
                            />
                        </AppLayout>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
            <Route
                path="/posts/:postId"
                element={
                        <AppLayout title="게시글" showBackButton>
                            <PostDetailRoute
                                posts={posts}
                                comments={comments}
                                currentUserId={currentUser?.id ?? null}
                                onAddComment={handleAddComment}
                                onUpdateComment={handleUpdateComment}
                                onDeleteComment={handleDeleteComment}
                                onLikePost={handleLikePost}
                                onViewPost={handleViewPost}
                                onDeletePost={handleDeletePost}
                            />
                        </AppLayout>
                }
            />
            <Route
                path="/posts/:postId/edit"
                element={
                    currentUser ? (
                        <AppLayout title="글 수정" showBackButton>
                            <PostEditRoute
                                posts={posts}
                                currentUserId={currentUser.id}
                                onUpdatePost={handleUpdatePost}
                            />
                        </AppLayout>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
            <Route
                path="*"
                element={
                    <Navigate to="/" replace />
                }
            />
        </Routes>
    );
}

function LoginRequiredRedirect() {
    const location = useLocation();
    const showToast = useToast();

    useEffect(() => {
        showToast("로그인이 필요한 서비스입니다.");
    }, [showToast]);

    return (
        <Navigate
            to="/login"
            replace
            state={{ from: location.pathname }}
        />
    );
}

type PostRouteProps = {
    posts: Post[];
};

type PostDetailRouteProps = PostRouteProps & {
    comments: Comment[];
    currentUserId: string | null;
    onAddComment: (postId: number, comment: CommentFormData) => void;
    onUpdateComment: (id: number, content: string) => void;
    onDeleteComment: (id: number) => void;
    onLikePost: (id: number) => void;
    onViewPost: (id: number) => void;
    onDeletePost: (id: number) => void;
};

function PostDetailRoute({
    posts,
    comments,
    currentUserId,
    onAddComment,
    onUpdateComment,
    onDeleteComment,
    onLikePost,
    onViewPost,
    onDeletePost,
}: PostDetailRouteProps) {
    const { postId } = useParams();
    const viewedPostIds = useRef<Set<number>>(new Set());
    const post = posts.find((item) => item.id === Number(postId));

    useEffect(() => {
        const currentPostId = Number(postId);

        if (!post || viewedPostIds.current.has(currentPostId)) return;

        viewedPostIds.current.add(currentPostId);
        onViewPost(currentPostId);
    }, [onViewPost, post, postId]);

    if (!post) {
        return <Navigate to="/" replace />;
    }

    const postComments = comments.filter((comment) => comment.postId === post.id);

    return (
        <PostDetailPage
            post={post}
            comments={postComments}
            currentUserId={currentUserId}
            onAddComment={onAddComment}
            onUpdateComment={onUpdateComment}
            onDeleteComment={onDeleteComment}
            onLikePost={onLikePost}
            onDeletePost={onDeletePost}
        />
    );
}

type PostEditRouteProps = PostRouteProps & {
    currentUserId: string;
    onUpdatePost: (id: number, post: PostFormData) => void;
};

function PostEditRoute({
    posts,
    currentUserId,
    onUpdatePost,
}: PostEditRouteProps) {
    const { postId } = useParams();
    const post = posts.find((item) => item.id === Number(postId));

    if (!post) {
        return <Navigate to="/" replace />;
    }

    if (post.author.id !== currentUserId) {
        return <Navigate to={`/posts/${post.id}`} replace />;
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
