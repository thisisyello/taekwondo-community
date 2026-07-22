export type UserRole = "member" | "admin";

export type User = {
    id: string;
    nickname: string;
    profileImageUrl?: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
};

export type CurrentUser = User;
