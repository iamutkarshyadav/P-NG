import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { SettingsRow, fetchSettings, saveSettings } from '../services/profile';
import { errorMessage } from '../services/errors';

/** The signed-in user's app settings with optimistic updates that roll back on failure. */
export function useSettings(userId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['settings', userId] as const;
  const query = useQuery({ queryKey, queryFn: () => fetchSettings(userId), staleTime: 5 * 60_000 });

  const update = useCallback(
    async (patch: Partial<SettingsRow>) => {
      const previous = queryClient.getQueryData<SettingsRow>(['settings', userId]);
      queryClient.setQueryData<SettingsRow | undefined>(['settings', userId], (old) =>
        old ? { ...old, ...patch } : old
      );
      try {
        await saveSettings(userId, patch);
        // Distance rounding and active status change what other people see in their feeds.
        if ('approximate_distance' in patch || 'show_active_status' in patch) {
          queryClient.invalidateQueries({ queryKey: ['feed'] });
        }
      } catch (e) {
        queryClient.setQueryData(['settings', userId], previous);
        Alert.alert('Could not save setting', errorMessage(e));
      }
    },
    [queryClient, userId]
  );

  return { settings: query.data, isLoading: query.isLoading, error: query.error as Error | null, update };
}
