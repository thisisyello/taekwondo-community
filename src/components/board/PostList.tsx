import { useEffect, useRef } from "react";
import type { Post } from "../../types/board";
import type { PostSortType } from "../../types/board";
import PostItem from "./PostItem";

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
    pagination?: PostListPagination;
};

export default function PostList({
    posts,
    commentCountsByPostId,
    postSortType,
    onChangePostSortType,
    emptyMessage = "게시글이 없습니다.",
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
                <select
                    className="h-9 rounded-full border border-kta-border bg-kta-surface px-3 text-xs font-bold text-kta-muted outline-none focus:border-kta-navy"
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
            {error ? (
                <div className="flex flex-col items-center gap-3 py-4">
                    <p role="alert" className="text-sm text-kta-red">{error}</p>
                    <button type="button" onClick={onLoadMore} className="min-h-11 rounded-kta-md border border-kta-border px-4 text-sm font-semibold text-kta-text">다시 불러오기</button>
                </div>
            ) : isLoadingMore ? (
                <p role="status" className="py-4 text-center text-sm text-kta-muted">게시글을 불러오고 있습니다.</p>
            ) : hasMore && (
                <div aria-hidden="true" className="h-6" ref={loadMoreRef} />
            )}
        </section>
    );
}
