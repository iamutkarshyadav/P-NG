import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { LAYOUT } from '../theme/responsive';
import { DotGridBackground } from '../components/DotGridBackground';
import { BrutalBox } from '../components/BrutalBox';
import { OnboardingTopHeader } from '../components/OnboardingTopHeader';
import { OnboardingBottomBar } from '../components/OnboardingBottomBar';
import { UserAccount, authDb } from '../services/authDb';

interface OnboardingNameScreenProps {
  user: UserAccount;
  onBack: () => void;
  onNext: (updatedUser: UserAccount) => void;
}

export const OnboardingNameScreen: React.FC<OnboardingNameScreenProps> = ({
  user,
  onBack,
  onNext,
}) => {
  const [name, setName] = useState(user.name || 'Alex');
  const [isSaving, setIsSaving] = useState(false);

  const handleNext = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }

    if (trimmed.length < 2) {
      Alert.alert('Invalid Name', 'Name must be at least 2 characters long.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await authDb.updateUserProfile(user.id, {
        name: trimmed,
      });

      if (updated) {
        onNext(updated);
      } else {
        Alert.alert('Error', 'Could not update name. Please try again.');
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
          <View style={styles.contentSection}>
            {/* 2. Step Badge & Dots Row */}
            <View style={styles.stepBadgeRow}>
              <BrutalBox
                backgroundColor={colors.accentYellow}
                borderColor={colors.borderBlack}
                borderWidth={2.2}
                borderRadius={999}
                shadowOffset={{ x: 2.2, y: 2.2 }}
                contentStyle={styles.stepBadgeContent}
              >
                <Ionicons name="flash" size={13} color={colors.textDark} />
                <Text style={styles.stepBadgeText}>STEP 02 / 08</Text>
              </BrutalBox>

              {/* 5 Dots: 2 filled, 3 unfilled */}
              <View style={styles.dotsRow}>
                <View style={[styles.dot, styles.dotFilled]} />
                <View style={[styles.dot, styles.dotFilled]} />
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </View>

            {/* 3. Headline */}
            <View style={styles.headlineWrapper}>
              <Text style={styles.headlineLine1}>WHAT SHOULD</Text>
              <Text style={styles.headlineLine2}>WE CALL YOU?</Text>
              <Text style={styles.subtitleText}>
                This is how you'll appear to other P!NG members.
              </Text>
            </View>

            {/* 4. Name Input Card */}
            <View style={styles.cardOuterWrapper}>
              <BrutalBox
                backgroundColor={colors.cardWhite}
                borderColor={colors.borderBlack}
                borderWidth={2.8}
                borderRadius={22}
                shadowOffset={{ x: 4, y: 4 }}
                overflow="visible"
                style={styles.fullWidth}
                contentStyle={styles.inputCardContent}
              >
                {/* Overlapping Floating Yellow Label */}
                <View style={styles.floatingLabel}>
                  <Text style={styles.floatingLabelText}>YOUR NAME</Text>
                </View>

                {/* Input Row with Avatar Placeholder & Character Counter */}
                <View style={styles.nameInputBox}>
                  <View style={styles.pinkAvatarPlaceholder} />
                  <TextInput
                    style={styles.nameTextInput}
                    value={name}
                    onChangeText={(val) => setName(val.slice(0, 20))}
                    placeholder="Your Name"
                    placeholderTextColor="#888"
                    maxLength={20}
                    autoCapitalize="words"
                  />
                  <View style={styles.charCountPill}>
                    <Text style={styles.charCountText}>{name.length}/20</Text>
                  </View>
                </View>

                {/* Privacy Guarantee Note */}
                <View style={styles.privacyNoteRow}>
                  <Feather name="shield" size={13} color="#059669" />
                  <Text style={styles.privacyNoteText}>
                    Real identity matters on P!NG. Use your authentic first name.
                  </Text>
                </View>
              </BrutalBox>
            </View>
          </View>
        </View>
      </ScrollView>

        {/* 6. Pinned Bottom Navigation Dual Buttons */}
        <View style={styles.bottomBarWrapper}>
          <OnboardingBottomBar
            onNext={handleNext}
            onSkip={() => handleNext()}
            isSaving={isSaving}
          />
        </View>
      </KeyboardAvoidingView>
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
    width: '25%', // Step 2 of 8
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
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: colors.borderBlack,
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
  headlineLine2: {
    fontSize: 34,
    color: colors.textDark,
    fontFamily: typography.headline,
    letterSpacing: 0.5,
    lineHeight: 38,
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
  inputCardContent: {
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
  },
  floatingLabelText: {
    fontSize: 10.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  nameInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    height: 52,
    paddingHorizontal: 12,
    gap: 10,
  },
  pinkAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FED7E2',
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
  },
  nameTextInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
  },
  charCountPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  charCountText: {
    fontSize: 10.5,
    fontFamily: typography.bodyBold,
    color: '#555',
  },
  privacyNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  privacyNoteText: {
    fontSize: 11.5,
    fontFamily: typography.bodyMedium,
    color: '#059669',
    flex: 1,
  },
  noticeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  noticeBannerText: {
    fontSize: 12.5,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
    flex: 1,
  },
});
