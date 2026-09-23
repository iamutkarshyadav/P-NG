import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';
import { errorMessage } from './errors';
import { authRedirectUrl, completeAuthLink, setOAuthInFlight } from './authLinks';

// Completes the OAuth popup on web when the provider redirects back to the app.
WebBrowser.maybeCompleteAuthSession();

export type AuthResult = { ok: true; needsEmailConfirmation?: boolean } | { ok: false; error: string };

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendlyAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Incorrect email or password.';
  if (/already registered|already exists/i.test(message)) {
    return 'An account with this email already exists. Switch to Log In.';
  }
  if (/email not confirmed/i.test(message)) return 'Confirm your email first. Check your inbox.';
  if (/rate limit|too many/i.test(message)) return 'Too many attempts. Wait a minute and try again.';
  if (/token has expired|invalid token|otp has expired|invalid otp|token is invalid/i.test(message)) {
    return 'Invalid or expired verification code. Please request a new code.';
  }
  if (/for security purposes, you can only request/i.test(message)) {
    return 'Please wait a moment before requesting another code.';
  }
  return errorMessage(message);
}

export function validateCredentials(email: string, password: string): string | null {
  if (!email.trim() || !password) return 'Please enter both your email and password.';
  if (!EMAIL_PATTERN.test(email.trim())) return 'That email does not look right.';
  return null;
}

export async function sendEmailOtp(email: string): Promise<AuthResult> {
  const clean = email.trim();
  if (!clean) return { ok: false, error: 'Please enter your email.' };
  if (!EMAIL_PATTERN.test(clean)) return { ok: false, error: 'That email does not look right.' };
  const { error } = await supabase.auth.signInWithOtp({
    email: clean,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: authRedirectUrl(),
    },
  });
  return error ? { ok: false, error: friendlyAuthError(error.message) } : { ok: true };
}

export async function verifyEmailOtp(email: string, token: string): Promise<AuthResult> {
  const cleanEmail = email.trim();
  const cleanToken = token.trim();
  if (!cleanEmail) return { ok: false, error: 'Please enter your email.' };
  if (!cleanToken) return { ok: false, error: 'Please enter the 6-digit code.' };
  if (cleanToken.length < 6) return { ok: false, error: 'The code must be 6 digits.' };

  const { error } = await supabase.auth.verifyOtp({
    email: cleanEmail,
    token: cleanToken,
    type: 'email',
  });
  if (error) return { ok: false, error: friendlyAuthError(error.message) };
  return { ok: true };
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

  // No session means the project requires email confirmation.
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
