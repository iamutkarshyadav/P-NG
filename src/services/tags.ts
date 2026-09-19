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

/** Replaces the user's tags with exactly `tagIds` (1-8 enforced by the UI and the database). */
export async function saveMyTags(userId: string, tagIds: number[]): Promise<void> {
  const current = await fetchMyTagIds(userId);
  const toAdd = tagIds.filter((id) => !current.includes(id));
  const toRemove = current.filter((id) => !tagIds.includes(id));
  if (toRemove.length > 0) {
    assertOk(
      await supabase.from('profile_tags').delete().eq('user_id', userId).in('tag_id', toRemove)
    );
  }
  if (toAdd.length > 0) {
    assertOk(
      await supabase
        .from('profile_tags')
        .insert(toAdd.map((tag_id) => ({ user_id: userId, tag_id })))
    );
  }
}

export async function fetchPromptSuggestions(): Promise<string[]> {
  const rows = unwrap(await supabase.from('prompt_suggestions').select('text').order('sort'));
  return rows.map((r) => r.text);
}
