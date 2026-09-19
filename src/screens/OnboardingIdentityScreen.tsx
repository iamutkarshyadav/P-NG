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
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { LAYOUT } from '../theme/responsive';
import { DotGridBackground } from '../components/DotGridBackground';
import { BrutalBox } from '../components/BrutalBox';
import { OnboardingTopHeader } from '../components/OnboardingTopHeader';
import { OnboardingBottomBar } from '../components/OnboardingBottomBar';
import { UserAccount } from '../types/user';
import { updateProfile } from '../services/profile';
import { errorMessage } from '../services/errors';
import { toDbGender, toGenderLabel } from '../lib/gender';

interface OnboardingIdentityScreenProps {
  user: UserAccount;
  onBack: () => void;
  onComplete: (updatedUser: UserAccount) => void;
}

const GENDER_OPTIONS = ['WOMAN', 'MAN', 'NON-BINARY', 'OTHER'] as const;
type GenderOption = typeof GENDER_OPTIONS[number];

export const OnboardingIdentityScreen: React.FC<OnboardingIdentityScreenProps> = ({
  user,
  onBack,
  onComplete,
}) => {
  const [selectedGender, setSelectedGender] = useState<GenderOption>(
    user.gender ? (toGenderLabel(user.gender) as GenderOption) : 'WOMAN'
  );
  const [showGenderOnProfile, setShowGenderOnProfile] = useState<boolean>(
    user.showGenderOnProfile ?? true
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleNext = async () => {
    setIsSaving(true);
    try {
      onComplete(
        await updateProfile(user, {
          gender: toDbGender(selectedGender),
          show_gender: showGenderOnProfile,
          onboarding_step: 4,
        })
      );
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
                <Ionicons name="flash" size={13} color={colors.textDark} />
                <Text style={styles.stepBadgeText}>
                  STEP 03 / 08 • YOU DO YOU
                </Text>
              </BrutalBox>
            </View>

            {/* 3. Headline */}
            <View style={styles.headlineWrapper}>
              <Text style={styles.headlineLine1}>HOW DO YOU</Text>
              <Text style={styles.headlinePink}>IDENTIFY?</Text>
              <Text style={styles.subtitleText}>
                This helps us build your profile accurately.
              </Text>
            </View>

            {/* 4. Identity Selection Card */}
            <View style={styles.cardOuterWrapper}>
              <BrutalBox
                backgroundColor={colors.cardWhite}
                borderColor={colors.borderBlack}
                borderWidth={2.8}
                borderRadius={22}
                shadowOffset={{ x: 4, y: 4 }}
                overflow="visible"
                style={styles.fullWidth}
                contentStyle={styles.identityCardContent}
              >
                {/* Overlapping Floating Yellow Label */}
                <View style={styles.floatingLabel}>
                  <Text style={styles.floatingLabelText}>SELECT GENDER</Text>
                </View>

                {/* 4 Gender Options */}
                <View style={styles.optionsCol}>
                  {GENDER_OPTIONS.map((opt) => {
                    const isSelected = selectedGender === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        activeOpacity={0.8}
                        onPress={() => setSelectedGender(opt)}
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
                            <Ionicons
                              name="checkmark"
                              size={18}
                              color={colors.textDark}
                            />
                          )}
                        </BrutalBox>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </BrutalBox>
            </View>

            {/* 5. Profile Visibility Card */}
            <BrutalBox
              backgroundColor={colors.cardWhite}
              borderColor={colors.borderBlack}
              borderWidth={2.4}
              borderRadius={18}
              shadowOffset={{ x: 3, y: 3 }}
              style={styles.fullWidth}
              contentStyle={styles.visibilityCardContent}
            >
              <View style={styles.visibilityTextCol}>
                <Text style={styles.visibilityTitle}>
                  SHOW GENDER ON PROFILE
                </Text>
                <Text style={styles.visibilitySubtext}>
                  Visible to other members viewing your cards
                </Text>
              </View>

              {/* Neo-brutalist custom switch */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowGenderOnProfile(!showGenderOnProfile)}
                style={[
                  styles.customSwitchTrack,
                  showGenderOnProfile ? styles.customSwitchTrackActive : styles.customSwitchTrackInactive,
                ]}
              >
                <View
                  style={[
                    styles.customSwitchKnob,
                    showGenderOnProfile ? styles.knobActive : styles.knobInactive,
                  ]}
                />
              </TouchableOpacity>
            </BrutalBox>

            {/* 6. Privacy Card */}
            <BrutalBox
              backgroundColor={colors.lavender}
              borderColor={colors.borderBlack}
              borderWidth={2.4}
              borderRadius={18}
              shadowOffset={{ x: 3, y: 3 }}
              style={styles.fullWidth}
              contentStyle={styles.privacyCardContent}
            >
              <View style={styles.lockIconCircle}>
                <Feather name="lock" size={16} color={colors.textDark} />
              </View>
              <Text style={styles.privacyCardText}>
                Your privacy matters. You can change visibility settings anytime from your profile editor.
              </Text>
            </BrutalBox>
          </View>
        </View>
      </ScrollView>

      {/* 7. Pinned Bottom Navigation Dual Buttons */}
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
    width: '37.5%', // Step 3 of 8
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
  headlineLine1: {
    fontSize: 34,
    color: colors.textDark,
    fontFamily: typography.headline,
    letterSpacing: 0.5,
    lineHeight: 38,
    paddingTop: 1,
  },
  headlinePink: {
    fontSize: 36,
    color: colors.primaryPink,
    fontFamily: typography.headline,
    letterSpacing: 0.5,
    lineHeight: 40,
    paddingTop: 1,
  },
  subtitleText: {
    fontSize: 13,
    fontFamily: typography.bodyMedium,
    color: '#333',
    marginTop: 4,
    lineHeight: 18,
  },
  cardOuterWrapper: {
    width: '100%',
    marginTop: 8,
  },
  identityCardContent: {
    padding: 16,
    paddingTop: 24,
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
    fontSize: 14,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
    letterSpacing: 0.3,
  },
  optionTextSelected: {
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  visibilityCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  visibilityTextCol: {
    flex: 1,
    gap: 2,
  },
  visibilityTitle: {
    fontSize: 13,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.3,
  },
  visibilitySubtext: {
    fontSize: 11.5,
    fontFamily: typography.bodyMedium,
    color: '#666',
  },
  customSwitchTrack: {
    width: 54,
    height: 30,
    borderRadius: 15,
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    padding: 2,
    justifyContent: 'center',
  },
  customSwitchTrackActive: {
    backgroundColor: colors.accentYellow,
  },
  customSwitchTrackInactive: {
    backgroundColor: '#E0DDD5',
  },
  customSwitchKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#000000',
  },
  knobActive: {
    alignSelf: 'flex-end',
  },
  knobInactive: {
    alignSelf: 'flex-start',
  },
  privacyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  lockIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyCardText: {
    fontSize: 12,
    fontFamily: typography.bodyMedium,
    color: '#333',
    flex: 1,
    lineHeight: 16,
  },
});
