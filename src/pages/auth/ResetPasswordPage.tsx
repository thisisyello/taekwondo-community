import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router";
import { useToast } from "../../hooks/useToast";
import { resetPassword, signOut } from "../../services/auth";

type ResetPasswordPageProps = { recoveryUserId: string | null };

export default function ResetPasswordPage({ recoveryUserId }: ResetPasswordPageProps) {
    const showToast = useToast();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [hasChanged, setHasChanged] = useState(false);
    const passwordError = !password.trim() || password.length < 8
        ? "비밀번호는 8자 이상 입력해주세요."
        : undefined;
    const confirmError = !passwordConfirm
        ? "비밀번호 확인을 입력해주세요."
        : password !== passwordConfirm
            ? "비밀번호가 일치하지 않습니다."
            : undefined;

    const finishReset = async () => {
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await signOut();
            showToast("비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.");
            navigate("/login", { replace: true });
        } catch {
            setSubmitError("비밀번호는 변경되었지만 로그아웃하지 못했습니다. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setHasSubmitted(true);
        if (isSubmitting || !recoveryUserId || passwordError || confirmError) return;
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await resetPassword(password, recoveryUserId);
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "비밀번호를 변경하지 못했습니다. 다시 시도해주세요.");
            setIsSubmitting(false);
            return;
        }
        setHasChanged(true);
        setPassword("");
        setPasswordConfirm("");
        await finishReset();
    };

    const fields = [
        {
            id: "reset-password",
            label: "새 비밀번호",
            placeholder: "8자 이상",
            value: password,
            onChange: setPassword,
            visible: isPasswordVisible,
            toggle: () => setIsPasswordVisible((value) => !value),
            error: hasSubmitted ? passwordError : undefined,
        },
        {
            id: "reset-password-confirm",
            label: "새 비밀번호 확인",
            placeholder: "비밀번호를 다시 입력해주세요",
            value: passwordConfirm,
            onChange: setPasswordConfirm,
            visible: isConfirmVisible,
            toggle: () => setIsConfirmVisible((value) => !value),
            error: hasSubmitted || passwordConfirm ? confirmError : undefined,
        },
    ];

    if (hasChanged || !recoveryUserId) {
        return (
            <section className="flex min-h-svh items-center justify-center bg-kta-bg px-4 py-5 text-kta-text">
                <div className="flex w-full max-w-md flex-col gap-4">
                    <h1 className="text-2xl font-bold">{hasChanged ? "비밀번호 변경 완료" : "유효하지 않은 재설정 링크"}</h1>
                    <p className="text-sm text-kta-muted">
                        {hasChanged ? "새 비밀번호로 다시 로그인해주세요." : "링크가 만료되었거나 인증을 확인할 수 없습니다. 재설정 메일을 다시 요청해주세요."}
                    </p>
                    {submitError && <p role="alert" className="text-sm text-kta-red">{submitError}</p>}
                    {hasChanged ? (
                        <button type="button" disabled={isSubmitting} onClick={() => void finishReset()} className="h-12 rounded-kta-md bg-kta-navy text-sm font-bold text-white disabled:opacity-60">
                            {isSubmitting ? "로그아웃 중…" : "로그아웃 후 로그인"}
                        </button>
                    ) : (
                        <Link to="/forgot-password" replace className="flex min-h-12 items-center justify-center rounded-kta-md bg-kta-navy text-sm font-bold text-white">
                            재설정 메일 다시 요청
                        </Link>
                    )}
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-svh bg-kta-bg px-4 py-5 text-kta-text">
            <div className="mx-auto flex min-h-[calc(100svh-40px)] max-w-md flex-col justify-center">
                <h1 className="text-2xl font-bold">새 비밀번호 설정</h1>
                <p className="mt-2 text-sm text-kta-muted">새로 사용할 비밀번호를 입력해주세요.</p>

                <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                    {fields.map((field) => (
                        <div key={field.id} className="flex flex-col gap-2">
                            <label htmlFor={field.id} className="text-sm font-semibold">{field.label}</label>
                            <div className="relative">
                                <input
                                    id={field.id}
                                    type={field.visible ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder={field.placeholder}
                                    value={field.value}
                                    disabled={isSubmitting}
                                    onChange={(event) => field.onChange(event.target.value)}
                                    aria-invalid={Boolean(field.error)}
                                    aria-describedby={field.error ? `${field.id}-error` : undefined}
                                    className={`h-12 w-full rounded-kta-md border bg-kta-surface pl-3 pr-14 text-sm outline-none placeholder:text-kta-muted ${field.error ? "border-kta-red focus:border-kta-red" : "border-kta-border focus:border-kta-navy"}`}
                                />
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={field.toggle}
                                    aria-label={`${field.label} ${field.visible ? "숨기기" : "보기"}`}
                                    aria-pressed={field.visible}
                                    title={`${field.label} ${field.visible ? "숨기기" : "보기"}`}
                                    className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-kta-muted"
                                >
                                    {field.visible ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                                </button>
                            </div>
                            {field.error && (
                                <p id={`${field.id}-error`} role="alert" className="text-xs font-semibold text-kta-red">
                                    {field.error}
                                </p>
                            )}
                            {field.id === "reset-password-confirm" && passwordConfirm && !confirmError && (
                                <p className="text-xs font-semibold text-kta-navy">비밀번호가 일치합니다.</p>
                            )}
                        </div>
                    ))}
                    {submitError && <p role="alert" className="text-sm text-kta-red">{submitError}</p>}
                    <button type="submit" disabled={isSubmitting} className="h-12 rounded-kta-md bg-kta-navy text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60">
                        {isSubmitting ? "비밀번호 변경 중…" : "비밀번호 변경"}
                    </button>
                    <Link to="/login" className="inline-flex min-h-11 items-center justify-center self-center text-sm font-semibold text-kta-navy">
                        로그인으로 돌아가기
                    </Link>
                </form>
            </div>
        </section>
    );
}
