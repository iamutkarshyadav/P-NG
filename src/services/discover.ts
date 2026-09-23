import { supabase } from '../lib/supabase';
import { assertOk, errorMessage, unwrap } from './errors';
import type { Gender } from '../types/user';
import type { Database } from '../types/database';
import { parsePrompts, ProfilePromptItem } from '../types/prompts';

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
  datingIntention?: string | null;
  heightCm?: number | null;
  drinkingHabits?: string | null;
  smokingHabits?: string | null;
  workoutHabits?: string | null;
  petPreference?: string | null;
  familyPlans?: string | null;
  zodiacSign?: string | null;
  educationLevel?: string | null;
  religion?: string | null;
  politics?: string | null;
  pronouns?: string | null;
  hometown?: string | null;
  languages: string[];
  occupation?: string | null;
  anthemTrack?: string | null;
  anthemArtist?: string | null;
  voiceNotePrompt?: string | null;
  voiceNoteDuration?: string | null;
  photo2Prompt?: string | null;
  photo3Prompt?: string | null;
  prompts: ProfilePromptItem[];
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

function mapFeedProfileRow(r: Database['public']['Functions']['get_profile_details']['Returns'][number]): FeedProfile {
  return {
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
    datingIntention: r.dating_intention,
    heightCm: r.height_cm,
    drinkingHabits: r.drinking_habits,
    smokingHabits: r.smoking_habits,
    workoutHabits: r.workout_habits,
    petPreference: r.pet_preference,
    familyPlans: r.family_plans,
    zodiacSign: r.zodiac_sign,
    educationLevel: r.education_level,
    religion: r.religion,
    politics: r.politics,
    pronouns: r.pronouns,
    hometown: r.hometown,
    languages: r.languages ?? [],
    occupation: r.occupation,
    anthemTrack: r.anthem_track,
    anthemArtist: r.anthem_artist,
    voiceNotePrompt: r.voice_note_prompt,
    voiceNoteDuration: r.voice_note_duration,
    photo2Prompt: r.photo_2_prompt,
    photo3Prompt: r.photo_3_prompt,
    prompts: parsePrompts(r.prompts),
  };
}

/**
 * The next batch of candidates, filtered by the caller's saved deal-breakers (the server reads them). An empty array
 * means "no one new"; a failure throws so the UI can say so.
 */
export async function fetchFeed(limit = 20): Promise<FeedProfile[]> {
  const rows = unwrap(await supabase.rpc('discover_feed', { p_limit: limit }));
  return rows.map(mapFeedProfileRow);
}

/**
 * Fetches the full profile details for a candidate, match partner, or liker.
 */
export async function fetchProfileDetails(targetId: string): Promise<FeedProfile | null> {
  const { data, error } = await supabase.rpc('get_profile_details', { p_target: targetId });
  if (error || !data || data.length === 0) return null;
  return mapFeedProfileRow(data[0]);
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

/** Fast scalar count for badge rendering without loading the entire profiles list. */
export async function fetchLikesCount(): Promise<number> {
  return unwrap(await supabase.rpc('likes_count'));
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
