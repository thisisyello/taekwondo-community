import type { BoardFilterType } from "../types/board";

type BoardFilterProps = {
    selectedBoardType: BoardFilterType;
    onSelectBoardType: (boardType: BoardFilterType) => void;
};

type BoardOption = {
    type: BoardFilterType;
    label: string;
};

const boardOptions: BoardOption[] = [
    { type: "all", label: "전체" },
    { type: "free", label: "자유게시판" },
    { type: "parent", label: "학부모게시판" },
    { type: "coach", label: "지도진게시판" },
    { type: "student", label: "관원생게시판" },
    { type: "question", label: "질문게시판" },
];

export default function BoardFilter({
    selectedBoardType,
    onSelectBoardType,
}: BoardFilterProps) {
    return (
        <div>
            {boardOptions.map((option) => (
                <button
                    key={option.type}
                    onClick={() => onSelectBoardType(option.type)}
                    disabled={selectedBoardType === option.type}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
