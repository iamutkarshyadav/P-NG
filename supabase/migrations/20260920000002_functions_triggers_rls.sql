-- Helper functions, triggers, RLS policies and explicit grants.

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger user_preferences_updated_at before update on public.user_preferences
  for each row execute function public.set_updated_at();
create trigger user_settings_updated_at before update on public.user_settings
  for each row execute function public.set_updated_at();

create function public.age_years(b date) returns integer
language sql stable set search_path = '' as $$
  select case when b is null then null else date_part('year', age(current_date, b))::integer end
$$;

create function public.zodiac_sign(b date) returns text
language plpgsql immutable set search_path = '' as $$
declare m integer; d integer;
begin
  if b is null then return null; end if;
  m := extract(month from b)::integer;
  d := extract(day from b)::integer;
  return case
    when (m = 3 and d >= 21) or (m = 4 and d <= 19) then 'Aries'
    when (m = 4 and d >= 20) or (m = 5 and d <= 20) then 'Taurus'
    when (m = 5 and d >= 21) or (m = 6 and d <= 20) then 'Gemini'
    when (m = 6 and d >= 21) or (m = 7 and d <= 22) then 'Cancer'
    when (m = 7 and d >= 23) or (m = 8 and d <= 22) then 'Leo'
    when (m = 8 and d >= 23) or (m = 9 and d <= 22) then 'Virgo'
    when (m = 9 and d >= 23) or (m = 10 and d <= 22) then 'Libra'
    when (m = 10 and d >= 23) or (m = 11 and d <= 21) then 'Scorpio'
    when (m = 11 and d >= 22) or (m = 12 and d <= 21) then 'Sagittarius'
    when (m = 12 and d >= 22) or (m = 1 and d <= 19) then 'Capricorn'
    when (m = 1 and d >= 20) or (m = 2 and d <= 18) then 'Aquarius'
    else 'Pisces'
  end;
end $$;

-- 18+ rule (a trigger, not a CHECK, because it depends on the current date).
create function public.validate_birthday() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.birthday is not null then
    if new.birthday > (current_date - interval '18 years')::date then
      raise exception 'You must be at least 18 years old.' using errcode = 'check_violation';
    end if;
    if new.birthday < (current_date - interval '120 years')::date then
      raise exception 'Please enter a valid birthday.' using errcode = 'check_violation';
    end if;
  end if;
  return new;
end $$;

create trigger profiles_validate_birthday before insert or update of birthday on public.profiles
  for each row execute function public.validate_birthday();

