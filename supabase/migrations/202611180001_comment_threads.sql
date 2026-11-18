begin;

alter table public.comments add column parent_id uuid;
alter table public.comments add constraint comments_post_id_id_key unique (post_id, id);
alter table public.comments add constraint comments_parent_not_self check (parent_id is distinct from id);
alter table public.comments add constraint comments_parent_same_post_fkey
    foreign key (post_id, parent_id) references public.comments (post_id, id) on delete cascade;
create index comments_post_parent_idx on public.comments (post_id, parent_id);

-- Existing comments remain roots. Parents must already exist and cannot be moved,
-- so even multi-row inserts cannot introduce cycles or cross-post reply chains.
create function public.guard_comment_parent()
returns trigger language plpgsql set search_path = ''
as $$
begin
    if tg_op = 'UPDATE' then
        if new.parent_id is distinct from old.parent_id or new.post_id is distinct from old.post_id then
            raise exception 'Comment parent and post cannot be changed' using errcode = '23514';
        end if;
    elsif new.parent_id is not null then
        perform 1 from public.comments c where c.id = new.parent_id and c.post_id = new.post_id;
        if not found then
            raise exception 'Parent comment does not exist in this post' using errcode = '23503';
        end if;
    end if;
    return new;
end;
$$;
revoke all on function public.guard_comment_parent() from public, anon, authenticated;
create trigger comments_parent_guard
before insert or update of parent_id, post_id on public.comments
for each row execute function public.guard_comment_parent();

grant insert (parent_id) on public.comments to authenticated;

commit;
