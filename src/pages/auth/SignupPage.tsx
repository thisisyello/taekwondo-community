import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router";
import type { SignupFormData, SignupResult } from "../../types/user";
import { getSignupErrors } from "../../utils/authValidation";
import { formatMobilePhoneNumber } from "../../utils/phone";

type SignupPageProps = {
    onSignup: (signupData: SignupFormData) => Promise<SignupResult>;
};

export default function SignupPage({ onSignup }: SignupPageProps) {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] =
        useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

    const signupData = { email, password, name, birthDate, phoneNumber, nickname };
    const errors = hasSubmitted ? getSignupErrors(signupData, passwordConfirm) : {};

    const nameError = errors.name;
    const birthDateError = errors.birthDate;
    const phoneNumberError = errors.phoneNumber;
    const emailError = errors.email;
    const nicknameError = errors.nickname;
    const passwordError = errors.password;
    const passwordConfirmError = errors.passwordConfirm;
    const hasPasswordConfirmValue = passwordConfirm.length > 0;
    const isPasswordConfirmMatched =
        hasPasswordConfirmValue && passwordConfirm === password;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setHasSubmitted(true);

        if (isSubmitting || Object.values(getSignupErrors(signupData, passwordConfirm)).some(Boolean)) return;
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const result = await onSignup(signupData);
            setPassword("");
            setPasswordConfirm("");
            if (result.needsEmailConfirmation) setConfirmationEmail(email.trim());
            else navigate("/", { replace: true });
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "회원가입하지 못했습니다. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (confirmationEmail) {
        return (
            <section className="flex min-h-svh items-center justify-center bg-kta-bg px-4 text-kta-text">
                <div className="w-full max-w-md text-center">
                    <h1 className="text-xl font-bold">이메일 인증을 완료해주세요</h1>
                    <p role="status" className="mt-4 break-all text-sm leading-6 text-kta-muted">
                        {confirmationEmail}로 인증 안내를 요청했습니다. 메일을 확인하고 인증을 완료해주세요.
                    </p>
                    <p className="mt-3 text-sm leading-6 text-kta-muted">
                        이미 가입한 이메일이라면 로그인해주세요. 메일이 보이지 않으면 스팸함도 확인해주세요.
                    </p>
                    <Link className="mt-6 inline-flex min-h-11 items-center rounded-kta-sm bg-kta-navy px-5 text-sm font-bold text-white" to="/login">
                        로그인으로 이동
                    </Link>
                </div>
            </section>
        );
    }

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
                    noValidate
                >
                    <fieldset className="flex flex-col gap-3">
                        <legend className="mb-1 text-sm font-black text-kta-navy">
                            개인정보
                        </legend>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="signup-name" className="text-xs font-semibold text-kta-text">
                                이름
                            </label>
                            <input
                                id="signup-name"
                                autoFocus
                                className={getInputClassName(nameError)}
                                placeholder="이름을 입력해주세요"
                                autoComplete="name"
                                maxLength={80}
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                            />
                            {nameError && (
                                <p className="text-xs font-semibold text-kta-red">
                                    {nameError}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="signup-birth-date" className="text-xs font-semibold text-kta-text">
                                생년월일
                            </label>
                            <input
                                id="signup-birth-date"
                                className={getInputClassName(birthDateError)}
                                type="date"
                                autoComplete="bday"
                                value={birthDate}
                                onChange={(event) =>
                                    setBirthDate(event.target.value)
                                }
                            />
                            {birthDateError && (
                                <p className="text-xs font-semibold text-kta-red">
                                    {birthDateError}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="signup-phone" className="text-xs font-semibold text-kta-text">
                                휴대전화 번호
                            </label>
                            <input
                                id="signup-phone"
                                className={getInputClassName(phoneNumberError)}
                                inputMode="tel"
                                type="tel"
                                autoComplete="tel"
                                placeholder="01012345678"
                                value={phoneNumber}
                                onChange={(event) =>
                                    setPhoneNumber(formatMobilePhoneNumber(event.target.value))
                                }
                            />
                            {phoneNumberError && (
                                <p className="text-xs font-semibold text-kta-red">
                                    {phoneNumberError}
                                </p>
                            )}
                        </div>
                    </fieldset>

                    <fieldset className="mt-2 flex flex-col gap-3 border-t border-kta-border pt-4">
                        <legend className="mb-1 text-sm font-black text-kta-navy">
                            계정정보
                        </legend>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="signup-email" className="text-xs font-semibold text-kta-text">
                                이메일
                            </label>
                            <input
                                id="signup-email"
                                className={getInputClassName(emailError)}
                                placeholder="example@email.com"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                            {emailError && (
                                <p className="text-xs font-semibold text-kta-red">
                                    {emailError}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="signup-nickname" className="text-xs font-semibold text-kta-text">
                                공용 닉네임
                            </label>
                            <input
                                id="signup-nickname"
                                className={getInputClassName(nicknameError)}
                                placeholder="공용 닉네임을 입력해주세요"
                                autoComplete="nickname"
                                maxLength={30}
                                value={nickname}
                                onChange={(event) =>
                                    setNickname(event.target.value)
                                }
                            />
                            {nicknameError && (
                                <p className="text-xs font-semibold text-kta-red">
                                    {nicknameError}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="signup-password" className="text-xs font-semibold text-kta-text">
                                비밀번호
                            </label>
                            <div className="relative">
                                <input
                                    id="signup-password"
                                    className={`${getInputClassName(passwordError)} pr-12`}
                                    placeholder="8자 이상"
                                    autoComplete="new-password"
                                    type={
                                        isPasswordVisible ? "text" : "password"
                                    }
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
                                    {passwordError}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="signup-password-confirm" className="text-xs font-semibold text-kta-text">
                                비밀번호 확인
                            </label>
                            <div className="relative">
                                <input
                                    id="signup-password-confirm"
                                    className={`${getInputClassName(
                                        passwordConfirmError,
                                    )} pr-12`}
                                    placeholder="비밀번호를 다시 입력해주세요"
                                    autoComplete="new-password"
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
                            {!hasPasswordConfirmValue &&
                                passwordConfirmError && (
                                    <p className="text-xs font-semibold text-kta-red">
                                        비밀번호 확인을 입력해주세요.
                                    </p>
                                )}
                        </div>
                    </fieldset>

                    {submitError && <p role="alert" className="text-sm text-kta-red">{submitError}</p>}
                    <button
                        className="h-12 rounded-kta-md bg-kta-navy text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "가입 중…" : "가입하기"}
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

const getInputClassName = (hasError: string | undefined) => {
    return hasError
        ? "h-12 w-full rounded-kta-md border border-kta-red px-3 text-sm outline-none placeholder:text-kta-muted focus:border-kta-red"
        : "h-12 w-full rounded-kta-md border border-kta-border px-3 text-sm outline-none placeholder:text-kta-muted focus:border-kta-navy";
};
