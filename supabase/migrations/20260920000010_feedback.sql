-- In-app feedback from beta testers (bug reports and ideas). Read it from the dashboard or with SQL.

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category text not null check (category in ('bug', 'idea', 'other')),
  message text not null check (char_length(message) between 5 and 2000),
  app_version text check (app_version is null or char_length(app_version) <= 40),
  platform text check (platform in ('ios', 'android', 'web')),
  created_at timestamptz not null default now()
);

create index feedback_user_idx on public.feedback (user_id, created_at desc);

alter table public.feedback enable row level security;
revoke all on public.feedback from anon, authenticated;

create policy feedback_select_own on public.feedback for select to authenticated
  using (user_id = (select auth.uid()));
create policy feedback_insert_own on public.feedback for insert to authenticated
  with check (user_id = (select auth.uid()));
grant select on public.feedback to authenticated;
grant insert (user_id, category, message, app_version, platform) on public.feedback to authenticated;

-- At most 20 pieces of feedback per user per day.
create function public.limit_feedback() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.feedback
       where user_id = new.user_id and created_at > now() - interval '1 day') >= 20 then
    raise exception 'You have sent a lot of feedback today. Please try again tomorrow.' using errcode = 'P0001';
  end if;
  return new;
end $$;

revoke execute on function public.limit_feedback() from public, anon, authenticated;

create trigger feedback_limit before insert on public.feedback
  for each row execute function public.limit_feedback();
