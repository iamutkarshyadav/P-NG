-- Storage buckets and policies, realtime publication, and reference data.

create function public.can_view_photos(p_owner text) returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare
  owner_id uuid;
  uid uuid := (select auth.uid());
begin
  if uid is null then return false; end if;
  begin
    owner_id := p_owner::uuid;
  exception when invalid_text_representation then
    return false;
  end;
  if owner_id = uid then return true; end if;
  return exists (
    select 1 from public.profiles p
     where p.id = owner_id and p.onboarding_completed_at is not null
  ) and not public.is_blocked_between(uid, owner_id);
end $$;

revoke execute on function public.can_view_photos(text) from public, anon;
grant execute on function public.can_view_photos(text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('profile-photos', 'profile-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('selfies', 'selfies', false, 5242880, array['image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy profile_photos_select on storage.objects for select to authenticated
  using (bucket_id = 'profile-photos' and public.can_view_photos((storage.foldername(name))[1]));
create policy profile_photos_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy profile_photos_update on storage.objects for update to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy profile_photos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Selfies are private to the owner; reviewers use the service role.
create policy selfies_select on storage.objects for select to authenticated
  using (bucket_id = 'selfies' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy selfies_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'selfies' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy selfies_delete on storage.objects for delete to authenticated
  using (bucket_id = 'selfies' and (storage.foldername(name))[1] = (select auth.uid())::text);

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.matches;

insert into public.app_config (key, value) values
  ('superping_daily_limit', '1'::jsonb);

insert into public.tags (slug, name, emoji, category, tint, sort) values
  ('flat-white', 'Flat White Enthusiast', '☕', 'food', '#FFFFFF', 1),
  ('bouldering', 'Bouldering 6B', '🧗', 'lifestyle', '#FFFFFF', 2),
  ('analog-vinyl', 'Analog Vinyl', '📻', 'music', '#FFFFFF', 3),
  ('matcha-mornings', 'Matcha Mornings', '🥞', 'food', '#FFFFFF', 4),
  ('spicy-tacos', 'Spicy Tacos & Curry', '🌮', 'food', '#FFF4EB', 5),
  ('omakase', 'Omakase Nights', '🍣', 'food', '#EEF2FF', 6),
  ('2am-talks', '2 AM Conversations', '💬', 'lifestyle', '#FFFFFF', 7),
  ('bakery', 'Artisanal Bakery', '🥐', 'food', '#FFF1EC', 8),
  ('sunrise-miles', 'Sunrise Miles', '🏃', 'lifestyle', '#FFFFFF', 9),
  ('synthwave', 'Retro Synthwave', '🎹', 'music', '#F0F5FF', 10),
  ('techno', 'Underground Techno', '⚡', 'music', '#FFFFFF', 11),
  ('indie-gigs', 'Indie Gigs & Fest', '🎸', 'music', '#FDF2F8', 12),
  ('jazz', 'Late Night Jazz', '🎷', 'music', '#FFFFFF', 13),
  ('surfing', 'Dawn Patrol Surfing', '🏄', 'lifestyle', '#ECFEFF', 14),
  ('road-trips', 'Unplanned Road Trips', '🚐', 'lifestyle', '#F5F3FF', 15),
  ('skateboarding', 'Street Skateboarding', '🛹', 'lifestyle', '#FCE7F3', 16),
  ('camping', 'Wild Mountain Camping', '🏕️', 'lifestyle', '#FFFFFF', 17),
  ('arcade', '16-Bit Arcade & SNES', '👾', 'creative', '#EEF2FF', 18),
  ('modernist-design', 'Modernist Design', '📐', 'creative', '#FFFFFF', 19),
  ('35mm-film', '35mm Film Photography', '📷', 'creative', '#FFE4E6', 20),
  ('clicky-switches', 'Custom Clicky Switches', '⌨️', 'creative', '#F0FDFA', 21),
  ('board-games', 'Strategy Board Games', '♟️', 'creative', '#F5F3FF', 22);

insert into public.prompt_suggestions (text, sort) values
  ('☕ Coffee, code & late night concerts.', 1),
  ('🍕 The secret to winning me over is good food.', 2),
  ('🎧 Song on heavy repeat: synthwave playlists.', 3),
  ('✈️ Most spontaneous road trip ever taken.', 4);
