// Sends Expo push notifications for new messages, matches and super-pings.
// Invoked by database triggers (see migration push_webhook) with a shared secret, never by clients.
import { createClient } from 'npm:@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface Payload {
  table: 'messages' | 'matches' | 'swipes';
  record: Record<string, unknown>;
}

interface Outgoing {
  userId: string;
  setting: 'notify_messages' | 'notify_matches' | 'notify_superpings';
  title: string;
  body: string;
  data: Record<string, unknown>;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: secretRow } = await admin.from('internal_secrets').select('value').eq('key', 'webhook_secret').maybeSingle();
  if (!secretRow || req.headers.get('x-webhook-secret') !== secretRow.value) return json({ error: 'Unauthorized' }, 401);

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const nameOf = async (id: string): Promise<string> => {
    const { data } = await admin.from('profiles').select('display_name').eq('id', id).maybeSingle();
    return data?.display_name || 'Someone';
  };

  const outgoing: Outgoing[] = [];
  const r = payload.record;

  if (payload.table === 'messages') {
    const { data: match } = await admin.from('matches').select('user_a, user_b').eq('id', r.match_id as string).maybeSingle();
    if (match) {
      const senderId = r.sender_id as string;
      const recipient = match.user_a === senderId ? match.user_b : match.user_a;
      const body = String(r.body ?? '');
      outgoing.push({
        userId: recipient,
        setting: 'notify_messages',
        title: await nameOf(senderId),
        body: body.length > 120 ? `${body.slice(0, 117)}...` : body,
        data: { type: 'message', matchId: r.match_id },
      });
    }
  } else if (payload.table === 'matches') {
    const a = r.user_a as string;
    const b = r.user_b as string;
    const [nameA, nameB] = await Promise.all([nameOf(a), nameOf(b)]);
    outgoing.push(
      { userId: a, setting: 'notify_matches', title: "It's a match! ⚡", body: `You and ${nameB} P!NGed each other.`, data: { type: 'match', matchId: r.id } },
      { userId: b, setting: 'notify_matches', title: "It's a match! ⚡", body: `You and ${nameA} P!NGed each other.`, data: { type: 'match', matchId: r.id } }
    );
  } else if (payload.table === 'swipes' && r.action === 'superping') {
    outgoing.push({
      userId: r.target_id as string,
      setting: 'notify_superpings',
      title: 'Super P!NG ⚡',
      body: `${await nameOf(r.swiper_id as string)} sent you a Super P!NG.`,
      data: { type: 'superping' },
    });
  }

  const messages: Array<Record<string, unknown>> = [];
  for (const item of outgoing) {
    const { data: settings } = await admin.from('user_settings').select(item.setting).eq('user_id', item.userId).maybeSingle();
    if (!settings || (settings as Record<string, boolean>)[item.setting] === false) continue;
    const { data: tokens } = await admin.from('push_tokens').select('token').eq('user_id', item.userId);
    for (const t of tokens ?? []) {
      messages.push({ to: t.token, title: item.title, body: item.body, data: item.data, sound: 'default', channelId: 'default' });
    }
  }
  if (messages.length === 0) return json({ sent: 0 });

  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
  const expoToken = Deno.env.get('EXPO_ACCESS_TOKEN');
  if (expoToken) headers.Authorization = `Bearer ${expoToken}`;

  const res = await fetch(EXPO_PUSH_URL, { method: 'POST', headers, body: JSON.stringify(messages) });
  const result = await res.json().catch(() => ({ data: [] }));

  // Drop tokens Expo says no longer exist so we stop trying them.
  const tickets: Array<{ status: string; details?: { error?: string } }> = result.data ?? [];
  const dead = messages.filter((_, i) => tickets[i]?.details?.error === 'DeviceNotRegistered').map((m) => m.to as string);
  if (dead.length > 0) await admin.from('push_tokens').delete().in('token', dead);

  return json({ sent: messages.length, removed: dead.length });
});
