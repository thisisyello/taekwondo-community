import { Link } from "react-router";
import BoardFilter from "../components/BoardFilter";
import PostList from "../components/PostList";
import type {
    BoardFilterType,
    Post,
    PostSortType,
    SearchTarget,
} from "../types/board";

type BoardPageProps = {
    posts: Post[];
    commentCountsByPostId: Record<number, number>;
    searchKeyword: string;
    searchTarget: SearchTarget;
    postSortType: PostSortType;
    onChangeSearchKeyword: (keyword: string) => void;
    onChangeSearchTarget: (target: SearchTarget) => void;
    onChangePostSortType: (sortType: PostSortType) => void;
    selectedBoardType: BoardFilterType;
    onSelectBoardType: (boardType: BoardFilterType) => void;
};

export default function BoardPage({
    posts,
    commentCountsByPostId,
    searchKeyword,
    searchTarget,
    postSortType,
    onChangeSearchKeyword,
    onChangeSearchTarget,
    onChangePostSortType,
    selectedBoardType,
    onSelectBoardType,
}: BoardPageProps) {
    return (
        <section className="min-h-svh bg-kta-bg px-4 py-5 text-kta-text">
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

                <div className="grid gap-2 rounded-kta-lg border border-kta-border bg-kta-surface p-4 shadow-kta-sm sm:grid-cols-[120px_1fr_140px]">
                    <select
                        className="h-11 rounded-kta-md border border-kta-border bg-white px-3 text-sm text-kta-text outline-none focus:border-kta-navy"
                        value={searchTarget}
                        onChange={(event) =>
                            onChangeSearchTarget(
                                event.target.value as SearchTarget,
                            )
                        }
                    >
                        <option value="all">전체</option>
                        <option value="title">제목</option>
                        <option value="content">내용</option>
                        <option value="author">작성자</option>
                    </select>
                    <input
                        className="h-11 rounded-kta-md border border-kta-border bg-white px-3 text-sm text-kta-text outline-none placeholder:text-kta-muted focus:border-kta-navy"
                        placeholder="검색어를 입력하세요"
                        value={searchKeyword}
                        onChange={(event) =>
                            onChangeSearchKeyword(event.target.value)
                        }
                    />

                    <select
                        className="h-11 rounded-kta-md border border-kta-border bg-white px-3 text-sm text-kta-text outline-none focus:border-kta-navy"
                        value={postSortType}
                        onChange={(event) =>
                            onChangePostSortType(
                                event.target.value as PostSortType,
                            )
                        }
                    >
                        <option value="latest">최신순</option>
                        <option value="oldest">오래된순</option>
                        <option value="mostCommented">댓글 많은순</option>
                    </select>
                </div>

                <PostList
                    posts={posts}
                    commentCountsByPostId={commentCountsByPostId}
                />

                <Link
                    className="fixed bottom-5 right-5 rounded-full bg-kta-red px-5 py-3 text-sm font-bold text-white shadow-kta-md sm:static sm:self-end"
                    to="/posts/new"
                >
                    글쓰기
                </Link>
            </div>
        </section>
    );
}
