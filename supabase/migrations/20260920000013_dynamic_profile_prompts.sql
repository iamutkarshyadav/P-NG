-- Migration: 20260920000013_dynamic_profile_prompts.sql
-- Description: profile prompts, occupation, pronouns and audio/anthem text attributes, with hard length limits.
-- No accounts or demo data live here: see supabase/seed-dev-profiles.sql (dev projects only).

-- The artwork URL was a free-form link that every viewer's app would fetch (an IP-tracking vector), so it is
-- not stored. The drop is only relevant to a database where an earlier draft of this migration was applied.
drop function if exists public.discover_feed(integer);
alter table public.profiles drop column if exists anthem_artwork;

-- 1. Columns
alter table public.profiles
  add column if not exists pronouns text,
  add column if not exists occupation text,
  add column if not exists anthem_track text,
  add column if not exists anthem_artist text,
  add column if not exists voice_note_prompt text,
  add column if not exists voice_note_duration text,
  add column if not exists prompt_1_title text,
  add column if not exists prompt_1_text text,
  add column if not exists photo_2_prompt text,
  add column if not exists photo_3_prompt text;

-- 1b. Hometown, languages, per-field visibility for sensitive answers, and a moderation hold that only the
--     service role can set (it is deliberately not granted to app users).
alter table public.profiles
  add column if not exists hometown text,
  add column if not exists languages text[] not null default '{}',
  add column if not exists show_religion boolean not null default true,
  add column if not exists show_politics boolean not null default true,
  add column if not exists moderation_hold boolean not null default false;

alter table public.profiles
  drop constraint if exists profiles_hometown_languages_check;

alter table public.profiles
  add constraint profiles_hometown_languages_check check (
    char_length(coalesce(hometown, '')) <= 80
    and cardinality(languages) <= 5
    and languages <@ array['english', 'hindi', 'bengali', 'tamil', 'telugu', 'marathi', 'gujarati', 'kannada', 'malayalam',
                           'punjabi', 'urdu', 'spanish', 'french', 'german', 'portuguese', 'italian', 'arabic', 'mandarin',
                           'japanese', 'korean', 'russian']
  );

-- 2. Every one of these is returned to every viewer by discover_feed, so cap them.
alter table public.profiles
  drop constraint if exists profiles_text_lengths_check;

alter table public.profiles
  add constraint profiles_text_lengths_check check (
    char_length(coalesce(pronouns, '')) <= 20
    and char_length(coalesce(occupation, '')) <= 60
    and char_length(coalesce(anthem_track, '')) <= 80
    and char_length(coalesce(anthem_artist, '')) <= 80
    and char_length(coalesce(voice_note_prompt, '')) <= 150
    and char_length(coalesce(voice_note_duration, '')) <= 8
    and char_length(coalesce(prompt_1_title, '')) <= 80
    and char_length(coalesce(prompt_1_text, '')) <= 300
    and char_length(coalesce(photo_2_prompt, '')) <= 200
    and char_length(coalesce(photo_3_prompt, '')) <= 200
  );

-- 3. Grants (column-level, like every other profile column)
grant select (
  pronouns, occupation, anthem_track, anthem_artist,
  voice_note_prompt, voice_note_duration, prompt_1_title, prompt_1_text,
  photo_2_prompt, photo_3_prompt
) on public.profiles to authenticated;

grant update (
  pronouns, occupation, anthem_track, anthem_artist,
  voice_note_prompt, voice_note_duration, prompt_1_title, prompt_1_text,
  photo_2_prompt, photo_3_prompt
) on public.profiles to authenticated;

grant select (hometown, languages, show_religion, show_politics) on public.profiles to authenticated;
grant update (hometown, languages, show_religion, show_politics) on public.profiles to authenticated;

-- 4. discover_feed with the full profile projection
create function public.discover_feed(p_limit integer default 20)
returns table (
  id uuid, display_name text, age integer, gender public.gender_t, bio text, city text,
  distance_km integer, is_verified boolean, last_active_at timestamptz,
  tags text[], photo_paths text[],
  dating_intention text, height_cm smallint, drinking_habits text, smoking_habits text,
  workout_habits text, pet_preference text, family_plans text, zodiac_sign text,
  education_level text, religion text, politics text,
  pronouns text, occupation text, anthem_track text, anthem_artist text,
  voice_note_prompt text, voice_note_duration text, prompt_1_title text, prompt_1_text text,
  photo_2_prompt text, photo_3_prompt text
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
         c.education_level, c.religion, c.politics,
         c.pronouns, c.occupation, c.anthem_track, c.anthem_artist,
         c.voice_note_prompt, c.voice_note_duration, c.prompt_1_title, c.prompt_1_text,
         c.photo_2_prompt, c.photo_3_prompt
    from cand c
   order by c.dist_m nulls last, c.last_active_at desc
   limit least(greatest(coalesce(p_limit, 20), 1), 50)
$$;

revoke execute on function public.discover_feed(integer) from public, anon;
grant execute on function public.discover_feed(integer) to authenticated;
