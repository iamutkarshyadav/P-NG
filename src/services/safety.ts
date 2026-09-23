import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { supabase } from '../lib/supabase';
import { assertOk, errorMessage, unwrap } from './errors';
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

/**
 * Files a report. The server snapshots the recent conversation with this person (even after a block has ended it),
 * so pass the match id when the report starts from a chat.
 */
export async function reportUser(
  reportedId: string,
  reason: ReportReason,
  details?: string,
  matchId?: string
): Promise<void> {
  assertOk(
    await supabase.rpc('report_user', {
      p_reported: reportedId,
      p_reason: reason,
      p_details: details?.trim() ? details.trim().slice(0, 1000) : undefined,
      p_match: matchId,
    })
  );
}

/** Blocking also ends any match between the two people (a database trigger does this; the messages are kept for reports). */
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

export type VerificationState = 'verified' | 'pending' | 'rejected' | 'none';

/** The user's verification status, from the badge and their latest request. */
export async function fetchVerificationState(userId: string, isVerified: boolean): Promise<VerificationState> {
  if (isVerified) return 'verified';
  const { data, error } = await supabase
    .from('verifications')
    .select('status')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(errorMessage(error));
  if (!data) return 'none';
  return data.status === 'pending' ? 'pending' : data.status === 'rejected' ? 'rejected' : 'verified';
}

/** Asks the server for a pose to strike in the selfie (valid for 15 minutes). */
export async function requestVerificationChallenge(): Promise<string> {
  return unwrap(await supabase.rpc('verification_challenge'));
}

/** Uploads the selfie privately and files the verification request, which carries the pose the server issued. */
export async function submitVerificationPhoto(userId: string, localUri: string): Promise<void> {
  const ref = await ImageManipulator.manipulate(localUri).resize({ width: 1080 }).renderAsync();
  const saved = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
  const path = `${userId}/${Date.now().toString(36)}.jpg`;
  const bytes = await (await fetch(saved.uri)).arrayBuffer();
  const upload = await supabase.storage.from('selfies').upload(path, bytes, { contentType: 'image/jpeg' });
  if (upload.error) throw new Error(errorMessage(upload.error, 'Upload failed. Please try again.'));

  const { error } = await supabase.rpc('submit_verification', { p_selfie_path: path });
  if (error) {
    await supabase.storage.from('selfies').remove([path]);
    // 23505: a request is already waiting for review.
    if (error.code === '23505') throw new Error('You already have a verification waiting for review.');
    throw new Error(errorMessage(error));
  }
}

export async function countMyReports(): Promise<number> {
  const { count, error } = await supabase.from('reports').select('id', { count: 'exact', head: true });
  if (error) throw new Error(errorMessage(error));
  return count ?? 0;
}
