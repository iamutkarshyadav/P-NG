-- Discovery filters + spatial-index feed, multi-slot prompts, selfie pose challenge.
--   A. profile_prompts: up to 3 question/answer slots per profile, written atomically through set_my_prompts().
--   B. Saved deal-breaker filters on user_preferences (dating intention and lifestyle).
--   C. discover_feed rewritten so PostGIS' GiST index does the work: an unconditional ST_DWithin radius plus
--      KNN ordering, sargable age bounds, and indexed anti-joins instead of per-row function calls.
--   D. Selfie verification issues a server-side pose challenge that the reviewer can check.

-- ------------------------------------------------------------------ A. prompts
create table public.profile_prompts (
  user_id uuid not null references public.profiles (id) on delete cascade,
  slot smallint not null check (slot between 1 and 3),
  prompt text not null check (char_length(prompt) between 1 and 80),
  answer text not null check (char_length(answer) between 1 and 300),
  updated_at timestamptz not null default now(),
  primary key (user_id, slot)
);

alter table public.profile_prompts enable row level security;
create policy profile_prompts_select_own on public.profile_prompts for select to authenticated
  using (user_id = (select auth.uid()));
revoke all on public.profile_prompts from anon, authenticated;
grant select on public.profile_prompts to authenticated;
-- Writes go through set_my_prompts() only. Other people's prompts are exposed only by discover_feed().

create function public.set_my_prompts(p_prompts jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  item jsonb;
  s integer;
  q text;
  a text;
begin
  if uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  if p_prompts is null or jsonb_typeof(p_prompts) <> 'array' or jsonb_array_length(p_prompts) > 3 then
    raise exception 'Choose up to 3 prompts.' using errcode = '22023';
  end if;

  delete from public.profile_prompts where user_id = uid;
  for item in select * from jsonb_array_elements(p_prompts) loop
    s := (item ->> 'slot')::integer;
    q := trim(item ->> 'prompt');
    a := trim(item ->> 'answer');
    if s is null or s not between 1 and 3 then
      raise exception 'Invalid prompt slot.' using errcode = '22023';
    end if;
    if coalesce(char_length(q), 0) not between 1 and 80 or coalesce(char_length(a), 0) not between 1 and 300 then
      raise exception 'Each prompt needs a question (up to 80 characters) and an answer (up to 300).' using errcode = '22023';
    end if;
    insert into public.profile_prompts (user_id, slot, prompt, answer) values (uid, s, q, a);
  end loop;
end $$;

revoke execute on function public.set_my_prompts(jsonb) from public, anon;
grant execute on function public.set_my_prompts(jsonb) to authenticated;

-- The single-prompt columns are replaced by profile_prompts.
drop function if exists public.discover_feed(integer);
alter table public.profiles drop constraint if exists profiles_text_lengths_check;
alter table public.profiles drop column if exists prompt_1_title, drop column if exists prompt_1_text;
alter table public.profiles
  add constraint profiles_text_lengths_check check (
    char_length(coalesce(pronouns, '')) <= 20
    and char_length(coalesce(occupation, '')) <= 60
    and char_length(coalesce(anthem_track, '')) <= 80
    and char_length(coalesce(anthem_artist, '')) <= 80
    and char_length(coalesce(voice_note_prompt, '')) <= 150
    and char_length(coalesce(voice_note_duration, '')) <= 8
    and char_length(coalesce(photo_2_prompt, '')) <= 200
    and char_length(coalesce(photo_3_prompt, '')) <= 200
  );

-- ------------------------------------------------------------------ B. saved deal-breakers
-- Empty array = no filter. Profiles that have not answered an attribute are never filtered out by it.
alter table public.user_preferences
  add column filter_intentions text[] not null default '{}',
  add column filter_drinking text[] not null default '{}',
  add column filter_smoking text[] not null default '{}',
  add column filter_workout text[] not null default '{}',
  add column filter_pets text[] not null default '{}',
  add column filter_family text[] not null default '{}';

alter table public.user_preferences
  add constraint user_preferences_filters_check check (
    filter_intentions <@ array['long_term', 'long_term_open_to_short', 'short_term_open_to_long', 'short_term', 'figuring_out', 'new_friends']
    and filter_drinking <@ array['socially', 'never', 'sober', 'frequently']
    and filter_smoking <@ array['never', 'socially', 'regular']
    and filter_workout <@ array['everyday', 'often', 'sometimes', 'never']
    and filter_pets <@ array['cat_person', 'dog_person', 'all_pets', 'none']
    and filter_family <@ array['want_kids', 'dont_want_kids', 'open_to_kids', 'have_and_want_more', 'have_and_dont_want']
  );

grant update (filter_intentions, filter_drinking, filter_smoking, filter_workout, filter_pets, filter_family)
  on public.user_preferences to authenticated;

-- ------------------------------------------------------------------ C. feed
-- Partial indexes that match the feed's fixed predicates (a query can use a partial index only when it
-- repeats its predicate, which discover_feed does).
drop index if exists public.profiles_location_idx;
create index profiles_feed_geo_idx on public.profiles using gist (location)
  where onboarding_completed_at is not null and not is_paused and not is_hidden;
