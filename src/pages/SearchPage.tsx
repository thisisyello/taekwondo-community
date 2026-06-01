import { useState } from "react";
import { Link } from "react-router";
import PostList from "../components/PostList";
import type { Post, PostSortType, SearchTarget } from "../types/board";
import { filterPostsBySearch, sortPosts } from "../utils/postList";

type SearchPageProps = {
    posts: Post[];
    commentCountsByPostId: Record<number, number>;
};

export default function SearchPage({
    posts,
    commentCountsByPostId,
}: SearchPageProps) {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchTarget, setSearchTarget] = useState<SearchTarget>("all");
    const [postSortType, setPostSortType] = useState<PostSortType>("latest");

    const searchResults = filterPostsBySearch(
        posts,
        searchTarget,
        searchKeyword,
    );
    const sortedSearchResults = sortPosts(
        searchResults,
        postSortType,
        commentCountsByPostId,
    );

    return (
        <section className="min-h-svh bg-kta-bg px-4 py-5 text-kta-text">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
                <div className="flex items-center justify-between">
                    <Link className="text-sm font-bold text-kta-navy" to="/">
                        목록으로
                    </Link>
                    <h1 className="text-lg font-black text-kta-text">검색</h1>
                    <div className="w-12" />
                </div>

                <div className="grid gap-2 rounded-kta-lg border border-kta-border bg-kta-surface p-4 shadow-kta-sm sm:grid-cols-[120px_1fr]">
                    <select
                        className="h-11 rounded-kta-md border border-kta-border bg-white px-3 text-sm text-kta-text outline-none focus:border-kta-navy"
                        value={searchTarget}
                        onChange={(event) =>
                            setSearchTarget(event.target.value as SearchTarget)
                        }
                    >
                        <option value="all">전체</option>
                        <option value="title">제목</option>
                        <option value="content">내용</option>
                        <option value="author">작성자</option>
                    </select>
                    <input
                        autoFocus
                        className="h-11 rounded-kta-md border border-kta-border bg-white px-3 text-sm text-kta-text outline-none placeholder:text-kta-muted focus:border-kta-navy"
                        placeholder="검색어를 입력하세요"
                        value={searchKeyword}
                        onChange={(event) => setSearchKeyword(event.target.value)}
                    />
                </div>

                <PostList
                    posts={sortedSearchResults}
                    commentCountsByPostId={commentCountsByPostId}
                    postSortType={postSortType}
                    onChangePostSortType={setPostSortType}
                />
            </div>
        </section>
    );
}
