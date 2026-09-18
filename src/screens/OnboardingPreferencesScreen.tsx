import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { DotGridBackground } from '../components/DotGridBackground';
import { BrutalBox } from '../components/BrutalBox';
import { OnboardingTopHeader } from '../components/OnboardingTopHeader';
import { UserAccount, authDb } from '../services/authDb';

interface OnboardingPreferencesScreenProps {
  user: UserAccount;
  onBack: () => void;
  onNext: (updatedUser: UserAccount) => void;
}

const INTERESTED_OPTIONS = ['WOMAN', 'MAN', 'NON-BINARY', 'OTHER'] as const;
const LOOKING_FOR_OPTIONS = [
  '★ LONG-TERM',
  'SHORT-TERM FUN',
  'NEW FRIENDS',
  'FIGURING IT OUT',
] as const;

export const OnboardingPreferencesScreen: React.FC<OnboardingPreferencesScreenProps> = ({
  user,
  onBack,
  onNext,
}) => {
  const [selectedInterested, setSelectedInterested] = useState<string[]>(['WOMAN']);
  const [selectedLookingFor, setSelectedLookingFor] = useState<string>('★ LONG-TERM');
  const [minAge, setMinAge] = useState<number>(24);
  const [maxAge, setMaxAge] = useState<number>(34);
  const [distanceKm, setDistanceKm] = useState<number>(25);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const toggleInterested = (item: string) => {
    if (selectedInterested.includes(item)) {
      if (selectedInterested.length > 1) {
        setSelectedInterested(selectedInterested.filter((i) => i !== item));
      }
    } else {
      setSelectedInterested([...selectedInterested, item]);
    }
  };

  const handleNext = async () => {
    setIsSaving(true);
    try {
      const updated = await authDb.updateUserProfile(user.id, {
        // Save preferences
      });
      onNext(updated || user);
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
          {/* 2. Step Badge Row */}
          <View style={styles.stepBadgeRow}>
            <BrutalBox
              backgroundColor={colors.accentYellow}
              borderColor={colors.borderBlack}
              borderWidth={2.2}
              borderRadius={999}
              shadowOffset={{ x: 2.2, y: 2.2 }}
              contentStyle={styles.stepBadgeContent}
            >
              <Ionicons name="compass" size={13} color={colors.textDark} />
              <Text style={styles.stepBadgeText}>STEP 04 / 08</Text>
            </BrutalBox>

            <View style={styles.vibeMatchingPill}>
              <View style={styles.vibeDot} />
              <Text style={styles.vibeMatchingText}>VIBE MATCHING</Text>
            </View>
          </View>

          {/* 3. Headline */}
          <View style={styles.headlineWrapper}>
            <Text style={styles.headlineText}>WHO DO YOU WANT TO SEE?</Text>
            <View style={styles.subtitleRow}>
              <Ionicons name="heart-outline" size={14} color={colors.primaryPink} style={{ marginTop: 2 }} />
              <Text style={styles.subtitleText}>
                Pick everyone you'd like in your Discovery feed.
              </Text>
            </View>
          </View>

          {/* 4. INTERESTED IN Card */}
          <View style={styles.cardOuterWrapper}>
            <BrutalBox
              backgroundColor={colors.cardWhite}
              borderColor={colors.borderBlack}
              borderWidth={2.8}
              borderRadius={20}
              shadowOffset={{ x: 4, y: 4 }}
              overflow="visible"
              style={styles.fullWidth}
              contentStyle={styles.cardContent}
            >
              <View style={styles.floatingLabel}>
                <Ionicons name="people" size={12} color={colors.textDark} />
                <Text style={styles.floatingLabelText}>INTERESTED IN</Text>
              </View>

              <View style={styles.grid2x2}>
                {INTERESTED_OPTIONS.map((opt) => {
                  const isSelected = selectedInterested.includes(opt);
                  return (
                    <TouchableOpacity
                      key={opt}
                      activeOpacity={0.85}
                      onPress={() => toggleInterested(opt)}
                      style={[
                        styles.selectPill,
                        isSelected ? styles.selectPillActiveYellow : styles.selectPillInactive,
                      ]}
                    >
                      <Text style={styles.selectPillText}>{opt}</Text>
                      <View
                        style={[
                          styles.checkCircle,
                          isSelected ? styles.checkCircleActive : styles.checkCircleInactive,
                        ]}
                      >
                        {isSelected && <Ionicons name="checkmark" size={13} color="#FFF" />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </BrutalBox>
          </View>

          {/* 5. LOOKING FOR Card */}
          <View style={styles.cardOuterWrapper}>
            <BrutalBox
              backgroundColor={colors.cardWhite}
              borderColor={colors.borderBlack}
              borderWidth={2.8}
              borderRadius={20}
              shadowOffset={{ x: 4, y: 4 }}
              overflow="visible"
              style={styles.fullWidth}
              contentStyle={styles.cardContent}
            >
              <View style={styles.floatingLabel}>
                <Feather name="search" size={12} color={colors.textDark} />
                <Text style={styles.floatingLabelText}>LOOKING FOR</Text>
              </View>

              <View style={styles.grid2x2}>
                {LOOKING_FOR_OPTIONS.map((opt) => {
                  const isSelected = selectedLookingFor === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      activeOpacity={0.85}
                      onPress={() => setSelectedLookingFor(opt)}
                      style={[
                        styles.selectPill,
                        isSelected ? styles.selectPillActivePink : styles.selectPillInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.selectPillText,
                          isSelected && styles.selectPillTextWhite,
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </BrutalBox>
          </View>

          {/* 6. AGE RANGE Card */}
          <View style={styles.cardOuterWrapper}>
            <BrutalBox
              backgroundColor={colors.cardWhite}
              borderColor={colors.borderBlack}
              borderWidth={2.8}
              borderRadius={20}
              shadowOffset={{ x: 4, y: 4 }}
              overflow="visible"
              style={styles.fullWidth}
              contentStyle={styles.cardContent}
            >
              <View style={styles.floatingLabel}>
                <MaterialCommunityIcons name="cake-variant" size={12} color={colors.textDark} />
                <Text style={styles.floatingLabelText}>AGE RANGE</Text>
              </View>

              <View style={styles.sliderHeaderRow}>
                <Text style={styles.sliderLabelTitle}>Target Peers</Text>
                <View style={styles.purpleRangeBadge}>
                  <Ionicons name="flash" size={12} color={colors.textDark} />
                  <Text style={styles.purpleRangeText}>{minAge} - {maxAge}</Text>
                </View>
              </View>

              {/* Slider Track Visual */}
              <View style={styles.trackContainer}>
                <View style={styles.sliderTrackBg}>
                  <View style={[styles.sliderTrackFillPink, { left: '20%', right: '40%' }]} />
                </View>
                <View style={[styles.sliderThumb, { left: '18%' }]}>
                  <View style={styles.thumbCenterDot} />
                </View>
                <View style={[styles.sliderThumb, { left: '58%' }]}>
                  <View style={styles.thumbCenterDot} />
                </View>
              </View>

              <View style={styles.sliderFooterRow}>
                <Text style={styles.sliderLimitText}>18 YRS</Text>
                <Text style={styles.sliderSubLabel}>SWEET SPOT</Text>
                <Text style={styles.sliderLimitText}>50+ YRS</Text>
              </View>
            </BrutalBox>
          </View>

          {/* 7. MAX DISTANCE Card */}
          <View style={styles.cardOuterWrapper}>
            <BrutalBox
              backgroundColor={colors.cardWhite}
              borderColor={colors.borderBlack}
              borderWidth={2.8}
              borderRadius={20}
              shadowOffset={{ x: 4, y: 4 }}
              overflow="visible"
              style={styles.fullWidth}
              contentStyle={styles.cardContent}
            >
              <View style={styles.floatingLabel}>
                <Feather name="navigation" size={12} color={colors.textDark} />
                <Text style={styles.floatingLabelText}>MAX DISTANCE</Text>
              </View>

              <View style={styles.sliderHeaderRow}>
                <Text style={styles.sliderLabelTitle}>Search Radius</Text>
                <View style={styles.yellowDistanceBadge}>
                  <Ionicons name="location" size={12} color={colors.textDark} />
                  <Text style={styles.yellowDistanceText}>WITHIN {distanceKm} KM</Text>
                </View>
              </View>

              {/* Distance Slider Track */}
              <View style={styles.trackContainer}>
                <View style={styles.sliderTrackBg}>
                  <View style={[styles.sliderTrackFillYellow, { width: '35%' }]} />
                </View>
                <View style={[styles.sliderThumb, { left: '33%' }]}>
                  <View style={styles.thumbCenterDot} />
                </View>
              </View>

              <View style={styles.sliderFooterRow}>
                <Text style={styles.sliderLimitText}>2 KM</Text>
                <Text style={styles.sliderSubLabel}>NEIGHBORHOOD</Text>
                <Text style={styles.sliderLimitText}>100 KM</Text>
              </View>
            </BrutalBox>
          </View>

          {/* 8. EXPANDED DISCOVERY READY Notice Card */}
          <BrutalBox
            backgroundColor="#FFE5EE"
            borderColor={colors.borderBlack}
            borderWidth={2.4}
            borderRadius={18}
            shadowOffset={{ x: 3, y: 3 }}
            style={styles.fullWidth}
            contentStyle={styles.discoveryCardContent}
          >
            <View style={styles.discoveryIconCircle}>
              <Ionicons name="flash" size={18} color="#FFFFFF" />
            </View>

            <View style={styles.discoveryTextCol}>
              <Text style={styles.discoveryTitle}>EXPANDED DISCOVERY READY</Text>
              <Text style={styles.discoverySub}>
                You'll see ~140 active profiles right away!
              </Text>
            </View>

            <View style={styles.boostedBadge}>
              <Text style={styles.boostedBadgeText}>BOOSTED</Text>
            </View>
          </BrutalBox>
        </View>
      </ScrollView>

      {/* 9. Sticky Bottom CTA Button */}
      <View style={styles.bottomCtaContainer}>
        <BrutalBox
          backgroundColor={colors.accentYellow}
          borderColor={colors.borderBlack}
          borderWidth={2.6}
          borderRadius={999}
          shadowOffset={{ x: 3.5, y: 3.5 }}
          onPress={handleNext}
          disabled={isSaving}
          contentStyle={styles.nextButtonContent}
        >
          <Text style={styles.nextButtonText}>
            {isSaving ? 'SAVING...' : 'NEXT ➔'}
          </Text>
        </BrutalBox>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgCream,
  },
  topNavContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: colors.bgCream,
    gap: 12,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
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
    width: '50%', // Step 4 of 8
    height: '100%',
    backgroundColor: colors.primaryPink,
    borderRadius: 999,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 110,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'flex-start',
    gap: 16,
  },
  fullWidth: {
    width: '100%',
  },
  stepBadgeRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
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
  vibeMatchingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5EE',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  vibeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primaryPink,
  },
  vibeMatchingText: {
    fontSize: 10.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  headlineWrapper: {
    width: '100%',
    gap: 0,
    marginTop: -8,
    paddingTop: 2,
    overflow: 'visible',
  },
  headlineText: {
    fontSize: 34,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.5,
    lineHeight: 38,
    paddingTop: 1,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  subtitleText: {
    fontSize: 13,
    fontFamily: typography.bodySemiBold,
    color: '#333',
    flex: 1,
    lineHeight: 18,
  },
  cardOuterWrapper: {
    width: '100%',
    marginTop: 8,
  },
  cardContent: {
    padding: 16,
    paddingTop: 24,
    gap: 12,
    position: 'relative',
    overflow: 'visible',
  },
  floatingLabel: {
    position: 'absolute',
    top: -14,
    left: 14,
    zIndex: 99,
    backgroundColor: colors.accentYellow,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 3.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  floatingLabelText: {
    fontSize: 10.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  selectPill: {
    width: '48%',
    height: 44,
    borderRadius: 999,
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    // Neo-brutalist shadow
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  selectPillInactive: {
    backgroundColor: '#FFFFFF',
  },
  selectPillActiveYellow: {
    backgroundColor: colors.accentYellow,
  },
  selectPillActivePink: {
    backgroundColor: colors.primaryPink,
  },
  selectPillText: {
    fontSize: 12.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  selectPillTextWhite: {
    color: '#FFFFFF',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    backgroundColor: '#000000',
  },
  checkCircleInactive: {
    backgroundColor: 'transparent',
  },
  sliderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sliderLabelTitle: {
    fontSize: 14,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  purpleRangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2DCFE',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  purpleRangeText: {
    fontSize: 13,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  yellowDistanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentYellow,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  yellowDistanceText: {
    fontSize: 11.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  trackContainer: {
    height: 28,
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 4,
  },
  sliderTrackBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    overflow: 'hidden',
  },
  sliderTrackFillPink: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.primaryPink,
  },
  sliderTrackFillYellow: {
    height: '100%',
    backgroundColor: colors.accentYellow,
  },
  sliderThumb: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbCenterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryPink,
  },
  sliderFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLimitText: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: '#666',
  },
  sliderSubLabel: {
    fontSize: 10.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  discoveryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  discoveryIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#9E0038',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoveryTextCol: {
    flex: 1,
    gap: 2,
  },
  discoveryTitle: {
    fontSize: 12,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  discoverySub: {
    fontSize: 11.5,
    fontFamily: typography.bodySemiBold,
    color: '#444',
  },
  boostedBadge: {
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  boostedBadgeText: {
    fontSize: 9.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  bottomCtaContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  nextButtonContent: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.8,
  },
});
