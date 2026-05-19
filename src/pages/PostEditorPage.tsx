import { useState } from "react";
import { useNavigate } from "react-router";
import PostForm from "../components/PostForm";
import type { BoardType, Post, PostFormData } from "../types/board";

type PostEditorPageProps =
    | {
          mode: "create";
          onSubmitPost: (post: PostFormData) => Post;
      }
    | {
          mode: "edit";
          post: Post;
          onSubmitPost: (post: PostFormData) => void;
      };

const getInitialForm = (props: PostEditorPageProps): PostFormData => {
    if (props.mode === "edit") {
        return {
            title: props.post.title,
            content: props.post.content,
            author: props.post.author,
            board: props.post.board,
        };
    }

    return {
        title: "",
        content: "",
        author: "",
        board: "free",
    };
};

export default function PostEditorPage(props: PostEditorPageProps) {
    const navigate = useNavigate();
    const { mode, onSubmitPost } = props;
    const [form, setForm] = useState<PostFormData>(() =>
        getInitialForm(props),
    );

    const updateForm = <Field extends keyof PostFormData>(
        field: Field,
        value: PostFormData[Field],
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
