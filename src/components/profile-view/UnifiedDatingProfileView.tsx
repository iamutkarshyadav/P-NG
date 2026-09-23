// src/components/profile-view/UnifiedDatingProfileView.tsx
// Master Bumble-Level Unified Profile Presentation Engine
// Single source of truth for Discovery, Likes, Chat, and User Settings Live Preview.

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { BrutalBox } from '../BrutalBox';
import { LifestyleBadges } from '../LifestyleBadges';
import { DatingProfileMediaPromptCard } from './DatingProfileMediaPromptCard';
import { DatingProfileTagsShowcase } from './DatingProfileTagsShowcase';
import { useSignedUrls } from '../../hooks/useSignedUrls';
import { paletteFor } from '../../lib/palette';
import { distanceLabel } from '../../lib/format';
import { languageLabel, formatHeightBadge } from '../../types/lifestyle';
import type { FeedProfile, SwipeAction } from '../../services/discover';
import type { UserAccount } from '../../types/user';
import type { ProfilePromptItem } from '../../types/prompts';
import type { VibeTag } from '../../services/tags';

export interface UnifiedDatingProfileViewProps {
  profile: FeedProfile | UserAccount;
  photoUrls?: string[];
  prompts?: ProfilePromptItem[];
  tags?: (string | VibeTag)[];
  isLivePreview?: boolean;
  onAction?: (action: SwipeAction) => void;
  onRewind?: () => void;
  pingsLeft?: number;
}

function PortraitPlaceholder({ seed }: { seed: string }) {
  const p = paletteFor(seed);
  return (
    <Svg width="100%" height="100%" viewBox="0 0 340 380" preserveAspectRatio="xMidYMid slice">
      <Rect width="340" height="380" fill={p.bgFrom} />
      <Circle cx="170" cy="140" r="54" fill={p.flat} stroke="#000" strokeWidth="3" />
      <Path d="M 112 135 Q 170 65 228 135 Q 195 105 170 110 Q 145 105 112 135 Z" fill={p.hair} />
      <Path d="M 50 380 Q 70 240 170 240 Q 270 240 290 380 Z" fill={p.jacket} stroke="#000" strokeWidth="3" />
    </Svg>
  );
}

