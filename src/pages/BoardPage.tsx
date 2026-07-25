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
        <>
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
        </>
    );
}
