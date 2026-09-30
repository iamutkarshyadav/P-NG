-- Migration: 20260920000022_photo_compaction_and_captions.sql
-- Description: Bind captions directly to photo entities and auto-compact positions on deletion.

-- 1. Entity-level caption column on photos
alter table public.photos
  add column if not exists caption text check (caption is null or char_length(caption) <= 200);

grant update (position, caption) on public.photos to authenticated;

-- 2. Compaction trigger on photo deletion
create or replace function public.compact_photos_on_delete()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.photos
     set position = (position - 1)::smallint
   where user_id = old.user_id
     and position > old.position;
  return null;
end $$;

drop trigger if exists trg_compact_photos on public.photos;
create trigger trg_compact_photos
  after delete on public.photos
  for each row execute function public.compact_photos_on_delete();
