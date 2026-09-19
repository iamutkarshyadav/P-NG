import { supabase } from '../lib/supabase';
import { assertOk, errorMessage, unwrap } from './errors';
import type { Gender } from '../types/user';

export interface FeedProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender | null;
  bio: string | null;
  city: string | null;
  distanceKm: number | null;
  isVerified: boolean;
  lastActiveAt: string | null;
  tags: string[];
  photoPaths: string[];
}

export interface LikeProfile {
  id: string;
  name: string;
  age: number;
  distanceKm: number | null;
  isVerified: boolean;
  isSuperping: boolean;
  likedAt: string;
  photoPaths: string[];
}

export type SwipeAction = 'like' | 'pass' | 'superping';
export interface SwipeOutcome {
  matched: boolean;
  matchId: string | null;
}

export async function fetchFeed(limit = 20): Promise<FeedProfile[]> {
  const rows = unwrap(await supabase.rpc('discover_feed', { p_limit: limit }));
  return rows.map((r) => ({
    id: r.id,
    name: r.display_name,
    age: r.age,
    gender: r.gender,
    bio: r.bio,
    city: r.city,
    distanceKm: r.distance_km,
    isVerified: r.is_verified,
    lastActiveAt: r.last_active_at,
    tags: r.tags ?? [],
    photoPaths: r.photo_paths ?? [],
  }));
}

export async function fetchLikes(): Promise<LikeProfile[]> {
  const rows = unwrap(await supabase.rpc('likes_received'));
  return rows.map((r) => ({
    id: r.id,
    name: r.display_name,
    age: r.age,
    distanceKm: r.distance_km,
    isVerified: r.is_verified,
    isSuperping: r.is_superping,
    likedAt: r.liked_at,
    photoPaths: r.photo_paths ?? [],
  }));
}

export async function swipe(targetId: string, action: SwipeAction): Promise<SwipeOutcome> {
  const { data, error } = await supabase.rpc('record_swipe', { p_target: targetId, p_action: action });
  if (error) {
    if (/super-ping limit/i.test(error.message)) {
      throw new Error('You have used your Super P!NG for today. It resets at midnight UTC.');
    }
    if (/unavailable/i.test(error.message)) {
      throw new Error('That profile is no longer available.');
    }
    throw new Error(errorMessage(error));
  }
  const row = data?.[0];
  return { matched: row?.matched ?? false, matchId: row?.match_id ?? null };
}

/** Undoes the most recent swipe (only if it has not become a match). Returns the restored profile id. */
export async function undoLastSwipe(): Promise<string | null> {
  const { data, error } = await supabase.rpc('undo_last_swipe');
  if (error) throw new Error(errorMessage(error));
  return data ?? null;
}

export async function fetchSuperpingsLeft(): Promise<number> {
  const { data, error } = await supabase.rpc('superpings_left');
  if (error) throw new Error(errorMessage(error));
  return data ?? 0;
}

export async function unmatch(matchId: string): Promise<void> {
  assertOk(await supabase.rpc('unmatch', { p_match: matchId }));
}
