import type { Post } from "../types/board";

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
                <li key={post.id}>
                    <h3>{post.title}</h3>
                    <p>
                        작성자: {post.author} | 게시판: {post.board}
                    </p>
                    <button onClick={() => onDeletePost(post.id)}>삭제</button>
                </li>
            ))}
        </ul>
    );
}
