import type {
    BoardFilterType,
    Comment,
    Post,
    PostSortType,
    SearchTarget,
} from "../types/board";

export const getCommentCountsByPostId = (comments: Comment[]) => {
    return comments.reduce<Record<number, number>>(
        (counts, comment) => ({
            ...counts,
            [comment.postId]: (counts[comment.postId] ?? 0) + 1,
        }),
        {},
    );
};

export const filterPostsByBoard = (
    posts: Post[],
    selectedBoardType: BoardFilterType,
) => {
    if (selectedBoardType === "all") {
        return posts;
    }

    return posts.filter((post) => post.board === selectedBoardType);
};

export const filterPostsBySearch = (
    posts: Post[],
    searchTarget: SearchTarget,
    searchKeyword: string,
) => {
    const normalizedSearchKeyword = searchKeyword.trim().toLowerCase();

    if (normalizedSearchKeyword.length === 0) {
        return posts;
    }

    return posts.filter((post) => {
        if (searchTarget === "all") {
            return [post.title, post.content, post.author].some((value) =>
                value.toLowerCase().includes(normalizedSearchKeyword),
            );
        }

        return post[searchTarget]
            .toLowerCase()
            .includes(normalizedSearchKeyword);
    });
};

export const sortPosts = (
    posts: Post[],
    postSortType: PostSortType,
    commentCountsByPostId: Record<number, number>,
) => {
    return [...posts].sort((firstPost, secondPost) => {
        if (postSortType === "oldest") {
            return (
                new Date(firstPost.createdAt).getTime() -
                new Date(secondPost.createdAt).getTime()
            );
        }

        if (postSortType === "mostCommented") {
            return (
                (commentCountsByPostId[secondPost.id] ?? 0) -
                (commentCountsByPostId[firstPost.id] ?? 0)
            );
        }

        return (
            new Date(secondPost.createdAt).getTime() -
            new Date(firstPost.createdAt).getTime()
        );
    });
};
