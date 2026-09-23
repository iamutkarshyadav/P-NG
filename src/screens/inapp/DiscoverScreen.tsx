import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, {
  Rect,
  Circle,
  Path,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { LAYOUT } from '../../theme/responsive';
import { BrutalBox } from '../../components/BrutalBox';
import { LifestyleBadges } from '../../components/LifestyleBadges';
import { UserAccount } from '../../types/user';
import { Image } from 'expo-image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchFeed, fetchSuperpingsLeft, swipe, undoLastSwipe, SwipeAction } from '../../services/discover';
import { errorMessage } from '../../services/errors';
import { useSignedUrls } from '../../hooks/useSignedUrls';
import { useSettings } from '../../hooks/useSettings';
import { haptic } from '../../lib/haptics';
import { paletteFor } from '../../lib/palette';
import { activeLabel, distanceLabel } from '../../lib/format';
import { DiscoveryProfileDetailScreen } from './DiscoveryProfileDetailScreen';
import type { ChatTarget } from './MatchesScreen';

interface DiscoverScreenProps {
  user: UserAccount;
  onOpenChat: (target: ChatTarget) => void;
}

// Generated character shown when a profile has no photo (yellow jacket, sunglasses, neon backdrop)
function PlaceholderIllustration({ jacketColor, bg1, bg2 }: { jacketColor: string; bg1: string; bg2: string }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 340 320" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={bg1} />
          <Stop offset="100%" stopColor={bg2} />
        </LinearGradient>
      </Defs>

      {/* Vibrant Background */}
      <Rect width="340" height="320" fill="url(#bgGrad)" />

      {/* Retro comic background halftone sparks */}
      <Path d="M 40 40 L 44 54 L 58 58 L 44 62 L 40 76 L 36 62 L 22 58 L 36 54 Z" fill="#FFE600" opacity="0.6" />
      <Path d="M 300 80 L 303 90 L 313 93 L 303 96 L 300 106 L 297 96 L 287 93 L 297 90 Z" fill="#FFE600" opacity="0.6" />
      <Path d="M 60 220 L 63 230 L 73 233 L 63 236 L 60 246 L 57 236 L 47 233 L 57 230 Z" fill="#FFFFFF" opacity="0.4" />

      {/* Cyberpunk Character */}
      <G transform="translate(45, 10)">
        {/* Bob Hair Behind */}
        <Path
          d="M 60 70 C 30 70 35 150 50 170 C 65 180 80 175 85 160 Z"
          fill="#111827"
          stroke="#000"
          strokeWidth="3"
        />
        <Path
          d="M 190 70 C 220 70 215 150 200 170 C 185 180 170 175 165 160 Z"
          fill="#111827"
          stroke="#000"
          strokeWidth="3"
        />

        {/* Neck & Gold Chain */}
        <Path d="M 105 140 L 105 180 Q 125 190 145 180 L 145 140 Z" fill="#FBBF24" stroke="#000" strokeWidth="2.5" />
        <Path d="M 110 165 Q 125 180 140 165" fill="none" stroke="#FDE047" strokeWidth="4" />

        {/* Black Crop Top */}
        <Path d="M 92 180 L 158 180 L 154 240 L 96 240 Z" fill="#18181B" stroke="#000" strokeWidth="2.5" />

        {/* Face */}
        <Path
          d="M 75 80 Q 125 70 175 80 Q 170 145 125 168 Q 80 145 75 80 Z"
          fill="#FED7AA"
          stroke="#000"
          strokeWidth="3"
        />

        {/* Sleek Black Bob Hair Front */}
        <Path
          d="M 65 80 Q 125 40 185 80 Q 195 120 180 140 Q 160 90 125 90 Q 90 90 70 140 Z"
          fill="#0F172A"
          stroke="#000"
          strokeWidth="3"
        />

        {/* Cool Tinted Sunglasses */}
        <Path
          d="M 85 96 L 120 96 L 115 122 L 90 120 Z"
          fill="#581C87"
          stroke="#000"
          strokeWidth="2.8"
        />
        <Path
          d="M 130 96 L 165 96 L 160 120 L 135 122 Z"
          fill="#581C87"
          stroke="#000"
          strokeWidth="2.8"
        />
        <Path d="M 120 102 L 130 102" stroke="#000" strokeWidth="3" />
        {/* Sunglasses shine */}
        <Path d="M 92 100 L 105 100 L 96 116 Z" fill="#C084FC" opacity="0.6" />
        <Path d="M 137 100 L 150 100 L 141 116 Z" fill="#C084FC" opacity="0.6" />

        {/* Golden Hoop Earrings */}
        <Circle cx="70" cy="130" r="12" fill="none" stroke="#FDE047" strokeWidth="3" />
        <Circle cx="180" cy="130" r="12" fill="none" stroke="#FDE047" strokeWidth="3" />

        {/* Confident Smile with Red Lip */}
        <Path d="M 108 142 Q 125 156 142 142" fill="#E11D48" stroke="#881337" strokeWidth="2" />
        <Path d="M 112 144 Q 125 150 138 144" fill="#FFFFFF" />

        {/* Yellow Biker Leather Jacket with Lapels & Zippers */}
        <G>
          {/* Main Jacket Body */}
          <Path
            d="M 30 220 L 60 160 Q 125 170 190 160 L 220 220 L 235 320 L 15 320 Z"
            fill={jacketColor}
            stroke="#000"
            strokeWidth="3.5"
          />
          {/* Left Lapel */}
          <Path
            d="M 60 160 L 98 220 L 65 240 L 40 195 Z"
            fill="#EAB308"
            stroke="#000"
            strokeWidth="3"
          />
          {/* Right Lapel */}
          <Path
            d="M 190 160 L 152 220 L 185 240 L 210 195 Z"
            fill="#EAB308"
            stroke="#000"
            strokeWidth="3"
          />
          {/* Zipper Lines */}
          <Path d="M 152 220 L 140 320" stroke="#000" strokeWidth="3.5" strokeDasharray="4, 3" />
          {/* Metal Studs */}
          <Circle cx="70" cy="220" r="3" fill="#E2E8F0" stroke="#000" strokeWidth="1.5" />
          <Circle cx="180" cy="220" r="3" fill="#E2E8F0" stroke="#000" strokeWidth="1.5" />
          {/* Belt Loops */}
          <Rect x="50" y="295" width="15" height="25" fill="#CA8A04" stroke="#000" strokeWidth="2" />
          <Rect x="185" y="295" width="15" height="25" fill="#CA8A04" stroke="#000" strokeWidth="2" />
        </G>
      </G>
    </Svg>
  );
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ user, onOpenChat }) => {
  const queryClient = useQueryClient();
  const { settings } = useSettings(user.id);
  const hapticsOn = settings?.haptics ?? true;
  const feed = useQuery({ queryKey: ['feed'], queryFn: () => fetchFeed(20) });
  const superpings = useQuery({ queryKey: ['superpings-left'], queryFn: fetchSuperpingsLeft });

  // Profiles acted on this session. The server already excludes them from the next batch.
  const [handled, setHandled] = useState<string[]>([]);
  const [pinned, setPinned] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [match, setMatch] = useState<{ matchId: string; name: string; partnerId: string } | null>(null);
  const [showExpandedProfile, setShowExpandedProfile] = useState(false);

  const queue = useMemo(() => {
    const remaining = (feed.data ?? []).filter((p) => !handled.includes(p.id));
    if (!pinned) return remaining;
    return [...remaining.filter((p) => p.id === pinned), ...remaining.filter((p) => p.id !== pinned)];
  }, [feed.data, handled, pinned]);
  const current = queue[0];

  const urls = useSignedUrls([...(current?.photoPaths ?? []), ...(queue[1]?.photoPaths ?? [])]);
  const photoUrls = (current?.photoPaths ?? []).map((p) => urls[p]).filter((u): u is string => Boolean(u));

  // Refill when the visible batch is nearly used up.
  const refillingRef = useRef(false);
  useEffect(() => {
    if (!feed.isSuccess || feed.isFetching || refillingRef.current) return;
    if (handled.length > 0 && queue.length <= 2) {
      refillingRef.current = true;
      feed
        .refetch()
        .then(() => setHandled([]))
        .finally(() => {
          refillingRef.current = false;
        });
    }
  }, [feed, handled.length, queue.length]);

  const handlePullRefresh = async () => {
    setPulling(true);
    try {
      await Promise.all([feed.refetch(), superpings.refetch()]);
      setHandled([]);
    } finally {
      setPulling(false);
    }
  };

  const act = async (action: SwipeAction) => {
    if (!current || busy) return;
    setBusy(true);
    try {
      const outcome = await swipe(current.id, action);
      haptic(hapticsOn, outcome.matched ? 'success' : 'tap');
      setHandled((h) => [...h, current.id]);
      setPinned(null);
      setActivePhotoIndex(0);
      if (action === 'superping') queryClient.invalidateQueries({ queryKey: ['superpings-left'] });
      queryClient.invalidateQueries({ queryKey: ['likes'] });
      queryClient.invalidateQueries({ queryKey: ['likes-count'] });
      if (outcome.matched && outcome.matchId) {
        setMatch({ matchId: outcome.matchId, name: current.name, partnerId: current.id });
        queryClient.invalidateQueries({ queryKey: ['matches'] });
      }
    } catch (e) {
      Alert.alert('Could not send', errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const handleSuperping = () => {
    if ((superpings.data ?? 0) <= 0) {
      Alert.alert('No Super P!NGs left', 'You get a new one every day at midnight UTC.');
      return;
    }
    act('superping');
  };

  const handleRewind = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const restored = await undoLastSwipe();
      if (!restored) {
        Alert.alert(
          'Nothing to rewind',
          'You can rewind your last swipe within 10 minutes, as long as it has not become a match. Super P!NGs cannot be rewound.'
        );
        return;
      }
      setHandled((h) => h.filter((id) => id !== restored));
      await feed.refetch();
      setPinned(restored);
      setActivePhotoIndex(0);
      queryClient.invalidateQueries({ queryKey: ['superpings-left'] });
      queryClient.invalidateQueries({ queryKey: ['likes'] });
      queryClient.invalidateQueries({ queryKey: ['likes-count'] });
    } catch (e) {
      Alert.alert('Could not rewind', errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (feed.isLoading) {
    return (
      <View style={styles.stateWrap}>
        <ActivityIndicator size="large" color={colors.primaryPink} />
      </View>
    );
  }

  if (feed.isError) {
    return (
      <View style={styles.stateWrap}>
        <Text style={styles.stateTitle}>Can&apos;t load your feed</Text>
        <Text style={styles.stateBody}>{errorMessage(feed.error)}</Text>
        <BrutalBox backgroundColor={colors.accentYellow} borderRadius={16} onPress={() => feed.refetch()} contentStyle={styles.stateButton}>
          <Text style={styles.stateButtonText}>TRY AGAIN</Text>
        </BrutalBox>
      </View>
    );
  }

  if (!current) {
    return (
      <View style={styles.stateWrap}>
        <MaterialCommunityIcons name="lightning-bolt" size={44} color={colors.primaryPink} />
        <Text style={styles.stateTitle}>YOU&apos;RE ALL CAUGHT UP</Text>
        <Text style={styles.stateBody}>
          No one new nearby right now. Widen your distance or age range in Preferences, or check back soon.
        </Text>
        <BrutalBox backgroundColor={colors.accentYellow} borderRadius={16} onPress={() => feed.refetch()} contentStyle={styles.stateButton}>
          <Text style={styles.stateButtonText}>{feed.isFetching ? 'CHECKING...' : 'REFRESH'}</Text>
        </BrutalBox>
      </View>
    );
  }

  const palette = paletteFor(current.id);
  const shownPhoto = photoUrls.length > 0 ? photoUrls[Math.min(activePhotoIndex, photoUrls.length - 1)] : null;
  const active = activeLabel(current.lastActiveAt);
  const distance = distanceLabel(current.distanceKm);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={pulling} onRefresh={handlePullRefresh} tintColor={colors.primaryPink} colors={[colors.primaryPink]} />
      }
    >
      <View style={styles.container}>
        <View style={styles.cardStackWrapper}>
          <View style={styles.yellowUnderlay} />

          <BrutalBox
            backgroundColor={colors.cardWhite}
            borderColor={colors.borderBlack}
            borderWidth={2.4}
            borderRadius={20}
            shadowOffset={{ x: 4, y: 4 }}
            overflow="hidden"
            style={styles.cardBox}
            contentStyle={styles.cardBoxContent}
          >
            <TouchableOpacity
              activeOpacity={0.92}
              style={styles.photoContainer}
              onPress={() => setShowExpandedProfile(true)}
              accessibilityRole="button"
              accessibilityLabel={`View full profile of ${current.name}`}
            >
              {shownPhoto ? (
                <Image
                  source={{ uri: shownPhoto }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={150}
                  accessibilityLabel={`Photo of ${current.name}`}
                />
              ) : (
                <PlaceholderIllustration jacketColor={palette.jacket} bg1={palette.bgFrom} bg2={palette.bgTo} />
              )}

              {photoUrls.length > 1 && (
                <View style={styles.tapZones}>
                  <Pressable
                    style={styles.tapZone}
                    accessibilityLabel="Previous photo"
                    onPress={() => setActivePhotoIndex((i) => Math.max(0, i - 1))}
                  />
                  <Pressable
                    style={styles.tapZone}
                    accessibilityLabel="Next photo"
                    onPress={() => setActivePhotoIndex((i) => Math.min(photoUrls.length - 1, i + 1))}
                  />
                </View>
              )}

              {current.isVerified && (
                <View style={styles.verifiedBadgeWrapper}>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-done" size={13} color={colors.textDark} />
                    <Text style={styles.verifiedBadgeText}>100% REAL</Text>
                  </View>
                </View>
              )}

              {photoUrls.length > 1 && (
                <View style={styles.photoDotsPill}>
                  {photoUrls.map((_, idx) => (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.8}
                      onPress={() => setActivePhotoIndex(idx)}
                      style={[styles.photoDot, activePhotoIndex === idx && styles.photoDotActive]}
                    />
                  ))}
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.infoSection}>
              <View style={styles.nameRow}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  style={styles.nameTouch}
                  onPress={() => setShowExpandedProfile(true)}
                  accessibilityRole="button"
                  accessibilityLabel="View full profile"
                >
                  <Text style={styles.nameTitle}>
                    {current.name.toUpperCase()}, {current.age}
                  </Text>
                  <Feather name="arrow-up-right" size={17} color={colors.textDark} style={{ marginLeft: 5 }} />
                </TouchableOpacity>
                <MaterialCommunityIcons name="lightning-bolt" size={24} color={colors.primaryPink} />
              </View>

              {(active || distance) && (
                <View style={styles.badgesRow}>
                  {active && (
                    <View style={styles.activePill}>
                      <View style={styles.greenDot} />
                      <Text style={styles.activePillText}>{active}</Text>
                    </View>
                  )}
                  {distance && (
                    <View style={styles.distancePill}>
                      <Feather name="navigation" size={11} color={colors.textDark} />
                      <Text style={styles.distancePillText}>{distance}</Text>
                    </View>
                  )}
                </View>
              )}

              {current.bio ? <Text style={styles.bioText}>{current.bio}</Text> : null}

              {/* Bumble-Style Compatibility & Lifestyle Badges */}
              <LifestyleBadges profile={current} variant="compact" />

              {current.tags.length > 0 && (
                <View style={styles.chipsRow}>
                  {current.tags.map((tag) => (
                    <View key={tag} style={styles.interestChip}>
                      <Text style={styles.interestChipText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </BrutalBox>
        </View>

        <View style={styles.controlsSection}>
          <BrutalBox
            backgroundColor={colors.accentYellow}
            borderColor={colors.borderBlack}
            borderWidth={2}
            borderRadius={999}
            shadowOffset={{ x: 2.5, y: 2.5 }}
            onPress={handleSuperping}
            contentStyle={styles.pingsLeftContent}
          >
            <MaterialCommunityIcons name="lightning-bolt" size={14} color={colors.textDark} />
            <Text style={styles.pingsLeftText}>SUPER P!NG · {superpings.data ?? 0} LEFT TODAY</Text>
          </BrutalBox>

          <View style={styles.actionButtonsRow}>
            <BrutalBox
              backgroundColor={colors.cardWhite}
              borderColor={colors.borderBlack}
              borderWidth={2.4}
              borderRadius={999}
              shadowOffset={{ x: 3, y: 3 }}
              onPress={handleRewind}
              disabled={busy}
              contentStyle={styles.sideActionBtn}
            >
              <Feather name="rotate-ccw" size={22} color={colors.textDark} />
            </BrutalBox>

            <BrutalBox
              backgroundColor={colors.primaryPink}
              borderColor={colors.borderBlack}
              borderWidth={2.6}
              borderRadius={999}
              shadowOffset={{ x: 3.5, y: 3.5 }}
              onPress={() => act('like')}
              disabled={busy}
              contentStyle={styles.centerHeartBtn}
            >
              <Ionicons name="heart" size={34} color="#FFFFFF" />
            </BrutalBox>

            <BrutalBox
              backgroundColor={colors.cardWhite}
              borderColor={colors.borderBlack}
              borderWidth={2.4}
              borderRadius={999}
              shadowOffset={{ x: 3, y: 3 }}
              onPress={() => act('pass')}
              disabled={busy}
              contentStyle={styles.sideActionBtn}
            >
              <Feather name="x" size={24} color={colors.textDark} />
            </BrutalBox>
          </View>
        </View>
      </View>

      <Modal transparent visible={match !== null} animationType="fade" onRequestClose={() => setMatch(null)}>
        <View style={styles.matchOverlay}>
          <BrutalBox
            backgroundColor={colors.accentYellow}
            borderColor={colors.borderBlack}
            borderWidth={2.8}
            borderRadius={24}
            shadowOffset={{ x: 5, y: 5 }}
            style={styles.matchCard}
            contentStyle={styles.matchCardContent}
          >
            <Text style={styles.matchTitle}>IT&apos;S A MATCH!</Text>
            <Text style={styles.matchBody}>You and {match?.name} P!NGed each other.</Text>
            <BrutalBox
              backgroundColor={colors.primaryPink}
              borderRadius={16}
              onPress={() => {
                const target = match;
                setMatch(null);
                if (target) onOpenChat({ matchId: target.matchId, partnerId: target.partnerId, partnerName: target.name });
              }}
              contentStyle={styles.matchButton}
            >
              <Text style={styles.matchButtonTextLight}>SAY HI</Text>
            </BrutalBox>
            <TouchableOpacity onPress={() => setMatch(null)} accessibilityRole="button">
              <Text style={styles.matchDismiss}>KEEP SWIPING</Text>
            </TouchableOpacity>
          </BrutalBox>
        </View>
      </Modal>

      {/* Expanded Profile Viewer Screen */}
      <Modal
        visible={showExpandedProfile && Boolean(current)}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowExpandedProfile(false)}
      >
        {current && (
          <DiscoveryProfileDetailScreen
            candidate={current}
            photoUrls={photoUrls}
            pingsLeft={superpings.data}
            onClose={() => setShowExpandedProfile(false)}
            onAction={(action) => {
              setShowExpandedProfile(false);
              if (action === 'superping') {
                handleSuperping();
              } else {
                act(action);
              }
            }}
            onRewind={
              handled.length > 0
                ? () => {
                    setShowExpandedProfile(false);
                    handleRewind();
                  }
                : undefined
            }
          />
        )}
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  nameTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileModalWrap: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 18 : 14,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: colors.borderBlack,
    backgroundColor: '#FFFFFF',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.6,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 18,
    maxWidth: LAYOUT.shellMaxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  modalHeroCard: {
    width: '100%',
  },
  modalHeroCardContent: {
    padding: 0,
  },
  modalPhotoBox: {
    width: '100%',
    height: 320,
    backgroundColor: colors.bgCream,
    overflow: 'hidden',
  },
  modalHeroInfo: {
    padding: 16,
    gap: 6,
  },
  modalHeroName: {
    fontSize: 22,
    fontFamily: typography.headline,
    color: colors.textDark,
  },
  modalHeroCity: {
    fontSize: 13,
    fontFamily: typography.bodyBold,
    color: colors.textMuted,
  },
  modalSectionCard: {
    gap: 8,
  },
  modalSectionLabel: {
    fontSize: 12,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.8,
  },
  modalBioContent: {
    padding: 14,
  },
  modalBioText: {
    fontSize: 14,
    fontFamily: typography.bodyMedium,
    color: colors.textDark,
    lineHeight: 21,
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingTop: 10,
  },
  modalSuperpingBtn: {
    width: 50,
    height: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 14,
  },
  stateTitle: {
    fontSize: 20,
    fontFamily: typography.headline,
    color: colors.textDark,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  stateBody: {
    fontSize: 14,
    fontFamily: typography.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  stateButton: {
    paddingVertical: 12,
    paddingHorizontal: 26,
    alignItems: 'center',
  },
  stateButtonText: {
    fontSize: 15,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  tapZones: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
  },
  tapZone: {
    flex: 1,
  },
  bioText: {
    fontSize: 13.5,
    fontFamily: typography.bodyMedium,
    color: '#374151',
    lineHeight: 19,
  },
  matchOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  matchCard: {
    width: '100%',
    maxWidth: 360,
  },
  matchCardContent: {
    padding: 24,
    alignItems: 'center',
    gap: 14,
  },
  matchTitle: {
    fontSize: 30,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.6,
  },
  matchBody: {
    fontSize: 15,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
    textAlign: 'center',
  },
  matchButton: {
    paddingVertical: 14,
    paddingHorizontal: 44,
    alignItems: 'center',
  },
  matchButtonTextLight: {
    fontSize: 18,
    fontFamily: typography.headline,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  matchDismiss: {
    fontSize: 13,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    textDecorationLine: 'underline',
    letterSpacing: 0.5,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: Platform.OS === 'ios' ? 95 : 85,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: LAYOUT.feedMaxWidth,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 14,
  },

  /* Card Stack with Neo-Brutalist Yellow Frame */
  cardStackWrapper: {
    width: '100%',
    position: 'relative',
  },
  yellowUnderlay: {
    position: 'absolute',
    top: 4,
    left: -5,
    right: 5,
    bottom: -4,
    backgroundColor: colors.accentYellow,
    borderWidth: 2.4,
    borderColor: colors.borderBlack,
    borderRadius: 20,
  },
  cardBox: {
    width: '100%',
  },
  cardBoxContent: {
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  photoContainer: {
    width: '100%',
    height: 330,
    position: 'relative',
    overflow: 'hidden',
  },
  verifiedBadgeWrapper: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentYellow,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    gap: 4,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  photoDotsPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 5,
    zIndex: 10,
  },
  photoDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.2,
    borderColor: colors.borderBlack,
    backgroundColor: 'transparent',
  },
  photoDotActive: {
    backgroundColor: colors.primaryPink,
  },

  /* Card Info Section */
  infoSection: {
    padding: 16,
    paddingTop: 14,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameTitle: {
    fontSize: 28,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1.6,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    gap: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  activePillText: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    borderWidth: 1.6,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    gap: 4,
  },
  distancePillText: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  repliesPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    borderWidth: 1.6,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  repliesPillText: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  interestChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  interestChipText: {
    fontSize: 12,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
  },

  /* Controls Section */
  controlsSection: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  pingsLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
    gap: 4,
  },
  pingsLeftText: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
  },
  sideActionBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerHeartBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
