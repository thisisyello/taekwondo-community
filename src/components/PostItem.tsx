import { FiEye, FiHeart, FiMessageCircle } from "react-icons/fi";
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
        <li className="rounded-kta-lg border border-kta-border bg-kta-surface shadow-kta-sm transition hover:-translate-y-0.5 hover:shadow-kta-md">
            <Link className="block px-5 py-4" to={`/posts/${post.id}`}>
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-kta-red">
                            {BOARD_LABELS[post.board]}
                        </p>
                        <h3 className="mt-1 line-clamp-1 text-base font-extrabold text-kta-text">
                            {post.title}
                        </h3>
                    </div>

                    <div className="flex shrink-0 gap-1 text-xs font-bold">
                        <span className="inline-flex items-center gap-1 rounded-full bg-kta-subtle px-2 py-1 text-kta-navy">
                            <FiEye aria-hidden="true" />
                            {post.viewCount}
                        </span>
                        {commentCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-kta-subtle px-2 py-1 text-kta-navy">
                                <FiMessageCircle aria-hidden="true" />
                                {commentCount}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-kta-red">
                            <FiHeart aria-hidden="true" />
                            {post.likeCount}
                        </span>
                    </div>
                </div>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-kta-muted">
                    {getPostPreview(post.content)}
                </p>

                <p className="mt-3 text-xs font-medium text-kta-muted">
                    {post.author} · {formatDate(post.createdAt)}
                    {isEdited(post.createdAt, post.updatedAt) && " (수정됨)"}
                </p>
            </Link>
        </li>
    );
}
