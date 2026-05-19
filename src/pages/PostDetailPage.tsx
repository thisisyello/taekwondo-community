import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { BOARD_LABELS } from "../types/board";
import type { Post } from "../types/board";

type PostDetailPageProps = {
    post: Post;
    onDeletePost: (id: number) => void;
};

export default function PostDetailPage({
    post,
    onDeletePost,
}: PostDetailPageProps) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleDelete = () => {
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
                    <Link to={`/posts/${post.id}/edit`}>수정</Link>
                    <button onClick={handleDelete}>삭제</button>
                </div>
            )}

            <h1>{post.title}</h1>
            <p>
                작성자: {post.author} | 게시판: {BOARD_LABELS[post.board]}
            </p>
            <p>{post.content}</p>
        </section>
    );
}
