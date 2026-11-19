import { isPostId } from "./boardData.ts";

export function isPublicRoute(pathname: string): boolean {
    const path = pathname.replace(/\/+$/, "").toLowerCase() || "/";
    if (["/", "/search", "/dojang", "/forgot-password"].includes(path)) return true;
    const postId = /^\/posts\/([^/]+)$/.exec(path)?.[1];
    return postId !== undefined && isPostId(postId);
}
