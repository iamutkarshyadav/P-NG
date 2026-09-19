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
import Svg, { Circle, Path, G, Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { LAYOUT } from '../../theme/responsive';
import { DotGridBackground } from '../../components/DotGridBackground';
import { BrutalBox } from '../../components/BrutalBox';
import { UserAccount } from '../../services/authDb';

interface ProfilePreviewScreenProps {
  user: UserAccount;
  onBack: () => void;
}

function AlexHeroIllustration() {
  return (
    <Svg width="100%" height="280" viewBox="0 0 340 280">
      {/* City/Coffee shop background aesthetic */}
      <Rect x="0" y="0" width="340" height="280" fill="#FDF2F8" />

      {/* Decorative city signs / background grid */}
      <Rect x="20" y="30" width="60" height="90" fill="#FCE7F3" stroke="#F472B6" strokeWidth="1" />
      <Rect x="260" y="40" width="65" height="110" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" />
      <SvgText x="30" y="52" fontSize="7.5" fill="#9D174D" fontWeight="bold">
        COFFEE & TAPE
      </SvgText>

      {/* Character body */}
      <G transform="translate(70, 30)">
        {/* Denim Jacket body */}
        <Path
          d="M 20 180 L 40 120 Q 100 110 160 120 L 180 180 Z"
          fill="#3B82F6"
          stroke="#000"
          strokeWidth="2.8"
        />
        {/* Jacket collar and red inner shirt */}
        <Path d="M 70 118 L 100 148 L 130 118" fill="#EF4444" stroke="#000" strokeWidth="2.5" />
        <Path d="M 50 120 L 80 160" stroke="#1D4ED8" strokeWidth="2" />
        <Path d="M 150 120 L 120 160" stroke="#1D4ED8" strokeWidth="2" />

        {/* Neck */}
        <Rect x="85" y="96" width="30" height="26" fill="#FDE68A" stroke="#000" strokeWidth="2" />

        {/* Face */}
        <Circle cx="100" cy="75" r="38" fill="#FED7AA" stroke="#000" strokeWidth="2.8" />

        {/* Dark Hair peeking */}
        <Path
          d="M 64 65 Q 58 85 68 95"
          stroke="#18181B"
          strokeWidth="4.5"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M 136 65 Q 142 85 132 95"
          stroke="#18181B"
          strokeWidth="4.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Yellow Beanie */}
        <Path
          d="M 62 58 Q 100 22 138 58 L 140 68 Q 100 62 60 68 Z"
          fill="#F59E0B"
          stroke="#000"
          strokeWidth="2.8"
        />
        {/* Beanie lines */}
        <Path d="M 75 48 L 78 64" stroke="#D97706" strokeWidth="2" />
        <Path d="M 90 38 L 92 63" stroke="#D97706" strokeWidth="2" />
        <Path d="M 110 38 L 108 63" stroke="#D97706" strokeWidth="2" />
        <Path d="M 125 48 L 122 64" stroke="#D97706" strokeWidth="2" />

        {/* Eyebrows */}
        <Path d="M 78 68 Q 88 63 94 69" stroke="#18181B" strokeWidth="3" fill="none" strokeLinecap="round" />
        <Path d="M 106 69 Q 112 63 122 68" stroke="#18181B" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Eyes with sparkle */}
        <Circle cx="86" cy="77" r="4.5" fill="#18181B" />
        <Circle cx="114" cy="77" r="4.5" fill="#18181B" />
        <Circle cx="84.5" cy="75" r="1.8" fill="#FFF" />
        <Circle cx="112.5" cy="75" r="1.8" fill="#FFF" />

        {/* Nose */}
        <Path d="M 100 76 L 97 86 L 103 86" stroke="#92400E" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Warm confident smirk */}
        <Path d="M 86 94 Q 100 106 114 94" stroke="#991B1B" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <Path d="M 90 95 Q 100 101 110 95" fill="#FFF" />

        {/* Ear & Earring */}
        <Circle cx="138" cy="80" r="3.5" fill="#FED7AA" stroke="#000" strokeWidth="1.8" />
        <Circle cx="139" cy="83" r="1.8" fill="#FFE600" stroke="#000" strokeWidth="1" />
      </G>
    </Svg>
  );
}

