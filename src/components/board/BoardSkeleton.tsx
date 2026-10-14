type BoardSkeletonProps = { view: "list" | "search" | "detail" };

function Placeholder({ className }: { className: string }) {
    return <div className={`rounded bg-gray-200 ${className}`} />;
}

export default function BoardSkeleton({ view }: BoardSkeletonProps) {
    return (
        <div role="status" aria-busy="true">
            <span className="sr-only">게시글을 불러오고 있습니다.</span>
            <div aria-hidden="true" className="flex flex-col gap-4 motion-safe:animate-pulse">
                {view === "detail" ? (
                    <>
                        <div className="rounded-kta-lg border border-kta-border bg-kta-surface p-5 shadow-kta-sm">
                            <Placeholder className="h-4 w-20" />
                            <div className="mt-2 flex items-start justify-between gap-3">
                                <Placeholder className="h-8 w-3/4" />
                                <Placeholder className="h-10 w-10 shrink-0" />
                            </div>
                            <Placeholder className="mt-3 h-5 w-40 max-w-full" />
                            <div className="mt-6 flex flex-col gap-3">
                                <Placeholder className="h-5 w-full" />
                                <Placeholder className="h-5 w-full" />
                                <Placeholder className="h-5 w-4/5" />
                                <Placeholder className="h-5 w-2/3" />
                            </div>
                            <div className="mt-6 flex items-center gap-3">
                                <Placeholder className="h-10 w-24" />
                                <Placeholder className="h-10 w-24" />
                            </div>
                        </div>
                        <div className="rounded-kta-lg border border-kta-border bg-kta-surface p-5 shadow-kta-sm">
                            <Placeholder className="h-7 w-20" />
                            <Placeholder className="mt-4 h-12 w-full" />
                            <div className="mt-5 flex flex-col gap-3 border-t border-kta-border pt-5">
                                <Placeholder className="h-4 w-32" />
                                <Placeholder className="h-5 w-4/5" />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex gap-3 overflow-hidden rounded-kta-lg border border-kta-border bg-kta-surface p-4 shadow-kta-sm">
                            <Placeholder className="h-9 w-20 shrink-0" />
                            <Placeholder className="h-9 flex-1" />
                            <Placeholder className="h-9 w-20 shrink-0" />
                        </div>
                        {view === "search" && <Placeholder className="h-12 w-full" />}
                        <Placeholder className="h-9 w-24 self-end" />
                        {Array.from({ length: 5 }, (_, index) => (
                            <div key={index} className="rounded-kta-lg border border-kta-border bg-kta-surface px-5 py-4 shadow-kta-sm">
                                <Placeholder className="h-4 w-20" />
                                <Placeholder className="mt-1 h-6 w-3/4" />
                                <Placeholder className="mt-2 h-5 w-full" />
                                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-between">
                                    <Placeholder className="h-4 w-36" />
                                    <Placeholder className="h-4 w-44 max-w-full" />
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
