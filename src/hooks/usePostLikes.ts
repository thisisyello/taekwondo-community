import { useCallback, useEffect, useMemo, useState } from "react";
import { getMemberLikeStates } from "../services/board";
import type { PostLikeState } from "../utils/boardData";

const emptyStates = new Map<string, PostLikeState>();

export function usePostLikes(postIds: string[], viewerId: string | null) {
    const idsKey = postIds.join(",");
    const [attempt, setAttempt] = useState(0);
    // A new identity also invalidates results when the same member signs back in.
    const request = useMemo(() => ({ viewerId, idsKey, attempt }), [viewerId, idsKey, attempt]);
    const enabled = viewerId !== null && idsKey !== "";
    const [result, setResult] = useState<{
        request: typeof request;
        states: Map<string, PostLikeState>;
        error: string | null;
    } | null>(null);

    useEffect(() => {
        if (!enabled) return;
        const controller = new AbortController();
        void getMemberLikeStates(idsKey.split(","), controller.signal).then((states) => {
            if (!controller.signal.aborted) setResult({ request, states, error: null });
        }).catch((cause: unknown) => {
            if (!controller.signal.aborted) setResult({
                request, states: emptyStates,
                error: cause instanceof Error ? cause.message : "공감 정보를 불러오지 못했습니다.",
            });
        });
        return () => controller.abort();
    }, [enabled, idsKey, request]);

    const current = enabled && result?.request === request ? result : null;
    const updateLikeState = useCallback((state: PostLikeState) => {
        setResult((previous) => previous?.request === request ? {
            ...previous, states: new Map(previous.states).set(state.post_id, state),
        } : previous);
    }, [request]);

    return {
        states: current?.states ?? emptyStates,
        isLoading: enabled && current === null,
        error: current?.error ?? null,
        retry: () => setAttempt((value) => value + 1),
        updateLikeState,
    };
}
