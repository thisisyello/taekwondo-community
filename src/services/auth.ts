import { getSupabase } from "../lib/supabase";
import type { User as AuthUser } from "@supabase/supabase-js";
import type { CurrentUser, SignupFormData, SignupResult } from "../types/user";

export function getAuthErrorMessage(error: unknown): string {
    const code = typeof error === "object" && error !== null && "code" in error
        ? error.code : undefined;
    switch (code) {
        case "invalid_credentials": return "이메일 또는 비밀번호를 확인해주세요.";
        case "email_not_confirmed": return "이메일 인증을 완료한 뒤 로그인해주세요.";
        case "user_already_exists": case "email_exists":
            return "가입 정보를 확인하거나 기존 계정으로 로그인해주세요.";
        case "weak_password": return "비밀번호가 보안 기준에 맞지 않습니다. 다른 비밀번호를 입력해주세요.";
        case "over_email_send_rate_limit": case "over_request_rate_limit":
            return "요청이 많습니다. 잠시 후 다시 시도해주세요.";
        case "signup_disabled": return "현재 회원가입이 일시 중단되어 있습니다.";
        case "unexpected_failure":
            return "가입 정보를 저장하지 못했습니다. 닉네임을 확인하고 다시 시도해주세요. 문제가 계속되면 관리자에게 문의해주세요.";
        default: return "요청을 처리하지 못했습니다. 연결 상태를 확인하고 다시 시도해주세요.";
    }
}

export async function loadCurrentUser(user: AuthUser): Promise<CurrentUser> {
    const client = getSupabase();
    const [profileResult, detailsResult] = await Promise.all([
        client.from("profiles").select("id,nickname,role,profile_image_url,created_at,updated_at").eq("id", user.id).single(),
        client.from("account_details").select("name,birth_date,phone_number").eq("user_id", user.id).single(),
    ]);
    if (profileResult.error || detailsResult.error || !user.email) {
        throw new Error("회원 정보를 불러오지 못했습니다. 연결 상태와 회원 테이블 설정을 확인해주세요.");
    }
    const profile = profileResult.data;
    const details = detailsResult.data;
    return {
        id: user.id,
        email: user.email,
        nickname: profile.nickname,
        role: profile.role === "admin" ? "admin" : "member",
        profileImageUrl: profile.profile_image_url ?? undefined,
        name: details.name,
        birthDate: details.birth_date,
        phoneNumber: details.phone_number,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
    };
}

export async function signIn(email: string, password: string): Promise<void> {
    const { error } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(getAuthErrorMessage(error));
}

export async function signUp(data: SignupFormData): Promise<SignupResult> {
    const { data: result, error } = await getSupabase().auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
                nickname: data.nickname.trim(),
                name: data.name.trim(),
                birth_date: data.birthDate,
                phone_number: data.phoneNumber.trim(),
            },
        },
    });
    if (error) throw new Error(getAuthErrorMessage(error));
    return { needsEmailConfirmation: !result.session };
}

export async function signOut(): Promise<void> {
    const { error } = await getSupabase().auth.signOut({ scope: "local" });
    if (error) throw new Error(getAuthErrorMessage(error));
}

export async function requestPasswordReset(email: string): Promise<void> {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
    });
    if (!error || error.code === "user_not_found") return;
    if (error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit") {
        throw new Error("요청이 많습니다. 잠시 후 다시 시도해주세요.");
    }
    throw new Error("재설정 메일을 요청하지 못했습니다. 잠시 후 다시 시도해주세요.");
}

export async function resetPassword(password: string, recoveryUserId: string): Promise<void> {
    const client = getSupabase();
    const { data, error: userError } = await client.auth.getUser();
    if (userError || data.user?.id !== recoveryUserId) {
        throw new Error("인증이 만료되었거나 유효하지 않습니다. 재설정 메일을 다시 요청해주세요.");
    }
    const { error } = await client.auth.updateUser({ password });
    if (!error) return;
    if (error.code === "same_password") {
        throw new Error("기존 비밀번호와 다른 비밀번호를 입력해주세요.");
    }
    if (error.code === "session_not_found" || error.code === "refresh_token_not_found" || error.status === 401) {
        throw new Error("인증이 만료되었거나 유효하지 않습니다. 재설정 메일을 다시 요청해주세요.");
    }
    if (error.code === "weak_password" || error.code === "over_request_rate_limit") {
        throw new Error(getAuthErrorMessage(error));
    }
    throw new Error("비밀번호를 변경하지 못했습니다. 잠시 후 다시 시도해주세요.");
}
