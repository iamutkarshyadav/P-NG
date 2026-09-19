import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { supabase } from '../lib/supabase';
import { env } from '../lib/env';
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

export type SelfieOutcome = 'submitted' | 'cancelled' | 'denied';

/** Takes a front-camera selfie, uploads it privately and files a verification request for review. */
export async function submitVerificationSelfie(userId: string): Promise<SelfieOutcome> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return 'denied';
  const shot = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    cameraType: ImagePicker.CameraType.front,
    allowsEditing: false,
    quality: 1,
  });
  const asset = shot.canceled ? undefined : shot.assets?.[0];
  if (!asset) return 'cancelled';

  const ref = await ImageManipulator.manipulate(asset.uri).resize({ width: 1080 }).renderAsync();
  const saved = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
  const path = `${userId}/${Date.now().toString(36)}.jpg`;
  const bytes = await (await fetch(saved.uri)).arrayBuffer();
  const upload = await supabase.storage.from('selfies').upload(path, bytes, { contentType: 'image/jpeg' });
  if (upload.error) throw new Error(errorMessage(upload.error, 'Upload failed. Please try again.'));

  const { error } = await supabase.from('verifications').insert({ user_id: userId, selfie_path: path });
  if (error) {
    await supabase.storage.from('selfies').remove([path]);
    // 23505: a request is already waiting for review.
    if (error.code === '23505') throw new Error('You already have a verification waiting for review.');
    throw new Error(errorMessage(error));
  }
  return 'submitted';
}

/** Dev only: approves the tester's own pending selfie so the badge can be seen. */
export async function devApproveVerification(): Promise<void> {
  if (!env.enableDevLogins) return;
  await supabase.rpc('dev_approve_my_verification');
}

export async function countMyReports(): Promise<number> {
  const { count, error } = await supabase.from('reports').select('id', { count: 'exact', head: true });
  if (error) throw new Error(errorMessage(error));
  return count ?? 0;
}
