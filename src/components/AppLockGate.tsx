import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { BrutalBox } from './BrutalBox';
import { authenticate, isLockEnabled } from '../services/appLock';

/** Hides the app behind a biometric/passcode prompt on launch and when returning from the background. */
export const AppLockGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locked, setLocked] = useState<boolean | null>(null); // null = still checking
  const [busy, setBusy] = useState(false);
  const backgroundedAt = useRef<number | null>(null);

  const unlock = useCallback(async () => {
    setBusy(true);
    try {
      if (await authenticate()) setLocked(false);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    isLockEnabled().then((enabled) => {
      setLocked(enabled);
      if (enabled) unlock();
    });
  }, [unlock]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      if (state === 'background' || state === 'inactive') {
        backgroundedAt.current = backgroundedAt.current ?? Date.now();
        return;
      }
      // Coming back after 30+ seconds away re-locks (short trips to the notification shade do not).
      const away = backgroundedAt.current ? Date.now() - backgroundedAt.current : 0;
      backgroundedAt.current = null;
      if (state === 'active' && away > 30_000 && (await isLockEnabled())) {
        setLocked(true);
        unlock();
      }
    });
    return () => sub.remove();
  }, [unlock]);

  return (
    <View style={styles.container}>
      {children}
      {(locked === true || locked === null) && (
        <View style={[StyleSheet.absoluteFill, styles.overlay]}>
          <Ionicons name="lock-closed" size={44} color={colors.primaryPink} />
          <Text style={styles.title}>P!NG IS LOCKED</Text>
          <BrutalBox
            backgroundColor={colors.accentYellow}
            borderRadius={16}
            onPress={unlock}
            disabled={busy}
            contentStyle={styles.button}
          >
            {busy ? <ActivityIndicator color={colors.textDark} /> : <Text style={styles.buttonText}>UNLOCK</Text>}
          </BrutalBox>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    zIndex: 9999,
    backgroundColor: colors.bgCream,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  title: { fontSize: 22, fontFamily: typography.headline, color: colors.textDark, letterSpacing: 0.6 },
  button: { paddingVertical: 14, paddingHorizontal: 40, alignItems: 'center' },
  buttonText: { fontSize: 16, fontFamily: typography.headline, color: colors.textDark, letterSpacing: 0.6 },
});
