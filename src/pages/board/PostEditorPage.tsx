import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import PostForm from "../../components/board/PostForm";
import type { BoardType, Post, PostFormData } from "../../types/board";
import { useToast } from "../../hooks/useToast";
import { getPostFormErrors } from "../../utils/boardValidation";

type PostEditorPageProps =
    | {
          mode: "create";
          onSubmitPost: (post: PostFormData) => Promise<{ id: string }>;
      }
    | {
          mode: "edit";
          post: Post;
          onSubmitPost: (post: PostFormData) => Promise<void>;
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
    const showToast = useToast();
    const submissionLock = useRef(false);
    const isActive = useRef(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const { mode } = props;
    const [form, setForm] = useState<PostFormData>(() =>
        getInitialForm(props),
    );

    useEffect(() => {
        isActive.current = true;
        return () => { isActive.current = false; };
    }, []);

    const updateForm = <Field extends keyof PostFormData>(
        field: Field,
        value: PostFormData[Field],
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async () => {
        const errors = getPostFormErrors(form.title, form.content);
        if (submissionLock.current || errors.title || errors.content) {
            return;
        }

        submissionLock.current = true;
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            if (props.mode === "edit") {
                await props.onSubmitPost(form);
                if (!isActive.current) return;
                showToast("게시글이 수정되었습니다.");
                navigate(`/posts/${props.post.id}`, { replace: true });
            } else {
                const newPost = await props.onSubmitPost(form);
                if (!isActive.current) return;
                showToast("게시글이 등록되었습니다.");
                navigate(`/posts/${newPost.id}`, { replace: true });
            }
        } catch (error) {
            if (isActive.current) setSubmitError(error instanceof Error ? error.message : "게시글을 저장하지 못했습니다. 다시 시도해주세요.");
        } finally {
            submissionLock.current = false;
            if (isActive.current) setIsSubmitting(false);
        }
    };

    return (
        <div className="rounded-kta-lg border border-kta-border bg-kta-surface p-5 shadow-kta-sm">
            {submitError && <p role="alert" className="mb-3 text-sm text-kta-red">{submitError}</p>}
            <PostForm
                mode={mode}
                title={form.title}
                content={form.content}
                board={form.board}
                onChangeTitle={(value) => updateForm("title", value)}
                onChangeContent={(value) => updateForm("content", value)}
                onChangeBoard={(value: BoardType) => updateForm("board", value)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                onCancel={() => navigate(-1)}
            />
        </div>
    );
}
