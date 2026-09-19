-- Names of the people the caller has blocked (profiles of other users are otherwise unreadable).
create function public.blocked_users()
returns table (user_id uuid, display_name text, blocked_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select b.blocked_id, p.display_name, b.created_at
    from public.blocks b
    join public.profiles p on p.id = b.blocked_id
   where b.blocker_id = (select auth.uid())
   order by b.created_at desc
$$;

revoke execute on function public.blocked_users() from public, anon;
grant execute on function public.blocked_users() to authenticated;