create index profiles_feed_active_idx on public.profiles (last_active_at desc)
  where onboarding_completed_at is not null and not is_paused and not is_hidden;

-- p_* filters override the caller's saved deal-breakers when not null (an empty array means "no filter").
create function public.discover_feed(
  p_limit integer default 20,
  p_intentions text[] default null,
  p_drinking text[] default null,
  p_smoking text[] default null,
  p_workout text[] default null,
  p_pets text[] default null,
  p_family text[] default null
)
returns table (
  id uuid, display_name text, age integer, gender public.gender_t, bio text, city text,
  distance_km integer, is_verified boolean, last_active_at timestamptz,
  tags text[], photo_paths text[],
  dating_intention text, height_cm smallint, drinking_habits text, smoking_habits text,
  workout_habits text, pet_preference text, family_plans text, zodiac_sign text,
  education_level text, religion text, politics text,
  pronouns text, occupation text, anthem_track text, anthem_artist text,
  voice_note_prompt text, voice_note_duration text, photo_2_prompt text, photo_3_prompt text,
  hometown text, languages text[], prompts jsonb
)
language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  me record;
  lim integer := least(greatest(coalesce(p_limit, 20), 1), 50);
  radius_m double precision;
  bday_lo date;
  bday_hi date;
  f_intent text[];
  f_drink text[];
  f_smoke text[];
  f_work text[];
  f_pets text[];
  f_family text[];
  ids uuid[] := '{}';
  more uuid[];
  base_sql text;
