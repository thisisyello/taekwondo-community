export type DojangMembershipRole = "student" | "parent" | "coach" | "master";

export type DojangMembershipStatus = "pending" | "approved" | "rejected";

export type Dojang = {
    id: string;
    name: string;
    region: string;
    address?: string;
    phoneNumber?: string;
    createdAt: string;
    updatedAt: string;
};

export type DojangMembership = {
    id: string;
    userId: string;
    dojangId: string;
    role: DojangMembershipRole;
    status: DojangMembershipStatus;
    createdAt: string;
    updatedAt: string;
    approvedAt?: string;
    rejectedAt?: string;
};
