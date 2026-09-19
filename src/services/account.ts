import { Platform, Share } from 'react-native';
import { supabase } from '../lib/supabase';
import { assertOk, errorMessage, unwrap } from './errors';

/** Downloads (web) or shares (native) the user's full data as JSON. */
export async function exportMyData(): Promise<void> {
  const data = unwrap(await supabase.rpc('export_my_data'));
  const json = JSON.stringify(data, null, 2);

  if (Platform.OS === 'web') {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ping-data-export.json';
    link.click();
    URL.revokeObjectURL(url);
    return;
  }
  await Share.share({ title: 'My P!NG data', message: json });
}

/** Deletes the user's swipe history and unmatches everyone (irreversible). */
export async function resetMySwipes(): Promise<void> {
  assertOk(await supabase.rpc('reset_my_swipes'));
}

/** Signs out every other device but keeps this one. */
export async function signOutOtherSessions(): Promise<void> {
  assertOk(await supabase.auth.signOut({ scope: 'others' }));
}

/** Permanently deletes the account and all its data, then ends the local session. */
export async function deleteMyAccount(): Promise<void> {
  const { error, data } = await supabase.functions.invoke('delete-account', { method: 'POST' });
  if (error) throw new Error(errorMessage(error, 'Could not delete your account. Please try again.'));
  if (data && (data as { error?: string }).error) throw new Error((data as { error: string }).error);
  await supabase.auth.signOut({ scope: 'local' });
}
