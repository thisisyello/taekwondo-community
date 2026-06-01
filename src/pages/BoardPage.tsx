import { Link } from "react-router";
import BoardFilter from "../components/BoardFilter";
import PostList from "../components/PostList";
import type { BoardFilterType, Post } from "../types/board";

type BoardPageProps = {
    posts: Post[];
    commentCountsByPostId: Record<number, number>;
    selectedBoardType: BoardFilterType;
    onSelectBoardType: (boardType: BoardFilterType) => void;
};

export default function BoardPage({
    posts,
    commentCountsByPostId,
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

            <PostList
                posts={posts}
                commentCountsByPostId={commentCountsByPostId}
            />

            <Link to="/posts/new">글쓰기</Link>
        </section>
    );
}
