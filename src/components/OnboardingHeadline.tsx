import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { BrutalBox } from './BrutalBox';

export interface OnboardingHeadlineProps {
  step: string;
  line1: string;
  line2?: string;
  focalWord: string;
  subtitle: string;
}

export const OnboardingHeadline: React.FC<OnboardingHeadlineProps> = ({
  step,
  line1,
  line2,
  focalWord,
  subtitle,
}) => {
  return (
    <View style={styles.container}>
      {/* 1. Step Badge Pill - Strictly STEP XX / 08, No emojis, No step names */}
      <View style={styles.stepBadgeWrapper}>
        <BrutalBox
          backgroundColor={colors.accentYellow}
          borderColor={colors.borderBlack}
          borderWidth={2.2}
          borderRadius={999}
          shadowOffset={{ x: 2.2, y: 2.2 }}
          contentStyle={styles.stepBadgeContent}
        >
          <Text style={styles.stepBadgeText}>STEP {step} / 08</Text>
        </BrutalBox>
      </View>

      {/* 2. Birthday-Style Modular Display Headline with 5px Solid Black Underline */}
      <View style={styles.headlineWrapper}>
        <Text style={styles.headlineLead}>{line1}</Text>
        {Boolean(line2) && <Text style={styles.headlineLead}>{line2}</Text>}
        <View style={styles.focalUnderlineWrapper}>
          <Text style={styles.focalWordText}>{focalWord}</Text>
        </View>
        <Text style={styles.subtitleText}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-start',
    gap: 8,
  },
  stepBadgeWrapper: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 2,
  },
  stepBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
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
    marginTop: -4,
    paddingTop: 2,
    overflow: 'visible',
  },
  headlineLead: {
    fontSize: 34,
    color: colors.textDark,
    fontFamily: typography.headline,
    letterSpacing: 0.5,
    lineHeight: 38,
    paddingTop: 1,
  },
  focalUnderlineWrapper: {
    alignSelf: 'flex-start',
    borderBottomWidth: 5,
    borderBottomColor: '#000000',
    paddingBottom: 2,
    paddingTop: 1,
    marginBottom: 4,
  },
  focalWordText: {
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
    color: '#333333',
    marginTop: 4,
    lineHeight: 18,
  },
});
