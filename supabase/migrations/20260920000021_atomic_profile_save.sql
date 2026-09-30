-- Migration: 20260920000021_atomic_profile_save.sql
-- Description: Unified atomic profile persistence RPC (save_full_profile) with cryptographic BOLA path enforcement.

-- 1. Strengthen standalone set_my_prompts with BOLA regex check
create or replace function public.set_my_prompts(p_prompts jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  item jsonb;
  s integer;
  q text;
  a text;
  ph text;
begin
  if uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  if p_prompts is null or jsonb_typeof(p_prompts) <> 'array' or jsonb_array_length(p_prompts) > 3 then
    raise exception 'Choose up to 3 prompts.' using errcode = '22023';
  end if;

  delete from public.profile_prompts where user_id = uid;
  for item in select * from jsonb_array_elements(p_prompts) loop
    s := (item ->> 'slot')::integer;
    q := trim(coalesce(item ->> 'prompt', ''));
    a := trim(coalesce(item ->> 'answer', ''));
    ph := trim(coalesce(item ->> 'photo_path', item ->> 'photoPath', ''));
    if ph = '' then ph := null; end if;

    if s is null or s not between 1 and 3 then
      raise exception 'Invalid prompt slot.' using errcode = '22023';
    end if;
    if coalesce(char_length(q), 0) not between 1 and 80 or coalesce(char_length(a), 0) not between 1 and 300 then
      raise exception 'Each prompt needs a question (up to 80 characters) and an answer (up to 300).' using errcode = '22023';
    end if;

    -- Cryptographic BOLA guard: only allow files inside this user's prompts/ folder
    if ph is not null then
      if ph !~ ('^' || uid::text || '/prompts/[a-zA-Z0-9\-_]+\.(jpg|jpeg|webp)$') then
        raise exception 'Unauthorized prompt photo storage path.' using errcode = '42501';
      end if;
    end if;

    insert into public.profile_prompts (user_id, slot, prompt, answer, photo_path) values (uid, s, q, a, ph);
  end loop;
end $$;

revoke execute on function public.set_my_prompts(jsonb) from public, anon;
grant execute on function public.set_my_prompts(jsonb) to authenticated;

-- 2. Unified atomic save RPC
create or replace function public.save_full_profile(
  p_profile jsonb,
  p_tag_ids smallint[],
  p_prompts jsonb
) returns public.profiles
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  updated_row public.profiles;
  clean_name text;
  clean_bio text;
  parsed_height smallint;
begin
  if uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  -- 2a. Input sanitization
  clean_name := trim(coalesce(p_profile->>'display_name', ''));
  clean_bio := trim(coalesce(p_profile->>'bio', ''));

  if char_length(clean_name) < 2 or char_length(clean_name) > 40 then
    raise exception 'Name must be between 2 and 40 characters.' using errcode = '22023';
  end if;

  if char_length(clean_bio) < 1 or char_length(clean_bio) > 500 then
    raise exception 'Bio must be between 1 and 500 characters.' using errcode = '22023';
  end if;

  -- Validate height (prevent NaN or out-of-range values)
  if p_profile ? 'height_cm' and (p_profile->>'height_cm') is not null and (p_profile->>'height_cm') <> '' then
    begin
      parsed_height := (p_profile->>'height_cm')::smallint;
    exception when others then
      raise exception 'Height must be a valid integer.' using errcode = '22023';
    end;
    if parsed_height < 90 or parsed_height > 250 then
      raise exception 'Height must be between 90 and 250 cm.' using errcode = '22023';
    end if;
  else
    parsed_height := null;
  end if;

  -- 2b. Atomic tags update (delegates to set_my_tags)
  if p_tag_ids is not null then
    perform public.set_my_tags(p_tag_ids);
  end if;

  -- 2c. Atomic prompts update (delegates to set_my_prompts with BOLA checks)
  if p_prompts is not null then
    perform public.set_my_prompts(p_prompts);
  end if;

  -- 2d. Update profiles row
  update public.profiles
     set display_name     = clean_name,
         bio              = clean_bio,
         show_gender      = coalesce((p_profile->>'show_gender')::boolean, show_gender),
         dating_intention = p_profile->>'dating_intention',
         height_cm        = parsed_height,
         workout_habits   = p_profile->>'workout_habits',
         drinking_habits  = p_profile->>'drinking_habits',
         smoking_habits   = p_profile->>'smoking_habits',
         pet_preference   = p_profile->>'pet_preference',
         family_plans     = p_profile->>'family_plans',
         zodiac_sign      = p_profile->>'zodiac_sign',
         education_level  = p_profile->>'education_level',
         religion         = p_profile->>'religion',
         politics         = p_profile->>'politics',
         show_religion    = coalesce((p_profile->>'show_religion')::boolean, show_religion),
         show_politics    = coalesce((p_profile->>'show_politics')::boolean, show_politics),
         occupation       = nullif(trim(coalesce(p_profile->>'occupation', '')), ''),
         pronouns         = nullif(trim(coalesce(p_profile->>'pronouns', '')), ''),
         hometown         = nullif(trim(coalesce(p_profile->>'hometown', '')), ''),
         languages        = coalesce((
                              select array_agg(x::text) 
                              from jsonb_array_elements_text(p_profile->'languages') x
                            ), languages),
         anthem_track     = nullif(trim(coalesce(p_profile->>'anthem_track', '')), ''),
         anthem_artist    = nullif(trim(coalesce(p_profile->>'anthem_artist', '')), ''),
         photo_2_prompt   = nullif(trim(coalesce(p_profile->>'photo_2_prompt', '')), ''),
         photo_3_prompt   = nullif(trim(coalesce(p_profile->>'photo_3_prompt', '')), ''),
         updated_at       = now()
   where id = uid
   returning * into updated_row;

  return updated_row;
end $$;

revoke execute on function public.save_full_profile(jsonb, smallint[], jsonb) from public, anon;
grant execute on function public.save_full_profile(jsonb, smallint[], jsonb) to authenticated;
