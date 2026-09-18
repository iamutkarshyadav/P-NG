import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { DotGridBackground } from '../components/DotGridBackground';
import { BrutalBox } from '../components/BrutalBox';
import { OnboardingTopHeader } from '../components/OnboardingTopHeader';
import { UserAccount, authDb } from '../services/authDb';

interface OnboardingBioScreenProps {
  user: UserAccount;
  onBack: () => void;
  onNext: (updatedUser: UserAccount) => void;
}

const PROMPT_SUGGESTIONS = [
  '☕ Coffee, code & late night concerts.',
  '🍕 The secret to winning me over is good food.',
  '🎧 Song on heavy repeat: synthwave playlists.',
  '✈️ Most spontaneous road trip ever taken.',
];

export const OnboardingBioScreen: React.FC<OnboardingBioScreenProps> = ({
  user,
  onBack,
  onNext,
}) => {
  const [bioText, setBioText] = useState<string>(
    user.bio || 'Coffee, code & concerts. Looking for real connections!'
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectPrompt = (prompt: string) => {
    setBioText(prompt);
  };

  const handleNext = async () => {
    if (!bioText.trim()) {
      Alert.alert('Bio Required', 'Please share a few words about yourself.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await authDb.updateUserProfile(user.id, {
        bio: bioText.trim(),
      });
      onNext(updated || user);
    } catch {
      Alert.alert('Error', 'Could not save bio.');
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
              <MaterialCommunityIcons name="lightning-bolt" size={15} color={colors.textDark} />
              <Text style={styles.stepBadgeText}>
                STEP 06 / 08 • VIBE PROMPT
              </Text>
            </BrutalBox>
          </View>

          {/* 3. Headline & Subtitle with Generous Headroom */}
          <View style={styles.headlineWrapper}>
            <Text style={styles.headlineTitle}>WHAT'S YOUR STORY?</Text>
            <Text style={styles.subtitleText}>
              Write a punchy bio or pick a quick conversation starter.
            </Text>
          </View>

          {/* 4. Main Bio Input Card */}
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
              {/* Floating Yellow Label */}
              <View style={styles.floatingLabel}>
                <Text style={styles.floatingLabelText}>YOUR PROFILE BIO</Text>
              </View>

              {/* Text Area */}
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textArea}
                  value={bioText}
                  onChangeText={setBioText}
                  placeholder="Tell potential matches what gets you excited..."
                  placeholderTextColor="#888"
                  multiline
                  numberOfLines={4}
                  maxLength={160}
                  textAlignVertical="top"
                />
              </View>

              {/* Character Counter */}
              <View style={styles.counterRow}>
                <Text style={styles.counterNote}>Keep it short, punchy and 100% real.</Text>
                <View style={styles.counterBadge}>
                  <Text style={styles.counterText}>{bioText.length}/160</Text>
                </View>
              </View>
            </BrutalBox>
          </View>

          {/* 5. Quick Prompt Starters */}
          <View style={styles.promptStartersWrapper}>
            <Text style={styles.startersHeader}>💡 QUICK STARTERS (TAP TO USE):</Text>
            <View style={styles.startersList}>
              {PROMPT_SUGGESTIONS.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={() => handleSelectPrompt(item)}
                  style={styles.starterChip}
                >
                  <BrutalBox
                    backgroundColor="#FFFFFF"
                    borderColor={colors.borderBlack}
                    borderWidth={1.8}
                    borderRadius={14}
                    shadowOffset={{ x: 2, y: 2 }}
                    contentStyle={styles.starterChipContent}
                  >
                    <Text style={styles.starterText}>"{item}"</Text>
                  </BrutalBox>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 6. Tip Banner */}
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
              <MaterialCommunityIcons name="lightning-bolt" size={17} color={colors.textDark} />
            </View>
            <Text style={styles.tipText}>
              Profiles with filled bios receive 3.2x more genuine pings!
            </Text>
          </BrutalBox>
        </View>
      </ScrollView>

      {/* 7. Bottom CTA */}
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
    width: '75%', // Step 6 of 8
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
    gap: 14,
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
  subtitleText: {
    fontSize: 13,
    fontFamily: typography.bodyMedium,
    color: '#333',
    lineHeight: 18,
  },

  /* Card */
  cardOuterWrapper: {
    width: '100%',
    marginTop: 8,
  },
  inputCardContent: {
    padding: 16,
    paddingTop: 24,
    position: 'relative',
    overflow: 'visible',
    gap: 12,
  },
  floatingLabel: {
    position: 'absolute',
    top: -13,
    left: 14,
    zIndex: 99,
    backgroundColor: colors.accentYellow,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  floatingLabelText: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  inputBox: {
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    borderRadius: 14,
    backgroundColor: '#FAFAFA',
    padding: 12,
    minHeight: 110,
  },
  textArea: {
    fontSize: 14,
    fontFamily: typography.bodyMedium,
    color: colors.textDark,
    lineHeight: 20,
    height: 90,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterNote: {
    fontSize: 11,
    fontFamily: typography.bodyMedium,
    color: '#6B7280',
  },
  counterBadge: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  counterText: {
    fontSize: 11,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
  },

  /* Prompt Starters */
  promptStartersWrapper: {
    width: '100%',
    gap: 8,
    marginTop: 4,
  },
  startersHeader: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  startersList: {
    gap: 8,
  },
  starterChip: {
    width: '100%',
  },
  starterChipContent: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  starterText: {
    fontSize: 12.5,
    fontFamily: typography.bodyMedium,
    color: colors.textDark,
  },

  /* Tip Card */
  tipCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  tipIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentYellow,
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

  /* Bottom CTA */
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
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.8,
  },
});
