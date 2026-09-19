import React, { useEffect, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { LAYOUT } from '../theme/responsive';
import { DotGridBackground } from '../components/DotGridBackground';
import { BrutalBox } from '../components/BrutalBox';
import { OnboardingTopHeader } from '../components/OnboardingTopHeader';
import { OnboardingBottomBar } from '../components/OnboardingBottomBar';
import { UserAccount } from '../types/user';
import { NeoSlider } from '../components/NeoSlider';
import { fetchPreferences, savePreferences, updateProfile } from '../services/profile';
import { errorMessage } from '../services/errors';
import { toDbGender, toGenderLabel } from '../lib/gender';
import type { Enums } from '../types/database';

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

const INTENTION_BY_LABEL: Record<(typeof LOOKING_FOR_OPTIONS)[number], Enums<'intention_t'>> = {
  '★ LONG-TERM': 'long_term',
  'SHORT-TERM FUN': 'short_term',
  'NEW FRIENDS': 'friends',
  'FIGURING IT OUT': 'figuring_out',
};
const LABEL_BY_INTENTION = Object.fromEntries(
  Object.entries(INTENTION_BY_LABEL).map(([label, value]) => [value, label])
) as Record<Enums<'intention_t'>, (typeof LOOKING_FOR_OPTIONS)[number]>;

const AGE_SLIDER_MIN = 18;
const AGE_SLIDER_MAX = 60; // 60 means "60+" and is stored as 99
const DISTANCE_MIN = 2;
const DISTANCE_MAX = 100;

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

  // Resume: show what was saved earlier (a brand-new profile has no genders picked yet).
  useEffect(() => {
    let cancelled = false;
    fetchPreferences(user.id)
      .then((prefs) => {
        if (cancelled || prefs.interested_in.length === 0) return;
        setSelectedInterested(prefs.interested_in.map(toGenderLabel));
        setSelectedLookingFor(LABEL_BY_INTENTION[prefs.intention]);
        setMinAge(Math.max(AGE_SLIDER_MIN, prefs.min_age));
        setMaxAge(Math.min(AGE_SLIDER_MAX, prefs.max_age));
        setDistanceKm(Math.min(DISTANCE_MAX, Math.max(DISTANCE_MIN, prefs.max_distance_km)));
      })
      .catch(() => undefined); // keep the defaults if the read fails
    return () => {
      cancelled = true;
    };
  }, [user.id]);

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
      await savePreferences(user.id, {
        interested_in: selectedInterested.map(toDbGender),
        intention: INTENTION_BY_LABEL[selectedLookingFor as keyof typeof INTENTION_BY_LABEL],
        min_age: minAge,
        max_age: maxAge >= AGE_SLIDER_MAX ? 99 : maxAge,
        max_distance_km: distanceKm,
      });
      onNext(await updateProfile(user, { onboarding_step: 5 }));
    } catch (e) {
      Alert.alert('Could not save', errorMessage(e));
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
                  <Text style={styles.floatingLabelText}>INTERESTED IN (SELECT ALL THAT APPLY)</Text>
                </View>

                <View style={styles.optionsCol}>
                  {INTERESTED_OPTIONS.map((opt) => {
                    const isSelected = selectedInterested.includes(opt);
                    return (
                      <TouchableOpacity
                        key={opt}
                        activeOpacity={0.8}
                        onPress={() => toggleInterested(opt)}
                      >
                        <BrutalBox
                          backgroundColor={isSelected ? colors.accentYellow : '#FFFFFF'}
                          borderColor={colors.borderBlack}
                          borderWidth={2.2}
                          borderRadius={14}
                          shadowOffset={isSelected ? { x: 3, y: 3 } : { x: 2, y: 2 }}
                          contentStyle={styles.optionRowContent}
                        >
                          <View style={styles.optionLeftRow}>
                            <View
                              style={[
                                styles.checkboxSquare,
                                isSelected && styles.checkboxSquareSelected,
                              ]}
                            >
                              {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                            </View>
                            <Text
                              style={[
                                styles.optionText,
                                isSelected && styles.optionTextSelected,
                              ]}
                            >
                              {opt}
                            </Text>
                          </View>
                          {isSelected && (
                            <View style={styles.activeMiniBadge}>
                              <Text style={styles.activeMiniBadgeText}>MATCH</Text>
                            </View>
                          )}
                        </BrutalBox>
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
                  <Ionicons name="flame" size={12} color={colors.textDark} />
                  <Text style={styles.floatingLabelText}>LOOKING FOR</Text>
                </View>

                <View style={styles.optionsCol}>
                  {LOOKING_FOR_OPTIONS.map((opt) => {
                    const isSelected = selectedLookingFor === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        activeOpacity={0.8}
                        onPress={() => setSelectedLookingFor(opt)}
                      >
                        <BrutalBox
                          backgroundColor={isSelected ? '#C7D2FE' : '#FFFFFF'}
                          borderColor={colors.borderBlack}
                          borderWidth={2.2}
                          borderRadius={14}
                          shadowOffset={isSelected ? { x: 3, y: 3 } : { x: 2, y: 2 }}
                          contentStyle={styles.optionRowContent}
                        >
                          <View style={styles.optionLeftRow}>
                            <View
                              style={[
                                styles.radioCircle,
                                isSelected && styles.radioCircleSelected,
                              ]}
                            >
                              {isSelected && <View style={styles.radioDot} />}
                            </View>
                            <Text
                              style={[
                                styles.optionText,
                                isSelected && styles.optionTextSelected,
                              ]}
                            >
                              {opt}
                            </Text>
                          </View>
                          {isSelected && (
                            <Ionicons name="sparkles" size={16} color={colors.primaryPink} />
                          )}
                        </BrutalBox>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </BrutalBox>
            </View>

            {/* 6. AGE RANGE SLIDER Card */}
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
                  <Ionicons name="calendar" size={12} color={colors.textDark} />
                  <Text style={styles.floatingLabelText}>AGE RANGE</Text>
                </View>

                <View style={styles.sliderHeaderRow}>
                  <Text style={styles.sliderLabelTitle}>TARGET AGES</Text>
                  <View style={styles.purpleRangeBadge}>
                    <Text style={styles.purpleRangeText}>
                      {minAge} — {maxAge >= AGE_SLIDER_MAX ? '60+' : maxAge} YRS
                    </Text>
                  </View>
                </View>

                <NeoSlider
                  min={AGE_SLIDER_MIN}
                  max={AGE_SLIDER_MAX}
                  values={[minAge, maxAge]}
                  minGap={2}
                  onChange={(v) => {
                    if (v.length === 2) {
                      setMinAge(v[0]);
                      setMaxAge(v[1]);
                    }
                  }}
                  accessibilityLabel="Age"
                />

                <View style={styles.sliderFooterRow}>
                  <Text style={styles.sliderLimitText}>18</Text>
                  <Text style={styles.sliderSubLabel}>DRAG TO ADJUST</Text>
                  <Text style={styles.sliderLimitText}>60+</Text>
                </View>
              </BrutalBox>
            </View>

            {/* 7. MAXIMUM DISTANCE Card */}
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
                  <Ionicons name="navigate" size={12} color={colors.textDark} />
                  <Text style={styles.floatingLabelText}>MAXIMUM DISTANCE</Text>
                </View>

                <View style={styles.sliderHeaderRow}>
                  <Text style={styles.sliderLabelTitle}>DISCOVERY RADIUS</Text>
                  <View style={styles.yellowDistanceBadge}>
                    <Ionicons name="location-sharp" size={12} color={colors.textDark} />
                    <Text style={styles.yellowDistanceText}>UP TO {distanceKm} KM</Text>
                  </View>
                </View>

                <NeoSlider
                  min={DISTANCE_MIN}
                  max={DISTANCE_MAX}
                  values={[distanceKm]}
                  fillColor={colors.accentYellow}
                  onChange={(v) => setDistanceKm(v[0])}
                  accessibilityLabel="Maximum distance in kilometres"
                />

                <View style={styles.sliderFooterRow}>
                  <Text style={styles.sliderLimitText}>2 KM</Text>
                  <Text style={styles.sliderSubLabel}>LOCAL NEIGHBORHOOD</Text>
                  <Text style={styles.sliderLimitText}>100 KM</Text>
                </View>
              </BrutalBox>
            </View>

            {/* 8. Discovery Feed Preview Banner */}
            <BrutalBox
              backgroundColor="#C7D2FE"
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
        </View>
      </ScrollView>

      {/* Pinned Bottom Action Buttons */}
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
  optionsCol: {
    gap: 8,
    marginTop: 4,
  },
  optionRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  checkboxSquare: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSquareSelected: {
    backgroundColor: '#000000',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.borderBlack,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryPink,
  },
  optionText: {
    fontSize: 13.5,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
    letterSpacing: 0.3,
  },
  optionTextSelected: {
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  activeMiniBadge: {
    backgroundColor: '#000000',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeMiniBadgeText: {
    fontSize: 9.5,
    fontFamily: typography.bodyExtraBold,
    color: '#FFE600',
    letterSpacing: 0.5,
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
});
