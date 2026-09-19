import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, {
  Circle,
  Rect,
  Path,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { LAYOUT } from '../theme/responsive';
import { DotGridBackground } from '../components/DotGridBackground';
import { BrutalBox } from '../components/BrutalBox';
import { OnboardingTopHeader } from '../components/OnboardingTopHeader';
import { OnboardingBottomBar } from '../components/OnboardingBottomBar';
import { UserAccount, authDb } from '../services/authDb';

interface OnboardingPhotosScreenProps {
  user: UserAccount;
  onBack: () => void;
  onNext: (updatedUser: UserAccount) => void;
}

// Stylized Vector Graphic for Slot 1 (Cyberpunk Anime Girl with Teal Hair & Headphones)
function Slot1Illustration() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 150 150">
      <Defs>
        <LinearGradient id="tealBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#14B8A6" />
          <Stop offset="100%" stopColor="#0D9488" />
        </LinearGradient>
      </Defs>
      <Rect width="150" height="150" fill="url(#tealBg)" rx="16" />

      {/* Cyberpunk Girl Vector Character */}
      <G transform="translate(15, 12)">
        {/* Hair Back */}
        <Path
          d="M 25 50 Q 10 75 18 100 Q 28 85 35 70 Z"
          fill="#06B6D4"
          stroke="#000"
          strokeWidth="2.5"
        />
        <Path
          d="M 95 50 Q 110 75 102 100 Q 92 85 85 70 Z"
          fill="#06B6D4"
          stroke="#000"
          strokeWidth="2.5"
        />

        {/* Headphones band */}
        <Path
          d="M 25 50 A 35 35 0 0 1 95 50"
          fill="none"
          stroke="#000"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <Path
          d="M 25 50 A 35 35 0 0 1 95 50"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Headphone ear pads */}
        <Rect x="20" y="44" width="10" height="18" rx="4" fill="#FFE600" stroke="#000" strokeWidth="2" />
        <Rect x="90" y="44" width="10" height="18" rx="4" fill="#FFE600" stroke="#000" strokeWidth="2" />

        {/* Face */}
        <Path
          d="M 35 48 Q 60 48 85 48 Q 88 80 60 92 Q 32 80 35 48 Z"
          fill="#FDDEC5"
          stroke="#000"
          strokeWidth="2.5"
        />

        {/* Hair Bangs */}
        <Path
          d="M 28 48 Q 45 60 55 52 Q 68 62 82 48 Q 92 42 90 32 Q 60 25 30 32 Z"
          fill="#22D3EE"
          stroke="#000"
          strokeWidth="2.2"
        />

        {/* Big Anime Eyes */}
        <Circle cx="47" cy="62" r="6.5" fill="#0F172A" />
        <Circle cx="73" cy="62" r="6.5" fill="#0F172A" />
        <Circle cx="45.5" cy="59.5" r="2.2" fill="#FFFFFF" />
        <Circle cx="71.5" cy="59.5" r="2.2" fill="#FFFFFF" />
        <Circle cx="49" cy="64" r="1.2" fill="#38BDF8" />
        <Circle cx="75" cy="64" r="1.2" fill="#38BDF8" />

        {/* Rosy Blush */}
        <Circle cx="40" cy="71" r="4.5" fill="#F43F5E" opacity="0.65" />
        <Circle cx="80" cy="71" r="4.5" fill="#F43F5E" opacity="0.65" />

        {/* Smile */}
        <Path d="M 54 74 Q 60 79 66 74" fill="none" stroke="#E11D48" strokeWidth="2.2" strokeLinecap="round" />

        {/* Yellow Hoop Earring */}
        <Circle cx="30" cy="66" r="6" fill="none" stroke="#FFE600" strokeWidth="2.5" />

        {/* Hoodie Shoulders */}
        <Path
          d="M 20 120 L 22 96 Q 60 90 98 96 L 100 120 Z"
          fill="#1E1B4B"
          stroke="#000"
          strokeWidth="2.5"
        />
        {/* Neon Patches on Hoodie */}
        <Rect x="68" y="98" width="22" height="12" rx="3" fill="#E51760" stroke="#000" strokeWidth="1.5" />
        {/* Sparkle badge */}
        <Path
          d="M 38 100 L 40 105 L 45 107 L 40 109 L 38 114 L 36 109 L 31 107 L 36 105 Z"
          fill="#FFE600"
          stroke="#000"
          strokeWidth="1.2"
        />
      </G>
    </Svg>
  );
}

