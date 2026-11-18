import type { Comment } from "../types/board.ts";

export function flattenCommentThreads(comments: Comment[]) {
    const byId = new Map(comments.map((comment) => [comment.id, comment]));
    const children = new Map<string | null, Comment[]>();
    const ordered = [...comments].sort((first, second) =>
        Date.parse(first.createdAt) - Date.parse(second.createdAt) || first.id.localeCompare(second.id));
    for (const comment of ordered) {
        const parent = comment.parentId && byId.has(comment.parentId) ? comment.parentId : null;
        const siblings = children.get(parent) ?? [];
        siblings.push(comment);
        children.set(parent, siblings);
    }
    const result: { comment: Comment; depth: number; parentAuthor: string | null }[] = [];
    const stack = (children.get(null) ?? []).map((comment) => ({ comment, depth: 0 })).reverse();
    const visited = new Set<string>();
    while (stack.length) {
        const item = stack.pop()!;
        if (visited.has(item.comment.id)) continue;
        visited.add(item.comment.id);
        result.push({ ...item, parentAuthor: byId.get(item.comment.parentId ?? "")?.author.nickname ?? null });
        for (const child of [...(children.get(item.comment.id) ?? [])].reverse()) {
            stack.push({ comment: child, depth: item.depth + 1 });
        }
    }
    return result;
}

export function removeCommentBranch(comments: Comment[], rootId: string): Comment[] {
    const children = new Map<string, string[]>();
    for (const comment of comments) {
        if (!comment.parentId) continue;
        const siblings = children.get(comment.parentId) ?? [];
        siblings.push(comment.id);
        children.set(comment.parentId, siblings);
    }
    const removed = new Set<string>();
    const stack = [rootId];
    while (stack.length) {
        const id = stack.pop()!;
        if (removed.has(id)) continue;
        removed.add(id);
        stack.push(...(children.get(id) ?? []));
    }
    return comments.filter((comment) => !removed.has(comment.id));
}
