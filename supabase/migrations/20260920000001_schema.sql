-- P!NG core schema: extensions, enums, tables, indexes.
create extension if not exists postgis with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create type public.gender_t as enum ('woman', 'man', 'non_binary', 'other');
create type public.intention_t as enum ('long_term', 'short_term', 'friends', 'figuring_out');
create type public.swipe_action_t as enum ('like', 'pass', 'superping');
create type public.moderation_t as enum ('pending', 'approved', 'rejected');
create type public.report_reason_t as enum (
  'fake_profile', 'harassment', 'inappropriate_photos', 'spam', 'underage', 'other'
);
create type public.verify_status_t as enum ('pending', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 40),
  birthday date,
  gender public.gender_t,
  show_gender boolean not null default true,
  bio text check (bio is null or char_length(bio) <= 500),
  location extensions.geography (Point, 4326),
  city text check (city is null or char_length(city) <= 80),
  last_active_at timestamptz not null default now(),
  is_verified boolean not null default false,
  is_paused boolean not null default false,
  is_hidden boolean not null default false,
  onboarding_step smallint not null default 1 check (onboarding_step between 1 and 8),
  onboarding_completed_at timestamptz,
  is_seed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  interested_in public.gender_t[] not null default '{}',
  min_age smallint not null default 18 check (min_age >= 18),
  max_age smallint not null default 99 check (max_age <= 99),
  max_distance_km smallint not null default 25 check (max_distance_km between 1 and 500),
  strict_distance boolean not null default true,
  intention public.intention_t not null default 'long_term',
  updated_at timestamptz not null default now(),
  check (max_age >= min_age)
);

create table public.user_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  notify_matches boolean not null default true,
  notify_messages boolean not null default true,
  notify_superpings boolean not null default true,
  notify_events boolean not null default false,
  show_active_status boolean not null default true,
  read_receipts boolean not null default true,
  approximate_distance boolean not null default false,
  haptics boolean not null default true,
  sound_effects boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null unique,
  position smallint not null check (position between 0 and 5),
  width integer,
  height integer,
  moderation public.moderation_t not null default 'approved',
  created_at timestamptz not null default now(),
  constraint photos_path_owned check (storage_path like user_id::text || '/%'),
  constraint photos_position_unique unique (user_id, position) deferrable initially deferred
);

create table public.tags (
  id smallint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  emoji text not null,
  category text not null check (category in ('lifestyle', 'music', 'creative', 'food')),
  tint text not null default '#FFFFFF',
  sort smallint not null default 0
);

create table public.profile_tags (
  user_id uuid not null references public.profiles (id) on delete cascade,
  tag_id smallint not null references public.tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, tag_id)
);

create table public.prompt_suggestions (
  id smallint generated always as identity primary key,
  text text not null,
  sort smallint not null default 0
);

create table public.app_config (
  key text primary key,
  value jsonb not null
);

create table public.swipes (
  swiper_id uuid not null references public.profiles (id) on delete cascade,
  target_id uuid not null references public.profiles (id) on delete cascade,
  action public.swipe_action_t not null,
  created_at timestamptz not null default now(),
  primary key (swiper_id, target_id),
  check (swiper_id <> target_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles (id) on delete cascade,
  user_b uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_a < user_b),
  unique (user_a, user_b)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table public.match_reads (
  match_id uuid not null references public.matches (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (match_id, user_id)
);

create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_id uuid not null references public.profiles (id) on delete cascade,
  reason public.report_reason_t not null,
  details text check (details is null or char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'actioned', 'dismissed')),
  created_at timestamptz not null default now(),
  check (reporter_id <> reported_id)
);

create table public.verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  selfie_path text not null,
  status public.verify_status_t not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint verifications_path_owned check (selfie_path like user_id::text || '/%')
);

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('ios', 'android', 'web')),
  updated_at timestamptz not null default now()
);

create index profiles_location_idx on public.profiles using gist (location);
create index profiles_feed_idx on public.profiles (gender) where onboarding_completed_at is not null;
create index swipes_target_idx on public.swipes (target_id, action);
create index matches_user_b_idx on public.matches (user_b);
create index messages_match_created_idx on public.messages (match_id, created_at desc);
create index messages_sender_idx on public.messages (sender_id);
create index photos_user_idx on public.photos (user_id, position);
create index profile_tags_tag_idx on public.profile_tags (tag_id);
create index blocks_blocked_idx on public.blocks (blocked_id);
create index reports_reported_idx on public.reports (reported_id);
create index reports_reporter_idx on public.reports (reporter_id);
create index verifications_user_idx on public.verifications (user_id);
create index push_tokens_user_idx on public.push_tokens (user_id);
create index match_reads_user_idx on public.match_reads (user_id);

-- Nothing is reachable by default; grants are added explicitly alongside each RLS policy.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
