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
import { UserAccount } from '../../types/user';

interface DiscoverScreenProps {
  user: UserAccount;
}

interface DiscoverProfile {
  id: string;
  name: string;
  age: number;
  distance: string;
  activeStatus: string;
  replyRate: string;
  tags: string[];
  bioPrompt?: string;
  jacketColor: string;
  bgGradient: [string, string];
}

const PROFILES: DiscoverProfile[] = [
  {
    id: 'p1',
    name: 'PRIYA',
    age: 27,
    distance: 'UNDER 5 KM',
    activeStatus: 'ACTIVE TODAY',
    replyRate: 'USUALLY REPLIES',
    tags: ['Analog Vinyl', '35mm Film', 'Moog Synths'],
    jacketColor: '#FFE600',
    bgGradient: ['#E51760', '#BE185D'],
  },
  {
    id: 'p2',
    name: 'SORA',
    age: 24,
    distance: '2 KM AWAY',
    activeStatus: 'ACTIVE NOW',
    replyRate: 'REPLIES INSTANTLY',
    tags: ['Bouldering', 'Indie Gigs', 'Matcha'],
    jacketColor: '#38BDF8',
    bgGradient: ['#4F46E5', '#312E81'],
  },
  {
    id: 'p3',
    name: 'ELENA',
    age: 25,
    distance: '1.2 KM AWAY',
    activeStatus: 'ACTIVE TODAY',
    replyRate: 'USUALLY REPLIES',
    tags: ['Modernist Design', 'Coffee', 'Surfing'],
    jacketColor: '#F43F5E',
    bgGradient: ['#F59E0B', '#B45309'],
  },
];

// Vector character for Priya (Yellow leather jacket, sunglasses, choker, neon backdrop)
function PriyaIllustration({ jacketColor, bg1, bg2 }: { jacketColor: string; bg1: string; bg2: string }) {
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

export const DiscoverScreen: React.FC<DiscoverScreenProps> = () => {
  const [profileIndex, setProfileIndex] = useState(0);
  const [pingsLeft, setPingsLeft] = useState(18);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const currentProfile = PROFILES[profileIndex % PROFILES.length];

  const handleHeart = () => {
    if (pingsLeft <= 0) {
      Alert.alert('Out of P!NGs', 'You have used all 18 pings for today! Come back tomorrow.');
      return;
    }
    setPingsLeft((prev) => prev - 1);
    Alert.alert('⚡ P!NG SENT!', `You sent a genuine P!NG to ${currentProfile.name}!`);
    setProfileIndex((prev) => prev + 1);
    setActivePhotoIndex(0);
  };

  const handlePass = () => {
    setProfileIndex((prev) => prev + 1);
    setActivePhotoIndex(0);
  };

  const handleRewind = () => {
    if (profileIndex > 0) {
      setProfileIndex((prev) => prev - 1);
    } else {
      Alert.alert('First Profile', "You're already at the start of your feed.");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* ========================================================================= */}
        {/* 1. MAIN DATING CARD (Matching ref/inApp.png with Neo-Brutalist Yellow Stack) */}
        {/* ========================================================================= */}
        <View style={styles.cardStackWrapper}>
          {/* Yellow layered frame peeking out on left & bottom */}
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
            {/* Top Image & Visual Section */}
            <View style={styles.photoContainer}>
              <PriyaIllustration
                jacketColor={currentProfile.jacketColor}
                bg1={currentProfile.bgGradient[0]}
                bg2={currentProfile.bgGradient[1]}
              />

              {/* Floating "100% REAL" Badge (Top Left) */}
              <View style={styles.verifiedBadgeWrapper}>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-done" size={13} color={colors.textDark} />
                  <Text style={styles.verifiedBadgeText}>100% REAL</Text>
                </View>
              </View>

              {/* Photo Carousel Indicators: ● ○ ○ ○ (Top Right) */}
              <View style={styles.photoDotsPill}>
                {[0, 1, 2, 3].map((idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    onPress={() => setActivePhotoIndex(idx)}
                    style={[
                      styles.photoDot,
                      activePhotoIndex === idx && styles.photoDotActive,
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Card Info Section */}
            <View style={styles.infoSection}>
              {/* Name, Age & Pink Flash Icon */}
              <View style={styles.nameRow}>
                <Text style={styles.nameTitle}>
                  {currentProfile.name}, {currentProfile.age}
                </Text>
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={24}
                  color={colors.primaryPink}
                />
              </View>

              {/* Status Badges Row */}
              <View style={styles.badgesRow}>
                {/* ACTIVE TODAY (Green Pill) */}
                <View style={styles.activePill}>
                  <View style={styles.greenDot} />
                  <Text style={styles.activePillText}>
                    {currentProfile.activeStatus}
                  </Text>
                </View>

                {/* DISTANCE (Lavender Pill) */}
                <View style={styles.distancePill}>
                  <Feather name="navigation" size={11} color={colors.textDark} />
                  <Text style={styles.distancePillText}>
                    {currentProfile.distance}
                  </Text>
                </View>
              </View>

              {/* Second Row: Reply Rate Badge */}
              <View style={styles.repliesPill}>
                <Text style={styles.repliesPillText}>
                  {currentProfile.replyRate}
                </Text>
              </View>

              {/* Interest Chips Row */}
              <View style={styles.chipsRow}>
                {currentProfile.tags.map((tag, idx) => (
                  <View key={idx} style={styles.interestChip}>
                    <Text style={styles.interestChipText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </BrutalBox>
        </View>

        {/* ========================================================================= */}
        {/* 2. ACTION CONTROLS (Below Card) */}
        {/* ========================================================================= */}
        <View style={styles.controlsSection}>
          {/* Yellow Daily P!NGs Left Badge */}
          <BrutalBox
            backgroundColor={colors.accentYellow}
            borderColor={colors.borderBlack}
            borderWidth={2}
            borderRadius={999}
            shadowOffset={{ x: 2.5, y: 2.5 }}
            contentStyle={styles.pingsLeftContent}
          >
            <MaterialCommunityIcons name="lightning-bolt" size={14} color={colors.textDark} />
            <Text style={styles.pingsLeftText}>
              {pingsLeft} P!NGS LEFT TODAY
            </Text>
          </BrutalBox>

          {/* 3 Circular Action Buttons */}
          <View style={styles.actionButtonsRow}>
            {/* Rewind ↺ */}
            <BrutalBox
              backgroundColor={colors.cardWhite}
              borderColor={colors.borderBlack}
              borderWidth={2.4}
              borderRadius={999}
              shadowOffset={{ x: 3, y: 3 }}
              onPress={handleRewind}
              contentStyle={styles.sideActionBtn}
            >
              <Feather name="rotate-ccw" size={22} color={colors.textDark} />
            </BrutalBox>

            {/* Send P!NG Heart ❤️ */}
            <BrutalBox
              backgroundColor={colors.primaryPink}
              borderColor={colors.borderBlack}
              borderWidth={2.6}
              borderRadius={999}
              shadowOffset={{ x: 3.5, y: 3.5 }}
              onPress={handleHeart}
              contentStyle={styles.centerHeartBtn}
            >
              <Ionicons name="heart" size={34} color="#FFFFFF" />
            </BrutalBox>

            {/* Pass ✕ */}
            <BrutalBox
              backgroundColor={colors.cardWhite}
              borderColor={colors.borderBlack}
              borderWidth={2.4}
              borderRadius={999}
              shadowOffset={{ x: 3, y: 3 }}
              onPress={handlePass}
              contentStyle={styles.sideActionBtn}
            >
              <Feather name="x" size={24} color={colors.textDark} />
            </BrutalBox>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
