import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { getEmailError } from "../../utils/authValidation";

type LoginPageProps = {
    onLogin: (email: string, password: string) => Promise<void>;
    returnTo: string;
};

export default function LoginPage({ onLogin, returnTo }: LoginPageProps) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const emailError = hasSubmitted ? getEmailError(email) : undefined;
    const passwordError = hasSubmitted && !password.trim();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setHasSubmitted(true);

        if (isSubmitting || getEmailError(email) || !password) return;
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await onLogin(email.trim(), password);
            navigate(returnTo, { replace: true });
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "로그인하지 못했습니다. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="min-h-svh bg-kta-bg px-4 py-5 text-kta-text">
            <div className="mx-auto flex min-h-[calc(100svh-40px)] max-w-md flex-col justify-center">
                <div className="rounded-kta-lg bg-kta-navy px-5 py-6 text-white shadow-kta-md">
                    <p className="text-sm font-semibold text-white/75">
                        도장 인증 기반 커뮤니티
                    </p>
                    <h1 className="mt-2 text-2xl font-black tracking-tight">
                        태권도 커뮤니티 로그인
                    </h1>
                </div>

                <form
                    className="mt-4 flex flex-col gap-3 rounded-kta-lg border border-kta-border bg-kta-surface p-5 shadow-kta-sm"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <div className="flex flex-col gap-1">
                        <input
                            autoFocus
                            className={getInputClassName(Boolean(emailError))}
                            placeholder="이메일"
                            aria-label="이메일"
                            type="email"
                            autoComplete="username"
                            aria-invalid={Boolean(emailError)}
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                        />
                        {emailError && (
                            <p className="text-xs font-semibold text-kta-red">
                                {emailError}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <input
                            className={getInputClassName(passwordError)}
                            placeholder="비밀번호"
                            type="password"
                            aria-label="비밀번호"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                        />
                        {passwordError && (
                            <p className="text-xs font-semibold text-kta-red">
                                비밀번호를 입력해주세요.
                            </p>
                        )}
                    </div>

                    {submitError && <p role="alert" className="text-sm text-kta-red">{submitError}</p>}
                    <button
                        className="h-12 rounded-kta-md bg-kta-navy text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "로그인 중…" : "로그인"}
                    </button>

                    <Link
                        className="inline-flex min-h-11 items-center self-center text-sm text-kta-muted hover:text-kta-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kta-navy"
                        to="/forgot-password"
                        state={{ from: returnTo }}
                    >
                        비밀번호를 잊으셨나요?
                    </Link>

                    <Link
                        className="self-center text-sm font-bold text-kta-navy"
                        to="/signup"
                        state={{ from: returnTo }}
                    >
                        계정이 없으신가요? 회원가입
                    </Link>
                </form>
            </div>
        </section>
    );
}

const getInputClassName = (hasError: boolean) => {
    return hasError
        ? "h-12 w-full rounded-kta-md border border-kta-red px-3 text-sm outline-none placeholder:text-kta-muted focus:border-kta-red"
        : "h-12 w-full rounded-kta-md border border-kta-border px-3 text-sm outline-none placeholder:text-kta-muted focus:border-kta-navy";
};
