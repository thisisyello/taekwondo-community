import type { Comment } from "../types/board";
import CommentItem from "./CommentItem";

type CommentListProps = {
    comments: Comment[];
    onUpdateComment: (id: number, content: string) => void;
    onDeleteComment: (id: number) => void;
};

export default function CommentList({
    comments,
    onUpdateComment,
    onDeleteComment,
}: CommentListProps) {
    if (comments.length === 0) {
        return <p className="text-sm text-kta-muted">댓글이 없습니다.</p>;
    }

    return (
        <ul className="flex flex-col divide-y divide-kta-border">
            {comments.map((comment) => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    onUpdateComment={onUpdateComment}
                    onDeleteComment={onDeleteComment}
                />
            ))}
        </ul>
    );
}
