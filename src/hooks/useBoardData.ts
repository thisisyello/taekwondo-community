import { useCallback, useEffect, useRef, useState } from "react";
import { getBoardPosts, getPostDetail, getPostForEdit, incrementPostViewCount } from "../services/board";
import { usePostLikes } from "./usePostLikes";

function useBoardQuery<T>(load: (signal: AbortSignal) => Promise<T>) {
    const [attempt, setAttempt] = useState(0);
    const [state, setState] = useState<{ data: T | null; isLoading: boolean; error: string | null }>({
        data: null, isLoading: true, error: null,
    });
    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal).then((data) => {
            if (!controller.signal.aborted) setState({ data, isLoading: false, error: null });
        }).catch((cause: unknown) => {
            if (!controller.signal.aborted) {
                setState({ data: null, isLoading: false, error: cause instanceof Error ? cause.message : "데이터를 불러오지 못했습니다." });
            }
        });
        return () => controller.abort();
    }, [load, attempt]);
    const retry = () => {
        setState({ data: null, isLoading: true, error: null });
        setAttempt((value) => value + 1);
    };
    const updateData = useCallback((update: (data: T) => T) => {
        setState((previous) => previous.data === null ? previous : { ...previous, data: update(previous.data) });
    }, []);
    return { ...state, retry, updateData };
}

export function useBoardPosts(viewerId: string | null = null) {
    const query = useBoardQuery(getBoardPosts);
    const likes = usePostLikes(query.data?.posts.map((post) => post.id) ?? [], viewerId);
    return {
        ...query,
        data: query.data ? {
            ...query.data,
            posts: query.data.posts.map((post) => {
                const state = likes.states.get(post.id);
                return { ...post, likeCount: state?.like_count ?? post.likeCount, isLiked: state?.is_liked ?? false };
            }),
        } : null,
    };
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
