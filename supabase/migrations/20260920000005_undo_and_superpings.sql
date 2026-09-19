-- Rewind (undo the last swipe, only if it has not become a match) and the daily super-ping counter.

create function public.undo_last_swipe() returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  last_swipe public.swipes%rowtype;
begin
  if uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  select * into last_swipe from public.swipes where swiper_id = uid order by created_at desc limit 1;
  if not found then return null; end if;
  if last_swipe.created_at < now() - interval '10 minutes' then return null; end if;
  if exists (
    select 1 from public.matches
     where user_a = least(uid, last_swipe.target_id) and user_b = greatest(uid, last_swipe.target_id)
  ) then
    return null;
  end if;
  delete from public.swipes where swiper_id = uid and target_id = last_swipe.target_id;
  return last_swipe.target_id;
end $$;

create function public.superpings_left() returns integer
language sql stable security definer set search_path = '' as $$
  select greatest(
    0,
    coalesce((select (value #>> '{}')::integer from public.app_config where key = 'superping_daily_limit'), 1)
    - (select count(*)::integer from public.swipes
        where swiper_id = (select auth.uid()) and action = 'superping'
          and created_at >= date_trunc('day', now() at time zone 'utc') at time zone 'utc')
  )
$$;

revoke execute on function public.undo_last_swipe(), public.superpings_left() from public, anon;
grant execute on function public.undo_last_swipe(), public.superpings_left() to authenticated;
