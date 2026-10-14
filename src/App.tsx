import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useParams } from "react-router";
import AppLayout from "./components/layout/AppLayout";
import BoardSkeleton from "./components/board/BoardSkeleton";
import BoardPage from "./pages/board/BoardPage";
import ChatsPage from "./pages/chat/ChatsPage";
import DojangPage from "./pages/dojang/DojangPage";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import MyPage from "./pages/account/MyPage";
import PostDetailPage from "./pages/board/PostDetailPage";
import PostEditorPage from "./pages/board/PostEditorPage";
import { createComment, createPost, setPostLike, updatePost } from "./services/board";
import SearchPage from "./pages/board/SearchPage";
import SignupPage from "./pages/auth/SignupPage";
import { useToast } from "./hooks/useToast";
import { useAuth } from "./hooks/useAuth";
import { useBoardPosts, usePostDetail, usePostForEdit } from "./hooks/useBoardData";
import { isPostId } from "./utils/boardData";
import { filterPostsByBoard, sortPosts } from "./utils/postList";
import type { BoardFilterType, PostSortType } from "./types/board";

export default function App() {
  const location = useLocation();
  const {
    currentUser,
    isLoading: isAuthLoading,
    error: authError,
    recoveryUserId,
    signIn,
    signUp,
    signOut,
  } = useAuth();
  const showToast = useToast();
  const [selectedBoardType, setSelectedBoardType] =
    useState<BoardFilterType>("all");
  const [postSortType, setPostSortType] = useState<PostSortType>("latest");
  const requestedPath: unknown = location.state?.from;
  const detailId =
    typeof requestedPath === "string"
      ? /^\/posts\/([^/]+)(?:\/edit)?$/.exec(requestedPath)?.[1]
      : undefined;
  const returnTo =
    typeof requestedPath === "string" &&
    (["/dojang", "/home", "/chats", "/me", "/posts/new"].includes(requestedPath) ||
      (detailId && isPostId(detailId)))
      ? requestedPath
      : "/";

  if (isAuthLoading) {
    return <LoadingState message="로그인 정보를 확인하고 있습니다." />;
  }
  if (authError && location.pathname !== "/reset-password") {
    return (
      <section className="flex min-h-svh flex-col items-center justify-center gap-4 bg-kta-bg px-4 text-center">
        <p role="alert" className="text-sm text-kta-red">
          {authError}
        </p>
        <button
          className="rounded-kta-sm bg-kta-navy px-4 py-3 text-sm font-bold text-white"
          onClick={() => window.location.reload()}
        >
          다시 시도
        </button>
        <button
          className="text-sm font-semibold text-kta-muted"
          onClick={() => {
            void signOut().catch(() =>
              showToast("로그아웃하지 못했습니다. 다시 시도해주세요."),
            );
          }}
        >
          로그아웃
        </button>
      </section>
    );
  }

  return (
    <Routes>
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/reset-password"
        element={<ResetPasswordPage recoveryUserId={recoveryUserId} />}
      />
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to={returnTo} replace />
          ) : (
            <LoginPage onLogin={signIn} returnTo={returnTo} />
          )
        }
      />
      <Route
        path="/signup"
        element={
          currentUser ? (
            <Navigate to="/" replace />
          ) : (
            <SignupPage onSignup={signUp} />
          )
        }
      />
      <Route
        path="/auth/callback"
        element={
          currentUser ? (
            <Navigate to="/" replace />
          ) : (
            <section className="flex min-h-svh flex-col items-center justify-center gap-4 bg-kta-bg px-4 text-center">
              <p className="text-sm text-kta-muted">
                인증 링크가 만료되었거나 인증을 완료하지 못했습니다.
              </p>
              <Link className="text-sm font-bold text-kta-navy" to="/login">
                로그인으로 돌아가기
              </Link>
            </section>
          )
        }
      />
      <Route
        path="/"
        element={
          <AppLayout title="태권도 커뮤니티" showSearchButton>
            <BoardBrowseRoute
              mode="list"
              selectedBoardType={selectedBoardType}
              onSelectBoardType={setSelectedBoardType}
              postSortType={postSortType}
              onChangePostSortType={setPostSortType}
            />
          </AppLayout>
        }
      />
      <Route
        path="/search"
        element={
          <AppLayout title="검색" showBackButton>
            <BoardBrowseRoute mode="search" />
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
              <MyPage currentUser={currentUser} onLogout={signOut} />
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
              <PostEditorPage mode="create" onSubmitPost={createPost} />
            </AppLayout>
          ) : (
            <LoginRequiredRedirect />
          )
        }
      />
      <Route
        path="/posts/:postId"
        element={
          <AppLayout title="게시글" showBackButton>
            <PostDetailRoute currentUserId={currentUser?.id ?? null} />
          </AppLayout>
        }
      />
      <Route
        path="/posts/:postId/edit"
        element={
          currentUser ? (
            <AppLayout title="글 수정" showBackButton>
              <PostEditRoute currentUserId={currentUser.id} />
            </AppLayout>
          ) : (
            <LoginRequiredRedirect />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

type BoardBrowseRouteProps =
  | { mode: "search" }
  | {
      mode: "list";
      selectedBoardType: BoardFilterType;
      onSelectBoardType: (board: BoardFilterType) => void;
      postSortType: PostSortType;
      onChangePostSortType: (sort: PostSortType) => void;
    };

function BoardBrowseRoute(props: BoardBrowseRouteProps) {
  const { data, isLoading, error, retry } = useBoardPosts();
  if (isLoading)
    return <BoardSkeleton view={props.mode} />;
  if (error || !data)
    return (
      <ErrorState
        message={error ?? "게시글 목록을 불러오지 못했습니다."}
        onRetry={retry}
      />
    );
  if (props.mode === "search")
    return (
      <SearchPage
        posts={data.posts}
        commentCountsByPostId={data.commentCountsByPostId}
      />
    );
  return (
    <BoardPage
      posts={sortPosts(
        filterPostsByBoard(data.posts, props.selectedBoardType),
        props.postSortType,
        data.commentCountsByPostId,
      )}
      commentCountsByPostId={data.commentCountsByPostId}
      postSortType={props.postSortType}
      onChangePostSortType={props.onChangePostSortType}
      selectedBoardType={props.selectedBoardType}
      onSelectBoardType={props.onSelectBoardType}
    />
  );
}

function PostDetailRoute({ currentUserId }: { currentUserId: string | null }) {
  const { postId = "" } = useParams();
  return (
    <PostDetailLoader
      key={postId}
      postId={postId}
      currentUserId={currentUserId}
    />
  );
}

function PostDetailLoader({
  postId,
  currentUserId,
}: {
  postId: string;
  currentUserId: string | null;
}) {
  const { data, isLoading, error, retry, updateData } = usePostDetail(postId);
  if (isLoading) return <BoardSkeleton view="detail" />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (!data)
    return (
      <section className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-kta-muted">
          게시글이 없거나 삭제되었습니다.
        </p>
        <Link to="/" className="text-sm font-semibold text-kta-navy">
          목록으로 돌아가기
        </Link>
      </section>
    );
  return (
    <PostDetailPage
      key={data.post.id}
      post={data.post}
      comments={data.comments}
      currentUserId={currentUserId}
      onLikePost={async (id, liked) => {
        if (!currentUserId) throw new Error("로그인이 필요합니다.");
        const state = await setPostLike(id, liked);
        updateData((previous) => previous ? {
          ...previous, post: { ...previous.post, likeCount: state.like_count, isLiked: state.is_liked },
        } : previous);
      }}
      onAddComment={async (id, form) => {
        if (!currentUserId) throw new Error("로그인이 필요합니다.");
        const comment = await createComment(id, form);
        updateData((previous) => previous ? {
          ...previous,
          comments: [...previous.comments, comment].sort((first, second) =>
            Date.parse(first.createdAt) - Date.parse(second.createdAt) || first.id.localeCompare(second.id)),
        } : previous);
      }}
    />
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <p role="status" className="px-4 py-10 text-center text-sm text-kta-muted">
      {message}
    </p>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section className="flex flex-col items-center gap-4 py-10">
      <p role="alert" className="text-sm text-kta-red">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 rounded-kta-md bg-kta-navy px-4 text-sm font-bold text-white"
      >
        다시 시도
      </button>
    </section>
  );
}

function PostEditRoute({ currentUserId }: { currentUserId: string }) {
  const { postId = "" } = useParams();
  return <PostEditLoader key={postId} postId={postId} currentUserId={currentUserId} />;
}

function PostEditLoader({ postId, currentUserId }: { postId: string; currentUserId: string }) {
  const { data: post, isLoading, error, retry } = usePostForEdit(postId);
  if (isLoading) return <BoardSkeleton view="detail" />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (!post || post.author.id !== currentUserId) {
    return (
      <section className="flex flex-col items-center gap-4 py-10">
        <p role="alert" className="text-sm text-kta-muted">
          {post ? "작성자만 게시글을 수정할 수 있습니다." : "게시글이 없거나 삭제되었습니다."}
        </p>
        <Link to={post ? `/posts/${post.id}` : "/"} replace className="text-sm font-semibold text-kta-navy">
          {post ? "게시글로 돌아가기" : "목록으로 돌아가기"}
        </Link>
      </section>
    );
  }
  return <PostEditorPage key={post.id} mode="edit" post={post} onSubmitPost={(form) => updatePost(post.id, form)} />;
}

function LoginRequiredRedirect() {
  const location = useLocation();
  const showToast = useToast();
  useEffect(() => {
    showToast("로그인이 필요한 서비스입니다.");
  }, [showToast]);
  return <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
