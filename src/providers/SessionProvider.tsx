import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { useQueryClient } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { fetchUser } from '../services/profile';
import { errorMessage } from '../services/errors';
import { completeAuthLink } from '../services/authLinks';
import { setMonitoringUser } from '../lib/monitoring';
import type { UserAccount } from '../types/user';

type SessionStatus = 'loading' | 'signedOut' | 'signedIn' | 'error';

interface SessionContextValue {
  status: SessionStatus;
  user: UserAccount | null;
  error: string | null;
  /** Replace the in-memory user after a profile write (the row is already saved). */
  setUser: (user: UserAccount) => void;
  /** Re-read the profile from the database. */
  refreshUser: () => Promise<void>;
  retry: () => void;
  /** True after the user opened a password-reset link; the app shows the set-new-password screen. */
  passwordRecovery: boolean;
  endRecovery: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [user, setUserState] = useState<UserAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const sessionRef = useRef<Session | null>(null);

  const load = useCallback(
    async (session: Session | null) => {
      sessionRef.current = session;
      if (!session) {
        queryClient.clear();
        setUserState(null);
        setError(null);
        setStatus('signedOut');
        return;
      }
      try {
        const profile = await fetchUser(session.user.id, session.user.email ?? '');
        setUserState(profile);
        setError(null);
        setStatus('signedIn');
      } catch (e) {
        setError(errorMessage(e));
        setStatus('error');
      }
    },
    [queryClient]
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => load(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // Web parses the reset link itself and reports it as this event.
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') return;
      // Never await Supabase calls inside this callback; defer to avoid a client-side deadlock.
      setTimeout(() => load(session), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  // Links from auth emails (confirm sign-up, reset password) arrive as deep links on native.
  useEffect(() => {
    // On web the Supabase client reads the URL itself, so handling it twice would consume the token twice.
    if (Platform.OS === 'web') return;
    const handle = async (url: string | null) => {
      if (!url) return;
      const result = await completeAuthLink(url);
      if (!result.handled) return;
      if (!result.ok) {
        Alert.alert('Link problem', `${result.error}

Request a new email and try again.`);
      } else if (result.recovery) {
        setPasswordRecovery(true);
      }
    };
    Linking.getInitialURL().then(handle);
    const sub = Linking.addEventListener('url', (event) => handle(event.url));
    return () => sub.remove();
  }, []);

  // Keep "last active" fresh so other people see a truthful active status.
  const userId = user?.id;
  useEffect(() => {
    setMonitoringUser(userId ?? null);
  }, [userId]);
  useEffect(() => {
    if (!userId) return;
    const touch = () =>
      supabase
        .from('profiles')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', userId)
        .then(() => undefined);
    touch();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') touch();
    });
    return () => sub.remove();
  }, [userId]);

  const refreshUser = useCallback(async () => {
    if (sessionRef.current) await load(sessionRef.current);
  }, [load]);

  const retry = useCallback(() => {
    setStatus('loading');
    supabase.auth.getSession().then(({ data }) => load(data.session));
  }, [load]);

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      user,
      error,
      setUser: setUserState,
      refreshUser,
      retry,
      passwordRecovery,
      endRecovery: () => setPasswordRecovery(false),
    }),
    [status, user, error, refreshUser, retry, passwordRecovery]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}

/** The signed-in user. Only call from screens rendered after sign-in. */
export function useCurrentUser(): UserAccount {
  const { user } = useSession();
  if (!user) throw new Error('useCurrentUser called while signed out');
  return user;
}
