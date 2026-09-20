import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchLikesCount } from '../services/discover';
import { fetchMatches, subscribeToInbox } from '../services/chat';

/** Live counts for the bottom nav: people who liked you, and whether any chat needs attention. */
export function useInboxBadges(userId: string) {
  const queryClient = useQueryClient();
  const likesCountQuery = useQuery({ queryKey: ['likes-count'], queryFn: fetchLikesCount, refetchInterval: 60_000 });
  const matches = useQuery({ queryKey: ['matches'], queryFn: fetchMatches });

  // New messages/matches arrive in realtime (RLS limits events to the user's own matches).
  useEffect(
    () =>
      subscribeToInbox(userId, (event) => {
        queryClient.invalidateQueries({ queryKey: ['matches'] });
        if (event === 'match') {
          queryClient.invalidateQueries({ queryKey: ['likes-count'] });
        }
      }),
    [userId, queryClient]
  );

  return {
    likesCount: likesCountQuery.data ?? 0,
    hasUnreadMatches: (matches.data ?? []).some((m) => m.unreadCount > 0 || !m.lastMessage),
  };
}
