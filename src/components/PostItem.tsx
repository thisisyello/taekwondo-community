import { Link } from "react-router";
import { BOARD_LABELS } from "../types/board";
import type { Post } from "../types/board";
import { formatDate, isEdited } from "../utils/date";

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
                작성자: {post.author} | 게시판: {BOARD_LABELS[post.board]} |
                작성일: {formatDate(post.createdAt)}
                {isEdited(post.createdAt, post.updatedAt) && " (수정됨)"}
            </p>
        </li>
    );
}
