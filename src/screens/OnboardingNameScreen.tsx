import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
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

interface OnboardingNameScreenProps {
  user: UserAccount;
  onBack: () => void;
  onNext: (updatedUser: UserAccount) => void;
}

const MAX_NAME_LENGTH = 30;

export const OnboardingNameScreen: React.FC<OnboardingNameScreenProps> = ({
  user,
  onBack,
  onNext,
}) => {
  const [name, setName] = useState(user.name);
  const [isSaving, setIsSaving] = useState(false);

  const trimmed = name.trim();
  const isValid = trimmed.length >= 2;

  const handleNext = async () => {
    if (!trimmed) {
      Alert.alert('Required', 'Please enter your first name.');
      return;
    }

    if (trimmed.length < 2) {
      Alert.alert('Invalid Name', 'Name must be at least 2 characters long.');
      return;
    }

    setIsSaving(true);
    try {
      onNext(await updateProfile(user, { display_name: trimmed, onboarding_step: 2 }));
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

      {/* 1. Universal Top Navigation Header */}
      <OnboardingTopHeader onLogout={onBack} user={user} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* 2. Unified Headline with 5px Black Underline */}
            <OnboardingHeadline
              step="01"
              line1="WHAT&apos;S YOUR"
              focalWord="FIRST NAME?"
              subtitle="This is how you&apos;ll appear on P!NG."
            />

            {/* 4. Single Master Name Input Box */}
            <View style={styles.inputCardWrapper}>
              <BrutalBox
                backgroundColor="#FFFFFF"
                borderColor={colors.borderBlack}
                borderWidth={2.4}
                borderRadius={16}
                shadowOffset={{ x: 4, y: 4 }}
                style={styles.fullWidth}
                contentStyle={styles.inputCardContent}
              >
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={(val) => setName(val.slice(0, MAX_NAME_LENGTH))}
                  placeholder="First name"
                  placeholderTextColor="#999999"
                  maxLength={MAX_NAME_LENGTH}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoFocus
                />
                {name.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setName('')}
                    style={styles.clearButton}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityRole="button"
                    accessibilityLabel="Clear name input"
                  >
                    <Ionicons name="close-circle" size={20} color="#888888" />
                  </TouchableOpacity>
                )}
              </BrutalBox>

              {/* 5. Minimalist Advisory & Counter */}
              <View style={styles.helperRow}>
                <Text style={styles.helperText}>
                  You won&apos;t be able to change this later.
                </Text>
                <Text style={styles.charCountText}>
                  {name.length}/{MAX_NAME_LENGTH}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* 6. Pinned Bottom Navigation Button */}
        <View style={styles.bottomBarWrapper}>
          <OnboardingBottomBar
            onNext={handleNext}
            showSkip={false}
            isSaving={isSaving}
            disabled={!isValid}
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
  keyboardView: {
    flex: 1,
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
    gap: 20,
  },
  inputCardWrapper: {
    width: '100%',
    marginTop: 4,
    gap: 10,
  },
  fullWidth: {
    width: '100%',
  },
  inputCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    gap: 12,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 19,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
  },
  clearButton: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  helperText: {
    fontSize: 12,
    fontFamily: typography.bodyMedium,
    color: '#71717A',
    flex: 1,
  },
  charCountText: {
    fontSize: 12,
    fontFamily: typography.bodySemiBold,
    color: '#71717A',
    marginLeft: 8,
  },
  bottomBarWrapper: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
  },
});
