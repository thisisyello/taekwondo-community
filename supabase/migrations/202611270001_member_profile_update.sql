begin;

-- Keep direct table updates closed; change only the signed-in member's editable fields.
create function public.update_member_profile(
    p_expected_user_id uuid,
    p_nickname text,
    p_name text,
    p_phone_number text
)
returns table (id uuid, nickname text, name text, phone_number text, updated_at timestamptz)
language plpgsql security definer set search_path = ''
as $$
declare
    member_id uuid := auth.uid();
begin
    if member_id is null or p_expected_user_id is distinct from member_id then
        raise exception 'Authentication does not match the profile being edited' using errcode = '42501';
    end if;

    if p_nickname is null or char_length(btrim(p_nickname)) not between 1 and 30
        or p_name is null or char_length(btrim(p_name)) not between 1 and 80
        or p_phone_number is null or btrim(p_phone_number) !~ '^\+?[0-9 ()-]+$'
        or char_length(regexp_replace(p_phone_number, '[^0-9]', '', 'g')) not between 8 and 15 then
        raise exception 'Invalid profile input' using errcode = '22023';
    end if;

    update public.profiles p
    set nickname = btrim(p_nickname), updated_at = now()
    where p.id = member_id;
    if not found then
        raise exception 'Profile not found' using errcode = 'P0002';
    end if;

    update public.account_details d
    set name = btrim(p_name), phone_number = btrim(p_phone_number), updated_at = now()
    where d.user_id = member_id;
    if not found then
        raise exception 'Account details not found' using errcode = 'P0002';
    end if;

    return query
        select p.id, p.nickname, d.name, d.phone_number, p.updated_at
        from public.profiles p
        join public.account_details d on d.user_id = p.id
        where p.id = member_id;
end;
$$;

revoke all on function public.update_member_profile(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.update_member_profile(uuid, text, text, text) to authenticated;
notify pgrst, 'reload schema';

commit;
