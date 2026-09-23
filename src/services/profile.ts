import { supabase } from '../lib/supabase';
import { ageFromIso, zodiacFromIso } from '../lib/zodiac';
import { assertOk, unwrap } from './errors';
import type { Database, Tables } from '../types/database';
import type { UserAccount } from '../types/user';

// Column-level grants hide server-owned columns (location, is_seed), so never select('*').
const PROFILE_COLUMNS =
  'id, display_name, birthday, gender, show_gender, bio, city, is_verified, is_paused, is_hidden, onboarding_step, onboarding_completed_at, created_at, dating_intention, height_cm, drinking_habits, smoking_habits, workout_habits, pet_preference, family_plans, zodiac_sign, education_level, religion, politics, pronouns, occupation, anthem_track, anthem_artist, hometown, languages, show_religion, show_politics, voice_note_prompt, voice_note_duration, photo_2_prompt, photo_3_prompt' as const;

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
> & {
  dating_intention?: string | null;
  height_cm?: number | null;
  drinking_habits?: string | null;
  smoking_habits?: string | null;
  workout_habits?: string | null;
  pet_preference?: string | null;
  family_plans?: string | null;
  zodiac_sign?: string | null;
  education_level?: string | null;
  religion?: string | null;
  politics?: string | null;
  pronouns?: string | null;
  hometown?: string | null;
  languages?: string[];
  show_religion?: boolean;
  show_politics?: boolean;
  occupation?: string | null;
  anthem_track?: string | null;
  anthem_artist?: string | null;
  voice_note_prompt?: string | null;
  voice_note_duration?: string | null;
  photo_2_prompt?: string | null;
  photo_3_prompt?: string | null;
};

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
  | 'dating_intention'
  | 'height_cm'
  | 'drinking_habits'
  | 'smoking_habits'
  | 'workout_habits'
  | 'pet_preference'
  | 'family_plans'
  | 'zodiac_sign'
  | 'education_level'
  | 'religion'
  | 'politics'
  | 'pronouns'
  | 'hometown'
  | 'languages'
  | 'show_religion'
  | 'show_politics'
  | 'occupation'
  | 'anthem_track'
  | 'anthem_artist'
  | 'voice_note_prompt'
  | 'voice_note_duration'
  | 'photo_2_prompt'
  | 'photo_3_prompt'
>;

export type PreferencesRow = Pick<
  Tables<'user_preferences'>,
  | 'interested_in'
  | 'min_age'
  | 'max_age'
  | 'max_distance_km'
  | 'strict_distance'
  | 'intention'
  | 'filter_intentions'
  | 'filter_drinking'
  | 'filter_smoking'
  | 'filter_workout'
  | 'filter_pets'
  | 'filter_family'
>;

export type SettingsRow = Omit<Tables<'user_settings'>, 'user_id' | 'updated_at'>;

function toUserAccount(row: ProfileRow, email: string): UserAccount {
  const age = row.birthday ? ageFromIso(row.birthday) : undefined;
  const zodiac = row.birthday ? zodiacFromIso(row.birthday) : undefined;
  return {
    id: row.id,
    email,
    name: row.display_name,
    birthday: row.birthday ?? undefined,
    age,
    // Stored in lowercase (see profiles_lifestyle_values_check); zodiacFromIso() returns a capitalised name.
    zodiacSign: (row.zodiac_sign ?? zodiac)?.toLowerCase(),
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
    datingIntention: row.dating_intention,
    heightCm: row.height_cm,
    drinkingHabits: row.drinking_habits,
    smokingHabits: row.smoking_habits,
    workoutHabits: row.workout_habits,
    petPreference: row.pet_preference,
    familyPlans: row.family_plans,
    educationLevel: row.education_level,
    religion: row.religion,
    politics: row.politics,
    pronouns: row.pronouns,
    hometown: row.hometown,
    languages: row.languages ?? [],
    showReligion: row.show_religion ?? true,
    showPolitics: row.show_politics ?? true,
    occupation: row.occupation,
    anthemTrack: row.anthem_track,
    anthemArtist: row.anthem_artist,
    voiceNotePrompt: row.voice_note_prompt,
    voiceNoteDuration: row.voice_note_duration,
    photo2Prompt: row.photo_2_prompt,
    photo3Prompt: row.photo_3_prompt,
  };
}

export async function fetchUser(userId: string, email: string): Promise<UserAccount> {
  const row = unwrap(await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', userId).single());
  return toUserAccount(row as ProfileRow, email);
}

export async function updateProfile(
  user: Pick<UserAccount, 'id' | 'email'>,
  patch: ProfileUpdate
): Promise<UserAccount> {
  const row = unwrap(
    await supabase.from('profiles').update(patch).eq('id', user.id).select(PROFILE_COLUMNS).single()
  );
  return toUserAccount(row as ProfileRow, user.email);
}

export async function fetchPreferences(userId: string): Promise<PreferencesRow> {
  return unwrap(
    await supabase
      .from('user_preferences')
      .select(
        'interested_in, min_age, max_age, max_distance_km, strict_distance, intention, filter_intentions, filter_drinking, filter_smoking, filter_workout, filter_pets, filter_family'
      )
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
