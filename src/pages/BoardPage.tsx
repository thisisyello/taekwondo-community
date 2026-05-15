import { Link } from "react-router";
import BoardFilter from "../components/BoardFilter";
import PostList from "../components/PostList";
import type { BoardFilterType, Post } from "../types/board";

type BoardPageProps = {
    posts: Post[];
    selectedBoardType: BoardFilterType;
    onSelectBoardType: (boardType: BoardFilterType) => void;
    onDeletePost: (id: number) => void;
};

export default function BoardPage({
    posts,
    selectedBoardType,
    onSelectBoardType,
    onDeletePost,
}: BoardPageProps) {
    return (
        <section>
            <h1>태권도 커뮤니티</h1>

            <BoardFilter
                selectedBoardType={selectedBoardType}
                onSelectBoardType={onSelectBoardType}
            />

            <PostList posts={posts} onDeletePost={onDeletePost} />

            <Link to="/posts/new">글쓰기</Link>
        </section>
    );
}
