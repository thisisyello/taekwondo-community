import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router";

type SignupPageProps = {
    onSignup: (loginId: string, nickname: string) => void;
};

export default function SignupPage({ onSignup }: SignupPageProps) {
    const navigate = useNavigate();
    const [loginId, setLoginId] = useState("");
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] =
        useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const loginIdError = hasSubmitted && !loginId.trim();
    const nicknameError = hasSubmitted && !nickname.trim();
    const passwordError = hasSubmitted && !password.trim();
    const passwordConfirmError =
        hasSubmitted &&
        (!passwordConfirm.trim() || passwordConfirm !== password);
    const hasPasswordConfirmValue = passwordConfirm.length > 0;
    const isPasswordConfirmMatched =
        hasPasswordConfirmValue && passwordConfirm === password;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setHasSubmitted(true);

        if (
            !loginId.trim() ||
            !nickname.trim() ||
            !password.trim() ||
            passwordConfirm !== password
        ) {
            return;
        }

        onSignup(loginId.trim(), nickname.trim());
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
                        회원가입
                    </h1>
                </div>

                <form
                    className="mt-4 flex flex-col gap-3 rounded-kta-lg border border-kta-border bg-kta-surface p-5 shadow-kta-sm"
                    onSubmit={handleSubmit}
                >
                    <div className="flex flex-col gap-1">
                        <div className="grid gap-2 sm:grid-cols-[1fr_104px]">
                            <input
                                autoFocus
                                className={getInputClassName(loginIdError)}
                                placeholder="아이디"
                                value={loginId}
                                onChange={(event) =>
                                    setLoginId(event.target.value)
                                }
                            />
                            <button
                                className="h-12 rounded-kta-md bg-kta-subtle px-3 text-sm font-bold text-kta-navy"
                                type="button"
                            >
                                중복체크
                            </button>
                        </div>
                        {loginIdError && (
                            <p className="text-xs font-semibold text-kta-red">
                                아이디를 입력해주세요.
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <input
                            className={getInputClassName(nicknameError)}
                            placeholder="닉네임"
                            value={nickname}
                            onChange={(event) =>
                                setNickname(event.target.value)
                            }
                        />
                        {nicknameError && (
                            <p className="text-xs font-semibold text-kta-red">
                                닉네임을 입력해주세요.
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="relative">
                            <input
                                className={getInputClassName(passwordError)}
                                placeholder="비밀번호"
                                type={isPasswordVisible ? "text" : "password"}
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                            />
                            <button
                                aria-label={
                                    isPasswordVisible
                                        ? "비밀번호 숨기기"
                                        : "비밀번호 보기"
                                }
                                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-kta-muted"
                                onClick={() =>
                                    setIsPasswordVisible((prev) => !prev)
                                }
                                type="button"
                            >
                                {isPasswordVisible ? (
                                    <FiEyeOff aria-hidden="true" />
                                ) : (
                                    <FiEye aria-hidden="true" />
                                )}
                            </button>
                        </div>
                        {passwordError && (
                            <p className="text-xs font-semibold text-kta-red">
                                비밀번호를 입력해주세요.
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="relative">
                            <input
                                className={getInputClassName(
                                    passwordConfirmError,
                                )}
                                placeholder="비밀번호 확인"
                                type={
                                    isPasswordConfirmVisible
                                        ? "text"
                                        : "password"
                                }
                                value={passwordConfirm}
                                onChange={(event) =>
                                    setPasswordConfirm(event.target.value)
                                }
                            />
                            <button
                                aria-label={
                                    isPasswordConfirmVisible
                                        ? "비밀번호 확인 숨기기"
                                        : "비밀번호 확인 보기"
                                }
                                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-kta-muted"
                                onClick={() =>
                                    setIsPasswordConfirmVisible(
                                        (prev) => !prev,
                                    )
                                }
                                type="button"
                            >
                                {isPasswordConfirmVisible ? (
                                    <FiEyeOff aria-hidden="true" />
                                ) : (
                                    <FiEye aria-hidden="true" />
                                )}
                            </button>
                        </div>
                        {hasPasswordConfirmValue &&
                            isPasswordConfirmMatched && (
                                <p className="text-xs font-semibold text-kta-navy">
                                    비밀번호가 일치합니다.
                                </p>
                            )}
                        {hasPasswordConfirmValue &&
                            !isPasswordConfirmMatched && (
                                <p className="text-xs font-semibold text-kta-red">
                                    비밀번호가 일치하지 않습니다.
                                </p>
                            )}
                        {!hasPasswordConfirmValue && passwordConfirmError && (
                            <p className="text-xs font-semibold text-kta-red">
                                비밀번호 확인을 입력해주세요.
                            </p>
                        )}
                    </div>

                    <button
                        className="h-12 rounded-kta-md bg-kta-navy text-sm font-bold text-white"
                        type="submit"
                    >
                        가입하기
                    </button>

                    <Link
                        className="self-center text-sm font-bold text-kta-navy"
                        to="/login"
                    >
                        이미 계정이 있으신가요? 로그인
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
