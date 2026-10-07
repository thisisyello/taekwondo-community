import type { SignupFormData } from "../types/user";

export function getEmailError(email: string): string | undefined {
    if (!email.trim()) return "이메일을 입력해주세요.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return "올바른 이메일 주소를 입력해주세요.";
    }
}

export function getSignupErrors(data: SignupFormData, passwordConfirm: string) {
    const errors: Partial<Record<keyof SignupFormData | "passwordConfirm", string>> = {};
    if (!data.name.trim()) errors.name = "이름을 입력해주세요.";
    else if (data.name.trim().length > 80) errors.name = "이름은 80자 이내로 입력해주세요.";

    const date = new Date(`${data.birthDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.birthDate) ||
        Number.isNaN(date.getTime()) ||
        date.getFullYear() !== Number(data.birthDate.slice(0, 4)) ||
        date.getMonth() + 1 !== Number(data.birthDate.slice(5, 7)) ||
        date.getDate() !== Number(data.birthDate.slice(8, 10)) || date > today) {
        errors.birthDate = "올바른 생년월일을 입력해주세요.";
    }

    if (!/^\+?[\d\s()-]+$/.test(data.phoneNumber.trim()) ||
        !/^\d{8,15}$/.test(data.phoneNumber.replace(/\D/g, ""))) {
        errors.phoneNumber = "올바른 전화번호를 입력해주세요.";
    }
    errors.email = getEmailError(data.email);
    if (!data.nickname.trim()) errors.nickname = "공용 닉네임을 입력해주세요.";
    else if (data.nickname.trim().length > 30) errors.nickname = "공용 닉네임은 30자 이내로 입력해주세요.";
    if (!data.password.trim() || data.password.length < 8) errors.password = "비밀번호는 8자 이상 입력해주세요.";
    if (!passwordConfirm) errors.passwordConfirm = "비밀번호 확인을 입력해주세요.";
    else if (passwordConfirm !== data.password) errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    return errors;
}
