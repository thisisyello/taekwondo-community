import type { Post } from "../types/board";
import type { PostSortType } from "../types/board";
import PostItem from "./PostItem";

type PostListProps = {
    posts: Post[];
    commentCountsByPostId: Record<number, number>;
    postSortType: PostSortType;
    onChangePostSortType: (sortType: PostSortType) => void;
};

export default function PostList({
    posts,
    commentCountsByPostId,
    postSortType,
    onChangePostSortType,
}: PostListProps) {
    return (
        <section className="flex flex-col gap-3">
            <div className="flex justify-end">
                <select
                    className="h-9 rounded-full border border-kta-border bg-kta-surface px-3 text-xs font-bold text-kta-muted outline-none focus:border-kta-navy"
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

            {posts.length === 0 ? (
                <p className="rounded-kta-lg border border-dashed border-kta-border bg-kta-surface px-5 py-10 text-center text-sm text-kta-muted">
                    게시글이 없습니다.
                </p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {posts.map((post) => (
                        <PostItem
                            key={post.id}
                            post={post}
                            commentCount={commentCountsByPostId[post.id] ?? 0}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}
