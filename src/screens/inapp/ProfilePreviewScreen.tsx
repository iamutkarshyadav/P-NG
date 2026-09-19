import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather } from '@expo/vector-icons';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { LAYOUT } from '../../theme/responsive';
import { DotGridBackground } from '../../components/DotGridBackground';
import { BrutalBox } from '../../components/BrutalBox';
import { UserAccount } from '../../types/user';
import { ProfileEditor } from '../../components/ProfileEditor';
import { usePhotos } from '../../hooks/usePhotos';
import { fetchAllTags, fetchMyTagIds } from '../../services/tags';
import { paletteFor } from '../../lib/palette';

interface ProfilePreviewScreenProps {
  user: UserAccount;
  onBack: () => void;
}

function PortraitPlaceholder({ seed }: { seed: string }) {
  const p = paletteFor(seed);
  return (
    <Svg width="100%" height="100%" viewBox="0 0 340 280" preserveAspectRatio="xMidYMid slice">
      <Rect width="340" height="280" fill={p.bgFrom} />
      <Circle cx="170" cy="110" r="46" fill={p.flat} stroke="#000" strokeWidth="3" />
      <Path d="M 122 105 Q 170 45 218 105 Q 190 82 170 86 Q 150 82 122 105 Z" fill={p.hair} />
      <Path d="M 70 280 Q 80 190 170 190 Q 260 190 270 280 Z" fill={p.jacket} stroke="#000" strokeWidth="3" />
    </Svg>
  );
}

