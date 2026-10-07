export type UserRole = "member" | "admin";

export type User = {
    id: string;
    email: string;
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
    email: string;
    password: string;
    name: string;
    birthDate: string;
    phoneNumber: string;
    nickname: string;
};

export type SignupResult = {
    needsEmailConfirmation: boolean;
};
