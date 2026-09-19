import { supabase } from '../lib/supabase';
import { ageFromIso, zodiacFromIso } from '../lib/zodiac';
import { assertOk, unwrap } from './errors';
import type { Database, Tables } from '../types/database';
import type { UserAccount } from '../types/user';

// Column-level grants hide server-owned columns (location, is_seed), so never select('*').
const PROFILE_COLUMNS =
  'id, display_name, birthday, gender, show_gender, bio, city, is_verified, is_paused, is_hidden, onboarding_step, onboarding_completed_at, created_at' as const;

type ProfileRow = Pick<
  Tables<'profiles'>,
  | 'id'
  | 'display_name'
  | 'birthday'
  | 'gender'
  | 'show_gender'
  | 'bio'
  | 'city'
  | 'is_verified'
  | 'is_paused'
  | 'is_hidden'
  | 'onboarding_step'
  | 'onboarding_completed_at'
  | 'created_at'
>;

export type ProfileUpdate = Pick<
  Database['public']['Tables']['profiles']['Update'],
  | 'display_name'
  | 'birthday'
  | 'gender'
  | 'show_gender'
  | 'bio'
  | 'city'
  | 'is_paused'
  | 'is_hidden'
  | 'onboarding_step'
  | 'last_active_at'
>;

export type PreferencesRow = Pick<
  Tables<'user_preferences'>,
  'interested_in' | 'min_age' | 'max_age' | 'max_distance_km' | 'strict_distance' | 'intention'
>;

export type SettingsRow = Omit<Tables<'user_settings'>, 'user_id' | 'updated_at'>;

export function toUserAccount(row: ProfileRow, email: string): UserAccount {
  return {
    id: row.id,
    email,
    name: row.display_name,
    birthday: row.birthday ?? undefined,
    age: row.birthday ? ageFromIso(row.birthday) : undefined,
    zodiacSign: row.birthday ? zodiacFromIso(row.birthday) : undefined,
    gender: row.gender ?? undefined,
    showGenderOnProfile: row.show_gender,
    bio: row.bio ?? undefined,
    city: row.city ?? undefined,
    isVerifiedReal: row.is_verified,
    isPaused: row.is_paused,
    isHidden: row.is_hidden,
    onboardingStep: row.onboarding_step,
    hasCompletedOnboarding: row.onboarding_completed_at !== null,
    createdAt: row.created_at,
  };
}

export async function fetchUser(userId: string, email: string): Promise<UserAccount> {
  const row = unwrap(
    await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', userId).single()
  );
  return toUserAccount(row, email);
}

export async function updateProfile(
  user: Pick<UserAccount, 'id' | 'email'>,
  patch: ProfileUpdate
): Promise<UserAccount> {
  const row = unwrap(
    await supabase.from('profiles').update(patch).eq('id', user.id).select(PROFILE_COLUMNS).single()
  );
  return toUserAccount(row, user.email);
}

export async function fetchPreferences(userId: string): Promise<PreferencesRow> {
  return unwrap(
    await supabase
      .from('user_preferences')
      .select('interested_in, min_age, max_age, max_distance_km, strict_distance, intention')
      .eq('user_id', userId)
      .single()
  );
}

export async function savePreferences(
  userId: string,
  patch: Partial<PreferencesRow>
): Promise<void> {
  assertOk(await supabase.from('user_preferences').update(patch).eq('user_id', userId));
}

export async function fetchSettings(userId: string): Promise<SettingsRow> {
  return unwrap(
    await supabase
      .from('user_settings')
      .select(
        'notify_matches, notify_messages, notify_superpings, notify_events, show_active_status, read_receipts, approximate_distance, haptics, sound_effects'
      )
      .eq('user_id', userId)
      .single()
  );
}

export async function saveSettings(userId: string, patch: Partial<SettingsRow>): Promise<void> {
  assertOk(await supabase.from('user_settings').update(patch).eq('user_id', userId));
}

export async function completeOnboarding(): Promise<void> {
  assertOk(await supabase.rpc('complete_onboarding'));
}

export async function setLocation(lat: number, lng: number, city?: string): Promise<void> {
  assertOk(await supabase.rpc('set_location', { p_lat: lat, p_lng: lng, p_city: city }));
}
