import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = url && key
    ? createClient(url, key, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    })
    : null;

export function getSupabase() {
    if (!supabase) {
        throw new Error("로그인 연결 설정이 없습니다. 관리자에게 문의해주세요.");
    }

    return supabase;
}
