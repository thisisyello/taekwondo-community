import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useToast } from "../../hooks/useToast";
import { requestPasswordReset } from "../../services/auth";
import { getEmailError } from "../../utils/authValidation";

export default function ForgotPasswordPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const showToast = useToast();
    const [email, setEmail] = useState("");
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const emailError = hasSubmitted ? getEmailError(email) : undefined;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setHasSubmitted(true);
        if (isSubmitting || getEmailError(email)) return;
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await requestPasswordReset(email);
            showToast("비밀번호 재설정 메일을 보냈습니다. 메일함을 확인해주세요.");
            navigate("/login", { replace: true, state: location.state });
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "재설정 메일을 요청하지 못했습니다. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="min-h-svh bg-kta-bg px-4 py-5 text-kta-text">
            <div className="mx-auto flex min-h-[calc(100svh-40px)] max-w-md flex-col justify-center">
                <h1 className="text-2xl font-bold">비밀번호 재설정</h1>
                <p className="mt-2 text-sm text-kta-muted">
                    가입한 이메일을 입력해주세요.
                </p>

                <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="reset-email" className="text-sm font-semibold">
                            이메일
                        </label>
                        <input
                            id="reset-email"
                            type="email"
                            autoComplete="email"
                            autoFocus
                            placeholder="example@email.com"
                            className={`h-12 w-full rounded-kta-md border bg-kta-surface px-3 text-sm outline-none placeholder:text-kta-muted ${emailError ? "border-kta-red focus:border-kta-red" : "border-kta-border focus:border-kta-navy"}`}
                            value={email}
                            disabled={isSubmitting}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setSubmitError(null);
                            }}
                            aria-invalid={Boolean(emailError)}
                            aria-describedby={emailError ? "reset-email-error" : undefined}
                        />
                        {emailError && (
                            <p id="reset-email-error" role="alert" className="text-xs font-semibold text-kta-red">
                                {emailError}
                            </p>
                        )}
                    </div>
                    {submitError && <p role="alert" className="text-sm text-kta-red">{submitError}</p>}
                    <button type="submit" disabled={isSubmitting} className="h-12 rounded-kta-md bg-kta-navy text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60">
                        {isSubmitting ? "메일 요청 중…" : "재설정 메일 보내기"}
                    </button>
                    <Link
                        to="/login"
                        state={location.state}
                        className="inline-flex min-h-11 items-center justify-center self-center text-sm font-semibold text-kta-navy"
                    >
                        로그인으로 돌아가기
                    </Link>
                </form>
            </div>
        </section>
    );
}
