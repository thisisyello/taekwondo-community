export type UserRole = "member" | "admin";

export type User = {
    id: string;
    loginId: string;
    name: string;
    birthDate: string;
    phoneNumber: string;
    nickname: string;
    profileImageUrl?: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
};

export type CurrentUser = User;

export type SignupFormData = {
    loginId: string;
    name: string;
    birthDate: string;
    phoneNumber: string;
    nickname: string;
};
