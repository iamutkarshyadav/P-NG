import { StyleSheet, TextStyle } from 'react-native';

export const typography = {
  // Ultra-condensed bold display font for headlines, big numbers, and primary action buttons
  headline: 'Anton_400Regular',
  headingHero: 'Anton_400Regular',

  // Modern geometric sans-serif for body, tags, labels, and badges
  bodyRegular: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemiBold: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
  bodyExtraBold: 'PlusJakartaSans_800ExtraBold',

  // Semantic mappings for UI continuity
  badge: 'PlusJakartaSans_800ExtraBold',
  pill: 'PlusJakartaSans_800ExtraBold',
  chip: 'PlusJakartaSans_700Bold',
  itemTitle: 'PlusJakartaSans_700Bold',
  helperText: 'PlusJakartaSans_500Medium',

  fonts: {
    black: 'Anton_400Regular',
    bold: 'PlusJakartaSans_700Bold',
    extraBold: 'PlusJakartaSans_800ExtraBold',
    semiBold: 'PlusJakartaSans_600SemiBold',
    medium: 'PlusJakartaSans_500Medium',
    regular: 'PlusJakartaSans_400Regular',
  },
};

export const fontStyles = StyleSheet.create({
  // Big bold condensed headers
  h1: {
    fontFamily: typography.headline,
    fontSize: 34,
    lineHeight: 38,
    textTransform: 'uppercase',
  } as TextStyle,
  h2: {
    fontFamily: typography.headline,
    fontSize: 26,
    lineHeight: 30,
    textTransform: 'uppercase',
  } as TextStyle,
  h3: {
    fontFamily: typography.headline,
    fontSize: 20,
    lineHeight: 24,
    textTransform: 'uppercase',
  } as TextStyle,

  // CTA button text
  cta: {
    fontFamily: typography.headline,
    fontSize: 18,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } as TextStyle,

  // Category & step badges
  badge: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } as TextStyle,

  // General body copy
  body: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
  } as TextStyle,

  // UI labels & chips
  chip: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
  } as TextStyle,
});