begin
  if uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;

  select pr.gender as gender, pr.location as location, public.age_years(pr.birthday) as age,
         up.interested_in, up.min_age, up.max_age, up.max_distance_km, up.strict_distance,
         up.filter_intentions, up.filter_drinking, up.filter_smoking, up.filter_workout,
         up.filter_pets, up.filter_family
    into me
    from public.profiles pr
    join public.user_preferences up on up.user_id = pr.id
   where pr.id = uid and pr.onboarding_completed_at is not null;
  if not found then return; end if;

  f_intent := coalesce(p_intentions, me.filter_intentions);
  f_drink := coalesce(p_drinking, me.filter_drinking);
  f_smoke := coalesce(p_smoking, me.filter_smoking);
  f_work := coalesce(p_workout, me.filter_workout);
  f_pets := coalesce(p_pets, me.filter_pets);
  f_family := coalesce(p_family, me.filter_family);

  -- "Not strict" means no radius; 20,100 km is beyond half the Earth's circumference.
  radius_m := case when me.strict_distance then me.max_distance_km * 1000.0 else 20100000 end;
  -- age between min and max  <=>  birthday between (today - (max+1) years + 1 day) and (today - min years)
  bday_lo := (current_date - make_interval(years => me.max_age + 1))::date + 1;
  bday_hi := (current_date - make_interval(years => me.min_age))::date;

  -- Shared eligibility. Parameters: $1 me, $2 my interests, $3/$4 birthday bounds, $5 my gender, $6 my age,
  -- $7 my location, $8 radius (m), $9..$14 deal-breakers. Only constants from this function are concatenated;
  -- every value travels through USING.
  base_sql := $sql$
      from public.profiles p
      join public.user_preferences cp on cp.user_id = p.id
     where p.id <> $1
       and p.onboarding_completed_at is not null
       and not p.is_paused and not p.is_hidden and not p.moderation_hold
       and p.gender = any ($2)
       and p.birthday between $3 and $4
       and $5 = any (cp.interested_in)
       and $6 between cp.min_age and cp.max_age
       and not exists (select 1 from public.swipes s where s.swiper_id = $1 and s.target_id = p.id)
       and not exists (select 1 from public.blocks b where b.blocker_id = $1 and b.blocked_id = p.id)
       and not exists (select 1 from public.blocks b where b.blocker_id = p.id and b.blocked_id = $1)
       and (cardinality($9) = 0 or p.dating_intention is null or p.dating_intention = any ($9))
       and (cardinality($10) = 0 or p.drinking_habits is null or p.drinking_habits = any ($10))
       and (cardinality($11) = 0 or p.smoking_habits is null or p.smoking_habits = any ($11))
       and (cardinality($12) = 0 or p.workout_habits is null or p.workout_habits = any ($12))
       and (cardinality($13) = 0 or p.pet_preference is null or p.pet_preference = any ($13))
       and (cardinality($14) = 0 or p.family_plans is null or p.family_plans = any ($14))
  $sql$;

  -- Pass 1: people with a location, nearest first. The unconditional ST_DWithin is the index qual and the
  -- <-> ordering is served by the same GiST index, so the scan stops after `lim` matches.
  if me.location is not null then
    execute
      'select coalesce(array_agg(t.id order by t.dist), ''{}''::uuid[]) from (select p.id, p.location operator(extensions.<->) $7 as dist '
      || base_sql
      || ' and extensions.st_dwithin(p.location, $7, $8) order by p.location operator(extensions.<->) $7 limit ' || lim || ') t'
      into ids
      using uid, me.interested_in, bday_lo, bday_hi, me.gender, me.age, me.location, radius_m,
            f_intent, f_drink, f_smoke, f_work, f_pets, f_family;
  end if;

  -- Pass 2: fill the rest with the most recently active people whose distance is unknown (no stored
  -- location), or with everyone when the caller has no location.
  if cardinality(ids) < lim then
    execute
      'select coalesce(array_agg(t.id order by t.last_active_at desc), ''{}''::uuid[]) from (select p.id, p.last_active_at '
      || base_sql
      || case when me.location is not null then ' and p.location is null ' else '' end
      || ' order by p.last_active_at desc limit ' || (lim - cardinality(ids)) || ') t'
      into more
      using uid, me.interested_in, bday_lo, bday_hi, me.gender, me.age, me.location, radius_m,
            f_intent, f_drink, f_smoke, f_work, f_pets, f_family;
    ids := ids || more;
  end if;

  return query
  select p.id, p.display_name, public.age_years(p.birthday), case when p.show_gender then p.gender end, p.bio, p.city,
         case when me.location is null or p.location is null then null
              when cs.approximate_distance
                then greatest(5, (ceil(extensions.st_distance(p.location, me.location) / 5000.0) * 5))::integer
              else greatest(1, ceil(extensions.st_distance(p.location, me.location) / 1000.0))::integer end,
         p.is_verified,
         case when cs.show_active_status then p.last_active_at end,
         coalesce((select array_agg(t.name order by t.sort)
                     from public.profile_tags pt join public.tags t on t.id = pt.tag_id
                    where pt.user_id = p.id), '{}'),
         coalesce((select array_agg(ph.storage_path order by ph.position)
                     from public.photos ph
                    where ph.user_id = p.id and ph.moderation = 'approved'), '{}'),
         p.dating_intention, p.height_cm, p.drinking_habits, p.smoking_habits,
         p.workout_habits, p.pet_preference, p.family_plans, p.zodiac_sign,
         p.education_level,
         case when p.show_religion then p.religion end,
         case when p.show_politics then p.politics end,
         p.pronouns, p.occupation, p.anthem_track, p.anthem_artist,
         p.voice_note_prompt, p.voice_note_duration, p.photo_2_prompt, p.photo_3_prompt,
         p.hometown, p.languages,
         coalesce((select jsonb_agg(jsonb_build_object('slot', pp.slot, 'prompt', pp.prompt, 'answer', pp.answer)
                                    order by pp.slot)
                     from public.profile_prompts pp where pp.user_id = p.id), '[]'::jsonb)
    from unnest(ids) with ordinality as o(pid, ord)
    join public.profiles p on p.id = o.pid
    join public.user_settings cs on cs.user_id = p.id
   order by o.ord;
end $$;

revoke execute on function public.discover_feed(integer, text[], text[], text[], text[], text[], text[]) from public, anon;
grant execute on function public.discover_feed(integer, text[], text[], text[], text[], text[], text[]) to authenticated;

-- ------------------------------------------------------------------ D. selfie pose challenge
alter table public.verifications add column challenge text;

create table public.verification_challenges (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  challenge text not null,
  issued_at timestamptz not null default now()
);
alter table public.verification_challenges enable row level security; -- no policies: reached only through the RPCs
revoke all on public.verification_challenges from anon, authenticated;

create function public.verification_challenge() returns text
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  poses text[] := array[
    'Touch your nose with one finger',
    'Give a thumbs up',
    'Hold up two fingers',
    'Cover your left eye with your hand',
    'Touch your chin',
    'Tilt your head to the right',
    'Point at the camera',
    'Put a hand on top of your head'
  ];
  pick text;
