-- Client-facing RPCs. Other people's data is only ever returned through these:
-- distance buckets instead of coordinates, age instead of birthday.

create function public.set_location(p_lat double precision, p_lng double precision, p_city text default null)
returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  if p_lat is null or p_lng is null or p_lat not between -90 and 90 or p_lng not between -180 and 180 then
    raise exception 'Invalid coordinates' using errcode = '22023';
  end if;
  -- Coarsen to ~1 km so exact positions are never stored.
  update public.profiles
     set location = extensions.st_setsrid(
           extensions.st_makepoint(round(p_lng::numeric, 2)::double precision, round(p_lat::numeric, 2)::double precision), 4326
         )::extensions.geography,
         city = coalesce(nullif(left(trim(p_city), 80), ''), city)
   where id = uid;
end $$;

create function public.discover_feed(p_limit integer default 20)
returns table (
  id uuid, display_name text, age integer, gender public.gender_t, bio text, city text,
  distance_km integer, is_verified boolean, last_active_at timestamptz,
  tags text[], photo_paths text[]
)
language sql stable security definer set search_path = '' as $$
  with me as (
    select p.id, p.gender, p.location, public.age_years(p.birthday) as age,
           up.interested_in, up.min_age, up.max_age, up.max_distance_km, up.strict_distance
      from public.profiles p
      join public.user_preferences up on up.user_id = p.id
     where p.id = (select auth.uid())
       and p.onboarding_completed_at is not null
  ),
  cand as (
    select p.*, public.age_years(p.birthday) as age, cp.interested_in as c_interested, cp.min_age as c_min, cp.max_age as c_max,
           cs.approximate_distance, cs.show_active_status,
           case when p.location is not null and me.location is not null
                then extensions.st_distance(p.location, me.location) end as dist_m
      from public.profiles p
      join public.user_preferences cp on cp.user_id = p.id
      join public.user_settings cs on cs.user_id = p.id
      cross join me
     where p.id <> me.id
       and p.onboarding_completed_at is not null
       and not p.is_paused and not p.is_hidden
       and p.gender = any (me.interested_in)
       and public.age_years(p.birthday) between me.min_age and me.max_age
       and me.gender = any (cp.interested_in)
       and me.age between cp.min_age and cp.max_age
       and (not me.strict_distance or p.location is null or me.location is null
            or extensions.st_dwithin(p.location, me.location, me.max_distance_km * 1000.0))
       and not exists (select 1 from public.swipes s where s.swiper_id = me.id and s.target_id = p.id)
       and not public.is_blocked_between(me.id, p.id)
  )
  select c.id, c.display_name, c.age, case when c.show_gender then c.gender end, c.bio, c.city,
         case when c.dist_m is null then null
              when c.approximate_distance then greatest(5, (ceil(c.dist_m / 5000.0) * 5))::integer
              else greatest(1, ceil(c.dist_m / 1000.0))::integer end,
         c.is_verified,
         case when c.show_active_status then c.last_active_at end,
         coalesce((select array_agg(t.name order by t.sort)
                     from public.profile_tags pt join public.tags t on t.id = pt.tag_id
                    where pt.user_id = c.id), '{}'),
         coalesce((select array_agg(ph.storage_path order by ph.position)
                     from public.photos ph
                    where ph.user_id = c.id and ph.moderation = 'approved'), '{}')
    from cand c
   order by c.dist_m nulls last, c.last_active_at desc
   limit least(greatest(coalesce(p_limit, 20), 1), 50)
$$;

create function public.likes_received()
returns table (
  id uuid, display_name text, age integer, distance_km integer, is_verified boolean,
  is_superping boolean, liked_at timestamptz, photo_paths text[]
)
language sql stable security definer set search_path = '' as $$
  select p.id, p.display_name, public.age_years(p.birthday),
         case when p.location is null or me.location is null then null
              when cs.approximate_distance
                then greatest(5, (ceil(extensions.st_distance(p.location, me.location) / 5000.0) * 5))::integer
              else greatest(1, ceil(extensions.st_distance(p.location, me.location) / 1000.0))::integer end,
         p.is_verified, s.action = 'superping', s.created_at,
         coalesce((select array_agg(ph.storage_path order by ph.position)
                     from public.photos ph
                    where ph.user_id = p.id and ph.moderation = 'approved'), '{}')
    from public.swipes s
    join public.profiles p on p.id = s.swiper_id
    join public.user_settings cs on cs.user_id = p.id
    join public.profiles me on me.id = (select auth.uid())
   where s.target_id = (select auth.uid())
     and s.action in ('like', 'superping')
     and p.onboarding_completed_at is not null
     and not p.is_paused and not p.is_hidden
     and not exists (select 1 from public.swipes mine where mine.swiper_id = me.id and mine.target_id = p.id)
     and not public.is_blocked_between(me.id, p.id)
   order by (s.action = 'superping') desc, s.created_at desc
$$;

create function public.record_swipe(p_target uuid, p_action public.swipe_action_t)
returns table (matched boolean, match_id uuid)
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  daily_limit integer;
  used integer;
  mid uuid;
