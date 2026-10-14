begin;

create function public.increment_post_view_count(p_post_id uuid)
returns integer
language sql
security definer
set search_path = ''
as $$
    update public.posts
    set view_count = view_count + 1
    where id = p_post_id
    returning view_count;
$$;

revoke all on function public.increment_post_view_count(uuid) from public, anon, authenticated;
grant execute on function public.increment_post_view_count(uuid) to anon, authenticated;

commit;
