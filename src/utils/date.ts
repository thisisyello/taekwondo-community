export const formatDate = (dateTime: string) => {
    const date = new Date(dateTime);
    const now = new Date();
    const diffMilliseconds = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMilliseconds / 1000 / 60);

    if (diffMinutes < 1) {
        return "방금 전";
    }

    if (diffMinutes < 60) {
        return `${diffMinutes}분 전`;
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24 && isSameDate(date, now)) {
        return `${diffHours}시간 전`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (isSameDate(date, yesterday)) {
        return "어제";
    }

    return `${date.getFullYear()}.${padNumber(date.getMonth() + 1)}.${padNumber(
        date.getDate(),
    )}`;
};

export const isEdited = (createdAt: string, updatedAt: string) => {
    return createdAt !== updatedAt;
};

const isSameDate = (firstDate: Date, secondDate: Date) => {
    return (
        firstDate.getFullYear() === secondDate.getFullYear() &&
        firstDate.getMonth() === secondDate.getMonth() &&
        firstDate.getDate() === secondDate.getDate()
    );
};

const padNumber = (value: number) => {
    return String(value).padStart(2, "0");
};
