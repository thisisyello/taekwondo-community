import { FiEdit3 } from "react-icons/fi";
import { Link } from "react-router";
import BoardFilter from "../components/BoardFilter";
import PostList from "../components/PostList";
import type { BoardFilterType, Post, PostSortType } from "../types/board";

type BoardPageProps = {
    posts: Post[];
    commentCountsByPostId: Record<number, number>;
    postSortType: PostSortType;
    onChangePostSortType: (sortType: PostSortType) => void;
    selectedBoardType: BoardFilterType;
    onSelectBoardType: (boardType: BoardFilterType) => void;
};

export default function BoardPage({
    posts,
    commentCountsByPostId,
    postSortType,
    onChangePostSortType,
    selectedBoardType,
    onSelectBoardType,
}: BoardPageProps) {
    return (
        <section className="min-h-svh bg-kta-bg px-4 pb-24 pt-5 text-kta-text">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
                <header className="rounded-kta-lg bg-kta-navy px-5 py-6 text-white shadow-kta-md">
                    <p className="text-sm font-semibold text-white/75">
                        도장 인증 기반 커뮤니티
                    </p>
                    <h1 className="mt-2 text-2xl font-black tracking-tight">
                        태권도 커뮤니티
                    </h1>
                </header>

                <div className="rounded-kta-lg border border-kta-border bg-kta-surface p-4 shadow-kta-sm">
                    <BoardFilter
                        selectedBoardType={selectedBoardType}
                        onSelectBoardType={onSelectBoardType}
                    />
                </div>

                <PostList
                    posts={posts}
                    commentCountsByPostId={commentCountsByPostId}
                    postSortType={postSortType}
                    onChangePostSortType={onChangePostSortType}
                />

                <Link
                    className="fixed bottom-5 right-5 z-20 inline-flex items-center gap-2 rounded-full bg-kta-navy px-5 py-3 text-sm font-bold text-white shadow-kta-md"
                    to="/posts/new"
                >
                    <FiEdit3 aria-hidden="true" />
                    글쓰기
                </Link>
            </div>
        </section>
    );
}
