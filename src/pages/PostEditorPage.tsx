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
            board: props.post.board,
        };
    }

    return {
        title: "",
        content: "",
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
        if (!form.title.trim() || !form.content.trim()) {
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
        <div className="rounded-kta-lg border border-kta-border bg-kta-surface p-5 shadow-kta-sm">
            <PostForm
                mode={mode}
                title={form.title}
                content={form.content}
                board={form.board}
                onChangeTitle={(value) => updateForm("title", value)}
                onChangeContent={(value) => updateForm("content", value)}
                onChangeBoard={(value: BoardType) => updateForm("board", value)}
                onSubmit={handleSubmit}
                onCancel={() => navigate(-1)}
            />
        </div>
    );
}
