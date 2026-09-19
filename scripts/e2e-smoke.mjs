// End-to-end smoke test against the live Supabase project (dev only).
// Signs in as the seeded Alex account and exercises feed, swipe/match, chat, realtime and RLS.
// Usage: node scripts/e2e-smoke.mjs   (reads EXPO_PUBLIC_* from .env.local)
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws'; // Node < 22 has no built-in WebSocket; Expo's own dependency tree already ships ws

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)])
);

const supabase = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

let failures = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};

const { data: login, error: loginError } = await supabase.auth.signInWithPassword({
  email: 'alex@ping.app',
  password: 'password123',
});
check('Alex can sign in', !loginError && !!login.session, loginError?.message);
const me = login.user.id;

const feed = (await supabase.rpc('discover_feed', { p_limit: 20 })).data ?? [];
console.log(`INFO  feed has ${feed.length} candidates (0 just means this test account has swiped everyone)`);
check('feed rows expose no coordinates or birthday', feed.every((p) => !('location' in p) && !('birthday' in p)));

const likesBefore = (await supabase.rpc('likes_received')).data ?? [];
console.log(`INFO  ${likesBefore.length} pending likes`);

// Like someone who already liked Alex: that must create a match immediately.
// Skipped when Alex has no pending likes left (e.g. someone tested the app as Alex; run supabase/reset-alex.sql).
const target = likesBefore[0];
let matchId = null;
if (!target) {
  console.log('SKIP  match, chat and realtime checks (Alex has no pending likes)');
} else {
  const swipe = (await supabase.rpc('record_swipe', { p_target: target.id, p_action: 'like' })).data?.[0];
  check('liking a person who liked you creates a match', swipe?.matched === true && !!swipe.match_id);

  matchId = swipe.match_id;
  const matches = (await supabase.rpc('my_matches')).data ?? [];
  check('my_matches lists the new match', matches.some((m) => m.match_id === matchId));

  // Realtime: subscribe (with the same match_id filter the app uses) and verify the insert is delivered back.
  const received = new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 12000);
    supabase
      .channel(`smoke:${matchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
        (payload) => {
          clearTimeout(timer);
          resolve(payload.new);
        }
      )
      .subscribe(async (status, err) => {
        console.log('  realtime status:', status, err?.message ?? '');
        if (status === 'SUBSCRIBED') {
          // SUBSCRIBED fires slightly before the server starts streaming changes.
          await new Promise((r) => setTimeout(r, 4000));
          await supabase.from('messages').insert({ match_id: matchId, sender_id: me, body: 'smoke test hello' });
        }
      });
  });
  const delivered = await received;
  check('realtime delivers a new message', delivered?.body === 'smoke test hello');

  const sent = await supabase.from('messages').select('id, body').eq('match_id', matchId);
  check('message is readable by a participant', sent.data?.length === 1);

  const spoof = await supabase.from('messages').insert({ match_id: matchId, sender_id: target.id, body: 'spoof' });
  check('cannot send as someone else', !!spoof.error, spoof.error?.code);

  const rewind = (await supabase.rpc('undo_last_swipe')).data;
  check('rewind refuses once a match exists', rewind === null);


}

const superLeft = (await supabase.rpc('superpings_left')).data;
check('superpings_left returns the daily allowance', superLeft === 1, String(superLeft));

const own = await supabase.from('profiles').select('id, display_name').eq('id', me);
check('profile row is readable by its owner', own.data?.length === 1);
const others = await supabase.from('profiles').select('id').neq('id', me);
check('other profiles are not readable directly', (others.data ?? []).length === 0);

const fb = await supabase.from('feedback').insert({ user_id: me, category: 'bug', message: 'smoke test feedback', platform: 'web', app_version: '0.0.0' });
check('can send feedback', !fb.error, fb.error?.message);
const fbBad = await supabase.from('feedback').insert({ user_id: me, category: 'nope', message: 'smoke test feedback' });
check('invalid feedback category rejected', !!fbBad.error, fbBad.error?.code);
const fbSpoof = await supabase.from('feedback').insert({ user_id: target?.id ?? '5eed0000-0000-4000-8000-000000000001', category: 'bug', message: 'smoke spoof' });
check('cannot send feedback as someone else', !!fbSpoof.error, fbSpoof.error?.code);
const fbMine = await supabase.from('feedback').select('id');
check('feedback is readable by its author', (fbMine.data ?? []).length >= 1);

// Clean up so the seeded dataset stays as designed: remove Alex's swipe (cascades nothing else) and the match.
await supabase.removeAllChannels();
console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`);
console.log(matchId ? '(cleanup: run supabase/reset-alex.sql; delete smoke feedback rows)' : '(cleanup: delete smoke feedback rows)');
process.exit(failures === 0 ? 0 : 1);
