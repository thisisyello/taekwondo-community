import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link } from "react-router";
import { useToast } from "../../hooks/useToast";

export default function ResetPasswordPage() {
    const showToast = useToast();
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const passwordError = !password.trim() || password.length < 8
        ? "비밀번호는 8자 이상 입력해주세요."
        : undefined;
    const confirmError = !passwordConfirm
        ? "비밀번호 확인을 입력해주세요."
        : password !== passwordConfirm
            ? "비밀번호가 일치하지 않습니다."
            : undefined;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setHasSubmitted(true);
        if (passwordError || confirmError) return;
        showToast("비밀번호 변경 기능은 아직 연결되지 않았습니다.");
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
                                    onChange={(event) => field.onChange(event.target.value)}
                                    aria-invalid={Boolean(field.error)}
                                    aria-describedby={field.error ? `${field.id}-error` : undefined}
                                    className={`h-12 w-full rounded-kta-md border bg-kta-surface pl-3 pr-14 text-sm outline-none placeholder:text-kta-muted ${field.error ? "border-kta-red focus:border-kta-red" : "border-kta-border focus:border-kta-navy"}`}
                                />
                                <button
                                    type="button"
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
                    <button type="submit" className="h-12 rounded-kta-md bg-kta-navy text-sm font-bold text-white">
                        비밀번호 변경
                    </button>
                    <Link to="/login" className="inline-flex min-h-11 items-center justify-center self-center text-sm font-semibold text-kta-navy">
                        로그인으로 돌아가기
                    </Link>
                </form>
            </div>
        </section>
    );
}
