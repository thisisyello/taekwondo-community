import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getBoardPostsPage } from "../services/board";
import type { BoardPostsPage, BoardQueryFilters } from "../types/board";
import { mergeBoardPostsPages } from "../utils/boardPagination";
import { usePostLikes } from "./usePostLikes";

type PageRequest = Required<BoardQueryFilters> & { enabled: boolean; attempt: number };
type PageSession = {
    request: PageRequest;
    controller: AbortController;
    nextOffset: number;
    hasMore: boolean;
    inFlight: boolean;
};
type PageResult = {
    request: PageRequest;
    data: BoardPostsPage | null;
    error: string | null;
    isLoadingMore: boolean;
    loadMoreError: string | null;
};

export function useBoardPosts(viewerId: string | null = null, filters: BoardQueryFilters = {}, enabled = true) {
    const { board = "all", target = "all", sort = "latest" } = filters;
    const keyword = filters.keyword?.trim() ?? "";
    const [attempt, setAttempt] = useState(0);
    const request = useMemo(() => ({ board, target, keyword, sort, enabled, attempt }), [board, target, keyword, sort, enabled, attempt]);
    const [result, setResult] = useState<PageResult | null>(null);
    const sessionRef = useRef<PageSession | null>(null);

    const fetchPage = useCallback((session: PageSession, append: boolean) => {
        return getBoardPostsPage(session.controller.signal, session.request, session.nextOffset).then((page) => {
            if (session.controller.signal.aborted || sessionRef.current !== session) return;
            session.nextOffset = page.nextOffset;
            session.hasMore = page.hasMore;
            setResult((previous) => {
                if (session.controller.signal.aborted || sessionRef.current !== session) return previous;
                if (append && (previous?.request !== session.request || !previous.data)) return previous;
                return {
                    request: session.request,
                    data: append && previous?.data ? mergeBoardPostsPages(previous.data, page) : page,
                    error: null, isLoadingMore: false, loadMoreError: null,
                };
            });
        }).catch((cause: unknown) => {
            if (session.controller.signal.aborted || sessionRef.current !== session) return;
            const message = cause instanceof Error ? cause.message : "게시글을 불러오지 못했습니다.";
            setResult((previous) => {
                if (session.controller.signal.aborted || sessionRef.current !== session) return previous;
                return append && previous?.request === session.request ? {
                    ...previous, isLoadingMore: false, loadMoreError: message,
                } : {
                    request: session.request, data: null, error: message, isLoadingMore: false, loadMoreError: null,
                };
            });
        }).finally(() => {
            session.inFlight = false;
        });
    }, []);

    useEffect(() => {
        if (!request.enabled) return;
        const session: PageSession = {
            // Only a successful first page can enable additional requests.
            request, controller: new AbortController(), nextOffset: 0, hasMore: false, inFlight: true,
        };
        sessionRef.current = session;
        void fetchPage(session, false);
        return () => {
            session.controller.abort();
            if (sessionRef.current === session) sessionRef.current = null;
        };
    }, [request, fetchPage]);

    const loadMore = useCallback(() => {
        const session = sessionRef.current;
        if (!session || session.request !== request || session.inFlight || !session.hasMore) return;
        session.inFlight = true;
        setResult((previous) => previous?.request === request ? {
            ...previous, isLoadingMore: true, loadMoreError: null,
        } : previous);
        void fetchPage(session, true);
    }, [request, fetchPage]);

    const current = enabled && result?.request === request ? result : null;
    const likes = usePostLikes(current?.data?.posts.map((post) => post.id) ?? [], viewerId);
    return {
        data: current?.data ? {
            ...current.data,
            posts: current.data.posts.map((post) => {
                const state = likes.states.get(post.id);
                return { ...post, likeCount: state?.like_count ?? post.likeCount, isLiked: state?.is_liked ?? false };
            }),
        } : null,
        isLoading: enabled && current === null,
        error: current?.error ?? null,
        isLoadingMore: current?.isLoadingMore ?? false,
        loadMoreError: current?.loadMoreError ?? null,
        hasMore: current?.data?.hasMore ?? false,
        retry: () => setAttempt((value) => value + 1),
        loadMore,
    };
}
