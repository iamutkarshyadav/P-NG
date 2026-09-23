// src/screens/inapp/DiscoveryProfileDetailScreen.tsx
// Full-screen profile viewer powered by UnifiedDatingProfileView.
// Guarantees 100% UI and UX parity with User Settings Live Preview.

import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  BackHandler,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { BrutalBox } from '../../components/BrutalBox';
import { UnifiedDatingProfileView } from '../../components/profile-view/UnifiedDatingProfileView';
import type { FeedProfile, SwipeAction } from '../../services/discover';

export interface DiscoveryProfileDetailScreenProps {
  candidate: FeedProfile;
  photoUrls?: string[];
  /** Super P!NGs left today; the pill is hidden while this is unknown. */
  pingsLeft?: number;
  onClose: () => void;
  onAction?: (action: SwipeAction) => void;
  onRewind?: () => void;
  showActions?: boolean;
}

export const DiscoveryProfileDetailScreen: React.FC<DiscoveryProfileDetailScreenProps> = ({
  candidate,
  photoUrls = [],
  pingsLeft,
  onClose,
  onAction,
  onRewind,
  showActions = true,
}) => {
  const insets = useSafeAreaInsets();

  // Android hardware back button handler
  useEffect(() => {
    const onBackPress = () => {
      onClose();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [onClose]);

  const primaryTag = candidate.tags && candidate.tags.length > 0 ? candidate.tags[0] : null;

  return (
    <View style={[styles.rootContainer, { paddingTop: insets.top }]}>
      {/* ── Top Header Bar ────────────────────────────────────────────── */}
      <View style={styles.topHeaderBar}>
        <BrutalBox
          backgroundColor="#FFFFFF"
          borderColor={colors.borderBlack}
          borderWidth={2}
          borderRadius={12}
          shadowOffset={{ x: 2, y: 2 }}
          onPress={onClose}
          contentStyle={styles.backButtonContent}
        >
          <Ionicons name="arrow-back" size={20} color="#18181B" />
        </BrutalBox>

        <View style={styles.vibeBannerRow}>
          {primaryTag ? (
            <BrutalBox
              backgroundColor="#FFE4E6"
              borderColor={colors.borderBlack}
              borderWidth={2}
              borderRadius={999}
              shadowOffset={{ x: 2, y: 2 }}
              contentStyle={styles.tagPillContent}
            >
              <Text style={styles.tagPillText}>{primaryTag.toUpperCase()}</Text>
            </BrutalBox>
          ) : (
            <Text style={styles.headerTitleText}>{candidate.name.toUpperCase()}&apos;S PROFILE</Text>
          )}
        </View>
      </View>

      {/* ── Scrollable Profile Content ─────────────────────────────────── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              Platform.OS === 'web'
                ? 48
                : Math.max(insets.bottom + 32, 48),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <UnifiedDatingProfileView
          profile={candidate}
          photoUrls={photoUrls}
          prompts={candidate.prompts}
          tags={candidate.tags}
          isLivePreview={false}
          onAction={showActions ? onAction : undefined}
          onRewind={showActions ? onRewind : undefined}
          pingsLeft={pingsLeft}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: '#FAF7F2',
  },
  backButtonContent: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vibeBannerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagPillContent: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tagPillText: {
    fontSize: 11.5,
    fontFamily: typography.headline,
    color: '#18181B',
    letterSpacing: 0.4,
  },
  headerTitleText: {
    fontSize: 14,
    fontFamily: typography.headline,
    color: '#18181B',
    letterSpacing: 0.6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
});
