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
        return <p>게시글이 없습니다.</p>;
    }

    return (
        <ul>
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
