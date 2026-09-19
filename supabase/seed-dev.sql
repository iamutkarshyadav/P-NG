-- DEV ONLY. Never run against a production project.
-- Creates the Alex test account, ~30 candidate profiles, likes and a few matches/messages,
-- enables the dev-tools gate, and adds dev_move_seeds_near_me().
-- Sam (sam@ping.app) is intentionally NOT seeded: the app signs him up fresh each time.

insert into public.app_config (key, value) values ('dev_tools_enabled', 'true'::jsonb)
on conflict (key) do update set value = excluded.value;

do $seed$
declare
  alex uuid := 'a1e00000-0000-4000-8000-000000000001';
  names text[] := array[
    'Priya','Sora','Elena','Maya','Aiko','Zara','Noor','Ines','Leila','Mira','Hana','Tara',
    'Riya','Anya','Kavya','Jia','Luna','Esha',
    'Kian','Rohan','Arjun','Leo','Omar','Dev','Theo','Ravi',
    'Sky','Rowan','Ash','Quinn'
  ];
  bios text[] := array[
    'Beach walks, spicy tacos, art galleries & making analog synth music.',
    'Bouldering on weekends, flat whites all week. Ask me about my vinyl.',
    'Film photographer chasing golden hour. Will trade playlists for pastries.',
    'Designer by day, terrible karaoke singer by night.',
    'Sunrise runner. Sunset bookshop wanderer. Always up for a road trip.',
    'Matcha snob and board game menace. Come with a strategy.'
  ];
  uid uuid;
  mid uuid;
  i integer;
  g public.gender_t;
  em text;