// Stylized Vector Graphic for Slot 2 (Cyberpunk Guy with Glasses & City Mockup)
function Slot2Illustration() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 150 150">
      <Defs>
        <LinearGradient id="guyBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F5F3FF" />
          <Stop offset="100%" stopColor="#DDD6FE" />
        </LinearGradient>
      </Defs>
      <Rect width="150" height="150" fill="url(#guyBg)" rx="16" />

      {/* Cyberpunk Guy with Glasses */}
      <G transform="translate(15, 6)">
        {/* Japanese Graffiti on wall */}
        <Path d="M 75 14 L 88 14 M 82 14 L 82 26" stroke="#E51760" strokeWidth="2" strokeLinecap="round" />
        <Path d="M 94 14 L 104 22 M 104 14 L 94 22" stroke="#E51760" strokeWidth="2" strokeLinecap="round" />

        {/* Spiky Dark Hair */}
        <Path
          d="M 34 40 L 40 22 L 52 30 L 62 16 L 72 28 L 84 20 L 88 38 Z"
          fill="#18181B"
          stroke="#000"
          strokeWidth="2.5"
        />

        {/* Face */}
        <Path
          d="M 38 42 L 82 42 L 78 78 L 60 88 L 42 78 Z"
          fill="#FED7AA"
          stroke="#000"
          strokeWidth="2.5"
        />

        {/* Tinted Yellow Aviator Glasses */}
        <Rect x="40" y="46" width="18" height="12" rx="3" fill="#FACC15" opacity="0.8" stroke="#000" strokeWidth="2" />
        <Rect x="62" y="46" width="18" height="12" rx="3" fill="#FACC15" opacity="0.8" stroke="#000" strokeWidth="2" />
        <Path d="M 58 52 L 62 52" stroke="#000" strokeWidth="2" />

        {/* Smirk & Silver Chain */}
        <Path d="M 54 72 L 66 71" stroke="#000" strokeWidth="2" strokeLinecap="round" />
        <Path d="M 50 88 Q 60 98 70 88" fill="none" stroke="#CBD5E1" strokeWidth="2.5" />

        {/* Bomber Jacket with Pink Graphic */}
        <Path
          d="M 22 120 L 26 88 L 46 86 L 60 98 L 74 86 L 94 88 L 98 120 Z"
          fill="#09090B"
          stroke="#000"
          strokeWidth="2.5"
        />
        <Path d="M 30 96 L 44 94 L 42 108 Z" fill="#E51760" />
      </G>

      {/* Mini Mockup Banner overlay at bottom of card */}
      <Rect x="10" y="112" width="130" height="28" rx="6" fill="#FFFFFF" stroke="#000" strokeWidth="1.8" />
      <Rect x="48" y="126" width="54" height="10" rx="3" fill="#E51760" />
    </Svg>
  );
}

