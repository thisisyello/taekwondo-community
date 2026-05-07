import type { Post } from "../types/board";
import PostItem from "./PostItem";

type PostListProps = {
    posts: Post[];
    onDeletePost: (id: number) => void;
};

export default function PostList({ posts, onDeletePost }: PostListProps) {
    if (posts.length === 0) {
        return <p>게시글이 없습니다.</p>;
    }

    return (
        <ul>
            {posts.map((post) => (
                <PostItem
                    key={post.id}
                    post={post}
                    onDeletePost={onDeletePost}
                />
            ))}
        </ul>
    );
}
