import { useEffect, useRef } from "react";
import { FiChevronDown, FiRefreshCw } from "react-icons/fi";
import type { Post } from "../../types/board";
import type { PostSortType } from "../../types/board";
import PostItem from "./PostItem";
import BoardSkeleton from "./BoardSkeleton";

export type PostListPagination = {
    hasMore: boolean;
    isLoadingMore: boolean;
    error: string | null;
    onLoadMore: () => void;
};

type PostListProps = {
    posts: Post[];
    commentCountsByPostId: Record<string, number>;
    postSortType: PostSortType;
    onChangePostSortType: (sortType: PostSortType) => void;
    emptyMessage?: string;
    endMessage?: string;
    pagination?: PostListPagination;
};

export default function PostList({
    posts,
    commentCountsByPostId,
    postSortType,
    onChangePostSortType,
    emptyMessage = "게시글이 없습니다.",
    endMessage = "모든 게시글을 확인했습니다.",
    pagination,
}: PostListProps) {
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const { hasMore = false, isLoadingMore = false, error = null, onLoadMore } = pagination ?? {};

    useEffect(() => {
        const element = loadMoreRef.current;
        if (!element || !hasMore || isLoadingMore || error || !onLoadMore) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) onLoadMore();
        }, { rootMargin: "0px" });
        observer.observe(element);
        return () => observer.disconnect();
    }, [hasMore, isLoadingMore, error, onLoadMore, posts.length]);

    return (
        <section className="flex flex-col gap-3 pt-3">
            <div className="flex justify-end">
                <div className="relative w-30 max-w-full">
                    <select
                        aria-label="게시글 정렬"
                        className="h-9 w-full appearance-none rounded-full border border-kta-border bg-kta-surface pl-3 pr-9 text-left text-xs font-bold text-kta-muted outline-none focus:border-kta-navy"
                        value={postSortType}
                        onChange={(event) =>
                            onChangePostSortType(
                                event.target.value as PostSortType,
                            )
                        }
                    >
                        <option value="latest">최신순</option>
                        <option value="oldest">오래된순</option>
                        <option value="mostCommented">댓글 많은순</option>
                    </select>
                    <FiChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-kta-muted" />
                </div>
            </div>

            {posts.length === 0 ? (
                <p className="rounded-kta-lg border border-dashed border-kta-border bg-kta-surface px-5 py-10 text-center text-sm text-kta-muted">
                    {emptyMessage}
                </p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {posts.map((post) => (
                        <PostItem key={post.id} post={post} commentCount={commentCountsByPostId[post.id] ?? 0} />
                    ))}
                </ul>
            )}
            {isLoadingMore ? (
                <BoardSkeleton view="more" />
            ) : error ? (
                <div className="flex flex-col items-center gap-3 border-t border-kta-border px-4 py-6 text-center">
                    <div role="alert" className="max-w-full text-sm">
                        <p className="font-semibold text-kta-red">추가 게시글을 불러오지 못했습니다.</p>
                        <p className="mt-1 break-words text-kta-muted [overflow-wrap:anywhere]">{error}</p>
                    </div>
                    <button type="button" onClick={onLoadMore}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-kta-md border border-kta-border bg-kta-surface px-4 text-sm font-semibold text-kta-text hover:bg-kta-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kta-navy">
                        <FiRefreshCw aria-hidden="true" />
                        다시 불러오기
                    </button>
                </div>
            ) : hasMore ? (
                <div aria-hidden="true" className="h-6" ref={loadMoreRef} />
            ) : pagination && posts.length > 0 ? (
                <p role="status" className="border-t border-kta-border px-4 py-6 text-center text-sm text-kta-muted">{endMessage}</p>
            ) : null}
        </section>
    );
}
