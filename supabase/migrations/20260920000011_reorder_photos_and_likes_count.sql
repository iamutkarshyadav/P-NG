-- Atomic photo reordering, lightweight likes count, and atomic tag assignment.

-- 1. Reorder photos atomically in a single transaction
create function public.reorder_photos(p_ordered_ids uuid[]) returns void
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  i integer;
  len integer;
begin
  if uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  len := cardinality(p_ordered_ids);
  if len = 0 then return; end if;

  -- Phase 1: stage positions as negative to avoid unique constraint violations
  for i in 1..len loop
    update public.photos
       set position = (-1 * i)::smallint
     where id = p_ordered_ids[i] and user_id = uid;
  end loop;

  -- Phase 2: assign target 0-indexed positions
  for i in 1..len loop
    update public.photos
       set position = (i - 1)::smallint
     where id = p_ordered_ids[i] and user_id = uid;
  end loop;
end $$;

-- 2. Fast scalar count of incoming likes (powers bottom nav badge without full payload)
create function public.likes_count() returns integer
language sql stable security definer set search_path = '' as $$
  select count(*)::integer
    from public.swipes s
    join public.profiles p on p.id = s.swiper_id
   where s.target_id = (select auth.uid())
     and s.action in ('like', 'superping')
     and p.onboarding_completed_at is not null
     and not p.is_paused and not p.is_hidden
     and not exists (
       select 1 from public.swipes mine
        where mine.swiper_id = (select auth.uid()) and mine.target_id = p.id
     )
     and not public.is_blocked_between((select auth.uid()), p.id);
$$;

-- 3. Atomically replace user's profile tags in a single transaction
create function public.set_my_tags(p_tag_ids smallint[]) returns void
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  len integer;
  tid smallint;
begin
  if uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  len := cardinality(p_tag_ids);
  if len < 1 or len > 8 then
    raise exception 'Pick between 1 and 8 tags.' using errcode = 'check_violation';
  end if;

  delete from public.profile_tags where user_id = uid;
  foreach tid in array p_tag_ids loop
    insert into public.profile_tags (user_id, tag_id)
    values (uid, tid)
    on conflict do nothing;
  end loop;
end $$;

revoke execute on function public.reorder_photos(uuid[]), public.likes_count(), public.set_my_tags(smallint[]) from public, anon;
grant execute on function public.reorder_photos(uuid[]), public.likes_count(), public.set_my_tags(smallint[]) to authenticated;
