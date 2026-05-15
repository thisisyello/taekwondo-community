import { Link } from "react-router";
import type { Post } from "../types/board";

type PostDetailPageProps = {
    post: Post;
};

export default function PostDetailPage({ post }: PostDetailPageProps) {
    return (
        <section>
            <Link to="/">목록으로</Link>
            <h1>{post.title}</h1>
            <p>
                작성자: {post.author} | 게시판: {post.board}
            </p>
            <p>{post.content}</p>
            <Link to={`/posts/${post.id}/edit`}>수정</Link>
        </section>
    );
}
