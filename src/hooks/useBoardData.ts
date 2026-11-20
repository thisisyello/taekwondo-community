import { useCallback, useEffect, useRef, useState } from "react";
import { getPostDetail, getPostForEdit, incrementPostViewCount } from "../services/board";
import { usePostLikes } from "./usePostLikes";
export { useBoardPosts } from "./useBoardPosts";

function useBoardQuery<T>(load: (signal: AbortSignal) => Promise<T>) {
    const [attempt, setAttempt] = useState(0);
    const [state, setState] = useState<{ source: typeof load; data: T | null; isLoading: boolean; error: string | null }>({
        source: load, data: null, isLoading: true, error: null,
    });
    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal).then((data) => {
            if (!controller.signal.aborted) setState({ source: load, data, isLoading: false, error: null });
        }).catch((cause: unknown) => {
            if (!controller.signal.aborted) {
                setState({ source: load, data: null, isLoading: false, error: cause instanceof Error ? cause.message : "데이터를 불러오지 못했습니다." });
            }
        });
        return () => controller.abort();
    }, [load, attempt]);
    const retry = () => {
        setState({ source: load, data: null, isLoading: true, error: null });
        setAttempt((value) => value + 1);
    };
    const updateData = useCallback((update: (data: T) => T) => {
        setState((previous) => previous.source !== load || previous.data === null ? previous : { ...previous, data: update(previous.data) });
    }, [load]);
    const current = state.source === load ? state : { data: null, isLoading: true, error: null };
    return { data: current.data, isLoading: current.isLoading, error: current.error, retry, updateData };
}

export function usePostForEdit(id: string) {
    const load = useCallback((signal: AbortSignal) => getPostForEdit(id, signal), [id]);
    return useBoardQuery(load);
}

export function usePostDetail(id: string, viewerId: string | null = null) {
    const load = useCallback((signal: AbortSignal) => getPostDetail(id, signal), [id]);
    const query = useBoardQuery(load);
    const viewedPostId = useRef<string | null>(null);
    const loadedPostId = query.data?.post.id;
    const { updateData } = query;
    const likes = usePostLikes(loadedPostId ? [loadedPostId] : [], viewerId);

    useEffect(() => {
        if (loadedPostId !== id || viewedPostId.current === id) return;
        viewedPostId.current = id;
        void incrementPostViewCount(id).then((count) => {
            if (count === null) return;
            updateData((previous) => previous?.post.id === id ? {
                ...previous, post: { ...previous.post, viewCount: count },
            } : previous);
        }).catch(() => {
            // Counting is best-effort; keep the stored count and the readable post on failure.
        });
    }, [id, loadedPostId, updateData]);

    const likeState = likes.states.get(id);
    return {
        ...query,
        data: query.data ? {
            ...query.data,
            post: { ...query.data.post, likeCount: likeState?.like_count ?? query.data.post.likeCount, isLiked: likeState?.is_liked ?? false },
        } : null,
        isLikeLoading: likes.isLoading,
        likeStateError: likes.error,
        retryLikeState: likes.retry,
        updateLikeState: likes.updateLikeState,
    };
}
