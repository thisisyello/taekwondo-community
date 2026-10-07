import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { loadCurrentUser, signIn, signOut, signUp } from "../services/auth";
import type { CurrentUser } from "../types/user";

export function useAuth() {
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [isLoading, setIsLoading] = useState(supabase !== null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!supabase) return;
        let active = true;
        let requestVersion = 0;
        let timeoutId: number | undefined;
        let loadedUserId: string | null | undefined;

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "TOKEN_REFRESHED") return;
            if (event === "SIGNED_IN" && session?.user.id === loadedUserId) return;
            const version = ++requestVersion;
            window.clearTimeout(timeoutId);
            setIsLoading(true);
            setError(null);

            // Defer database requests until the Auth callback releases its lock.
            timeoutId = window.setTimeout(async () => {
                try {
                    const user = session?.user ? await loadCurrentUser(session.user) : null;
                    if (active && version === requestVersion) {
                        loadedUserId = user?.id ?? null;
                        setCurrentUser(user);
                    }
                } catch (cause) {
                    if (active && version === requestVersion) {
                        setCurrentUser(null);
                        setError(cause instanceof Error ? cause.message : "회원 정보를 불러오지 못했습니다.");
                    }
                } finally {
                    if (active && version === requestVersion) setIsLoading(false);
                }
            }, 0);
        });

        return () => {
            active = false;
            window.clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, []);

    return { currentUser, isLoading, error, signIn, signUp, signOut };
}