begin
  if uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  if p_target is null or p_target = uid then raise exception 'Invalid target' using errcode = '22023'; end if;
  if not exists (
    select 1 from public.profiles t
     where t.id = p_target and t.onboarding_completed_at is not null and not t.is_paused
  ) or public.is_blocked_between(uid, p_target) then
    raise exception 'Profile unavailable' using errcode = 'P0002';
  end if;

  if p_action = 'superping' then
    select coalesce((value #>> '{}')::integer, 1) into daily_limit
      from public.app_config where key = 'superping_daily_limit';
    select count(*) into used from public.swipes
     where swiper_id = uid and action = 'superping'
       and created_at >= date_trunc('day', now() at time zone 'utc') at time zone 'utc';
    if used >= coalesce(daily_limit, 1) then
      raise exception 'Daily super-ping limit reached' using errcode = 'P0001';
    end if;
  end if;

  insert into public.swipes (swiper_id, target_id, action)
  values (uid, p_target, p_action)
  on conflict (swiper_id, target_id) do nothing;

  select m.id into mid from public.matches m
   where m.user_a = least(uid, p_target) and m.user_b = greatest(uid, p_target);
  return query select mid is not null, mid;
end $$;

create function public.my_matches()
returns table (
  match_id uuid, partner_id uuid, display_name text, age integer, is_verified boolean,
  photo_path text, matched_at timestamptz, last_message text, last_message_at timestamptz,
  last_sender_id uuid, unread_count integer
)
language sql stable security definer set search_path = '' as $$
  select m.id, p.id, p.display_name, public.age_years(p.birthday), p.is_verified,
         (select ph.storage_path from public.photos ph
           where ph.user_id = p.id and ph.moderation = 'approved' order by ph.position limit 1),
         m.created_at, lm.body, lm.created_at, lm.sender_id,
         (select count(*)::integer from public.messages x
           where x.match_id = m.id and x.sender_id <> (select auth.uid())
             and x.created_at > coalesce(mr.last_read_at, 'epoch'::timestamptz))
    from public.matches m
    join public.profiles p on p.id = case when m.user_a = (select auth.uid()) then m.user_b else m.user_a end
    left join public.match_reads mr on mr.match_id = m.id and mr.user_id = (select auth.uid())
    left join lateral (
      select body, created_at, sender_id from public.messages
       where match_id = m.id order by created_at desc limit 1
    ) lm on true
   where (select auth.uid()) in (m.user_a, m.user_b)
     and not public.is_blocked_between(m.user_a, m.user_b)
   order by coalesce(lm.created_at, m.created_at) desc
$$;

create function public.mark_messages_read(p_match uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  receipts boolean;
begin
  if not public.is_match_participant(p_match) then
    raise exception 'Not a participant' using errcode = '42501';
  end if;
  insert into public.match_reads (match_id, user_id, last_read_at)
  values (p_match, uid, now())
  on conflict (match_id, user_id) do update set last_read_at = excluded.last_read_at;

  select read_receipts into receipts from public.user_settings where user_id = uid;
  if coalesce(receipts, true) then
    update public.messages set read_at = now()
     where match_id = p_match and sender_id <> uid and read_at is null;
  end if;
end $$;

create function public.unmatch(p_match uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_match_participant(p_match) then
    raise exception 'Not a participant' using errcode = '42501';
  end if;
  delete from public.matches where id = p_match;
end $$;

create function public.register_push_token(p_token text, p_platform text) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  insert into public.push_tokens (user_id, token, platform, updated_at)
  values (uid, p_token, p_platform, now())
  on conflict (token) do update set user_id = excluded.user_id, platform = excluded.platform, updated_at = now();
end $$;

create function public.complete_onboarding() returns void
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  prof public.profiles%rowtype;
begin
  select * into prof from public.profiles where id = uid;
  if not found then raise exception 'Profile not found' using errcode = 'P0002'; end if;
  if coalesce(trim(prof.display_name), '') = '' then raise exception 'Add your name to continue.' using errcode = 'P0001'; end if;
  if prof.birthday is null then raise exception 'Add your birthday to continue.' using errcode = 'P0001'; end if;
  if prof.gender is null then raise exception 'Pick your gender to continue.' using errcode = 'P0001'; end if;
  if coalesce(trim(prof.bio), '') = '' then raise exception 'Write a short bio to continue.' using errcode = 'P0001'; end if;
  if prof.location is null and coalesce(trim(prof.city), '') = '' then
    raise exception 'Share your location or city to continue.' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.user_preferences where user_id = uid and cardinality(interested_in) > 0) then
    raise exception 'Pick who you are interested in.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.photos where user_id = uid) < 2 then
    raise exception 'Add at least 2 photos.' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.profile_tags where user_id = uid) then
    raise exception 'Pick at least 1 tag.' using errcode = 'P0001';
  end if;
  update public.profiles
     set onboarding_completed_at = coalesce(onboarding_completed_at, now()), onboarding_step = 8
   where id = uid;
end $$;

-- Only signed-in users may call these.
revoke execute on function
  public.set_location(double precision, double precision, text),
  public.discover_feed(integer), public.likes_received(),
  public.record_swipe(uuid, public.swipe_action_t), public.my_matches(),
  public.mark_messages_read(uuid), public.unmatch(uuid),
  public.register_push_token(text, text), public.complete_onboarding()
  from public, anon;
grant execute on function
  public.set_location(double precision, double precision, text),
  public.discover_feed(integer), public.likes_received(),
  public.record_swipe(uuid, public.swipe_action_t), public.my_matches(),
  public.mark_messages_read(uuid), public.unmatch(uuid),
  public.register_push_token(text, text), public.complete_onboarding()
  to authenticated;
