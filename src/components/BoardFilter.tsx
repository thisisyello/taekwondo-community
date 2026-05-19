import { BOARD_FILTER_OPTIONS } from "../types/board";
import type { BoardFilterType } from "../types/board";

type BoardFilterProps = {
    selectedBoardType: BoardFilterType;
    onSelectBoardType: (boardType: BoardFilterType) => void;
};

export default function BoardFilter({
    selectedBoardType,
    onSelectBoardType,
}: BoardFilterProps) {
    return (
        <div>
            {BOARD_FILTER_OPTIONS.map((option) => (
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
