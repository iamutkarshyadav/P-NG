-- Migration: 20260920000012_bumble_profile_attributes.sql
-- Description: Bumble-style lifestyle badges, deal-breakers, and profile compatibility attributes.

alter table public.profiles
  add column if not exists dating_intention text,          -- e.g., 'long_term', 'short_term_open_to_long', 'figuring_out'
  add column if not exists height_cm smallint,             -- e.g., 180
  add column if not exists drinking_habits text,           -- e.g., 'socially', 'never', 'frequently'
  add column if not exists smoking_habits text,            -- e.g., 'never', 'socially', 'regular'
  add column if not exists workout_habits text,            -- e.g., 'everyday', 'often', 'sometimes'
  add column if not exists pet_preference text,            -- e.g., 'dog_person', 'cat_person', 'all_pets', 'none'
  add column if not exists family_plans text,              -- e.g., 'want_kids', 'dont_want_kids', 'open_to_kids'
  add column if not exists zodiac_sign text,               -- e.g., 'scorpio'
  add column if not exists education_level text,           -- e.g., 'masters', 'undergrad', 'high_school'
  add column if not exists religion text,                  -- e.g., 'spiritual', 'agnostic', etc.
  add column if not exists politics text;                  -- e.g., 'moderate', 'liberal', 'conservative'

-- Add check constraint for realistic human heights if provided
alter table public.profiles
  drop constraint if exists profiles_height_cm_check;

alter table public.profiles
  add constraint profiles_height_cm_check
  check (height_cm is null or (height_cm between 90 and 250));

-- These are free text columns that other people's clients read and render, so pin them to the
-- exact values the app offers (see src/types/lifestyle.ts). NULL means "not shared".
alter table public.profiles
  drop constraint if exists profiles_lifestyle_values_check;

alter table public.profiles
  add constraint profiles_lifestyle_values_check check (
    (dating_intention is null or dating_intention in
      ('long_term', 'long_term_open_to_short', 'short_term_open_to_long', 'short_term', 'figuring_out', 'new_friends'))
    and (drinking_habits is null or drinking_habits in ('socially', 'never', 'sober', 'frequently'))
    and (smoking_habits is null or smoking_habits in ('never', 'socially', 'regular'))
    and (workout_habits is null or workout_habits in ('everyday', 'often', 'sometimes', 'never'))
    and (pet_preference is null or pet_preference in ('cat_person', 'dog_person', 'all_pets', 'none'))
    and (family_plans is null or family_plans in
      ('want_kids', 'dont_want_kids', 'open_to_kids', 'have_and_want_more', 'have_and_dont_want'))
    and (zodiac_sign is null or zodiac_sign in
      ('aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'))
    and (education_level is null or education_level in
      ('high_school', 'in_college', 'undergrad', 'postgrad', 'doctorate', 'trade_school'))
    and (religion is null or religion in
      ('agnostic', 'atheist', 'spiritual', 'christian', 'hindu', 'muslim', 'jewish', 'buddhist', 'other'))
    and (politics is null or politics in ('liberal', 'moderate', 'conservative', 'apolitical', 'other'))
  );

-- Grant select and update permissions on the new columns to authenticated users
grant select (
  dating_intention, height_cm, drinking_habits, smoking_habits,
  workout_habits, pet_preference, family_plans, zodiac_sign,
  education_level, religion, politics
) on public.profiles to authenticated;

grant update (
  dating_intention, height_cm, drinking_habits, smoking_habits,
  workout_habits, pet_preference, family_plans, zodiac_sign,
  education_level, religion, politics
) on public.profiles to authenticated;

-- Drop and re-create discover_feed to return the lifestyle attributes in the discovery feed
drop function if exists public.discover_feed(integer);

create function public.discover_feed(p_limit integer default 20)
returns table (
  id uuid, display_name text, age integer, gender public.gender_t, bio text, city text,
  distance_km integer, is_verified boolean, last_active_at timestamptz,
  tags text[], photo_paths text[],
  dating_intention text, height_cm smallint, drinking_habits text, smoking_habits text,
  workout_habits text, pet_preference text, family_plans text, zodiac_sign text,
  education_level text, religion text, politics text
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
                    where ph.user_id = c.id and ph.moderation = 'approved'), '{}'),
         c.dating_intention, c.height_cm, c.drinking_habits, c.smoking_habits,
         c.workout_habits, c.pet_preference, c.family_plans, c.zodiac_sign,
         c.education_level, c.religion, c.politics
    from cand c
   order by c.dist_m nulls last, c.last_active_at desc
   limit least(greatest(coalesce(p_limit, 20), 1), 50)
$$;

revoke execute on function public.discover_feed(integer) from public, anon;
grant execute on function public.discover_feed(integer) to authenticated;
