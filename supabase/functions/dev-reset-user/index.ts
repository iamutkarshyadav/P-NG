// DEV ONLY. Lets the app's "SAM" quick-fill start from a genuinely new account every time.
// Refuses to do anything unless app_config.dev_tools_enabled is true (set only by supabase/seed-dev.sql,
// never by a migration), and only ever touches sam@ping.app.
import { createClient } from 'npm:@supabase/supabase-js@2';

const ALLOWED_EMAIL = 'sam@ping.app';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: CORS });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: flag } = await admin.from('app_config').select('value').eq('key', 'dev_tools_enabled').maybeSingle();
  if (flag?.value !== true) return json({ error: 'Dev tools are disabled.' }, 403);

  let body: { action?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  if (body.email?.trim().toLowerCase() !== ALLOWED_EMAIL) return json({ error: 'Not allowed for this account.' }, 403);
  if (body.action !== 'reset' && body.action !== 'confirm') return json({ error: 'Unknown action' }, 400);

  // Find Sam (dev projects have few users, so a single page is enough).
  const { data: list, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) return json({ error: listError.message }, 500);
  const sam = list.users.find((u) => u.email?.toLowerCase() === ALLOWED_EMAIL);

  if (body.action === 'confirm') {
    if (!sam) return json({ error: 'Account not found' }, 404);
    const { error } = await admin.auth.admin.updateUserById(sam.id, { email_confirm: true });
    return error ? json({ error: error.message }, 500) : json({ ok: true });
  }

  if (!sam) return json({ ok: true, existed: false });

  // Remove Sam's files first (deleting the user cascades the database rows).
  for (const bucket of ['profile-photos', 'selfies']) {
    const { data: files } = await admin.storage.from(bucket).list(sam.id, { limit: 100 });
    if (files && files.length > 0) {
      await admin.storage.from(bucket).remove(files.map((f) => `${sam.id}/${f.name}`));
    }
  }
  const { error } = await admin.auth.admin.deleteUser(sam.id);
  return error ? json({ error: error.message }, 500) : json({ ok: true, existed: true });
});
