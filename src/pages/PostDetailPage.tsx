import { useState } from "react";
import { Link, useNavigate } from "react-router";
import CommentForm from "../components/CommentForm";
import CommentList from "../components/CommentList";
import { BOARD_LABELS } from "../types/board";
import type { Comment, CommentFormData, Post } from "../types/board";
import { formatDate, isEdited } from "../utils/date";

type PostDetailPageProps = {
    post: Post;
    comments: Comment[];
    onAddComment: (postId: number, comment: CommentFormData) => void;
    onUpdateComment: (id: number, content: string) => void;
    onDeleteComment: (id: number) => void;
    onLikePost: (id: number) => void;
    onDeletePost: (id: number) => void;
};

export default function PostDetailPage({
    post,
    comments,
    onAddComment,
    onUpdateComment,
    onDeleteComment,
    onLikePost,
    onDeletePost,
}: PostDetailPageProps) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleStartEdit = () => {
        setIsMenuOpen(false);
    };

    const handleDelete = () => {
        setIsMenuOpen(false);

        const confirmed = window.confirm("게시글을 삭제하시겠습니까?");

        if (!confirmed) return;

        onDeletePost(post.id);
        navigate("/");
    };

    return (
        <section>
            <Link to="/">목록으로</Link>
            <button onClick={() => setIsMenuOpen((prev) => !prev)}>
                메뉴
            </button>

            {isMenuOpen && (
                <div>
                    <Link to={`/posts/${post.id}/edit`} onClick={handleStartEdit}>
                        수정
                    </Link>
                    <button onClick={handleDelete}>삭제</button>
                </div>
            )}

            <h1>{post.title}</h1>
            <p>
                작성자: {post.author} | 게시판: {BOARD_LABELS[post.board]}
            </p>
            <p>
                작성일: {formatDate(post.createdAt)}
                {isEdited(post.createdAt, post.updatedAt) && " (수정됨)"}
            </p>
            <p>{post.content}</p>
            <button onClick={() => onLikePost(post.id)}>
                ❤️ {post.likeCount}
            </button>

            <section>
                <h2>댓글</h2>
                <CommentList
                    comments={comments}
                    onUpdateComment={onUpdateComment}
                    onDeleteComment={onDeleteComment}
                />
                <CommentForm
                    onAddComment={(comment) => onAddComment(post.id, comment)}
                />
            </section>
        </section>
    );
}
