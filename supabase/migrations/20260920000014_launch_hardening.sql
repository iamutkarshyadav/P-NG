-- Launch hardening.
--   1. reorder_photos: a single UPDATE (the old version staged negative positions, which the
--      0..5 CHECK rejects, so reordering always failed).
--   2. Super-pings cannot be undone (undo + re-ping was an unlimited super-ping loop that also
--      re-notified the target every time). record_swipe also serialises the daily cap.
--   3. Matches end softly instead of being deleted, so a block or unmatch no longer erases the
--      conversation a report needs as evidence.
--   4. Reports go through report_user(), which snapshots the conversation, rate-limits, and keeps
--      a hash of the reported email so the record survives account deletion.
--   5. Birthday is locked once onboarding is complete.
--   6. Three different people reporting the same profile within 7 days puts it on a moderation hold
--      (hidden from Discover and un-swipeable) until a moderator releases it.

-- ------------------------------------------------------------------ 1. reorder_photos
create or replace function public.reorder_photos(p_ordered_ids uuid[]) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  if p_ordered_ids is null
     or cardinality(p_ordered_ids) <> (select count(*) from public.photos where user_id = uid)
     or (select count(distinct x) from unnest(p_ordered_ids) as x) <> cardinality(p_ordered_ids)
     or exists (
       select 1 from unnest(p_ordered_ids) as x
        where not exists (select 1 from public.photos where id = x and user_id = uid)
     ) then
    raise exception 'Invalid photo order' using errcode = '22023';
  end if;

  -- photos_position_unique is DEFERRABLE INITIALLY DEFERRED, so the swap is checked once at commit.
  update public.photos p
     set position = (o.ord - 1)::smallint
    from unnest(p_ordered_ids) with ordinality as o(id, ord)
   where p.id = o.id and p.user_id = uid;
end $$;

-- ------------------------------------------------------------------ 3. matches end softly
alter table public.matches
  add column ended_at timestamptz,
  add column ended_by uuid references public.profiles (id) on delete set null,
  add column end_reason text check (end_reason in ('unmatched', 'blocked', 'reset'));

alter table public.matches
  add constraint matches_end_consistent check ((ended_at is null) = (end_reason is null));

-- One ACTIVE match per pair; ended rows are kept, so the same pair can match again later.
alter table public.matches drop constraint if exists matches_user_a_user_b_key;
create unique index matches_active_pair_key on public.matches (user_a, user_b) where ended_at is null;

-- Participants can still SELECT the row (so Realtime can tell their app the match ended), but every
-- function below treats an ended match as gone: no messages can be read, sent or listed.
create or replace function public.is_match_participant(m uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.matches
    where id = m and ended_at is null and (select auth.uid()) in (user_a, user_b)
  )
$$;

create or replace function public.can_message(m uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.matches mt
    where mt.id = m
      and mt.ended_at is null
      and (select auth.uid()) in (mt.user_a, mt.user_b)
      and not public.is_blocked_between(mt.user_a, mt.user_b)
  )
$$;

create or replace function public.remove_match_on_block() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.matches
     set ended_at = now(), ended_by = new.blocker_id, end_reason = 'blocked'
   where user_a = least(new.blocker_id, new.blocked_id)
     and user_b = greatest(new.blocker_id, new.blocked_id)
     and ended_at is null;
  return null;
end $$;

create or replace function public.unmatch(p_match uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_match_participant(p_match) then
    raise exception 'Not a participant' using errcode = '42501';
  end if;
  update public.matches
     set ended_at = now(), ended_by = (select auth.uid()), end_reason = 'unmatched'
   where id = p_match and ended_at is null;
end $$;

create or replace function public.reset_my_swipes() returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  update public.matches
     set ended_at = now(), ended_by = uid, end_reason = 'reset'
   where uid in (user_a, user_b) and ended_at is null;
  delete from public.swipes where swiper_id = uid;
end $$;

create or replace function public.my_matches()
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
     and m.ended_at is null
     and not public.is_blocked_between(m.user_a, m.user_b)
   order by coalesce(lm.created_at, m.created_at) desc
$$;

-- ------------------------------------------------------------------ 2. swipes
create or replace function public.record_swipe(p_target uuid, p_action public.swipe_action_t)
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
     where t.id = p_target and t.onboarding_completed_at is not null
       and not t.is_paused and not t.is_hidden and not t.moderation_hold
  ) or public.is_blocked_between(uid, p_target) then
    raise exception 'Profile unavailable' using errcode = 'P0002';
  end if;

  if p_action = 'superping' then
    -- Two concurrent calls must not both see "0 used".
    perform pg_advisory_xact_lock(hashtextextended(uid::text || ':superping', 0));
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
   where m.user_a = least(uid, p_target) and m.user_b = greatest(uid, p_target)
     and m.ended_at is null;
  return query select mid is not null, mid;
end $$;

create or replace function public.undo_last_swipe() returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  last_swipe public.swipes%rowtype;
begin
  if uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  select * into last_swipe from public.swipes where swiper_id = uid order by created_at desc limit 1;
  if not found then return null; end if;
  -- Refunding a super-ping would make the daily limit meaningless.
  if last_swipe.action = 'superping' then return null; end if;
  if last_swipe.created_at < now() - interval '10 minutes' then return null; end if;
  if exists (
    select 1 from public.matches
     where user_a = least(uid, last_swipe.target_id) and user_b = greatest(uid, last_swipe.target_id)
       and ended_at is null
  ) then
    return null;
  end if;
  delete from public.swipes where swiper_id = uid and target_id = last_swipe.target_id;
  return last_swipe.target_id;
