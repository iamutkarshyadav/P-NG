import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';
import { assertOk } from './errors';

export type FeedbackCategory = 'bug' | 'idea' | 'other';

export const FEEDBACK_CATEGORIES: Array<{ value: FeedbackCategory; label: string }> = [
  { value: 'bug', label: 'BUG' },
  { value: 'idea', label: 'IDEA' },
  { value: 'other', label: 'OTHER' },
];

export async function submitFeedback(userId: string, category: FeedbackCategory, message: string): Promise<void> {
  const text = message.trim();
  if (text.length < 5) throw new Error('Please write at least a few words.');
  assertOk(
    await supabase.from('feedback').insert({
      user_id: userId,
      category,
      message: text,
      app_version: Constants.expoConfig?.version ?? null,
      platform: Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web',
    })
  );
}
