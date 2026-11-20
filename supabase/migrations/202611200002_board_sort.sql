begin;

-- A PostgREST computed field, not a stored counter or a new posts column.
-- An unnamed table-row argument keeps this out of the normal RPC interface.
create function public.comment_count(public.posts)
returns bigint
language sql stable security invoker set search_path = ''
as $$
    select count(*)
    from public.comments c
    where c.post_id = ($1).id;
$$;

revoke all on function public.comment_count(public.posts) from public, anon, authenticated;
grant execute on function public.comment_count(public.posts) to anon, authenticated;

notify pgrst, 'reload schema';

commit;
