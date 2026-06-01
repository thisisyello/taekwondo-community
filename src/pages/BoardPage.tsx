import { Link } from "react-router";
import BoardFilter from "../components/BoardFilter";
import PostList from "../components/PostList";
import type { BoardFilterType, Post, SearchTarget } from "../types/board";

type BoardPageProps = {
    posts: Post[];
    commentCountsByPostId: Record<number, number>;
    searchKeyword: string;
    searchTarget: SearchTarget;
    onChangeSearchKeyword: (keyword: string) => void;
    onChangeSearchTarget: (target: SearchTarget) => void;
    selectedBoardType: BoardFilterType;
    onSelectBoardType: (boardType: BoardFilterType) => void;
};

export default function BoardPage({
    posts,
    commentCountsByPostId,
    searchKeyword,
    searchTarget,
    onChangeSearchKeyword,
    onChangeSearchTarget,
    selectedBoardType,
    onSelectBoardType,
}: BoardPageProps) {
    return (
        <section>
            <h1>태권도 커뮤니티</h1>

            <BoardFilter
                selectedBoardType={selectedBoardType}
                onSelectBoardType={onSelectBoardType}
            />

            <select
                value={searchTarget}
                onChange={(event) =>
                    onChangeSearchTarget(event.target.value as SearchTarget)
                }
            >
                <option value="all">전체</option>
                <option value="title">제목</option>
                <option value="content">내용</option>
                <option value="author">작성자</option>
            </select>
            <input
                placeholder="검색어를 입력하세요"
                value={searchKeyword}
                onChange={(event) => onChangeSearchKeyword(event.target.value)}
            />

            <PostList
                posts={posts}
                commentCountsByPostId={commentCountsByPostId}
            />

            <Link to="/posts/new">글쓰기</Link>
        </section>
    );
}
