import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';
import { env } from '../lib/env';
import { errorMessage } from './errors';
import { authRedirectUrl, completeAuthLink, setOAuthInFlight } from './authLinks';

// Completes the OAuth popup on web when the provider redirects back to the app.
WebBrowser.maybeCompleteAuthSession();

export type AuthResult = { ok: true; needsEmailConfirmation?: boolean } | { ok: false; error: string };

/** Dev-only test accounts. Alex is seeded on the dev project; Sam is recreated fresh on demand. */
export const DEV_ALEX = { email: 'alex@ping.app', password: 'password123' } as const;
export const DEV_SAM = { email: 'sam@ping.app', password: 'password123' } as const;

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendlyAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Incorrect email or password.';
  if (/already registered|already exists/i.test(message)) {
    return 'An account with this email already exists. Switch to Log In.';
  }
  if (/email not confirmed/i.test(message)) return 'Confirm your email first. Check your inbox.';
  if (/rate limit|too many/i.test(message)) return 'Too many attempts. Wait a minute and try again.';
  return errorMessage(message);
}

export function validateCredentials(email: string, password: string): string | null {
  if (!email.trim() || !password) return 'Please enter both your email and password.';
  if (!EMAIL_PATTERN.test(email.trim())) return 'That email does not look right.';
  return null;
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const invalid = validateCredentials(email, password);
  if (invalid) return { ok: false, error: invalid };
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  return error ? { ok: false, error: friendlyAuthError(error.message) } : { ok: true };
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  const invalid = validateCredentials(email, password);
  if (invalid) return { ok: false, error: invalid };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { emailRedirectTo: authRedirectUrl() },
  });
  if (error) return { ok: false, error: friendlyAuthError(error.message) };
  if (data.session) return { ok: true };

  // No session means the project requires email confirmation. The dev Sam account is auto-confirmed.
  if (env.enableDevLogins && email.trim().toLowerCase() === DEV_SAM.email) {
    await supabase.functions.invoke('dev-reset-user', { body: { action: 'confirm', email: DEV_SAM.email } });
    return signInWithEmail(email, password);
  }
  return { ok: true, needsEmailConfirmation: true };
}

export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    if (Platform.OS === 'web') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      return error ? { ok: false, error: friendlyAuthError(error.message) } : { ok: true };
    }

    const redirectTo = Linking.createURL('auth-callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) {
      return { ok: false, error: friendlyAuthError(error?.message ?? 'Could not start Google sign-in.') };
    }

    setOAuthInFlight(true);
    let result: WebBrowser.WebBrowserAuthSessionResult;
    try {
      result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    } finally {
      // Keep the guard up briefly: Android may also deliver the same redirect as a deep link.
      setTimeout(() => setOAuthInFlight(false), 1500);
    }
    if (result.type !== 'success') return { ok: false, error: 'Google sign-in was cancelled.' };

    const link = await completeAuthLink(result.url, { force: true });
    if (!link.handled) return { ok: false, error: 'Google sign-in failed.' };
    return link.ok ? { ok: true } : { ok: false, error: friendlyAuthError(link.error) };
  } catch (e) {
    return { ok: false, error: errorMessage(e, 'Google sign-in failed.') };
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  if (!EMAIL_PATTERN.test(email.trim())) return { ok: false, error: 'Enter your email above first.' };
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: authRedirectUrl(),
  });
  return error ? { ok: false, error: friendlyAuthError(error.message) } : { ok: true };
}

export async function changePassword(newPassword: string): Promise<AuthResult> {
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return error ? { ok: false, error: friendlyAuthError(error.message) } : { ok: true };
}

/** Dev only: deletes Sam (and his files) so signing up as him is always a brand-new account. */
export async function resetDevSam(): Promise<void> {
  if (!env.enableDevLogins) return;
  await supabase.functions.invoke('dev-reset-user', { body: { action: 'reset', email: DEV_SAM.email } });
}

/** Dev only: moves the seeded candidates near the signed-in user and has a few like them. */
export async function moveSeedsNearMe(): Promise<void> {
  if (!env.enableDevLogins) return;
  await supabase.rpc('dev_move_seeds_near_me');
}
