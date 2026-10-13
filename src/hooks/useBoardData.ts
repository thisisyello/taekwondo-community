import { useCallback, useEffect, useState } from "react";
import { getBoardPosts, getPostDetail } from "../services/board";

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
    const updateData = (update: (data: T) => T) => {
        setState((previous) => previous.data === null ? previous : { ...previous, data: update(previous.data) });
    };
    return { ...state, retry, updateData };
}

export const useBoardPosts = () => useBoardQuery(getBoardPosts);

export function usePostDetail(id: string) {
    const load = useCallback((signal: AbortSignal) => getPostDetail(id, signal), [id]);
    return useBoardQuery(load);
}
