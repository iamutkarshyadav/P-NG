// Permanently deletes the caller's account: storage files first, then the auth user
// (database rows cascade from auth.users -> profiles). Requires the caller's own JWT.
// Compliant with GDPR Article 17 (Right to Erasure) via recursive bucket traversal.
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: CORS });

/** Recursively collects all file paths inside a user folder hierarchy */
async function listAllFilesRecursively(
  admin: SupabaseClient,
  bucket: string,
  prefix: string
): Promise<string[]> {
  const filePaths: string[] = [];
  const { data: entries, error } = await admin.storage.from(bucket).list(prefix, {
    limit: 1000,
    sortBy: { column: 'name', order: 'asc' },
  });

  if (error || !entries) return filePaths;

  for (const entry of entries) {
    const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id === null) {
      // Subdirectory prefix detected -> recursively fetch nested objects
      const nested = await listAllFilesRecursively(admin, bucket, fullPath);
      filePaths.push(...nested);
    } else {
      filePaths.push(fullPath);
    }
  }

  return filePaths;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const jwt = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!jwt) return json({ error: 'Not signed in' }, 401);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error: userError } = await admin.auth.getUser(jwt);
  if (userError || !data.user) return json({ error: 'Not signed in' }, 401);
  const userId = data.user.id;

  // 1. Purge all storage files across all private user buckets recursively (including prompts/)
  for (const bucket of ['profile-photos', 'selfies']) {
    const allUserFiles = await listAllFilesRecursively(admin, bucket, userId);
    if (allUserFiles.length > 0) {
      for (let i = 0; i < allUserFiles.length; i += 100) {
        const batch = allUserFiles.slice(i, i + 100);
        await admin.storage.from(bucket).remove(batch);
      }
    }
  }

  // 2. Permanently delete the Auth user
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
});
