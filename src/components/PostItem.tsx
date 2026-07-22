import { FiEye, FiHeart, FiMessageCircle } from "react-icons/fi";
import { Link } from "react-router";
import { BOARD_LABELS } from "../types/board";
import type { Post } from "../types/board";
import { formatDate, isEdited } from "../utils/date";

type PostItemProps = {
    post: Post;
    commentCount: number;
};

export default function PostItem({ post, commentCount }: PostItemProps) {
    return (
        <li className="rounded-kta-lg border border-kta-border bg-kta-surface shadow-kta-sm transition hover:-translate-y-0.5 hover:shadow-kta-md">
            <Link className="block px-5 py-4" to={`/posts/${post.id}`}>
                <p className="text-xs font-bold text-kta-red">
                    {BOARD_LABELS[post.board]}
                </p>
                <h3 className="mt-1 line-clamp-1 text-base font-extrabold leading-6 text-kta-text">
                    {post.title}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-kta-muted">
                    {post.content}
                </p>

                <div className="mt-3 flex flex-col gap-2 text-xs font-medium text-kta-muted sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        {post.author.nickname} · {formatDate(post.createdAt)}
                        {isEdited(post.createdAt, post.updatedAt) &&
                            " (수정됨)"}
                    </p>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 font-bold">
                        <span className="inline-flex items-center gap-1 text-kta-navy">
                            <FiEye aria-hidden="true" />
                            조회 {post.viewCount}
                        </span>
                        <span className="inline-flex items-center gap-1 text-kta-navy">
                            <FiMessageCircle aria-hidden="true" />
                            댓글 {commentCount}
                        </span>
                        <span className="inline-flex items-center gap-1 text-kta-red">
                            <FiHeart aria-hidden="true" />
                            공감 {post.likeCount}
                        </span>
                    </div>
                </div>
            </Link>
        </li>
    );
}