end $$;

-- ------------------------------------------------------------------ 4. reports with evidence
alter table public.reports
  alter column reported_id drop not null,
  add column match_id uuid references public.matches (id) on delete set null,
  add column evidence jsonb,
  add column reported_email_hash text;

-- A report outlives the account it is about, so deleting an account does not erase the report.
alter table public.reports drop constraint if exists reports_reported_id_fkey;
alter table public.reports
  add constraint reports_reported_id_fkey foreign key (reported_id) references public.profiles (id) on delete set null;

-- Reports are created only through report_user(). Reporters may read their own reports, but not the
-- evidence snapshot or the hashed identity of the person they reported.
drop policy if exists reports_insert_own on public.reports;
revoke insert (reporter_id, reported_id, reason, details) on public.reports from authenticated;
revoke select on public.reports from authenticated;
grant select (id, reporter_id, reported_id, reason, details, status, created_at) on public.reports to authenticated;

create function public.report_user(
  p_reported uuid,
  p_reason public.report_reason_t,
  p_details text default null,
  p_match uuid default null
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  mid uuid;
  snapshot jsonb;
  email_hash text;
begin
  if uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  if p_reported is null or p_reported = uid then raise exception 'Invalid report target' using errcode = '22023'; end if;
  if not exists (select 1 from public.profiles where id = p_reported) then
    raise exception 'Profile unavailable' using errcode = 'P0002';
  end if;

  -- The same complaint twice in a day is one report.
  if exists (
    select 1 from public.reports
     where reporter_id = uid and reported_id = p_reported and reason = p_reason
       and created_at > now() - interval '1 day'
  ) then
    return;
  end if;
  if (select count(*) from public.reports where reporter_id = uid and created_at > now() - interval '1 day') >= 10 then
    raise exception 'You have sent a lot of reports today. Please try again tomorrow.' using errcode = 'P0001';
  end if;

  -- The conversation between the two people, active or already ended (a block ends it).
  select m.id into mid from public.matches m
   where m.user_a = least(uid, p_reported) and m.user_b = greatest(uid, p_reported)
     and (p_match is null or m.id = p_match)
   order by m.created_at desc limit 1;

  if mid is not null then
    select coalesce(jsonb_agg(
             jsonb_build_object(
               'from', case when x.sender_id = uid then 'reporter' else 'reported' end,
               'body', x.body,
               'at', x.created_at
             ) order by x.created_at), '[]'::jsonb)
      into snapshot
      from (select sender_id, body, created_at from public.messages
             where match_id = mid order by created_at desc limit 30) x;
  end if;

  select encode(sha256(convert_to(lower(u.email), 'UTF8')), 'hex')
    into email_hash from auth.users u where u.id = p_reported;

  insert into public.reports (reporter_id, reported_id, reason, details, match_id, evidence, reported_email_hash)
  values (uid, p_reported, p_reason, left(nullif(trim(p_details), ''), 1000), mid, snapshot, email_hash);
end $$;

revoke execute on function public.report_user(uuid, public.report_reason_t, text, uuid) from public, anon;
grant execute on function public.report_user(uuid, public.report_reason_t, text, uuid) to authenticated;

-- People removed for abuse can be blocked from signing up again (by hashed email). Populated by hand from the
-- service role after a report is actioned, e.g.:
--   insert into public.banned_identities (email_hash, reason)
--   select reported_email_hash, 'harassment' from public.reports where id = '<report id>';
-- This stops a plain re-signup with the same address, not aliases or new addresses.
create table public.banned_identities (
  email_hash text primary key,
  reason text,
  created_at timestamptz not null default now()
);
alter table public.banned_identities enable row level security; -- no policies: service role only
revoke all on public.banned_identities from anon, authenticated;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.email is not null and exists (
    select 1 from public.banned_identities
     where email_hash = encode(sha256(convert_to(lower(new.email), 'UTF8')), 'hex')
  ) then
    raise exception 'This account cannot be created.' using errcode = 'P0001';
  end if;

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

-- ------------------------------------------------------------------ 5. birthday lock
-- Only enforced for signed-in app users (auth.uid() is null for the dashboard and service role, so
-- support can still correct a genuine mistake).
create function public.lock_birthday() returns trigger
language plpgsql set search_path = '' as $$
begin
  if (select auth.uid()) is not null
     and old.onboarding_completed_at is not null
     and old.birthday is not null
     and new.birthday is distinct from old.birthday then
    raise exception 'Your birthday cannot be changed. Contact support if it is wrong.'
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

revoke execute on function public.lock_birthday() from public, anon, authenticated;

create trigger profiles_lock_birthday before update of birthday on public.profiles
  for each row execute function public.lock_birthday();

-- ------------------------------------------------------------------ 6. automatic hold
-- The hold only hides the profile pending review; moderators release it with
--   update public.profiles set moderation_hold = false where id = '<profile id>';
-- (see supabase/review-reports.sql). Distinct reporters are counted so one person cannot trigger it alone.
create function public.hold_on_repeated_reports() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.reported_id is not null and new.reason <> 'other' and (
    select count(distinct r.reporter_id) from public.reports r
     where r.reported_id = new.reported_id and r.reason <> 'other'
       and r.created_at > now() - interval '7 days'
  ) >= 3 then
    update public.profiles set moderation_hold = true where id = new.reported_id and not moderation_hold;
  end if;
  return null;
end $$;

revoke execute on function public.hold_on_repeated_reports() from public, anon, authenticated;

create trigger reports_auto_hold after insert on public.reports
  for each row execute function public.hold_on_repeated_reports();
