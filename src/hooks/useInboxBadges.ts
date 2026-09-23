import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchLikesCount } from '../services/discover';
import { MatchSummary, applyMessageToMatches, fetchMatches, subscribeToInbox } from '../services/chat';

/** Live counts for the bottom nav: people who liked you, and whether any chat needs attention. */
export function useInboxBadges(userId: string) {
  const queryClient = useQueryClient();
  const likesCountQuery = useQuery({ queryKey: ['likes-count'], queryFn: fetchLikesCount, refetchInterval: 60_000 });
  const matches = useQuery({ queryKey: ['matches'], queryFn: fetchMatches });

  // New messages/matches arrive in realtime (RLS limits events to the user's own matches). A message for a chat we
  // already list is applied to the cached list directly; only new/ended matches trigger a (debounced) refetch.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const refreshSoon = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        queryClient.invalidateQueries({ queryKey: ['matches'] });
        queryClient.invalidateQueries({ queryKey: ['likes-count'] });
      }, 600);
    };
    const unsubscribe = subscribeToInbox(userId, (change) => {
      if (change.kind === 'match') return refreshSoon();
      const current = queryClient.getQueryData<MatchSummary[]>(['matches']);
      const next = current ? applyMessageToMatches(current, change.message, userId) : null;
      if (next) queryClient.setQueryData(['matches'], next);
      else refreshSoon();
    });
    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, [userId, queryClient]);

  return {
    likesCount: likesCountQuery.data ?? 0,
    hasUnreadMatches: (matches.data ?? []).some((m) => m.unreadCount > 0 || !m.lastMessage),
  };
}
