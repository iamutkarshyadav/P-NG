import { supabase } from '../lib/supabase';
import { assertOk, unwrap } from './errors';

export interface VibeTag {
  id: number;
  name: string;
  emoji: string;
  category: 'lifestyle' | 'music' | 'creative' | 'food';
  tint: string;
}

export async function fetchAllTags(): Promise<VibeTag[]> {
  const rows = unwrap(
    await supabase.from('tags').select('id, name, emoji, category, tint').order('sort')
  );
  return rows as VibeTag[];
}

export async function fetchMyTagIds(userId: string): Promise<number[]> {
  const rows = unwrap(await supabase.from('profile_tags').select('tag_id').eq('user_id', userId));
  return rows.map((r) => r.tag_id);
}

/** Replaces the user's tags with exactly `tagIds` in one transaction (1-8 enforced by the database). */
export async function saveMyTags(tagIds: number[]): Promise<void> {
  assertOk(await supabase.rpc('set_my_tags', { p_tag_ids: tagIds }));
}

export async function fetchPromptSuggestions(): Promise<string[]> {
  const rows = unwrap(await supabase.from('prompt_suggestions').select('text').order('sort'));
  return rows.map((r) => r.text);
}
