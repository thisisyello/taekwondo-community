import { useState } from "react";
import BoardFilter from "./components/BoardFilter";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";
import type { BoardFilterType, BoardType, Post } from "./types/board";

export default function App() {
    const [posts, setPosts] = useState<Post[]>([
        {
            id: 1,
            title: "줄넘기 추천 부탁드려요",
            author: "학부모1",
            board: "question",
        },
        {
            id: 2,
            title: "학부모 상담 팁 공유합니다",
            author: "사범님",
            board: "coach",
        },
        {
            id: 3,
            title: "승급심사 준비 중입니다",
            author: "관원생",
            board: "free",
        },
    ]);

    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [board, setBoard] = useState<BoardType>("free");
    const [selectedBoardType, setSelectedBoardType] =
        useState<BoardFilterType>("all");

    const filteredPosts =
        selectedBoardType === "all"
            ? posts
            : posts.filter((post) => post.board === selectedBoardType);

    const handleAddPost = () => {
        if (!title.trim() || !author.trim()) return;

        const newPost: Post = {
            id: Date.now(),
            title,
            author,
            board,
        };

        setPosts((prev) => [...prev, newPost]);

        setTitle("");
        setAuthor("");
        setBoard("free");
    };

    // const handleSelectBoardType = (boardType: BoardFilterType) => {
    //   setSelectedBoardType(boardType);
    // };

    const handleDeletePost = (id: number) => {
        setPosts((prev) => prev.filter((post) => post.id !== id));
    };

    return (
        <section>
            <h1>태권도 커뮤니티</h1>

            <BoardFilter
                selectedBoardType={selectedBoardType}
                onSelectBoardType={setSelectedBoardType}
            />

            <PostList posts={filteredPosts} onDeletePost={handleDeletePost} />

            <PostForm
                title={title}
                author={author}
                board={board}
                onChangeTitle={setTitle}
                onChangeAuthor={setAuthor}
                onChangeBoard={setBoard}
                onAddPost={handleAddPost}
            />
        </section>
    );
}
