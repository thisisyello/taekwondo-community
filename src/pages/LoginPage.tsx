import { useState } from "react";
import { Link, useNavigate } from "react-router";

type LoginPageProps = {
    onLogin: (loginId: string) => void;
};

export default function LoginPage({ onLogin }: LoginPageProps) {
    const navigate = useNavigate();
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const loginIdError = hasSubmitted && !loginId.trim();
    const passwordError = hasSubmitted && !password.trim();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setHasSubmitted(true);

        if (!loginId.trim() || !password.trim()) return;

        onLogin(loginId.trim());
        navigate("/");
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
                >
                    <div className="flex flex-col gap-1">
                        <input
                            autoFocus
                            className={
                                loginIdError
                                    ? "h-12 rounded-kta-md border border-kta-red px-3 text-sm outline-none placeholder:text-kta-muted focus:border-kta-red"
                                    : "h-12 rounded-kta-md border border-kta-border px-3 text-sm outline-none placeholder:text-kta-muted focus:border-kta-navy"
                            }
                            placeholder="아이디"
                            value={loginId}
                            onChange={(event) =>
                                setLoginId(event.target.value)
                            }
                        />
                        {loginIdError && (
                            <p className="text-xs font-semibold text-kta-red">
                                아이디를 입력해주세요.
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <input
                            className={
                                passwordError
                                    ? "h-12 rounded-kta-md border border-kta-red px-3 text-sm outline-none placeholder:text-kta-muted focus:border-kta-red"
                                    : "h-12 rounded-kta-md border border-kta-border px-3 text-sm outline-none placeholder:text-kta-muted focus:border-kta-navy"
                            }
                            placeholder="비밀번호"
                            type="password"
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

                    <button
                        className="h-12 rounded-kta-md bg-kta-navy text-sm font-bold text-white"
                        type="submit"
                    >
                        로그인
                    </button>

                    <Link
                        className="self-center text-sm font-bold text-kta-navy"
                        to="/signup"
                    >
                        계정이 없으신가요? 회원가입
                    </Link>
                </form>
            </div>
        </section>
    );
}
