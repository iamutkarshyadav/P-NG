import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { LAYOUT } from '../theme/responsive';
import { BrutalBox } from './BrutalBox';

interface OnboardingBottomBarProps {
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
  nextText?: string;
  isSaving?: boolean;
  disabled?: boolean;
}

export const OnboardingBottomBar: React.FC<OnboardingBottomBarProps> = ({
  onNext,
  onBack,
  onSkip,
  showSkip = false,
  nextText = 'NEXT',
  isSaving = false,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      {/* 1. GO BACK Button (Rendered on Steps 2 - 8) */}
      {onBack && (
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onBack}
          disabled={isSaving}
          style={styles.backWrapper}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <BrutalBox
            backgroundColor="#FFFFFF"
            borderColor={colors.borderBlack}
            borderWidth={2.6}
            borderRadius={999}
            shadowOffset={{ x: 3, y: 3 }}
            contentStyle={styles.backContent}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textDark} />
          </BrutalBox>
        </TouchableOpacity>
      )}

      {/* 2. SKIP Button (Rendered only on optional steps) */}
      {showSkip && onSkip && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onSkip}
          disabled={isSaving}
          style={styles.skipWrapper}
          accessibilityRole="button"
          accessibilityLabel="Skip this step"
        >
          <BrutalBox
            backgroundColor="#EBE7E0"
            borderColor="#71717A"
            borderWidth={2.2}
            borderRadius={999}
            shadowOffset={{ x: 2, y: 2 }}
            contentStyle={styles.skipContent}
          >
            <Text style={styles.skipText}>SKIP</Text>
          </BrutalBox>
        </TouchableOpacity>
      )}

      {/* 3. NEXT Button (Bottom Right, Vibrant Yellow) */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onNext}
        disabled={disabled || isSaving}
        style={styles.nextWrapper}
      >
        <BrutalBox
          backgroundColor={colors.accentYellow}
          borderColor={colors.borderBlack}
          borderWidth={2.6}
          borderRadius={999}
          shadowOffset={{ x: 3, y: 3 }}
          contentStyle={styles.nextContent}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.textDark} />
          ) : (
            <Text style={styles.nextText}>{nextText}</Text>
          )}
        </BrutalBox>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  backWrapper: {
    width: 52,
  },
  backContent: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipWrapper: {
    width: 90,
  },
  skipContent: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 13.5,
    fontFamily: typography.bodyExtraBold,
    color: '#71717A',
    letterSpacing: 0.8,
  },
  nextWrapper: {
    flex: 1,
  },
  nextContent: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  nextText: {
    fontSize: 19,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.8,
  },
});
