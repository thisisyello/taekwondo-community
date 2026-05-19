import { useState } from "react";
import { useNavigate } from "react-router";
import PostForm from "../components/PostForm";
import type { BoardType, Post } from "../types/board";

type PostFormState = Omit<Post, "id">;

type PostEditorPageProps =
    | {
          mode: "create";
          onSubmitPost: (post: Omit<Post, "id">) => Post;
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

    const [form, setForm] = useState<PostFormState>({
        title: post?.title ?? "",
        content: post?.content ?? "",
        author: post?.author ?? "",
        board: post?.board ?? "free",
    });

    const updateForm = <Field extends keyof PostFormState>(
        field: Field,
        value: PostFormState[Field],
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = () => {
        if (!form.title.trim() || !form.content.trim() || !form.author.trim()) {
            return;
        }

        if (mode === "edit") {
            onSubmitPost(form);
            navigate(`/posts/${props.post.id}`);
            return;
        }

        const newPost = onSubmitPost(form);
        navigate(`/posts/${newPost.id}`);
    };

    return (
        <section>
            <h1>{mode === "create" ? "글쓰기" : "글 수정"}</h1>

            <PostForm
                mode={mode}
                title={form.title}
                content={form.content}
                author={form.author}
                board={form.board}
                onChangeTitle={(value) => updateForm("title", value)}
                onChangeContent={(value) => updateForm("content", value)}
                onChangeAuthor={(value) => updateForm("author", value)}
                onChangeBoard={(value: BoardType) => updateForm("board", value)}
                onSubmit={handleSubmit}
                onCancel={() => navigate(-1)}
            />
        </section>
    );
}
