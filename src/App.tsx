import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useParams } from "react-router";
import AppLayout from "./components/layout/AppLayout";
import BoardSkeleton from "./components/board/BoardSkeleton";
import AuthNotice from "./components/common/AuthNotice";
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
import { createComment, createPost, deleteComment, deletePost, setPostLike, updateComment, updatePost } from "./services/board";
import SearchPage from "./pages/board/SearchPage";
import SignupPage from "./pages/auth/SignupPage";
import { useToast } from "./hooks/useToast";
import { useAuth } from "./hooks/useAuth";
import { useBoardPosts, usePostDetail, usePostForEdit } from "./hooks/useBoardData";
import { isPostId } from "./utils/boardData";
import { removeCommentBranch } from "./utils/commentThreads";
import { isPublicRoute } from "./utils/authRoutes";
import type { BoardFilterType, PostSortType } from "./types/board";

export default function App() {
  const location = useLocation();
  const {
    currentUser,
    isLoading: isAuthLoading,
    error: authError,
    recoveryUserId,
    retry: retryAuth,
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

  const isAuthPending = isAuthLoading || authError !== null;
  const viewerId = isAuthPending ? null : currentUser?.id ?? null;
  const handleLogout = () => {
    void signOut().catch(() => showToast("로그아웃하지 못했습니다. 다시 시도해주세요."));
  };
  const authNotice = authError ? <AuthNotice message={authError} onRetry={retryAuth} onLogout={handleLogout} /> : null;

  if (!isPublicRoute(location.pathname) && isAuthLoading) {
    return <LoadingState message="로그인 정보를 확인하고 있습니다." />;
  }
  if (authError && !isPublicRoute(location.pathname) && location.pathname !== "/reset-password") {
    return (
      <section className="flex min-h-svh flex-col items-center justify-center gap-4 bg-kta-bg px-4 text-center">
        <p role="alert" className="text-sm text-kta-red">
          {authError}
        </p>
        <button
          className="rounded-kta-sm bg-kta-navy px-4 py-3 text-sm font-bold text-white"
          onClick={retryAuth}
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
          <AppLayout title="태권도 커뮤니티" showSearchButton authNotice={authNotice}>
            <BoardBrowseRoute
              mode="list"
              viewerId={viewerId}
              isAuthPending={isAuthPending}
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
          <AppLayout title="검색" showBackButton authNotice={authNotice}>
            <BoardBrowseRoute mode="search" viewerId={viewerId} isAuthPending={isAuthPending} />
          </AppLayout>
        }
      />
      <Route
        path="/dojang"
        element={
          <AppLayout title="찾기" authNotice={authNotice}>
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
          <AppLayout title="게시글" showBackButton authNotice={authNotice}>
            <PostDetailRoute currentUserId={viewerId} isAuthPending={isAuthPending} />
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

type BoardBrowseRouteProps = { viewerId: string | null; isAuthPending: boolean } & (
  | { mode: "search" }
  | {
      mode: "list";
      selectedBoardType: BoardFilterType;
      onSelectBoardType: (board: BoardFilterType) => void;
      postSortType: PostSortType;
      onChangePostSortType: (sort: PostSortType) => void;
    });

function BoardBrowseRoute(props: BoardBrowseRouteProps) {
  if (props.mode === "search")
    return <SearchPage viewerId={props.viewerId} />;
  return <BoardListRoute {...props} />;
}

function BoardListRoute(props: Extract<BoardBrowseRouteProps, { mode: "list" }>) {
  const { data, isLoading, error, retry, hasMore, isLoadingMore, loadMoreError, loadMore } = useBoardPosts(props.viewerId, { board: props.selectedBoardType, sort: props.postSortType });
  return (
    <BoardPage
      posts={data?.posts ?? []}
      commentCountsByPostId={data?.commentCountsByPostId ?? {}}
      isLoading={isLoading}
      error={error}
      onRetry={retry}
      pagination={{ hasMore, isLoadingMore, error: loadMoreError, onLoadMore: loadMore }}
      postSortType={props.postSortType}
      onChangePostSortType={props.onChangePostSortType}
      selectedBoardType={props.selectedBoardType}
      onSelectBoardType={props.onSelectBoardType}
      isAuthPending={props.isAuthPending}
    />
  );
}

function PostDetailRoute({ currentUserId, isAuthPending }: { currentUserId: string | null; isAuthPending: boolean }) {
  const { postId = "" } = useParams();
  return (
    <PostDetailLoader
      key={postId}
      postId={postId}
      currentUserId={currentUserId}
      isAuthPending={isAuthPending}
    />
  );
}

function PostDetailLoader({
  postId,
  currentUserId,
  isAuthPending,
}: {
  postId: string;
  currentUserId: string | null;
  isAuthPending: boolean;
}) {
  const { data, isLoading, error, retry, updateData, isLikeLoading, likeStateError, retryLikeState, updateLikeState } = usePostDetail(postId, currentUserId);
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
      key={`${data.post.id}:${currentUserId ?? "guest"}`}
      post={data.post}
      comments={data.comments}
      currentUserId={currentUserId}
      isAuthPending={isAuthPending}
      isLikeLoading={isLikeLoading}
      likeStateError={likeStateError}
      onRetryLikeState={retryLikeState}
      onDeletePost={async (id) => {
        if (!currentUserId) throw new Error("로그인이 필요합니다.");
        await deletePost(id);
      }}
      onLikePost={async (id, liked) => {
        if (isAuthPending || !currentUserId || isLikeLoading || likeStateError) throw new Error("로그인 및 공감 상태 확인 후 다시 시도해주세요.");
        const state = await setPostLike(id, liked);
        updateLikeState(state);
        updateData((previous) => previous ? {
          ...previous, post: { ...previous.post, likeCount: state.like_count, isLiked: state.is_liked },
        } : previous);
      }}
      onUpdateComment={async (id, content) => {
        if (!currentUserId) throw new Error("로그인이 필요합니다.");
        const comment = await updateComment(id, content);
        updateData((previous) => previous ? {
          ...previous, comments: previous.comments.map((item) => item.id === id ? comment : item),
        } : previous);
      }}
      onDeleteComment={async (id) => {
        if (!currentUserId) throw new Error("로그인이 필요합니다.");
        await deleteComment(id);
        updateData((previous) => previous ? {
          ...previous, comments: removeCommentBranch(previous.comments, id),
        } : previous);
      }}
      onAddComment={async (id, form, parentId = null) => {
        if (!currentUserId) throw new Error("로그인이 필요합니다.");
        const comment = await createComment(id, form, parentId);
        updateData((previous) => previous && (!comment.parentId || previous.comments.some((item) => item.id === comment.parentId)) ? {
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
