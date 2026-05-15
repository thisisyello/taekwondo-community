import { useState } from "react";
import { Link } from "react-router";
import type { Post } from "../types/board";

type PostItemProps = {
    post: Post;
    onDeletePost: (id: number) => void;
};

export default function PostItem({ post, onDeletePost }: PostItemProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <li>
            <h3>
                <Link to={`/posts/${post.id}`}>{post.title}</Link>
            </h3>
            <p>
                작성자: {post.author} | 게시판: {post.board}
            </p>
            <button onClick={() => setIsMenuOpen((prev) => !prev)}>
                메뉴
            </button>

            {isMenuOpen && (
                <div>
                    <Link to={`/posts/${post.id}/edit`}>수정</Link>
                    <button onClick={() => onDeletePost(post.id)}>삭제</button>
                </div>
            )}
        </li>
    );
}
