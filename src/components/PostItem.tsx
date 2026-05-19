import { Link } from "react-router";
import type { Post } from "../types/board";

type PostItemProps = {
    post: Post;
};

export default function PostItem({ post }: PostItemProps) {
    return (
        <li>
            <h3>
                <Link to={`/posts/${post.id}`}>{post.title}</Link>
            </h3>
            <p>
                작성자: {post.author} | 게시판: {post.board}
            </p>
        </li>
    );
}
