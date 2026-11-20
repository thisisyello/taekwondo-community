begin;

-- Return the posts row type so the API can still embed authors and comment counts.
-- Invoker permissions preserve the caller's SELECT grants and row-level policies.
create function public.search_board_posts(
    p_board text default 'all',
    p_target text default 'all',
    p_keyword text default ''
)
returns setof public.posts
language sql stable security invoker set search_path = ''
as $$
    select p.*
    from public.posts p
    left join public.profiles author on author.id = p.author_id
    cross join (select lower(btrim(coalesce(p_keyword, ''))) as keyword) query
    where (coalesce(p_board, 'all') = 'all' or p.board = p_board)
        and coalesce(p_target, 'all') in ('all', 'title', 'content', 'author')
        and (
            query.keyword = ''
            or (coalesce(p_target, 'all') in ('all', 'title') and strpos(lower(p.title), query.keyword) > 0)
            or (coalesce(p_target, 'all') in ('all', 'content') and strpos(lower(p.content), query.keyword) > 0)
            or (coalesce(p_target, 'all') in ('all', 'author') and strpos(lower(coalesce(author.nickname, '탈퇴한 회원')), query.keyword) > 0)
        );
$$;

revoke all on function public.search_board_posts(text, text, text) from public, anon, authenticated;
grant execute on function public.search_board_posts(text, text, text) to anon, authenticated;

commit;
