import { BOARD_OPTIONS } from "../types/board";
import type { BoardFilterType } from "../types/board";

type BoardFilterProps = {
    selectedBoardType: BoardFilterType;
    onSelectBoardType: (boardType: BoardFilterType) => void;
};

const boardFilterOptions: Array<{ type: BoardFilterType; label: string }> = [
    { type: "all", label: "전체" },
    ...BOARD_OPTIONS,
];

export default function BoardFilter({
    selectedBoardType,
    onSelectBoardType,
}: BoardFilterProps) {
    return (
        <div>
            {boardFilterOptions.map((option) => (
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
