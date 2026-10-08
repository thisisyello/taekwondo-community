import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { loadCurrentUser, signIn, signOut, signUp } from "../services/auth";
import type { CurrentUser } from "../types/user";

const recoveryStorageKey = "taekwondo.passwordRecoveryUserId";

function readRecoveryUserId(): string | null {
    if (new URLSearchParams(window.location.hash.slice(1)).has("error") ||
        new URLSearchParams(window.location.search).has("error")) return null;
    try { return sessionStorage.getItem(recoveryStorageKey); }
    catch { return null; }
}

export function useAuth() {
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [isLoading, setIsLoading] = useState(supabase !== null);
    const [error, setError] = useState<string | null>(null);
    const [recoveryUserId, setRecoveryUserId] = useState<string | null>(readRecoveryUserId);

    useEffect(() => {
        if (!supabase) return;
        let active = true;
        let requestVersion = 0;
        let timeoutId: number | undefined;
        let loadedUserId: string | null | undefined;

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" && session?.user.id === loadedUserId) return;
            if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "INITIAL_SESSION") {
                const recoveryId = event === "PASSWORD_RECOVERY" ? session?.user.id ?? null
                    : event === "INITIAL_SESSION" && readRecoveryUserId() === session?.user.id
                        ? session.user.id : null;
                setRecoveryUserId(recoveryId);
                try {
                    if (recoveryId) sessionStorage.setItem(recoveryStorageKey, recoveryId);
                    else sessionStorage.removeItem(recoveryStorageKey);
                } catch { /* Recovery still works when browser storage is unavailable. */ }
            }
            if (event === "TOKEN_REFRESHED") return;
            if (event === "USER_UPDATED" && session &&
                (session.user.id === loadedUserId || session.user.id === readRecoveryUserId())) return;
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

    return { currentUser, isLoading, error, recoveryUserId, signIn, signUp, signOut };
}
