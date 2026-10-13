begin;

create table public.posts (
    id uuid primary key default gen_random_uuid(),
    author_id uuid default auth.uid() references public.profiles(id) on delete set null,
    board text not null check (board in ('free', 'parent', 'coach', 'student', 'question')),
    title text not null check (title ~ '[^[:space:]]' and char_length(title) <= 200),
    content text not null check (content ~ '[^[:space:]]' and char_length(content) <= 20000),
    view_count integer not null default 0 check (view_count >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.comments (
    id uuid primary key default gen_random_uuid(),
    post_id uuid not null references public.posts(id) on delete cascade,
    author_id uuid default auth.uid() references public.profiles(id) on delete set null,
    content text not null check (content ~ '[^[:space:]]' and char_length(content) <= 2000),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index posts_created_at_id_idx on public.posts (created_at desc, id desc);
create index posts_board_created_at_id_idx on public.posts (board, created_at desc, id desc);
create index posts_author_id_idx on public.posts (author_id);
create index comments_post_created_at_id_idx on public.comments (post_id, created_at, id);
create index comments_author_id_idx on public.comments (author_id);

create function public.set_board_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

revoke all on function public.set_board_updated_at() from public, anon, authenticated;

-- Counter updates and member deletion must not mark the content as edited.
create trigger posts_content_updated
before update of title, content, board on public.posts
for each row
when (old.title is distinct from new.title or old.content is distinct from new.content or old.board is distinct from new.board)
execute function public.set_board_updated_at();

create trigger comments_content_updated
before update of content on public.comments
for each row
when (old.content is distinct from new.content)
execute function public.set_board_updated_at();

alter table public.posts enable row level security;
alter table public.comments enable row level security;

revoke all on public.posts, public.comments from public, anon, authenticated;
grant select on public.posts, public.comments to anon, authenticated;
grant delete on public.posts, public.comments to authenticated;
grant insert (author_id, board, title, content) on public.posts to authenticated;
grant update (board, title, content) on public.posts to authenticated;
grant insert (post_id, author_id, content) on public.comments to authenticated;
grant update (content) on public.comments to authenticated;

create policy "Public posts are readable"
on public.posts for select to anon, authenticated using (true);

create policy "Members can create their own posts"
on public.posts for insert to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = author_id);

create policy "Authors can update their own posts"
on public.posts for update to authenticated
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

create policy "Authors can delete their own posts"
on public.posts for delete to authenticated
using ((select auth.uid()) = author_id);

create policy "Public comments are readable"
on public.comments for select to anon, authenticated using (true);

create policy "Members can create their own comments"
on public.comments for insert to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = author_id);

create policy "Authors can update their own comments"
on public.comments for update to authenticated
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

create policy "Authors can delete their own comments"
on public.comments for delete to authenticated
using ((select auth.uid()) = author_id);

commit;
