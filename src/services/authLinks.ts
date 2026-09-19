import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import { errorMessage } from './errors';

/** Where Supabase sends people after they tap a link in an auth email (confirm, reset password). */
export function authRedirectUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') return window.location.origin;
  return Linking.createURL('auth-callback');
}

export interface AuthLink {
  code?: string;
  accessToken?: string;
  refreshToken?: string;
  /** Supabase link type: 'signup', 'recovery', 'magiclink', ... */
  type?: string;
  error?: string;
}

/** Reads tokens from either the query string (PKCE) or the fragment (implicit flow) of a redirect URL. */
export function parseAuthUrl(url: string): AuthLink {
  const params = new URLSearchParams();
  const hash = url.indexOf('#');
  const query = url.indexOf('?');
  if (query >= 0) new URLSearchParams(url.slice(query + 1, hash > query ? hash : undefined)).forEach((v, k) => params.set(k, v));
  if (hash >= 0) new URLSearchParams(url.slice(hash + 1)).forEach((v, k) => params.set(k, v));
  return {
    code: params.get('code') ?? undefined,
    accessToken: params.get('access_token') ?? undefined,
    refreshToken: params.get('refresh_token') ?? undefined,
    type: params.get('type') ?? undefined,
    error: params.get('error_description') ?? params.get('error') ?? undefined,
  };
}

export type AuthLinkResult =
  | { handled: false }
  | { handled: true; ok: true; recovery: boolean }
  | { handled: true; ok: false; error: string };

// The Google browser flow returns its own result; do not process the same redirect twice.
let oauthInFlight = false;
let lastProcessedUrl: string | null = null;

export function setOAuthInFlight(active: boolean): void {
  oauthInFlight = active;
}

/** Turns an auth redirect URL into a signed-in session. Ignores URLs that are not auth links. */
export async function completeAuthLink(url: string, options: { force?: boolean } = {}): Promise<AuthLinkResult> {
  const link = parseAuthUrl(url);
  const isAuthLink = Boolean(link.code || link.accessToken || link.error);
  if (!isAuthLink) return { handled: false };
  if (!options.force && (oauthInFlight || url === lastProcessedUrl)) return { handled: false };
  lastProcessedUrl = url;

  if (link.error) return { handled: true, ok: false, error: link.error };
  try {
    if (link.code) {
      const { error } = await supabase.auth.exchangeCodeForSession(link.code);
      if (error) return { handled: true, ok: false, error: errorMessage(error) };
    } else if (link.accessToken && link.refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: link.accessToken,
        refresh_token: link.refreshToken,
      });
      if (error) return { handled: true, ok: false, error: errorMessage(error) };
    } else {
      return { handled: true, ok: false, error: 'This link is incomplete. Please request a new one.' };
    }
    return { handled: true, ok: true, recovery: link.type === 'recovery' };
  } catch (e) {
    return { handled: true, ok: false, error: errorMessage(e) };
  }
}
