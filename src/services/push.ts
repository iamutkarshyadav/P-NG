import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';
import { errorMessage } from './errors';

// Show alerts while the app is open too, but stay quiet when the user is already in that chat.
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export type PushResult =
  | { ok: true; token: string }
  | { ok: false; reason: 'unsupported' | 'denied' | 'no-project' | 'error'; message?: string };

/**
 * Asks for notification permission (if needed), gets the Expo push token and registers it for the
 * signed-in user. Safe to call repeatedly; the token is upserted by the server.
 */
export async function registerForPush(): Promise<PushResult> {
  if (Platform.OS === 'web') return { ok: false, reason: 'unsupported' };
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E51760',
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
    if (status !== 'granted') return { ok: false, reason: 'denied' };

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) return { ok: false, reason: 'no-project' };

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    const { error } = await supabase.rpc('register_push_token', { p_token: token, p_platform: Platform.OS });
    if (error) return { ok: false, reason: 'error', message: errorMessage(error) };
    return { ok: true, token };
  } catch (e) {
    return { ok: false, reason: 'error', message: errorMessage(e) };
  }
}

/** Removes this device's token (called on sign out so the next user does not get this user's pushes). */
export async function unregisterPush(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) return;
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await supabase.from('push_tokens').delete().eq('token', token);
  } catch {
    // Best effort: the server also drops tokens Expo reports as unregistered.
  }
}

export interface PushTarget {
  type: 'message' | 'match' | 'superping';
  matchId?: string;
}

/** Calls back with the destination when the user taps a notification. Returns an unsubscribe function. */
export function onNotificationOpened(handler: (target: PushTarget) => void): () => void {
  if (Platform.OS === 'web') return () => undefined;
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as Partial<PushTarget> | undefined;
    if (data?.type) handler({ type: data.type, matchId: data.matchId });
  });
  return () => sub.remove();
}
