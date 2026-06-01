import type { Post } from "../types/board";
import PostItem from "./PostItem";

type PostListProps = {
    posts: Post[];
    commentCountsByPostId: Record<number, number>;
};

export default function PostList({
    posts,
    commentCountsByPostId,
}: PostListProps) {
    if (posts.length === 0) {
        return (
            <p className="rounded-kta-lg border border-dashed border-kta-border bg-kta-surface px-5 py-10 text-center text-sm text-kta-muted">
                게시글이 없습니다.
            </p>
        );
    }

    return (
        <ul className="flex flex-col gap-3">
            {posts.map((post) => (
                <PostItem
                    key={post.id}
                    post={post}
                    commentCount={commentCountsByPostId[post.id] ?? 0}
                />
            ))}
        </ul>
    );
}
