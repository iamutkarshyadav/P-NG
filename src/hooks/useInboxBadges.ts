import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchLikes } from '../services/discover';
import { fetchMatches, subscribeToInbox } from '../services/chat';

/** Live counts for the bottom nav: people who liked you, and whether any chat needs attention. */
export function useInboxBadges(userId: string) {
  const queryClient = useQueryClient();
  const likes = useQuery({ queryKey: ['likes'], queryFn: fetchLikes, refetchInterval: 60_000 });
  const matches = useQuery({ queryKey: ['matches'], queryFn: fetchMatches });

  // New messages/matches arrive in realtime (RLS limits events to the user's own matches).
  useEffect(
    () =>
      subscribeToInbox(userId, () => {
        queryClient.invalidateQueries({ queryKey: ['matches'] });
        queryClient.invalidateQueries({ queryKey: ['likes'] });
      }),
    [userId, queryClient]
  );

  return {
    likesCount: likes.data?.length ?? 0,
    hasUnreadMatches: (matches.data ?? []).some((m) => m.unreadCount > 0 || !m.lastMessage),
  };
}
