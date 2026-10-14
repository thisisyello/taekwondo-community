begin;

create table public.post_likes (
    post_id uuid not null references public.posts(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (post_id, user_id)
);
create index post_likes_user_id_idx on public.post_likes (user_id);
alter table public.post_likes enable row level security;
revoke all on public.post_likes from public, anon, authenticated;
grant select on public.post_likes to authenticated;
create policy "Members can read their own likes"
on public.post_likes for select to authenticated
using ((select auth.uid()) = user_id);

create function public.get_post_like_states(p_post_ids uuid[])
returns table (post_id uuid, like_count bigint, is_liked boolean)
language sql stable security definer set search_path = ''
as $$
    select p.id, count(l.user_id), coalesce(bool_or(l.user_id = (select auth.uid())), false)
    from public.posts p
    left join public.post_likes l on l.post_id = p.id
    where p.id = any(p_post_ids)
    group by p.id;
$$;

create function public.set_post_like(p_post_id uuid, p_liked boolean)
returns table (post_id uuid, like_count bigint, is_liked boolean)
language plpgsql security definer set search_path = ''
as $$
declare
    member_id uuid := auth.uid();
begin
    if member_id is null then
        raise exception 'Authentication required' using errcode = '42501';
    end if;
    if p_liked is null then
        raise exception 'Like state is required' using errcode = '22004';
    end if;
    -- Serialize changes for one post, and use a desired state so retries are idempotent.
    perform 1 from public.posts p where p.id = p_post_id for update;
    if not found then
        raise exception 'Post not found' using errcode = 'P0002';
    end if;
    if p_liked then
        insert into public.post_likes (post_id, user_id) values (p_post_id, member_id)
        on conflict on constraint post_likes_pkey do nothing;
    else
        delete from public.post_likes l where l.post_id = p_post_id and l.user_id = member_id;
    end if;
    return query select * from public.get_post_like_states(array[p_post_id]);
end;
$$;

revoke all on function public.get_post_like_states(uuid[]) from public, anon, authenticated;
revoke all on function public.set_post_like(uuid, boolean) from public, anon, authenticated;
grant execute on function public.get_post_like_states(uuid[]) to anon, authenticated;
grant execute on function public.set_post_like(uuid, boolean) to authenticated;

commit;