begin
  if uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  pick := poses[1 + floor(random() * cardinality(poses))::integer];
  insert into public.verification_challenges (user_id, challenge, issued_at)
  values (uid, pick, now())
  on conflict (user_id) do update set challenge = excluded.challenge, issued_at = excluded.issued_at;
  return pick;
end $$;

-- Verification requests are created here only, so every one carries the pose the reviewer should see.
create function public.submit_verification(p_selfie_path text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  pose text;
begin
  if uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  if p_selfie_path is null or p_selfie_path not like uid::text || '/%' then
    raise exception 'Invalid selfie' using errcode = '22023';
  end if;
  if (select count(*) from public.verifications where user_id = uid and created_at > now() - interval '1 day') >= 5 then
    raise exception 'Too many verification attempts today. Please try again tomorrow.' using errcode = 'P0001';
  end if;
  select vc.challenge into pose from public.verification_challenges vc
   where vc.user_id = uid and vc.issued_at > now() - interval '15 minutes';
  if pose is null then
    raise exception 'Your pose challenge expired. Start again.' using errcode = 'P0001';
  end if;

  insert into public.verifications (user_id, selfie_path, challenge) values (uid, p_selfie_path, pose);
  delete from public.verification_challenges where user_id = uid;
end $$;

drop policy if exists verifications_insert_own on public.verifications;
revoke insert (user_id, selfie_path) on public.verifications from authenticated;

revoke execute on function public.verification_challenge(), public.submit_verification(text) from public, anon;
grant execute on function public.verification_challenge(), public.submit_verification(text) to authenticated;

-- ------------------------------------------------------------------ E. data export includes prompts
create or replace function public.export_my_data() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  return jsonb_build_object(
    'exported_at', now(),
    'account', (select jsonb_build_object('id', u.id, 'email', u.email, 'created_at', u.created_at)
                  from auth.users u where u.id = uid),
    'profile', (select (to_jsonb(p) - 'location' - 'is_seed' - 'moderation_hold')
                       || jsonb_build_object(
                            'approx_latitude', extensions.st_y(p.location::extensions.geometry),
                            'approx_longitude', extensions.st_x(p.location::extensions.geometry))
                  from public.profiles p where p.id = uid),
    'prompts', coalesce((select jsonb_agg(jsonb_build_object('slot', pp.slot, 'prompt', pp.prompt, 'answer', pp.answer) order by pp.slot)
                           from public.profile_prompts pp where pp.user_id = uid), '[]'::jsonb),
    'preferences', (select to_jsonb(x) from public.user_preferences x where x.user_id = uid),
    'settings', (select to_jsonb(x) from public.user_settings x where x.user_id = uid),
    'photos', coalesce((select jsonb_agg(jsonb_build_object('path', ph.storage_path, 'position', ph.position, 'added', ph.created_at) order by ph.position)
                          from public.photos ph where ph.user_id = uid), '[]'::jsonb),
    'tags', coalesce((select jsonb_agg(t.name order by t.sort)
                        from public.profile_tags pt join public.tags t on t.id = pt.tag_id
                       where pt.user_id = uid), '[]'::jsonb),
    'swipes', coalesce((select jsonb_agg(jsonb_build_object('target', s.target_id, 'action', s.action, 'at', s.created_at) order by s.created_at)
                          from public.swipes s where s.swiper_id = uid), '[]'::jsonb),
    'matches', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'created_at', m.created_at, 'ended_at', m.ended_at, 'end_reason', m.end_reason) order by m.created_at)
                           from public.matches m where uid in (m.user_a, m.user_b)), '[]'::jsonb),
    'messages', coalesce((select jsonb_agg(jsonb_build_object('match', msg.match_id, 'sent_by_me', msg.sender_id = uid,
                                                              'body', msg.body, 'at', msg.created_at) order by msg.created_at)
                            from public.messages msg join public.matches m on m.id = msg.match_id
                           where uid in (m.user_a, m.user_b)), '[]'::jsonb),
    'blocks', coalesce((select jsonb_agg(jsonb_build_object('blocked', b.blocked_id, 'at', b.created_at))
                          from public.blocks b where b.blocker_id = uid), '[]'::jsonb),
    'reports_filed', coalesce((select jsonb_agg(jsonb_build_object('reported', r.reported_id, 'reason', r.reason, 'at', r.created_at))
                                 from public.reports r where r.reporter_id = uid), '[]'::jsonb)
  );
end $$;
