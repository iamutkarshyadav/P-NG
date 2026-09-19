-- Per-project push configuration. Run once in each Supabase project (dev now, prod before launch),
-- replacing <project-ref>. The shared secret is generated here and never leaves the database + Edge Function.
insert into public.internal_secrets (key, value) values
  ('functions_url', 'https://<project-ref>.supabase.co/functions/v1'),
  ('webhook_secret', encode(extensions.gen_random_bytes(24), 'hex'))
on conflict (key) do nothing;
