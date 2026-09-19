import { AppState, Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import { authStorage } from './authStorage';
import type { Database } from '../types/database';

export const supabase = createClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Native has no URL to read a session from; web handles the OAuth redirect.
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Only refresh tokens while the app is in the foreground.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
