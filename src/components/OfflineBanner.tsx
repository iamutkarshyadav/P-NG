import React, { useSyncExternalStore } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { onlineManager } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const subscribe = (callback: () => void) => onlineManager.subscribe(callback);
const getSnapshot = () => onlineManager.isOnline();

/** Slim banner shown at the top of the screen while the device has no connection. */
export const OfflineBanner: React.FC = () => {
  const online = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const insets = useSafeAreaInsets();
  if (online) return null;
  return (
    <View
      pointerEvents="none"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.banner, { paddingTop: insets.top + 6 }]}
    >
      <Feather name="wifi-off" size={14} color="#FFFFFF" />
      <Text style={styles.text}>You are offline. Showing saved data.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 6,
    backgroundColor: colors.textDark,
  },
  text: { color: '#FFFFFF', fontSize: 12, fontFamily: typography.bodyBold, letterSpacing: 0.3 },
});
