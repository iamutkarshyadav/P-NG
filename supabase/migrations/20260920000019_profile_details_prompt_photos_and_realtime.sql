-- Migration: 20260920000019_profile_details_prompt_photos_and_realtime.sql
-- Description: 
-- 1. Updates get_profile_details RPC to include photo_path in prompts JSON object.
-- 2. Sets REPLICA IDENTITY FULL on messages and matches to ensure Supabase Realtime broadcast filters work on UPDATE events (read receipts, match endings).

-- 1. Ensure photo_path column exists on profile_prompts
alter table public.profile_prompts
  add column if not exists photo_path text;

-- 2. Fix get_profile_details to project photo_path
create or replace function public.get_profile_details(p_target uuid)
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
begin
  if uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  if p_target is null then raise exception 'Target user required' using errcode = '22023'; end if;

  -- Block check: if either user has blocked the other, refuse access
  if public.is_blocked_between(uid, p_target) then
    raise exception 'Profile unavailable' using errcode = 'P0002';
  end if;

  select location into me from public.profiles where id = uid;

  return query
  select p.id,
         p.display_name,
         public.age_years(p.birthday),
         case when p.show_gender then p.gender end,
         p.bio,
         p.city,
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
         p.dating_intention,
         p.height_cm,
         p.drinking_habits,
         p.smoking_habits,
         p.workout_habits,
         p.pet_preference,
         p.family_plans,
         p.zodiac_sign,
         p.education_level,
         case when p.show_religion then p.religion end,
         case when p.show_politics then p.politics end,
         p.pronouns,
         p.occupation,
         p.anthem_track,
         p.anthem_artist,
         p.voice_note_prompt,
         p.voice_note_duration,
         p.photo_2_prompt,
         p.photo_3_prompt,
         p.hometown,
         p.languages,
         coalesce((select jsonb_agg(jsonb_build_object(
                     'slot', pp.slot,
                     'prompt', pp.prompt,
                     'answer', pp.answer,
                     'photo_path', pp.photo_path
                   ) order by pp.slot)
                     from public.profile_prompts pp where pp.user_id = p.id), '[]'::jsonb)
    from public.profiles p
    join public.user_settings cs on cs.user_id = p.id
   where p.id = p_target
     and p.onboarding_completed_at is not null
     and not p.is_paused
     and not p.is_hidden
     and not p.moderation_hold;
end $$;

revoke execute on function public.get_profile_details(uuid) from public, anon;
grant execute on function public.get_profile_details(uuid) to authenticated;

-- 2. Configure REPLICA IDENTITY FULL for complete Realtime UPDATE payload delivery
alter table public.messages replica identity full;
alter table public.matches replica identity full;
