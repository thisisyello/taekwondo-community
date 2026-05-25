export const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
};

export const isEdited = (createdAt: string, updatedAt: string) => {
    return createdAt !== updatedAt;
};
