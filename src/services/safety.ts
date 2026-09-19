import { supabase } from '../lib/supabase';
import { assertOk, unwrap } from './errors';
import type { Enums } from '../types/database';

export type ReportReason = Enums<'report_reason_t'>;

export const REPORT_REASONS: Array<{ value: ReportReason; label: string }> = [
  { value: 'fake_profile', label: 'Fake profile or bot' },
  { value: 'harassment', label: 'Harassment or abuse' },
  { value: 'inappropriate_photos', label: 'Inappropriate photos' },
  { value: 'spam', label: 'Spam or scam' },
  { value: 'underage', label: 'Seems underage' },
  { value: 'other', label: 'Something else' },
];

export interface BlockedUser {
  userId: string;
  name: string;
  blockedAt: string;
}

export async function reportUser(
  reporterId: string,
  reportedId: string,
  reason: ReportReason,
  details?: string
): Promise<void> {
  assertOk(
    await supabase.from('reports').insert({
      reporter_id: reporterId,
      reported_id: reportedId,
      reason,
      details: details?.trim() ? details.trim().slice(0, 1000) : null,
    })
  );
}

/** Blocking also removes any match between the two people (a database trigger does this). */
export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase.from('blocks').insert({ blocker_id: blockerId, blocked_id: blockedId });
  // 23505 = already blocked; that is the outcome the user wanted.
  if (error && error.code !== '23505') assertOk({ error });
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  assertOk(
    await supabase.from('blocks').delete().eq('blocker_id', blockerId).eq('blocked_id', blockedId)
  );
}

export async function fetchBlockedUsers(): Promise<BlockedUser[]> {
  const rows = unwrap(await supabase.rpc('blocked_users'));
  return rows.map((r) => ({ userId: r.user_id, name: r.display_name, blockedAt: r.blocked_at }));
}
