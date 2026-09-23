import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { LAYOUT } from '../theme/responsive';
import { DotGridBackground } from '../components/DotGridBackground';
import { BrutalBox } from '../components/BrutalBox';
import { OnboardingTopHeader } from '../components/OnboardingTopHeader';
import { OnboardingBottomBar } from '../components/OnboardingBottomBar';
import { OnboardingHeadline } from '../components/OnboardingHeadline';
import { UserAccount } from '../types/user';
import { updateProfile } from '../services/profile';
import { errorMessage } from '../services/errors';
import { fetchPromptSuggestions } from '../services/tags';

interface OnboardingBioScreenProps {
  user: UserAccount;
  onBack: () => void;
  onNext: (updatedUser: UserAccount) => void;
}

const FALLBACK_PROMPTS = [
  'Coffee, code & late night concerts.',
  'The secret to winning me over is good food & honesty.',
  'Always looking for someone to explore hidden food spots with.',
  'Music on repeat, weekend road trips & good vibes only.',
];

export const OnboardingBioScreen: React.FC<OnboardingBioScreenProps> = ({
  user,
  onBack,
  onNext,
}) => {
  const [bioText, setBioText] = useState<string>(user.bio ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [prompts, setPrompts] = useState<string[]>(FALLBACK_PROMPTS);

  useEffect(() => {
    let cancelled = false;
    fetchPromptSuggestions()
      .then((list) => {
        if (!cancelled && list.length > 0) {
          const cleaned = list.map((item) =>
            item
              .replace(
                /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
                ''
              )
              .trim()
          );
          setPrompts(cleaned);
        }
      })
      .catch(() => undefined); // suggestions are optional; keep the fallbacks
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectPrompt = (prompt: string) => {
    setBioText(prompt);
  };

  const handleNext = async () => {
    const trimmed = bioText.trim();
    if (!trimmed) {
      Alert.alert('Bio Required', 'Write a short bio or tap one of the conversation starters below.');
      return;
    }

    setIsSaving(true);
    try {
      onNext(await updateProfile(user, { bio: trimmed, onboarding_step: 7 }));
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
      <OnboardingTopHeader onBack={onBack} onPrevStep={onBack} user={user} />

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
            {/* 2. Unified Headline with 5px Black Underline */}
            <OnboardingHeadline
              step="06"
              line1="WHAT&apos;S YOUR"
              focalWord="STORY &amp; VIBE?"
              subtitle="Write a punchy bio or pick a quick conversation starter."
            />

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
              <Text style={styles.startersHeader}>CONVERSATION STARTERS (TAP TO ADD):</Text>
              <View style={styles.startersList}>
                {prompts.map((item, index) => (
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

            {/* 6. Guidance Box */}
            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2.4}
              borderRadius={16}
              shadowOffset={{ x: 3.5, y: 3.5 }}
              style={styles.fullWidth}
              contentStyle={styles.tipCardContent}
            >
              <Text style={styles.tipText}>
                A clear bio helps matches break the ice and start real conversations.
              </Text>
            </BrutalBox>
          </View>
        </View>
      </ScrollView>

      {/* 7. Pinned Bottom Action Buttons */}
      <View style={styles.bottomBarWrapper}>
        <OnboardingBottomBar
          onNext={handleNext}
          onBack={onBack}
          showSkip={false}
          disabled={!bioText.trim()}
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
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  tipText: {
    fontSize: 12,
    fontFamily: typography.bodyBold,
    color: '#4B5563',
    lineHeight: 17,
  },
});
