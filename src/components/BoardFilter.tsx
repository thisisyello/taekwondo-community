import { Link } from "react-router";
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
        <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
                {BOARD_FILTER_OPTIONS.map((option) => (
                    <button
                        className={
                            selectedBoardType === option.type
                                ? "shrink-0 rounded-full bg-kta-navy px-4 py-2 text-sm font-bold text-white"
                                : "shrink-0 rounded-full bg-kta-subtle px-4 py-2 text-sm font-semibold text-kta-muted"
                        }
                        key={option.type}
                        onClick={() => onSelectBoardType(option.type)}
                        disabled={selectedBoardType === option.type}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            <Link
                aria-label="검색"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kta-navy text-sm font-black text-white"
                to="/search"
            >
                🔍
            </Link>
        </div>
    );
}
