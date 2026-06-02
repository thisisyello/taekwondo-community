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
    const [inputKeyword, setInputKeyword] = useState("");
    const [submittedKeyword, setSubmittedKeyword] = useState("");
    const [recentKeywords, setRecentKeywords] = useState<string[]>([]);
    const [searchTarget, setSearchTarget] = useState<SearchTarget>("all");
    const [postSortType, setPostSortType] = useState<PostSortType>("latest");

    const searchResults = filterPostsBySearch(
        posts,
        searchTarget,
        submittedKeyword,
    );
    const sortedSearchResults = sortPosts(
        searchResults,
        postSortType,
        commentCountsByPostId,
    );
    const hasSubmittedKeyword = submittedKeyword.trim().length > 0;

    const submitKeyword = (keyword: string) => {
        const nextKeyword = keyword.trim();

        if (!nextKeyword) return;

        setSubmittedKeyword(nextKeyword);
        setInputKeyword(nextKeyword);
        setRecentKeywords((prev) => [
            nextKeyword,
            ...prev.filter((item) => item !== nextKeyword),
        ].slice(0, 5));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        submitKeyword(inputKeyword);
    };

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

                <form
                    className="grid gap-2 rounded-kta-lg border border-kta-border bg-kta-surface p-4 shadow-kta-sm sm:grid-cols-[120px_1fr_88px]"
                    onSubmit={handleSubmit}
                >
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
                        value={inputKeyword}
                        onChange={(event) => setInputKeyword(event.target.value)}
                    />
                    <button
                        className="h-11 rounded-kta-md bg-kta-navy text-sm font-bold text-white"
                        type="submit"
                    >
                        검색
                    </button>
                </form>

                {hasSubmittedKeyword ? (
                    <PostList
                        posts={sortedSearchResults}
                        commentCountsByPostId={commentCountsByPostId}
                        postSortType={postSortType}
                        onChangePostSortType={setPostSortType}
                    />
                ) : (
                    <section className="rounded-kta-lg border border-kta-border bg-kta-surface p-5 shadow-kta-sm">
                        <h2 className="text-base font-black text-kta-navy">
                            최근 검색어
                        </h2>
                        {recentKeywords.length === 0 ? (
                            <p className="mt-3 text-sm text-kta-muted">
                                아직 검색어가 없습니다.
                            </p>
                        ) : (
                            <ul className="mt-3 flex flex-wrap gap-2">
                                {recentKeywords.map((keyword) => (
                                    <li key={keyword}>
                                        <button
                                            className="rounded-full bg-kta-subtle px-3 py-2 text-sm font-bold text-kta-muted"
                                            onClick={() => submitKeyword(keyword)}
                                            type="button"
                                        >
                                            {keyword}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                )}
            </div>
        </section>
    );
}
