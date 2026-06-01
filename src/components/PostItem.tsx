import { Link } from "react-router";
import { BOARD_LABELS } from "../types/board";
import type { Post } from "../types/board";
import { formatDate, isEdited } from "../utils/date";

type PostItemProps = {
    post: Post;
    commentCount: number;
};

const PREVIEW_MAX_LENGTH = 60;

const getPostPreview = (content: string) => {
    if (content.length <= PREVIEW_MAX_LENGTH) {
        return content;
    }

    return `${content.slice(0, PREVIEW_MAX_LENGTH)}...`;
};

export default function PostItem({ post, commentCount }: PostItemProps) {
    return (
        <li>
            <h3>
                <Link to={`/posts/${post.id}`}>
                    {post.title}
                    {commentCount > 0 && ` [${commentCount}]`}
                </Link>
            </h3>
            <p>{getPostPreview(post.content)}</p>
            <p>
                작성자: {post.author} | 게시판: {BOARD_LABELS[post.board]} |
                ❤️: {post.likeCount} | 작성일: {formatDate(post.createdAt)}
                {isEdited(post.createdAt, post.updatedAt) && " (수정됨)"}
            </p>
        </li>
    );
}
