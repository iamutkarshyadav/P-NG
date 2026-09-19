-- Server-side push: database events call the notify-push Edge Function through pg_net.
-- Environment-specific values (functions URL, shared secret) live in internal_secrets and are
-- inserted by supabase/push-config.sql, so this migration is identical for every project.

create extension if not exists pg_net with schema extensions;

create table public.internal_secrets (
  key text primary key,
  value text not null
);
alter table public.internal_secrets enable row level security; -- no policies: only the service role can read it
revoke all on public.internal_secrets from anon, authenticated;

create function public.notify_push() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  base_url text;
  secret text;
begin
  select value into base_url from public.internal_secrets where key = 'functions_url';
  select value into secret from public.internal_secrets where key = 'webhook_secret';
  if base_url is null or secret is null then
    return null; -- push is not configured for this project
  end if;
  begin
    perform net.http_post(
      url := base_url || '/notify-push',
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', secret),
      body := jsonb_build_object('table', tg_table_name, 'record', to_jsonb(new)),
      timeout_milliseconds := 3000
    );
  exception when others then
    -- A push failure must never block the message, match or swipe itself.
    null;
  end;
  return null;
end $$;

revoke execute on function public.notify_push() from public, anon, authenticated;

create trigger messages_notify_push after insert on public.messages
  for each row execute function public.notify_push();
create trigger matches_notify_push after insert on public.matches
  for each row execute function public.notify_push();
create trigger superpings_notify_push after insert on public.swipes
  for each row when (new.action = 'superping') execute function public.notify_push();