export const ProfilePreviewScreen: React.FC<ProfilePreviewScreenProps> = ({
  user,
  onBack,
}) => {
  const [mode, setMode] = useState<'preview' | 'edit'>('preview');
  const [photoIndex, setPhotoIndex] = useState(0);
  const { photos } = usePhotos(user.id);
  const tagsQuery = useQuery({ queryKey: ['tags'], queryFn: fetchAllTags, staleTime: 10 * 60_000 });
  const myTagsQuery = useQuery({ queryKey: ['my-tags', user.id], queryFn: () => fetchMyTagIds(user.id) });
  const myTags = (tagsQuery.data ?? []).filter((t) => (myTagsQuery.data ?? []).includes(t.id));

  const displayName = user.name;
  const displayAge = user.age;
  const displayBio =
    user.bio && user.bio.trim().length > 0 ? user.bio : 'Add a short bio so people know who you are.';
  const shownPhoto = photos.length > 0 ? photos[Math.min(photoIndex, photos.length - 1)] : undefined;

  const handleDisabledAction = () => {
    Alert.alert(
      'Preview Mode Active',
      'This is how other users see your profile. Swipe & match actions are disabled in preview mode.'
    );
  };

  return (
    <View style={styles.screenWrapper}>
      <StatusBar style="dark" />
      <DotGridBackground />

      {/* Top Back Navigation (No bar, just the back button) */}
      <View style={styles.backNavRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Screen Title Block */}
          <View style={styles.screenHeader}>
            <View style={styles.previewTitleRow}>
              <Text style={styles.screenHeading}>{mode === 'preview' ? 'PROFILE PREVIEW' : 'EDIT PROFILE'}</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setMode(mode === 'preview' ? 'edit' : 'preview')}
                style={styles.howOthersSeePill}
                accessibilityRole="button"
                accessibilityLabel={mode === 'preview' ? 'Edit your profile' : 'Back to preview'}
              >
                <Feather name={mode === 'preview' ? 'edit-2' : 'eye'} size={12} color="#000" />
                <Text style={styles.howOthersSeeText}>{mode === 'preview' ? 'EDIT PROFILE' : 'VIEW PREVIEW'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.screenSubheading}>
              {mode === 'preview'
                ? 'This is how potential matches see your card'
                : 'Update your details and photos'}
            </Text>
          </View>

          {mode === 'edit' && <ProfileEditor user={user} onDone={() => setMode('preview')} />}
          {mode === 'preview' && (
            <>

          {/* 3. HERO DATING CARD */}
          <BrutalBox
            backgroundColor="#FFFFFF"
            borderColor={colors.borderBlack}
            borderWidth={3}
            borderRadius={24}
            shadowOffset={{ x: 4, y: 4 }}
            style={styles.fullWidth}
            contentStyle={styles.heroCardContent}
          >
            {/* Story Indicator dashes */}
            {photos.length > 1 && (
              <View style={styles.storyIndicatorsRow}>
                {photos.map((p, i) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.storyDash, i === photoIndex && styles.storyDashActive]}
                    onPress={() => setPhotoIndex(i)}
                    accessibilityLabel={`Show photo ${i + 1}`}
                  />
                ))}
              </View>
            )}

            {/* 100% REAL Floating Top Badge */}
            {user.isVerifiedReal && (
              <View style={styles.realBadgeHero}>
                <Ionicons name="shield-checkmark" size={13} color="#000" />
                <Text style={styles.realBadgeHeroText}>100% REAL</Text>
              </View>
            )}

            {/* Hero Illustration */}
            <View style={styles.heroImageWrapper}>
              {shownPhoto?.url ? (
                <Image source={{ uri: shownPhoto.url }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
              ) : (
                <PortraitPlaceholder seed={user.id} />
              )}
            </View>

            {/* Profile Info Overlay at bottom of Hero Card */}
            <View style={styles.heroInfoOverlay}>
              <View style={styles.nameProRow}>
                <Text style={styles.heroNameText}>
                  {displayName.toUpperCase()}
                  {displayAge ? `, ${displayAge}` : ''}
                </Text>
              </View>

              <View style={styles.badgesUnderNameRow}>
                <View style={styles.activeTodayPill}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeTodayText}>ACTIVE NOW</Text>
                </View>

                {user.city ? (
                  <View style={styles.distancePill}>
                    <Feather name="navigation" size={11} color="#000" />
                    <Text style={styles.distanceText}>{user.city.toUpperCase()}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </BrutalBox>

          {/* 6. ABOUT ME & MANIFESTO */}
          <View style={styles.cardWrapper}>
            <View style={styles.floatingBadgeYellow}>
              <Ionicons name="flash" size={11} color="#000" />
              <Text style={styles.floatingBadgeText}>ABOUT ME & MANIFESTO</Text>
            </View>

            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2.8}
              borderRadius={20}
              shadowOffset={{ x: 4, y: 4 }}
              style={styles.fullWidth}
              contentStyle={styles.manifestoContent}
            >
              <Text style={styles.manifestoBody}>{displayBio}</Text>
            </BrutalBox>
          </View>

          {/* 9. OBSESSIONS & RIG */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>OBSESSIONS & RIG</Text>
            <View style={styles.tagCountPill}>
              <Text style={styles.tagCountText}>
                {myTags.length} {myTags.length === 1 ? 'TAG' : 'TAGS'}
              </Text>
            </View>
          </View>

          <View style={styles.tagsContainer}>
            {myTags.map((tag, idx) => (
              <View
                key={tag.id}
                style={[styles.tagChip, { backgroundColor: idx % 3 === 1 ? colors.accentYellow : tag.tint || '#FFFFFF' }]}
              >
                <Text style={styles.tagChipText}>
                  {tag.emoji} {tag.name}
                </Text>
              </View>
            ))}
          </View>

          {/* 10. PREVIEW BOTTOM DECK */}
          <BrutalBox
            backgroundColor="#27272A"
            borderColor={colors.borderBlack}
            borderWidth={2.8}
            borderRadius={24}
            shadowOffset={{ x: 4, y: 4 }}
            style={styles.fullWidth}
            contentStyle={styles.previewDeckContent}
          >
            <View style={styles.deckButtonsRow}>
              {/* Pass button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDisabledAction}
                style={styles.deckCircleBtn}
              >
                <Ionicons name="close" size={28} color="#DC2626" />
              </TouchableOpacity>

              {/* Rewind button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDisabledAction}
                style={styles.deckCircleBtn}
              >
                <Ionicons name="reload" size={24} color="#000" />
              </TouchableOpacity>

              {/* Star button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDisabledAction}
                style={[styles.deckCircleBtn, { backgroundColor: colors.accentYellow }]}
              >
                <Ionicons name="star" size={26} color="#000" />
              </TouchableOpacity>

              {/* Like button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDisabledAction}
                style={[styles.deckCircleBtn, { backgroundColor: '#BE123C' }]}
              >
                <Ionicons name="heart" size={26} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.previewModeNoteRow}>
              <View style={styles.previewYellowDot} />
              <Text style={styles.previewModeNoteText}>
                PREVIEW MODE • DISCOVERY ACTIONS DISABLED
              </Text>
            </View>
          </BrutalBox>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  backNavRow: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  screenHeader: {
    paddingTop: 4,
    paddingBottom: 4,
    gap: 4,
  },
  previewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  screenHeading: {
    fontFamily: typography.fonts.black,
    fontSize: 28,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  screenSubheading: {
    fontFamily: typography.fonts.medium,
    fontSize: 13,
    color: '#555555',
    letterSpacing: 0.1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 85,
  },
  container: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 18,
  },
  fullWidth: {
    width: '100%',
  },
  howOthersSeePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.accentYellow,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  howOthersSeeText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 11,
    color: '#000',
    letterSpacing: 0.5,
  },
  /* Hero Dating Card */
  heroCardContent: {
    overflow: 'hidden',
    paddingBottom: 16,
    position: 'relative',
  },
  storyIndicatorsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingTop: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  storyDash: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  storyDashActive: {
    backgroundColor: colors.primaryPink,
  },
  realBadgeHero: {
    position: 'absolute',
    top: 24,
    right: 14,
    zIndex: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentYellow,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  realBadgeHeroText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 11,
    color: '#000',
  },
  heroImageWrapper: {
    width: '100%',
    height: 280,
    backgroundColor: '#FDF2F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInfoOverlay: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 8,
  },
  nameProRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroNameText: {
    fontFamily: typography.fonts.black,
    fontSize: 28,
    color: colors.textDark,
    letterSpacing: -0.5,
  },
  proBadge: {
    backgroundColor: colors.primaryPink,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  proBadgeText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  badgesUnderNameRow: {
    flexDirection: 'row',
    gap: 8,
  },
  activeTodayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EAB308',
  },
  activeTodayText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 10,
    color: '#000',
    letterSpacing: 0.5,
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E2DCFE',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  distanceText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 10,
    color: '#000',
    letterSpacing: 0.5,
  },
  /* Vibe Banner */
  vibeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  vibePercentCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vibePercentNumber: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 15,
    color: colors.accentYellow,
    letterSpacing: -0.5,
  },
  vibeTextCol: {
    flex: 1,
  },
  vibeBannerTitle: {
    fontFamily: typography.bodyBold,
    fontSize: 14,
    color: colors.textDark,
  },
  vibeBannerSub: {
    fontFamily: typography.fonts.bold,
    fontSize: 12,
    color: '#1F2937',
    marginTop: 2,
  },
  /* Voice Note Card */
  voiceNoteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  voicePlayCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  voiceTextCol: {
    flex: 1,
    gap: 4,
  },
  voicePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceTagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  voiceTagText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  voiceDurationText: {
    fontFamily: typography.fonts.bold,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  voiceQuoteText: {
    fontFamily: typography.fonts.bold,
    fontSize: 13,
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  waveBar: {
    width: 3.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  /* Manifesto & Card Wrappers */
  cardWrapper: {
    position: 'relative',
    marginTop: 8,
  },
  floatingBadgeYellow: {
    position: 'absolute',
    top: -12,
    left: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentYellow,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  floatingBadgeText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 11,
    color: '#000',
    letterSpacing: 0.5,
  },
  manifestoContent: {
    padding: 18,
    paddingTop: 20,
  },
  manifestoBody: {
    fontFamily: typography.fonts.bold,
    fontSize: 15,
    color: colors.textDark,
    lineHeight: 22,
  },
  /* Prompt Cards */
  promptCardContent: {
    padding: 16,
    gap: 10,
  },
  promptTagPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  promptTagText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 11,
    color: '#000',
    letterSpacing: 0.5,
  },
  promptResponseText: {
    fontFamily: typography.bodyBold,
    fontSize: 15,
    color: colors.textDark,
    lineHeight: 22,
  },
  /* Obsessions & Rig */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionHeading: {
    fontFamily: typography.fonts.black,
    fontSize: 18,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  tagCountPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    paddingHorizontal: 8,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  tagCountText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 10,
    color: '#000',
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2.5, height: 2.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  tagChipText: {
    fontFamily: typography.fonts.bold,
    fontSize: 13,
    color: colors.textDark,
  },
  /* Bottom Preview Deck */
  previewDeckContent: {
    padding: 16,
    gap: 14,
    alignItems: 'center',
  },
  deckButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  deckCircleBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2.5, height: 2.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  previewModeNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewYellowDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.accentYellow,
  },
  previewModeNoteText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.5,
  },
});
