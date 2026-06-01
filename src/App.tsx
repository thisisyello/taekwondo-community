import { useState } from "react";
import { Navigate, Route, Routes, useParams } from "react-router";
import { initialComments, initialPosts } from "./data/initialBoardData";
import BoardPage from "./pages/BoardPage";
import PostDetailPage from "./pages/PostDetailPage";
import PostEditorPage from "./pages/PostEditorPage";
import type {
    BoardFilterType,
    Comment,
    CommentFormData,
    Post,
    PostFormData,
    PostSortType,
    SearchTarget,
} from "./types/board";

export default function App() {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [comments, setComments] = useState<Comment[]>(initialComments);

    const [selectedBoardType, setSelectedBoardType] =
        useState<BoardFilterType>("all");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchTarget, setSearchTarget] = useState<SearchTarget>("all");
    const [postSortType, setPostSortType] = useState<PostSortType>("latest");

    const filteredByBoardPosts =
        selectedBoardType === "all"
            ? posts
            : posts.filter((post) => post.board === selectedBoardType);

    const normalizedSearchKeyword = searchKeyword.trim().toLowerCase();
    const filteredBySearchPosts =
        normalizedSearchKeyword.length === 0
            ? filteredByBoardPosts
            : filteredByBoardPosts.filter((post) => {
                  if (searchTarget === "all") {
                      return [post.title, post.content, post.author].some(
                          (value) =>
                              value
                                  .toLowerCase()
                                  .includes(normalizedSearchKeyword),
                      );
                  }

                  return post[searchTarget]
                      .toLowerCase()
                      .includes(normalizedSearchKeyword);
              });

    const commentCountsByPostId = comments.reduce<Record<number, number>>(
        (counts, comment) => ({
            ...counts,
            [comment.postId]: (counts[comment.postId] ?? 0) + 1,
        }),
        {},
    );

    const sortedPosts = [...filteredBySearchPosts].sort((firstPost, secondPost) => {
        if (postSortType === "oldest") {
            return (
                new Date(firstPost.createdAt).getTime() -
                new Date(secondPost.createdAt).getTime()
            );
        }

        if (postSortType === "mostCommented") {
            return (
                (commentCountsByPostId[secondPost.id] ?? 0) -
                (commentCountsByPostId[firstPost.id] ?? 0)
            );
        }

        return (
            new Date(secondPost.createdAt).getTime() -
            new Date(firstPost.createdAt).getTime()
        );
    });

    const handleCreatePost = (post: PostFormData) => {
        const now = new Date().toISOString();
        const newPost: Post = {
            id: Date.now(),
            ...post,
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

    const handleAddComment = (postId: number, comment: CommentFormData) => {
        const now = new Date().toISOString();
        const newComment: Comment = {
            id: Date.now(),
            postId,
            ...comment,
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
                        posts={sortedPosts}
                        commentCountsByPostId={commentCountsByPostId}
                        searchKeyword={searchKeyword}
                        searchTarget={searchTarget}
                        postSortType={postSortType}
                        onChangeSearchKeyword={setSearchKeyword}
                        onChangeSearchTarget={setSearchTarget}
                        onChangePostSortType={setPostSortType}
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
