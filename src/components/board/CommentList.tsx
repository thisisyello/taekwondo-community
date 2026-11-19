import type { Comment, CommentFormData } from "../../types/board";
import CommentItem from "./CommentItem";
import { flattenCommentThreads } from "../../utils/commentThreads";

type CommentListProps = {
    comments: Comment[];
    currentUserId: string | null;
    isAuthPending?: boolean;
    onUpdateComment?: (id: string, content: string) => Promise<void>;
    onDeleteComment?: (id: string) => Promise<void>;
    onAddReply?: (parentId: string, form: CommentFormData) => Promise<void>;
};

export default function CommentList({
    comments,
    currentUserId,
    isAuthPending = false,
    onUpdateComment,
    onDeleteComment,
    onAddReply,
}: CommentListProps) {
    if (comments.length === 0) {
        return <p className="text-sm text-kta-muted">댓글이 없습니다.</p>;
    }

    return (
        <ul className="flex flex-col divide-y divide-kta-border">
            {flattenCommentThreads(comments).map(({ comment, depth, parentAuthor }) => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={currentUserId}
                    isAuthPending={isAuthPending}
                    onUpdateComment={onUpdateComment}
                    onDeleteComment={onDeleteComment}
                    depth={depth}
                    parentAuthor={parentAuthor}
                    onAddReply={onAddReply}
                />
            ))}
        </ul>
    );
}
