export function getPostFormErrors(title: string, content: string) {
    return {
        title: !title.trim() ? "제목을 입력해주세요."
            : Array.from(title.trim()).length > 200 ? "제목은 200자 이내로 입력해주세요." : undefined,
        content: !content.trim() ? "내용을 입력해주세요."
            : Array.from(content.trim()).length > 20000 ? "내용은 20,000자 이내로 입력해주세요." : undefined,
    };
}

export function getCommentContentError(content: string): string | undefined {
    if (!content.trim()) return "댓글 내용을 입력해주세요.";
    if (Array.from(content.trim()).length > 2000) return "댓글은 2,000자 이내로 입력해주세요.";
}
