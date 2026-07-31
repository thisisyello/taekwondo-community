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
        <div className="flex gap-2 overflow-x-auto">
            {BOARD_FILTER_OPTIONS.map((option) => (
                <button
                    className={
                        `shrink-0 rounded-full px-4 py-2 text-sm ${
                            selectedBoardType === option.type
                                ? "bg-kta-navy font-bold text-white"
                                : "bg-kta-subtle font-semibold text-kta-muted"
                        }`
                    }
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
