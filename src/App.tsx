import { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useParams } from "react-router";
import { initialComments, initialPosts } from "./data/initialBoardData";
import BoardPage from "./pages/BoardPage";
import PostDetailPage from "./pages/PostDetailPage";
import PostEditorPage from "./pages/PostEditorPage";
import SearchPage from "./pages/SearchPage";
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
import type { CurrentUser } from "./types/user";

const currentUser: CurrentUser = {
    id: "user-current",
    nickname: "현재회원",
    role: "member",
    createdAt: "2026-07-22T00:00:00.000Z",
    updatedAt: "2026-07-22T00:00:00.000Z",
};

const getBoardAuthor = (user: CurrentUser): BoardAuthor => ({
    id: user.id,
    nickname: user.nickname,
});

export default function App() {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [comments, setComments] = useState<Comment[]>(initialComments);

    const [selectedBoardType, setSelectedBoardType] =
        useState<BoardFilterType>("all");
    const [postSortType, setPostSortType] = useState<PostSortType>("latest");

    const commentCountsByPostId = getCommentCountsByPostId(comments);
    const visiblePosts = sortPosts(
        filterPostsByBoard(posts, selectedBoardType),
        postSortType,
        commentCountsByPostId,
    );

    const handleCreatePost = (post: PostFormData) => {
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
                path="/"
                element={
                    <BoardPage
                        posts={visiblePosts}
                        commentCountsByPostId={commentCountsByPostId}
                        postSortType={postSortType}
                        onChangePostSortType={setPostSortType}
                        selectedBoardType={selectedBoardType}
                        onSelectBoardType={setSelectedBoardType}
                    />
                }
            />
            <Route
                path="/search"
                element={
                    <SearchPage
                        posts={posts}
                        commentCountsByPostId={commentCountsByPostId}
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
                        onLikePost={handleLikePost}
                        onViewPost={handleViewPost}
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
    onLikePost: (id: number) => void;
    onViewPost: (id: number) => void;
    onDeletePost: (id: number) => void;
};

function PostDetailRoute({
    posts,
    comments,
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
            onAddComment={onAddComment}
            onUpdateComment={onUpdateComment}
            onDeleteComment={onDeleteComment}
            onLikePost={onLikePost}
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