-- Every new auth user gets a profile, preferences and settings row.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(coalesce(new.email, ''), '@', 1)
    ), 40)
  );
  insert into public.user_preferences (user_id) values (new.id);
  insert into public.user_settings (user_id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.enforce_tag_limit() returns trigger
language plpgsql set search_path = '' as $$
begin
  if (select count(*) from public.profile_tags where user_id = new.user_id) >= 8 then
    raise exception 'You can pick up to 8 tags.' using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger profile_tags_limit before insert on public.profile_tags
  for each row execute function public.enforce_tag_limit();

create function public.is_blocked_between(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  )
$$;

create function public.is_match_participant(m uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.matches
    where id = m and (select auth.uid()) in (user_a, user_b)
  )
$$;

-- A participant of the match who has not blocked (and is not blocked by) the partner.
create function public.can_message(m uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.matches mt
    where mt.id = m
      and (select auth.uid()) in (mt.user_a, mt.user_b)
      and not public.is_blocked_between(mt.user_a, mt.user_b)
  )
$$;

-- Mutual like/superping creates the match. The advisory lock serialises two people
-- swiping on each other at the same moment so exactly one of them creates it.
create function public.create_match_on_mutual_like() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.action in ('like', 'superping') then
    perform pg_advisory_xact_lock(
      hashtextextended(least(new.swiper_id, new.target_id)::text || greatest(new.swiper_id, new.target_id)::text, 0)
    );
    if exists (
      select 1 from public.swipes s
      where s.swiper_id = new.target_id and s.target_id = new.swiper_id
        and s.action in ('like', 'superping')
    ) then
      insert into public.matches (user_a, user_b)
      values (least(new.swiper_id, new.target_id), greatest(new.swiper_id, new.target_id))
      on conflict do nothing;
    end if;
  end if;
  return null;
end $$;

create trigger swipes_create_match after insert on public.swipes
  for each row execute function public.create_match_on_mutual_like();

create function public.remove_match_on_block() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.matches
  where user_a = least(new.blocker_id, new.blocked_id)
    and user_b = greatest(new.blocker_id, new.blocked_id);
  return null;
end $$;

create trigger blocks_remove_match after insert on public.blocks
  for each row execute function public.remove_match_on_block();

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.age_years(date), public.zodiac_sign(date) to authenticated;
grant execute on function public.is_match_participant(uuid), public.can_message(uuid) to authenticated;

-- ---------------------------------------------------------------- RLS
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_settings enable row level security;
alter table public.photos enable row level security;
alter table public.tags enable row level security;
alter table public.profile_tags enable row level security;
alter table public.prompt_suggestions enable row level security;
alter table public.app_config enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.match_reads enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.verifications enable row level security;
alter table public.push_tokens enable row level security;

-- profiles: owners only. Other people's profiles are exposed only through RPCs.
create policy profiles_select_own on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
grant select (id, display_name, birthday, gender, show_gender, bio, city, last_active_at,
  is_verified, is_paused, is_hidden, onboarding_step, onboarding_completed_at, created_at, updated_at)
  on public.profiles to authenticated;
grant update (display_name, birthday, gender, show_gender, bio, city, is_paused, is_hidden,
  onboarding_step, last_active_at) on public.profiles to authenticated;

create policy prefs_select_own on public.user_preferences for select to authenticated
  using (user_id = (select auth.uid()));
create policy prefs_update_own on public.user_preferences for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select on public.user_preferences to authenticated;
grant update (interested_in, min_age, max_age, max_distance_km, strict_distance, intention)
  on public.user_preferences to authenticated;

create policy settings_select_own on public.user_settings for select to authenticated
  using (user_id = (select auth.uid()));
create policy settings_update_own on public.user_settings for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select on public.user_settings to authenticated;
grant update (notify_matches, notify_messages, notify_superpings, notify_events, show_active_status,
  read_receipts, approximate_distance, haptics, sound_effects) on public.user_settings to authenticated;

create policy photos_select_own on public.photos for select to authenticated
  using (user_id = (select auth.uid()));
create policy photos_insert_own on public.photos for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy photos_update_own on public.photos for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy photos_delete_own on public.photos for delete to authenticated
  using (user_id = (select auth.uid()));
grant select on public.photos to authenticated;
grant insert (user_id, storage_path, position, width, height) on public.photos to authenticated;
grant update (position) on public.photos to authenticated;
grant delete on public.photos to authenticated;

create policy tags_select_all on public.tags for select to authenticated using (true);
grant select on public.tags to authenticated;
create policy prompts_select_all on public.prompt_suggestions for select to authenticated using (true);
grant select on public.prompt_suggestions to authenticated;
create policy config_select_all on public.app_config for select to authenticated using (true);
grant select on public.app_config to authenticated;

create policy profile_tags_select_own on public.profile_tags for select to authenticated
  using (user_id = (select auth.uid()));
create policy profile_tags_insert_own on public.profile_tags for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy profile_tags_delete_own on public.profile_tags for delete to authenticated
  using (user_id = (select auth.uid()));
grant select, insert, delete on public.profile_tags to authenticated;

create policy swipes_select_own on public.swipes for select to authenticated
  using (swiper_id = (select auth.uid()));
grant select on public.swipes to authenticated;

create policy matches_select_participant on public.matches for select to authenticated
  using ((select auth.uid()) in (user_a, user_b));
grant select on public.matches to authenticated;

create policy messages_select_participant on public.messages for select to authenticated
  using (public.is_match_participant(match_id));
create policy messages_insert_participant on public.messages for insert to authenticated
  with check (sender_id = (select auth.uid()) and public.can_message(match_id));
grant select on public.messages to authenticated;
grant insert (match_id, sender_id, body) on public.messages to authenticated;

create policy match_reads_select_own on public.match_reads for select to authenticated
  using (user_id = (select auth.uid()));
grant select on public.match_reads to authenticated;

create policy blocks_select_own on public.blocks for select to authenticated
  using (blocker_id = (select auth.uid()));
create policy blocks_insert_own on public.blocks for insert to authenticated
  with check (blocker_id = (select auth.uid()));
create policy blocks_delete_own on public.blocks for delete to authenticated
  using (blocker_id = (select auth.uid()));
grant select, insert, delete on public.blocks to authenticated;

create policy reports_select_own on public.reports for select to authenticated
  using (reporter_id = (select auth.uid()));
create policy reports_insert_own on public.reports for insert to authenticated
  with check (reporter_id = (select auth.uid()));
grant select on public.reports to authenticated;
grant insert (reporter_id, reported_id, reason, details) on public.reports to authenticated;

create policy verifications_select_own on public.verifications for select to authenticated
  using (user_id = (select auth.uid()));
create policy verifications_insert_own on public.verifications for insert to authenticated
  with check (user_id = (select auth.uid()));
grant select on public.verifications to authenticated;
grant insert (user_id, selfie_path) on public.verifications to authenticated;

create policy push_tokens_select_own on public.push_tokens for select to authenticated
  using (user_id = (select auth.uid()));
create policy push_tokens_delete_own on public.push_tokens for delete to authenticated
  using (user_id = (select auth.uid()));
grant select, delete on public.push_tokens to authenticated;
