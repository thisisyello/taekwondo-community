import { FiEdit3 } from "react-icons/fi";
import { Link } from "react-router";
import BoardFilter from "../../components/board/BoardFilter";
import PostList from "../../components/board/PostList";
import type { BoardFilterType, Post, PostSortType } from "../../types/board";

type BoardPageProps = {
    posts: Post[];
    commentCountsByPostId: Record<string, number>;
    postSortType: PostSortType;
    onChangePostSortType: (sortType: PostSortType) => void;
    selectedBoardType: BoardFilterType;
    onSelectBoardType: (boardType: BoardFilterType) => void;
    isAuthPending?: boolean;
};

export default function BoardPage({
    posts,
    commentCountsByPostId,
    postSortType,
    onChangePostSortType,
    selectedBoardType,
    onSelectBoardType,
    isAuthPending = false,
}: BoardPageProps) {
    return (
        <div>
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

            {isAuthPending ? (
                <button type="button" disabled aria-busy="true" title="로그인 정보를 확인하고 있습니다."
                    className="fixed bottom-20 right-5 z-20 inline-flex items-center gap-2 rounded-full bg-kta-navy px-5 py-3 text-sm font-bold text-white opacity-60 shadow-kta-md">
                    <FiEdit3 aria-hidden="true" />글쓰기
                </button>
            ) : <Link
                to="/posts/new"
                className="fixed bottom-20 right-5 z-20 inline-flex items-center gap-2 rounded-full bg-kta-navy px-5 py-3 text-sm font-bold text-white shadow-kta-md"
            >
                <FiEdit3 aria-hidden="true" />
                글쓰기
            </Link>}
        </div>
    );
}
