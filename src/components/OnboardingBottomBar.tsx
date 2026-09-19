import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { LAYOUT } from '../theme/responsive';
import { BrutalBox } from './BrutalBox';

interface OnboardingBottomBarProps {
  onNext: () => void;
  onSkip?: () => void;
  nextText?: string;
  isSaving?: boolean;
  disabled?: boolean;
}

export const OnboardingBottomBar: React.FC<OnboardingBottomBarProps> = ({
  onNext,
  onSkip,
  nextText = 'NEXT ➔',
  isSaving = false,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      {/* 1. SKIP Button (Bottom Left, Faded Muted Aesthetic) */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onSkip || onNext}
        disabled={isSaving}
        style={styles.skipWrapper}
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

      {/* 2. NEXT Button (Bottom Right, Vibrant Yellow) */}
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
  skipWrapper: {
    width: 100,
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
