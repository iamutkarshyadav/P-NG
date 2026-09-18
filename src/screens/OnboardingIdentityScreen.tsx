import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { DotGridBackground } from '../components/DotGridBackground';
import { BrutalBox } from '../components/BrutalBox';
import { OnboardingTopHeader } from '../components/OnboardingTopHeader';
import { UserAccount, authDb } from '../services/authDb';

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
    (user.gender as GenderOption) || 'WOMAN'
  );
  const [showGenderOnProfile, setShowGenderOnProfile] = useState<boolean>(
    user.showGenderOnProfile ?? true
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleNext = async () => {
    setIsSaving(true);
    try {
      const updated = await authDb.updateUserProfile(user.id, {
        gender: selectedGender,
        showGenderOnProfile,
      });

      if (updated) {
        onComplete(updated);
      } else {
        Alert.alert('Error', 'Could not save profile settings. Please try again.');
      }
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
                <MaterialCommunityIcons name="briefcase-outline" size={14} color={colors.textDark} />
                <Text style={styles.floatingLabelText}>I IDENTIFY AS</Text>
              </View>

              {/* 2x2 Grid of Neo-Brutalist Pill Buttons */}
              <View style={styles.genderGrid}>
                {GENDER_OPTIONS.map((g) => {
                  const isSelected = selectedGender === g;
                  return (
                    <View key={g} style={styles.genderPillCol}>
                      <BrutalBox
                        backgroundColor={isSelected ? colors.accentYellow : colors.cardWhite}
                        borderColor={colors.borderBlack}
                        borderWidth={2.4}
                        borderRadius={999}
                        shadowOffset={{ x: 2.5, y: 2.5 }}
                        onPress={() => setSelectedGender(g)}
                        contentStyle={styles.genderPillContent}
                      >
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={colors.textDark}
                            style={styles.checkIcon}
                          />
                        )}
                        <Text style={styles.genderPillText}>{g}</Text>
                      </BrutalBox>
                    </View>
                  );
                })}
              </View>
            </BrutalBox>
          </View>

          {/* 5. Visibility Toggle Card */}
          <BrutalBox
            backgroundColor={colors.cardWhite}
            borderColor={colors.borderBlack}
            borderWidth={2.4}
            borderRadius={20}
            shadowOffset={{ x: 3.5, y: 3.5 }}
            style={styles.fullWidth}
            contentStyle={styles.toggleCardContent}
          >
            <View style={styles.eyeIconSquare}>
              <Feather name="eye" size={20} color={colors.primaryPink} />
            </View>

            <View style={styles.toggleInfoCol}>
              <Text style={styles.toggleTitleText}>Show gender on my profile</Text>
              <Text style={styles.toggleSubtitleText}>
                Others will see this next to your name
              </Text>
            </View>

            {/* Custom Neo-Brutalist Switch */}
            <TouchableOpacity
              activeOpacity={0.85}
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
      </ScrollView>

      {/* 7. Sticky Bottom CTA Button */}
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
    width: '37.5%', // Step 3 of 8
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
    fontWeight: '900',
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  genderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  genderPillCol: {
    width: '48%',
  },
  genderPillContent: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  checkIcon: {
    marginRight: 6,
  },
  genderPillText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  toggleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  eyeIconSquare: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleInfoCol: {
    flex: 1,
    gap: 2,
  },
  toggleTitleText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textDark,
  },
  toggleSubtitleText: {
    fontSize: 11.5,
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#333',
    flex: 1,
    lineHeight: 16,
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
    fontSize: 22,
    color: colors.textDark,
    fontFamily: typography.headline,
    letterSpacing: 0.8,
  },
});