begin
  -- ---- Alex (login demo) -------------------------------------------------
  if not exists (select 1 from auth.users where id = alex) then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) values (
      '00000000-0000-0000-0000-000000000000', alex, 'authenticated', 'authenticated',
      'alex@ping.app', extensions.crypt('password123', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Alex Rivera"}', now(), now(),
      '', '', '', ''
    );
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), alex, alex::text,
      jsonb_build_object('sub', alex::text, 'email', 'alex@ping.app', 'email_verified', true, 'phone_verified', false),
      'email', now(), now(), now());
  end if;

  update public.profiles set
    display_name = 'Alex Rivera', birthday = '2000-05-14', gender = 'man', show_gender = true,
    bio = 'Coffee, code & concerts. Looking for real connections!', city = 'Bengaluru',
    location = extensions.st_setsrid(extensions.st_makepoint(77.59, 12.97), 4326)::extensions.geography,
    is_verified = true, onboarding_step = 8, onboarding_completed_at = coalesce(onboarding_completed_at, now())
  where id = alex;
  update public.user_preferences set interested_in = '{woman}', min_age = 21, max_age = 32,
    max_distance_km = 25, strict_distance = true, intention = 'long_term' where user_id = alex;
  insert into public.profile_tags (user_id, tag_id)
    select alex, id from public.tags where slug in ('flat-white', 'analog-vinyl', 'indie-gigs', '35mm-film')
  on conflict do nothing;

  -- ---- Candidates ---------------------------------------------------------
  for i in 1..30 loop
    uid := ('5eed0000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid;
    em := 'seed' || i || '@ping.app';
    g := case when i <= 18 then 'woman' when i <= 26 then 'man' else 'non_binary' end;
    if not exists (select 1 from auth.users where id = uid) then
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change, email_change_token_new
      ) values (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', em,
        extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object('full_name', names[i]), now(), now(), '', '', '', ''
      );
      insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (gen_random_uuid(), uid, uid::text,
        jsonb_build_object('sub', uid::text, 'email', em, 'email_verified', true, 'phone_verified', false),
        'email', now(), now(), now());
    end if;

    update public.profiles set
      display_name = names[i],
      birthday = (current_date - make_interval(years => 22 + (i % 12), days => (i * 17) % 300))::date,
      gender = g, show_gender = true, bio = bios[1 + (i % 6)],
      city = 'Bengaluru',
      location = extensions.st_setsrid(extensions.st_makepoint(
        77.5946 + (((i * 53) % 101) - 50) / 500.0, 12.9716 + (((i * 37) % 101) - 50) / 500.0), 4326)::extensions.geography,
      is_verified = (i % 3 <> 0), is_seed = true, onboarding_step = 8, onboarding_completed_at = now(),
      last_active_at = now() - make_interval(mins => (i * 41) % 2000)
    where id = uid;
    update public.user_preferences set interested_in = '{woman,man,non_binary,other}',
      min_age = 18, max_age = 99, max_distance_km = 500 where user_id = uid;
    insert into public.profile_tags (user_id, tag_id)
      select uid, t.id from (select distinct (((i * k) % 22) + 1)::smallint as id from unnest(array[3, 7, 11]) k) t
    on conflict do nothing;
  end loop;

  -- Seeds 1-3 already matched with Alex (mutual likes + a short conversation).
  for i in 1..3 loop
    uid := ('5eed0000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid;
    insert into public.swipes (swiper_id, target_id, action) values (alex, uid, 'like') on conflict do nothing;
    insert into public.swipes (swiper_id, target_id, action) values (uid, alex, 'like') on conflict do nothing;
    select id into mid from public.matches where user_a = least(alex, uid) and user_b = greatest(alex, uid);
    if mid is not null and not exists (select 1 from public.messages where match_id = mid) then
      insert into public.messages (match_id, sender_id, body, created_at) values
        (mid, uid,  'Hey Alex! Loved your tags. Analog vinyl, really?', now() - interval '3 hours'),
        (mid, alex, 'Guilty. Bring your best record recommendation.',   now() - interval '2 hours 40 minutes'),
        (mid, uid,  'Deal. Coffee this weekend?',                        now() - interval '2 hours 10 minutes');
    end if;
  end loop;

  -- Seeds 4-12 like Alex but he has not swiped them yet: nine people in his Likes tab.
  for i in 4..12 loop
    uid := ('5eed0000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid;
    insert into public.swipes (swiper_id, target_id, action) values (uid, alex, 'like') on conflict do nothing;
  end loop;
end
$seed$;

-- Dev helper: put every seed profile within ~10 km of the caller and have five of them like the caller,
-- so a fresh Sam sees a full feed and Likes tab wherever the device is.
create or replace function public.dev_move_seeds_near_me() returns void
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  loc extensions.geography;
  i integer := 0;
  r record;
begin
  if not exists (select 1 from public.app_config where key = 'dev_tools_enabled' and value = 'true'::jsonb) then
    raise exception 'Dev tools are disabled.' using errcode = '42501';
  end if;
  select location into loc from public.profiles where id = uid;
  if loc is null then return; end if;
  for r in select id from public.profiles where is_seed order by id loop
    i := i + 1;
    update public.profiles
       set location = extensions.st_project(loc, 500 + ((i * 263) % 9000), radians((i * 47) % 360))::extensions.geography
     where id = r.id;
  end loop;
  insert into public.swipes (swiper_id, target_id, action)
  select id, uid, 'like' from public.profiles where is_seed order by id limit 5
  on conflict do nothing;
end $$;

revoke execute on function public.dev_move_seeds_near_me() from public, anon;
grant execute on function public.dev_move_seeds_near_me() to authenticated;

-- Dev helper: lets a tester approve their own pending selfie so the 100% REAL badge can be seen.
create or replace function public.dev_approve_my_verification() returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if not exists (select 1 from public.app_config where key = 'dev_tools_enabled' and value = 'true'::jsonb) then
    raise exception 'Dev tools are disabled.' using errcode = '42501';
  end if;
  update public.verifications set status = 'approved', reviewed_at = now()
   where user_id = uid and status = 'pending';
end $$;

revoke execute on function public.dev_approve_my_verification() from public, anon;
grant execute on function public.dev_approve_my_verification() to authenticated;