export const UnifiedDatingProfileView: React.FC<UnifiedDatingProfileViewProps> = ({
  profile,
  photoUrls = [],
  prompts = [],
  tags = [],
  isLivePreview = false,
  onAction,
  onRewind,
  pingsLeft,
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);

  // Extract prompt photo paths to resolve signed URLs
  const promptPhotoPaths = prompts.map((p) => p.photoPath).filter((p): p is string => Boolean(p));
  const promptSignedUrls = useSignedUrls(promptPhotoPaths);

  const displayName = profile.name;
  const displayAge = profile.age;
  const displayBio = profile.bio && profile.bio.trim().length > 0 ? profile.bio : null;
  const isVerified = 'isVerifiedReal' in profile ? Boolean(profile.isVerifiedReal) : Boolean((profile as FeedProfile).isVerified);
  const heightCm = 'heightCm' in profile && typeof profile.heightCm === 'number' ? profile.heightCm : null;
  const heightText = formatHeightBadge(heightCm);

  const dist = 'distanceKm' in profile ? (profile as FeedProfile).distanceKm : null;
  const distanceText = dist != null ? distanceLabel(dist) : null;
  const cityText = profile.city ? profile.city.toUpperCase() : null;
  const locationPillText = [distanceText, cityText].filter(Boolean).join(' • ');

  const pronouns = 'pronouns' in profile && typeof profile.pronouns === 'string' ? profile.pronouns : null;
  const occupation = 'occupation' in profile && typeof profile.occupation === 'string' ? profile.occupation : null;
  const hometown = 'hometown' in profile && typeof profile.hometown === 'string' ? profile.hometown : null;
  const languages = 'languages' in profile && Array.isArray(profile.languages) ? profile.languages : [];
  const anthemTrack = 'anthemTrack' in profile && typeof profile.anthemTrack === 'string' ? profile.anthemTrack : null;
  const anthemArtist = 'anthemArtist' in profile && typeof profile.anthemArtist === 'string' ? profile.anthemArtist : null;

  const currentHeroPhoto = photoUrls.length > 0 ? photoUrls[Math.min(photoIndex, photoUrls.length - 1)] : undefined;
  const secondaryPhotos = photoUrls.slice(1);

  const photo2Caption = 'photo2Prompt' in profile && typeof profile.photo2Prompt === 'string' ? profile.photo2Prompt : null;
  const photo3Caption = 'photo3Prompt' in profile && typeof profile.photo3Prompt === 'string' ? profile.photo3Prompt : null;

  const captionForIndex = (idx: number): string | null => {
    if (idx === 0) return photo2Caption;
    if (idx === 1) return photo3Caption;
    return null;
  };

  const handleNextPhoto = () => {
    if (photoUrls.length > 1) {
      setPhotoIndex((prev) => (prev + 1) % photoUrls.length);
    }
  };

  const handlePrevPhoto = () => {
    if (photoUrls.length > 1) {
      setPhotoIndex((prev) => (prev - 1 + photoUrls.length) % photoUrls.length);
    }
  };

  const handleDisabledAction = () => {
    // Non-interactive in live preview
  };

  return (
    <View style={styles.container}>
      {/* ── 1. HERO DATING CARD ─────────────────────────────────────────── */}
      <BrutalBox
        backgroundColor="#FFFFFF"
        borderColor={colors.borderBlack}
        borderWidth={3}
        borderRadius={26}
        shadowOffset={{ x: 4, y: 4 }}
        style={styles.fullWidth}
        contentStyle={styles.heroCardContent}
      >
        {/* Story Progress Indicator Dashes */}
        {photoUrls.length > 1 && (
          <View style={styles.storyIndicatorsRow}>
            {photoUrls.map((_, i) => (
              <TouchableOpacity
                key={`dash-${i}`}
                style={[styles.storyDash, i === photoIndex && styles.storyDashActive]}
                onPress={() => setPhotoIndex(i)}
                accessibilityLabel={`View photo ${i + 1}`}
              />
            ))}
          </View>
        )}

        {/* 100% REAL Floating Top Badge */}
        {isVerified && (
          <View style={styles.realBadgeHero}>
            <Ionicons name="shield-checkmark" size={13} color="#000" />
            <Text style={styles.realBadgeHeroText}>100% REAL</Text>
          </View>
        )}

        {/* Hero Photo with Tap Navigation */}
        <View style={styles.heroImageWrapper}>
          {currentHeroPhoto ? (
            <Image
              source={{ uri: currentHeroPhoto }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <PortraitPlaceholder seed={profile.id} />
          )}

          {/* Left & Right Tap Zones for Story Navigation */}
          {photoUrls.length > 1 && (
            <>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.heroTapZoneLeft}
                onPress={handlePrevPhoto}
                accessibilityLabel="Previous photo"
              />
              <TouchableOpacity
                activeOpacity={1}
                style={styles.heroTapZoneRight}
                onPress={handleNextPhoto}
                accessibilityLabel="Next photo"
              />
            </>
          )}
        </View>

        {/* Profile Info Overlay at Bottom of Hero Card */}
        <View style={styles.heroInfoOverlay}>
          <View style={styles.nameProRow}>
            <Text style={styles.heroNameText}>
              {displayName.toUpperCase()}
              {displayAge ? `, ${displayAge}` : ''}
            </Text>
          </View>

          {/* Neo-Brutalist Identity Stickers Deck (Directly below user name on main card) */}
          <View style={styles.heroBadgesDeck}>
            {pronouns ? (
              <View style={[styles.neoBadge, styles.neoBadgeLilac]}>
                <Text style={styles.neoBadgeText}>{pronouns.toUpperCase()}</Text>
              </View>
            ) : null}

            {occupation ? (
              <View style={[styles.neoBadge, styles.neoBadgeYellow]}>
                <Feather name="briefcase" size={12} color="#000" style={styles.neoBadgeIcon} />
                <Text style={styles.neoBadgeText}>{occupation.toUpperCase()}</Text>
              </View>
            ) : null}

            {hometown ? (
              <View style={[styles.neoBadge, styles.neoBadgeRose]}>
                <Feather name="home" size={12} color="#000" style={styles.neoBadgeIcon} />
                <Text style={styles.neoBadgeText}>FROM {hometown.toUpperCase()}</Text>
              </View>
            ) : null}

            {locationPillText ? (
              <View style={[styles.neoBadge, styles.neoBadgeMint]}>
                <Feather name="map-pin" size={12} color="#000" style={styles.neoBadgeIcon} />
                <Text style={styles.neoBadgeText}>{locationPillText}</Text>
              </View>
            ) : null}

            {heightText ? (
              <View style={[styles.neoBadge, styles.neoBadgeCream]}>
                <MaterialCommunityIcons name="ruler" size={12} color="#000" style={styles.neoBadgeIcon} />
                <Text style={styles.neoBadgeText}>{heightText}</Text>
              </View>
            ) : null}

            {languages && languages.length > 0 ? (
              <View style={[styles.neoBadge, styles.neoBadgeWhite]}>
                <Feather name="globe" size={12} color="#000" style={styles.neoBadgeIcon} />
                <Text style={styles.neoBadgeText}>
                  {languages.map((l) => languageLabel(l).toUpperCase()).join(' • ')}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </BrutalBox>

      {/* ── 2. ABOUT ME & MANIFESTO CARD ────────────────────────────────── */}
      {displayBio ? (
        <View style={styles.cardWrapper}>
          <View style={styles.floatingBadgeYellow}>
            <Ionicons name="flash" size={12} color="#000" />
            <Text style={styles.floatingBadgeText}>ABOUT ME & MANIFESTO</Text>
          </View>

          <BrutalBox
            backgroundColor="#FFFFFF"
            borderColor={colors.borderBlack}
            borderWidth={2.8}
            borderRadius={22}
            shadowOffset={{ x: 4, y: 4 }}
            style={styles.fullWidth}
            contentStyle={styles.manifestoContent}
          >
            <Text style={styles.manifestoBody}>{displayBio}</Text>
          </BrutalBox>
        </View>
      ) : null}

      {/* ── 3. THE VITALS & LIFESTYLE (Bumble Stack) ─────────────────────── */}
      <LifestyleBadges profile={profile} variant="full" />

      {/* ── 4. PROFILE ANTHEM ───────────────────────────────────────────── */}
      {anthemTrack ? (
        <View style={styles.cardWrapper}>
          <View style={styles.floatingBadgeYellow}>
            <Ionicons name="musical-notes" size={12} color="#000" />
            <Text style={styles.floatingBadgeText}>MY ANTHEM</Text>
          </View>

          <BrutalBox
            backgroundColor="#FFFFFF"
            borderColor={colors.borderBlack}
            borderWidth={2.8}
            borderRadius={22}
            shadowOffset={{ x: 4, y: 4 }}
            style={styles.fullWidth}
            contentStyle={styles.anthemCardContent}
          >
            <View style={styles.anthemCardRow}>
              <View style={styles.anthemIconWrap}>
                <Ionicons name="disc" size={26} color="#1DB954" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.anthemTrackName}>{anthemTrack}</Text>
                {anthemArtist ? (
                  <Text style={styles.anthemArtistName}>{anthemArtist}</Text>
                ) : null}
              </View>
              <View style={styles.anthemBadgeSmall}>
                <Ionicons name="play" size={14} color="#000" />
              </View>
            </View>
          </BrutalBox>
        </View>
      ) : null}

      {/* ── 5. MEDIA PROMPTS & SECONDARY PHOTOS ─────────────────────────── */}
      {prompts.map((prompt, idx) => {
        const pUrl = prompt.photoPath ? promptSignedUrls[prompt.photoPath] : null;
        const matchingPhoto = secondaryPhotos[idx];
        const caption = captionForIndex(idx);

        return (
          <React.Fragment key={`prompt-sec-${prompt.slot}`}>
            {/* Prompt Card (with or without attached photo) */}
            <DatingProfileMediaPromptCard
              prompt={prompt}
              photoUrl={pUrl}
              onSuperPing={!isLivePreview && onAction ? () => onAction('superping') : undefined}
            />

            {/* Interleaved Secondary Photo with Caption */}
            {matchingPhoto && (
              <View style={styles.cardWrapper}>
                <BrutalBox
                  backgroundColor="#FFFFFF"
                  borderColor={colors.borderBlack}
                  borderWidth={2.8}
                  borderRadius={24}
                  shadowOffset={{ x: 4, y: 4 }}
                  style={styles.fullWidth}
                  contentStyle={styles.secondaryPhotoContent}
                >
                  <View style={styles.secondaryPhotoWrapper}>
                    <Image
                      source={{ uri: matchingPhoto }}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                      transition={150}
                    />
                    <View style={styles.photoIndexBadge}>
                      <Text style={styles.photoIndexBadgeText}>PHOTO 0{idx + 2}</Text>
                    </View>
                  </View>

                  {caption ? (
                    <View style={styles.photoCaptionWrap}>
                      <Text style={styles.photoCaptionText}>&ldquo;{caption}&rdquo;</Text>
                      {!isLivePreview && onAction && (
                        <BrutalBox
                          backgroundColor={colors.primaryPink}
                          borderColor={colors.borderBlack}
                          borderWidth={2.2}
                          borderRadius={14}
                          shadowOffset={{ x: 2.5, y: 2.5 }}
                          onPress={() => onAction('like')}
                          contentStyle={styles.pingMomentBtn}
                        >
                          <Ionicons name="heart" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                          <Text style={styles.pingMomentText}>P!NG THIS MOMENT</Text>
                        </BrutalBox>
                      )}
                    </View>
                  ) : null}
                </BrutalBox>
              </View>
            )}
          </React.Fragment>
        );
      })}

      {/* ── 6. OBSESSIONS & VIBES BENTO SHOWCASE ─────────────────────────── */}
      <DatingProfileTagsShowcase tags={tags} />

      {/* ── 7. BOTTOM ACTION DECK ───────────────────────────────────────── */}
      {isLivePreview ? (
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
            <TouchableOpacity activeOpacity={0.8} onPress={handleDisabledAction} style={styles.deckCircleBtn}>
              <Ionicons name="close" size={28} color="#DC2626" />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} onPress={handleDisabledAction} style={styles.deckCircleBtn}>
              <Ionicons name="reload" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleDisabledAction}
              style={[styles.deckCircleBtn, { backgroundColor: colors.accentYellow }]}
            >
              <Ionicons name="star" size={26} color="#000" />
            </TouchableOpacity>
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
      ) : onAction ? (
        <View style={styles.floatingActionBarWrap}>
          {pingsLeft !== undefined && (
            <View style={styles.pingsCountPill}>
              <Ionicons name="flash" size={13} color="#000" />
              <Text style={styles.pingsCountText}>{pingsLeft} SUPER P!NGS LEFT</Text>
            </View>
          )}

          <View style={styles.floatingActionButtonsRow}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => onAction('pass')} style={styles.activeDeckBtn}>
              <Ionicons name="close" size={30} color="#DC2626" />
            </TouchableOpacity>

            {onRewind && (
              <TouchableOpacity activeOpacity={0.8} onPress={onRewind} style={styles.activeDeckBtn}>
                <Ionicons name="reload" size={24} color="#000" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onAction('superping')}
              style={[styles.activeDeckBtn, { backgroundColor: colors.accentYellow }]}
            >
              <Ionicons name="star" size={26} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onAction('like')}
              style={[styles.activeDeckBtn, { backgroundColor: '#BE123C' }]}
            >
              <Ionicons name="heart" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 18,
    paddingBottom: 24,
  },
  fullWidth: {
    width: '100%',
  },
  /* Hero Card */
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
    backgroundColor: '#FFFFFF',
    height: 5,
  },
  realBadgeHero: {
    position: 'absolute',
    top: 24,
    left: 14,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.accentYellow,
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
  realBadgeHeroText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 10,
    color: '#000',
    letterSpacing: 0.5,
  },
  heroImageWrapper: {
    width: '100%',
    height: 380,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  heroTapZoneLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '40%',
    zIndex: 5,
  },
  heroTapZoneRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '60%',
    zIndex: 5,
  },
  heroInfoOverlay: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 10,
  },
  nameProRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroNameText: {
    fontFamily: typography.fonts.black,
    fontSize: 28,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  heroBadgesDeck: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },
  neoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  neoBadgeIcon: {
    marginRight: 5,
  },
  neoBadgeText: {
    fontFamily: typography.headline,
    fontSize: 11.5,
    color: '#000000',
    letterSpacing: 0.5,
  },
  neoBadgeLilac: {
    backgroundColor: '#EDE9FE',
  },
  neoBadgeYellow: {
    backgroundColor: '#FEF08A',
  },
  neoBadgeRose: {
    backgroundColor: '#FFE4E6',
  },
  neoBadgeMint: {
    backgroundColor: '#CCFBF1',
  },
  neoBadgeCream: {
    backgroundColor: '#FEF3C7',
  },
  neoBadgeWhite: {
    backgroundColor: '#FFFFFF',
  },
  /* Card Wrapper & Floating Badge */
  cardWrapper: {
    position: 'relative',
    marginTop: 8,
    width: '100%',
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
    paddingVertical: 3.5,
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
    paddingTop: 22,
    gap: 14,
  },
  manifestoBody: {
    fontFamily: typography.fonts.bold,
    fontSize: 15.5,
    color: colors.textDark,
    lineHeight: 23,
  },

  /* Anthem Card */
  anthemCardContent: {
    padding: 16,
    paddingTop: 20,
  },
  anthemCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  anthemIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  anthemTrackName: {
    fontFamily: typography.fonts.black,
    fontSize: 16,
    color: colors.textDark,
    letterSpacing: 0.3,
  },
  anthemArtistName: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  anthemBadgeSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    backgroundColor: colors.accentYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* Secondary Photos */
  secondaryPhotoContent: {
    overflow: 'hidden',
  },
  secondaryPhotoWrapper: {
    width: '100%',
    height: 340,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  photoIndexBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  photoIndexBadgeText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 9.5,
    color: '#000',
    letterSpacing: 0.5,
  },
  photoCaptionWrap: {
    padding: 16,
    gap: 10,
  },
  photoCaptionText: {
    fontFamily: typography.fonts.bold,
    fontSize: 15,
    fontStyle: 'italic',
    color: colors.textDark,
    lineHeight: 21,
  },
  pingMomentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  pingMomentText: {
    fontFamily: typography.headline,
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  /* Preview Deck */
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
  /* Floating Action Bar (Discovery / Likes) */
  floatingActionBarWrap: {
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  pingsCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.accentYellow,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  pingsCountText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 11,
    color: '#000',
    letterSpacing: 0.5,
  },
  floatingActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  activeDeckBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.6,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
});
