import { useState } from "react";
import { useNavigate } from "react-router";
import PostForm from "../components/PostForm";
import type { BoardType, Post } from "../types/board";

type PostEditorPageProps =
    | {
          mode: "create";
          onSubmitPost: (post: Omit<Post, "id">) => void;
      }
    | {
          mode: "edit";
          post: Post;
          onSubmitPost: (post: Omit<Post, "id">) => void;
      };

export default function PostEditorPage(props: PostEditorPageProps) {
    const navigate = useNavigate();
    const { mode, onSubmitPost } = props;
    const post = mode === "edit" ? props.post : null;

    const [title, setTitle] = useState(post?.title ?? "");
    const [content, setContent] = useState(post?.content ?? "");
    const [author, setAuthor] = useState(post?.author ?? "");
    const [board, setBoard] = useState<BoardType>(post?.board ?? "free");

    const handleSubmit = () => {
        if (!title.trim() || !content.trim() || !author.trim()) return;

        onSubmitPost({
            title,
            content,
            author,
            board,
        });

        if (mode === "edit") {
            navigate(`/posts/${props.post.id}`);
            return;
        }

        navigate("/");
    };

    return (
        <section>
            <h1>{mode === "create" ? "글쓰기" : "글 수정"}</h1>

            <PostForm
                mode={mode}
                title={title}
                content={content}
                author={author}
                board={board}
                onChangeTitle={setTitle}
                onChangeContent={setContent}
                onChangeAuthor={setAuthor}
                onChangeBoard={setBoard}
                onSubmit={handleSubmit}
                onCancel={() => navigate(-1)}
            />
        </section>
    );
}