export const OnboardingPhotosScreen: React.FC<OnboardingPhotosScreenProps> = ({
  user,
  onBack,
  onNext,
}) => {
  const [photoCount, setPhotoCount] = useState<number>(2);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasExtraPhoto, setHasExtraPhoto] = useState<boolean>(false);

  const handleToggleExtra = () => {
    if (hasExtraPhoto) {
      setHasExtraPhoto(false);
      setPhotoCount(2);
    } else {
      setHasExtraPhoto(true);
      setPhotoCount(3);
    }
  };

  const handleNext = async () => {
    setIsSaving(true);
    try {
      const updated = await authDb.updateUserProfile(user.id, {
        // user profile photos synced
      });
      onNext(updated || user);
    } catch {
      Alert.alert('Error', 'Unable to save photos.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <DotGridBackground />

      {/* 1. Universal Neo-Brutalist Onboarding Top Header */}
      <OnboardingTopHeader onBack={onBack} user={user} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.contentSection}>
            {/* 2. Step Badge Pill */}
            <View style={styles.stepBadgeWrapper}>
              <BrutalBox
                backgroundColor={colors.accentYellow}
                borderColor={colors.borderBlack}
                borderWidth={2.2}
                borderRadius={999}
                shadowOffset={{ x: 2.2, y: 2.2 }}
                contentStyle={styles.stepBadgeContent}
              >
                <MaterialCommunityIcons name="lightning-bolt" size={15} color={colors.textDark} />
                <Text style={styles.stepBadgeText}>
                  STEP 05 / 08 • VIBE CHECK
                </Text>
              </BrutalBox>
            </View>

            {/* 3. Headline & Subtitle Row */}
            <View style={styles.headlineWrapper}>
              <Text style={styles.headlineTitle}>ADD YOUR PHOTOS</Text>
              <View style={styles.subtitleRow}>
                <Text style={styles.subtitleText}>Add at least 2 real photos</Text>
                <BrutalBox
                  backgroundColor="#FFD8E4"
                  borderColor={colors.borderBlack}
                  borderWidth={2}
                  borderRadius={999}
                  shadowOffset={{ x: 2, y: 2 }}
                  contentStyle={styles.soFarPillContent}
                >
                  <Text style={styles.soFarPillText}>{photoCount}/6 SO FAR</Text>
                </BrutalBox>
              </View>
            </View>

            {/* 4. 6-Slot Photo Grid */}
            <View style={styles.gridContainer}>
              {/* Slot 1: Primary Photo */}
              <View style={styles.gridItem}>
                <BrutalBox
                  backgroundColor="#14B8A6"
                  borderColor={colors.borderBlack}
                  borderWidth={2.6}
                  borderRadius={18}
                  shadowOffset={{ x: 3.5, y: 3.5 }}
                  overflow="visible"
                  contentStyle={styles.photoSlotContent}
                >
                  <Slot1Illustration />

                  {/* Floating Primary Badge */}
                  <View style={styles.primaryBadgeWrapper}>
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>★ PRIMARY</Text>
                    </View>
                  </View>

                  {/* Slot Number Badge */}
                  <View style={styles.slotIndexBadge}>
                    <Text style={styles.slotIndexText}>1</Text>
                  </View>

                  {/* Reorder Handle Icon */}
                  <View style={styles.reorderBadge}>
                    <MaterialCommunityIcons name="dots-grid" size={16} color={colors.textDark} />
                  </View>
                </BrutalBox>
              </View>

            {/* Slot 2: Second Photo */}
            <View style={styles.gridItem}>
              <BrutalBox
                backgroundColor="#FFFFFF"
                borderColor={colors.borderBlack}
                borderWidth={2.6}
                borderRadius={18}
                shadowOffset={{ x: 3.5, y: 3.5 }}
                overflow="visible"
                contentStyle={styles.photoSlotContent}
              >
                <Slot2Illustration />

                {/* Slot Number Badge */}
                <View style={styles.slotIndexBadge}>
                  <Text style={styles.slotIndexText}>2</Text>
                </View>

                {/* Reorder Handle Icon */}
                <View style={styles.reorderBadge}>
                  <MaterialCommunityIcons name="dots-grid" size={16} color={colors.textDark} />
                </View>
              </BrutalBox>
            </View>

            {/* Slot 3: Active Add Slot */}
            <View style={styles.gridItem}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleToggleExtra}
                style={[
                  styles.dashedSlot,
                  hasExtraPhoto && styles.extraSlotFilled,
                ]}
              >
                <View style={styles.dashedSlotIndex}>
                  <Text style={styles.dashedSlotIndexText}>3</Text>
                </View>

                <View style={styles.yellowAddCircle}>
                  <Feather
                    name={hasExtraPhoto ? 'check' : 'plus'}
                    size={24}
                    color={colors.textDark}
                  />
                </View>

                <Text style={styles.addPhotoLabel}>
                  {hasExtraPhoto ? 'ADDED' : 'ADD PHOTO'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Slot 4: Empty Slot */}
            <View style={styles.gridItem}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => Alert.alert('Add Photo', 'Tap Slot 3 to add your 3rd photo.')}
                style={styles.dashedSlot}
              >
                <View style={styles.dashedSlotIndex}>
                  <Text style={styles.dashedSlotIndexText}>4</Text>
                </View>
                <View style={styles.greyAddCircle}>
                  <Feather name="plus" size={18} color="#777" />
                </View>
                <Text style={styles.slotEmptyLabel}>SLOT 4</Text>
              </TouchableOpacity>
            </View>

            {/* Slot 5: Empty Slot */}
            <View style={styles.gridItem}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => Alert.alert('Add Photo', 'Tap Slot 3 to add your 3rd photo.')}
                style={styles.dashedSlot}
              >
                <View style={styles.dashedSlotIndex}>
                  <Text style={styles.dashedSlotIndexText}>5</Text>
                </View>
                <View style={styles.greyAddCircle}>
                  <Feather name="plus" size={18} color="#777" />
                </View>
                <Text style={styles.slotEmptyLabel}>SLOT 5</Text>
              </TouchableOpacity>
            </View>

            {/* Slot 6: Empty Slot */}
            <View style={styles.gridItem}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => Alert.alert('Add Photo', 'Tap Slot 3 to add your 3rd photo.')}
                style={styles.dashedSlot}
              >
                <View style={styles.dashedSlotIndex}>
                  <Text style={styles.dashedSlotIndexText}>6</Text>
                </View>
                <View style={styles.greyAddCircle}>
                  <Feather name="plus" size={18} color="#777" />
                </View>
                <Text style={styles.slotEmptyLabel}>SLOT 6</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 5. Tip Container */}
          <BrutalBox
            backgroundColor={colors.lavender}
            borderColor={colors.borderBlack}
            borderWidth={2.4}
            borderRadius={18}
            shadowOffset={{ x: 3.5, y: 3.5 }}
            style={styles.fullWidth}
            contentStyle={styles.tipCardContent}
          >
            <View style={styles.tipIconBadge}>
              <MaterialCommunityIcons name="lightbulb-on" size={18} color="#4338CA" />
            </View>
            <Text style={styles.tipText}>
              Your first photo is what people see on Discover. Make it punchy!
            </Text>
          </BrutalBox>

          {/* 6. Rules Container */}
          <BrutalBox
            backgroundColor={colors.cardWhite}
            borderColor={colors.borderBlack}
            borderWidth={2.2}
            borderRadius={16}
            shadowOffset={{ x: 3.5, y: 3.5 }}
            style={styles.fullWidth}
            contentStyle={styles.rulesCardContent}
          >
            <Text style={styles.rulesHeader}>RULES:</Text>
            <View style={styles.rulesItemsRow}>
              <Text style={styles.ruleItemText}>NO SUNGLASSES ONLY</Text>
              <View style={styles.ruleDot} />
              <Text style={styles.ruleItemText}>NO GROUP CONFUSION</Text>
              <View style={styles.ruleDot} />
              <Text style={styles.ruleItemText}>100% REAL</Text>
            </View>
          </BrutalBox>
          </View>
        </View>
      </ScrollView>

      {/* 7. Pinned Bottom Action Buttons */}
      <View style={styles.bottomBarWrapper}>
        <OnboardingBottomBar
          onNext={handleNext}
          onSkip={() => handleNext()}
          isSaving={isSaving}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgCream,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButtonContent: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniLogoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  miniLogoText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: typography.headline,
    letterSpacing: 0.5,
  },
  stepIndicatorText: {
    fontSize: 12.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.6,
  },
  avatarButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '62.5%', // Step 5 of 8
    height: '100%',
    backgroundColor: colors.primaryPink,
    borderRadius: 999,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    alignItems: 'flex-start',
    gap: 20,
  },
  bottomBarWrapper: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
  },
  contentSection: {
    width: '100%',
    alignItems: 'flex-start',
    gap: 18,
  },
  fullWidth: {
    width: '100%',
  },
  stepBadgeWrapper: {
    alignSelf: 'flex-start',
    marginTop: 0,
  },
  stepBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 6,
  },
  stepBadgeText: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  headlineWrapper: {
    width: '100%',
    gap: 0,
    marginTop: -8,
    paddingTop: 2,
    overflow: 'visible',
  },
  headlineTitle: {
    fontSize: 34,
    color: colors.textDark,
    fontFamily: typography.headline,
    letterSpacing: 0.5,
    lineHeight: 38,
    paddingTop: 1,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  subtitleText: {
    fontSize: 13,
    fontFamily: typography.bodyMedium,
    color: '#333',
  },
  soFarPillContent: {
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  soFarPillText: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },

  /* Photo Grid */
  gridContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  gridItem: {
    width: '48%',
    aspectRatio: 0.95,
  },
  photoSlotContent: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  primaryBadgeWrapper: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
  },
  primaryBadge: {
    backgroundColor: colors.accentYellow,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
  },
  primaryBadgeText: {
    fontSize: 9.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  slotIndexBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  slotIndexText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
  },
  reorderBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.6,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  /* Dashed Slots */
  dashedSlot: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    borderWidth: 2.2,
    borderStyle: 'dashed',
    borderColor: colors.borderBlack,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    gap: 6,
  },
  extraSlotFilled: {
    backgroundColor: '#FEF08A',
  },
  dashedSlotIndex: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.6,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedSlotIndexText: {
    fontSize: 10.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  yellowAddCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentYellow,
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    // hard offset shadow
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  greyAddCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.6,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoLabel: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  slotEmptyLabel: {
    fontSize: 10.5,
    fontFamily: typography.bodyBold,
    color: '#6B7280',
    letterSpacing: 0.4,
  },

  /* Tip Card */
  tipCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  tipIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
    lineHeight: 17,
  },

  /* Rules Card */
  rulesCardContent: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  rulesHeader: {
    fontSize: 10.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  rulesItemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  ruleItemText: {
    fontSize: 9.5,
    fontFamily: typography.bodyBold,
    color: '#4B5563',
    letterSpacing: 0.3,
  },
  ruleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primaryPink,
  },
});
