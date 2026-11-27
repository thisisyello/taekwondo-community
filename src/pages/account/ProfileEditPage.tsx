import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useToast } from "../../hooks/useToast";
import type { CurrentUser, ProfileFormData } from "../../types/user";
import { getProfileErrors } from "../../utils/authValidation";
import { formatMobilePhoneNumber } from "../../utils/phone";

type ProfileEditPageProps = {
    currentUser: CurrentUser;
    onSave: (form: ProfileFormData) => Promise<void>;
};

const fields = [
    { key: "nickname", label: "공용 닉네임", autoComplete: "nickname", maxLength: 30, placeholder: "공용 닉네임을 입력해주세요" },
    { key: "name", label: "이름", autoComplete: "name", maxLength: 80, placeholder: "이름을 입력해주세요" },
    { key: "phoneNumber", label: "휴대전화 번호", autoComplete: "tel", maxLength: 13, placeholder: "010-1234-5678" },
] as const;

export default function ProfileEditPage({ currentUser, onSave }: ProfileEditPageProps) {
    const navigate = useNavigate();
    const showToast = useToast();
    const isSavingRef = useRef(false);
    const mountedRef = useRef(true);
    const [values, setValues] = useState<ProfileFormData>(() => ({
        nickname: currentUser.nickname,
        name: currentUser.name,
        phoneNumber: currentUser.phoneNumber,
    }));
    const [touched, setTouched] = useState<Partial<Record<keyof ProfileFormData, boolean>>>({});
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const errors = getProfileErrors(values);
    const isDirty = values.name.trim() !== currentUser.name.trim() ||
        values.nickname.trim() !== currentUser.nickname.trim() ||
        values.phoneNumber.replace(/\D/g, "") !== currentUser.phoneNumber.replace(/\D/g, "");

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSavingRef.current || !isDirty) return;
        setHasSubmitted(true);
        const invalidField = fields.find(({ key }) => errors[key]);
        if (invalidField) {
            document.getElementById(`profile-${invalidField.key}`)?.focus();
            return;
        }
        isSavingRef.current = true;
        setIsSaving(true);
        setSubmitError(null);
        try {
            await onSave(values);
            if (!mountedRef.current) return;
            showToast("회원정보를 수정했습니다.");
            navigate("/me", { replace: true });
        } catch (cause) {
            if (mountedRef.current) setSubmitError(cause instanceof Error ? cause.message : "회원정보를 저장하지 못했습니다.");
        } finally {
            isSavingRef.current = false;
            if (mountedRef.current) setIsSaving(false);
        }
    };

    return (
        <form className="mx-auto flex w-full max-w-md flex-col gap-6" onSubmit={handleSubmit} aria-busy={isSaving} noValidate>
            {fields.map(({ key, label, autoComplete, maxLength, placeholder }) => {
                const error = hasSubmitted || touched[key] ? errors[key] : undefined;
                const id = `profile-${key}`;
                return (
                    <div key={key} className="flex flex-col gap-2">
                        <label htmlFor={id} className="text-sm font-semibold text-kta-text">{label}</label>
                        <input
                            id={id}
                            name={key}
                            type={key === "phoneNumber" ? "tel" : "text"}
                            autoComplete={autoComplete}
                            maxLength={maxLength}
                            placeholder={placeholder}
                            value={values[key]}
                            disabled={isSaving}
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? `${id}-error` : undefined}
                            onBlur={() => setTouched((previous) => ({ ...previous, [key]: true }))}
                            onChange={(event) => {
                                const value = key === "phoneNumber" ? formatMobilePhoneNumber(event.target.value) : event.target.value;
                                setValues((previous) => ({ ...previous, [key]: value }));
                                setSubmitError(null);
                            }}
                            className={`h-12 w-full rounded-kta-md border bg-kta-surface px-3 text-sm outline-none placeholder:text-kta-muted ${error ? "border-kta-red focus:border-kta-red" : "border-kta-border focus:border-kta-navy"}`}
                        />
                        {error && <p id={`${id}-error`} className="text-xs font-semibold text-kta-red">{error}</p>}
                    </div>
                );
            })}
            {submitError && <p role="alert" className="break-words text-sm text-kta-red">{submitError}</p>}
            <div className="flex items-center gap-3 border-t border-kta-border pt-5">
                <button type="button" onClick={() => navigate("/me")} disabled={isSaving} className="min-h-12 flex-1 rounded-kta-md border border-kta-border bg-kta-surface text-sm font-bold text-kta-text disabled:opacity-50">취소</button>
                <button type="submit" disabled={isSaving || !isDirty} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-kta-md bg-kta-navy text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
                    {isSaving ? "저장 중…" : "저장"}
                </button>
            </div>
        </form>
    );
}
