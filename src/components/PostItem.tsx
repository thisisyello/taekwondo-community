import type { Post } from "../types/board";

type PostItemProps = {
    post: Post;
    onDeletePost: (id: number) => void;
};

export default function PostItem({ post, onDeletePost }: PostItemProps) {
    return (
        <li>
            <h3>{post.title}</h3>
            <p>
                작성자: {post.author} | 게시판: {post.board}
            </p>
            <button onClick={() => onDeletePost(post.id)}>삭제</button>
        </li>
    );
}
