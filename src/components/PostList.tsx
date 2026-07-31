import { useEffect, useMemo, useRef, useState } from "react";
import type { Post } from "../types/board";
import type { PostSortType } from "../types/board";
import PostItem from "./PostItem";

const POSTS_PER_LOAD = 5;

type PostListProps = {
    posts: Post[];
    commentCountsByPostId: Record<number, number>;
    postSortType: PostSortType;
    onChangePostSortType: (sortType: PostSortType) => void;
    emptyMessage?: string;
};

export default function PostList({
    posts,
    commentCountsByPostId,
    postSortType,
    onChangePostSortType,
    emptyMessage = "게시글이 없습니다.",
}: PostListProps) {
    const postListKey = useMemo(
        () => posts.map((post) => post.id).join(","),
        [posts],
    );

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
                <VisiblePostList
                    key={postListKey}
                    posts={posts}
                    commentCountsByPostId={commentCountsByPostId}
                />
            )}
        </section>
    );
}

type VisiblePostListProps = {
    posts: Post[];
    commentCountsByPostId: Record<number, number>;
};

function VisiblePostList({
    posts,
    commentCountsByPostId,
}: VisiblePostListProps) {
    const [visibleCount, setVisibleCount] = useState(POSTS_PER_LOAD);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const visiblePosts = posts.slice(0, visibleCount);
    const hasMorePosts = visibleCount < posts.length;

    useEffect(() => {
        const loadMoreElement = loadMoreRef.current;

        if (!loadMoreElement || !hasMorePosts) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;

                setVisibleCount((prev) =>
                    Math.min(prev + POSTS_PER_LOAD, posts.length),
                );
            },
            { rootMargin: "160px" },
        );

        observer.observe(loadMoreElement);

        return () => {
            observer.disconnect();
        };
    }, [hasMorePosts, posts.length, visibleCount]);

    return (
        <>
            <ul className="flex flex-col gap-3">
                {visiblePosts.map((post) => (
                    <PostItem
                        key={post.id}
                        post={post}
                        commentCount={commentCountsByPostId[post.id] ?? 0}
                    />
                ))}
            </ul>
            {hasMorePosts && (
                <div aria-hidden="true" className="h-6" ref={loadMoreRef} />
            )}
        </>
    );
}