export const ProfilePreviewScreen: React.FC<ProfilePreviewScreenProps> = ({
  user,
  onBack,
}) => {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const displayName = user.name || 'ALEX';
  const displayAge = user.age || 26;
  const displayBio =
    user.bio && user.bio.trim().length > 0
      ? user.bio
      : 'Beach walks at sunrise, ridiculously spicy carnitas tacos, indie cinema retrospectives, and patching analog modular synthesizers till 3AM. If you know how to build a tape loop, we’re officially locked in.';

  const handleVoiceToggle = () => {
    setIsPlayingVoice(!isPlayingVoice);
  };

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
              <Text style={styles.screenHeading}>PROFILE PREVIEW</Text>
              <View style={styles.howOthersSeePill}>
                <Feather name="eye" size={12} color="#000" />
                <Text style={styles.howOthersSeeText}>HOW OTHERS SEE YOU</Text>
              </View>
            </View>
            <Text style={styles.screenSubheading}>This is how potential matches view your card stack and prompts</Text>
          </View>

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
            <View style={styles.storyIndicatorsRow}>
              <View style={[styles.storyDash, styles.storyDashActive]} />
              <View style={styles.storyDash} />
              <View style={styles.storyDash} />
              <View style={styles.storyDash} />
            </View>

            {/* 100% REAL Floating Top Badge */}
            <View style={styles.realBadgeHero}>
              <Ionicons name="shield-checkmark" size={13} color="#000" />
              <Text style={styles.realBadgeHeroText}>100% REAL</Text>
            </View>

            {/* Hero Illustration */}
            <View style={styles.heroImageWrapper}>
              <AlexHeroIllustration />
            </View>

            {/* Profile Info Overlay at bottom of Hero Card */}
            <View style={styles.heroInfoOverlay}>
              <View style={styles.nameProRow}>
                <Text style={styles.heroNameText}>{displayName.toUpperCase()}, {displayAge}</Text>
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </View>

              <View style={styles.badgesUnderNameRow}>
                <View style={styles.activeTodayPill}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeTodayText}>ACTIVE TODAY</Text>
                </View>

                <View style={styles.distancePill}>
                  <Feather name="navigation" size={11} color="#000" />
                  <Text style={styles.distanceText}>UNDER 3 KM AWAY</Text>
                </View>
              </View>
            </View>
          </BrutalBox>

          {/* 4. VIBE COMPATIBILITY BANNER */}
          <BrutalBox
            backgroundColor={colors.accentYellow}
            borderColor={colors.borderBlack}
            borderWidth={2.8}
            borderRadius={20}
            shadowOffset={{ x: 4, y: 4 }}
            style={styles.fullWidth}
            contentStyle={styles.vibeBannerContent}
          >
            <View style={styles.vibePercentCircle}>
              <Text style={styles.vibePercentNumber}>94%</Text>
            </View>

            <View style={styles.vibeTextCol}>
              <Text style={styles.vibeBannerTitle}>VIBE COMPATIBILITY</Text>
              <Text style={styles.vibeBannerSub}>
                You both obsess over analog synths & flea markets!
              </Text>
            </View>

            <Ionicons name="flash" size={24} color="#000" />
          </BrutalBox>

          {/* 5. VOICE NOTE PLAYER CARD */}
          <BrutalBox
            backgroundColor="#9F1239"
            borderColor={colors.borderBlack}
            borderWidth={2.8}
            borderRadius={20}
            shadowOffset={{ x: 4, y: 4 }}
            style={styles.fullWidth}
            contentStyle={styles.voiceNoteContent}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleVoiceToggle}
              style={styles.voicePlayCircle}
            >
              <Ionicons
                name={isPlayingVoice ? 'pause' : 'play'}
                size={22}
                color="#BE123C"
                style={{ marginLeft: isPlayingVoice ? 0 : 3 }}
              />
            </TouchableOpacity>

            <View style={styles.voiceTextCol}>
              <View style={styles.voicePillRow}>
                <View style={styles.voiceTagPill}>
                  <Text style={styles.voiceTagText}>VOICE NOTE</Text>
                </View>
                <Text style={styles.voiceDurationText}>0:18</Text>
              </View>

              <Text style={styles.voiceQuoteText}>
                "How I take my coffee & record shop lore"
              </Text>
            </View>

            {/* Sound waveform graphic */}
            <View style={styles.waveformRow}>
              <View style={[styles.waveBar, { height: 12 }]} />
              <View style={[styles.waveBar, { height: 22 }]} />
              <View style={[styles.waveBar, { height: 16 }]} />
              <View style={[styles.waveBar, { height: 28 }]} />
              <View style={[styles.waveBar, { height: 20 }]} />
              <View style={[styles.waveBar, { height: 24 }]} />
              <View style={[styles.waveBar, { height: 14 }]} />
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

          {/* 7. PROMPT CARD 1: MY IDEAL SUNDAY */}
          <BrutalBox
            backgroundColor="#FCE7F3"
            borderColor={colors.borderBlack}
            borderWidth={2.8}
            borderRadius={20}
            shadowOffset={{ x: 4, y: 4 }}
            style={styles.fullWidth}
            contentStyle={styles.promptCardContent}
          >
            <View style={styles.promptTagPill}>
              <Text style={styles.promptTagText}>MY IDEAL SUNDAY ☕</Text>
            </View>
            <Text style={styles.promptResponseText}>
              Grabbing double-shot flat whites and hunting dusty Japanese jazz fusion vinyls at neighbourhood flea markets.
            </Text>
          </BrutalBox>

          {/* 8. PROMPT CARD 2: CONVERSATION STARTER */}
          <BrutalBox
            backgroundColor="#EDE9FE"
            borderColor={colors.borderBlack}
            borderWidth={2.8}
            borderRadius={20}
            shadowOffset={{ x: 4, y: 4 }}
            style={styles.fullWidth}
            contentStyle={styles.promptCardContent}
          >
            <View style={styles.promptTagPill}>
              <Text style={styles.promptTagText}>CONVERSATION STARTER 📻</Text>
            </View>
            <Text style={styles.promptResponseText}>
              Tell me the objectively worst pop song you secretly crank with zero remorse when driving solo.
            </Text>
          </BrutalBox>

          {/* 9. OBSESSIONS & RIG */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>OBSESSIONS & RIG</Text>
            <View style={styles.tagCountPill}>
              <Text style={styles.tagCountText}>6 TAGS</Text>
            </View>
          </View>

          <View style={styles.tagsContainer}>
            <View style={[styles.tagChip, { backgroundColor: '#FFFFFF' }]}>
              <Text style={styles.tagChipText}>☕ Flat White Purist</Text>
            </View>

            <View style={[styles.tagChip, { backgroundColor: colors.accentYellow }]}>
              <Text style={styles.tagChipText}>💛 🧗 Bouldering 6B</Text>
            </View>

            <View style={[styles.tagChip, { backgroundColor: '#FFFFFF' }]}>
              <Text style={styles.tagChipText}>📻 Modular Synths</Text>
            </View>

            <View style={[styles.tagChip, { backgroundColor: '#E2DCFE' }]}>
              <Text style={styles.tagChipText}>✪ 📐 Bauhaus Design</Text>
            </View>

            <View style={[styles.tagChip, { backgroundColor: '#FFFFFF' }]}>
              <Text style={styles.tagChipText}>🍣 Omakase Nights</Text>
            </View>

            <View style={[styles.tagChip, { backgroundColor: '#FFD5E5' }]}>
              <Text style={styles.tagChipText}>📷 35mm Point & Shoot</Text>
            </View>
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
