import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

type Kind = 'tap' | 'success' | 'warning';

/** Fire-and-forget haptic feedback (no-op on web). Callers pass the user's haptics setting. */
export function haptic(enabled: boolean, kind: Kind = 'tap'): void {
  if (!enabled || Platform.OS === 'web') return;
  const run =
    kind === 'success'
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : kind === 'warning'
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  run.catch(() => undefined);
}
