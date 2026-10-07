begin;

create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    nickname text not null check (char_length(btrim(nickname)) between 1 and 30),
    role text not null default 'member' check (role in ('member', 'admin')),
    profile_image_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index profiles_nickname_unique on public.profiles (lower(btrim(nickname)));

create table public.account_details (
    user_id uuid primary key references auth.users(id) on delete cascade,
    name text not null check (char_length(btrim(name)) between 1 and 80),
    birth_date date not null check (birth_date <= current_date),
    phone_number text not null check (
        phone_number ~ '^\+?[0-9 ()-]+$' and
        char_length(regexp_replace(phone_number, '[^0-9]', '', 'g')) between 8 and 15
    ),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.account_details enable row level security;
revoke all on public.profiles, public.account_details from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant select on public.account_details to authenticated;

create policy "Public nicknames are readable"
on public.profiles for select to anon, authenticated using (true);

create policy "Members can read their own personal details"
on public.account_details for select to authenticated
using ((select auth.uid()) = user_id);

create function public.create_member_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
    insert into public.profiles (id, nickname)
    values (new.id, btrim(new.raw_user_meta_data ->> 'nickname'));

    insert into public.account_details (user_id, name, birth_date, phone_number)
    values (
        new.id,
        btrim(new.raw_user_meta_data ->> 'name'),
        (new.raw_user_meta_data ->> 'birth_date')::date,
        btrim(new.raw_user_meta_data ->> 'phone_number')
    );
    return new;
end;
$$;

revoke all on function public.create_member_profile() from public, anon, authenticated;
create trigger on_auth_user_created
after insert on auth.users for each row execute function public.create_member_profile();

commit;
