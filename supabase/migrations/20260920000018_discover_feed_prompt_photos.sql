-- Migration: 20260920000018_discover_feed_prompt_photos.sql
-- Description: Projects photo_path inside discover_feed's prompts JSON object to ensure prompt media loads in Discovery.

create or replace function public.discover_feed(
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

  -- Pass 1: people with a location, nearest first.
  if me.location is not null then
    execute
      'select coalesce(array_agg(t.id order by t.dist), ''{}''::uuid[]) from (select p.id, p.location operator(extensions.<->) $7 as dist '
      || base_sql
      || ' and extensions.st_dwithin(p.location, $7, $8) order by p.location operator(extensions.<->) $7 limit ' || lim || ') t'
      into ids
      using uid, me.interested_in, bday_lo, bday_hi, me.gender, me.age, me.location, radius_m,
            f_intent, f_drink, f_smoke, f_work, f_pets, f_family;
  end if;

  -- Pass 2: fill the rest with the most recently active people whose distance is unknown
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
         coalesce((select jsonb_agg(jsonb_build_object(
                     'slot', pp.slot,
                     'prompt', pp.prompt,
                     'answer', pp.answer,
                     'photo_path', pp.photo_path
                   ) order by pp.slot)
                     from public.profile_prompts pp where pp.user_id = p.id), '[]'::jsonb)
    from unnest(ids) with ordinality as o(pid, ord)
    join public.profiles p on p.id = o.pid
    join public.user_settings cs on cs.user_id = p.id
   order by o.ord;
end $$;

revoke execute on function public.discover_feed(integer, text[], text[], text[], text[], text[], text[]) from public, anon;
grant execute on function public.discover_feed(integer, text[], text[], text[], text[], text[], text[]) to authenticated;
