import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { fetchUser } from '../services/profile';
import { errorMessage } from '../services/errors';
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
}

const SessionContext = createContext<SessionContextValue | null>(null);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [user, setUserState] = useState<UserAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') return;
      // Never await Supabase calls inside this callback; defer to avoid a client-side deadlock.
      setTimeout(() => load(session), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  // Keep "last active" fresh so other people see a truthful active status.
  const userId = user?.id;
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
    () => ({ status, user, error, setUser: setUserState, refreshUser, retry }),
    [status, user, error, refreshUser, retry]
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
