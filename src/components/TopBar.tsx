import { FiArrowLeft, FiSearch } from "react-icons/fi";
import { Link, useNavigate } from "react-router";

type TopBarProps = {
    title: string;
    showBackButton?: boolean;
    showSearchButton?: boolean;
};

export default function TopBar({
    title,
    showBackButton = false,
    showSearchButton = false,
}: TopBarProps) {
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-30 border-b border-kta-border bg-kta-surface/95 text-kta-text backdrop-blur">
            <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
                <div className="flex min-w-0 items-center gap-2">
                    {showBackButton && (
                        <button
                            aria-label="뒤로가기"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-kta-navy"
                            onClick={() => navigate(-1)}
                            type="button"
                        >
                            <FiArrowLeft aria-hidden="true" />
                        </button>
                    )}
                    <h1 className="truncate text-lg font-black">{title}</h1>
                </div>

                {showSearchButton ? (
                    <Link
                        aria-label="검색"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-kta-navy"
                        to="/search"
                    >
                        <FiSearch aria-hidden="true" />
                    </Link>
                ) : (
                    <div className="h-9 w-9 shrink-0" />
                )}
            </div>
        </header>
    );
}
