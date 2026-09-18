import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { BrutalBox } from './BrutalBox';
import { UserAccount } from '../services/authDb';

interface OnboardingTopHeaderProps {
  user?: UserAccount;
  onBack?: () => void;
}

export const OnboardingTopHeader: React.FC<OnboardingTopHeaderProps> = () => {
  return (
    <View style={styles.headerContainer}>
      {/* Left-Aligned Single Iconic Pink P!NG Logo Badge */}
      <BrutalBox
        backgroundColor={colors.primaryPink}
        borderColor={colors.borderBlack}
        borderWidth={2.2}
        borderRadius={8}
        shadowOffset={{ x: 2, y: 2 }}
        contentStyle={styles.logoBadge}
      >
        <Text style={styles.logoBadgeText}>
          P<Text style={{ color: colors.accentYellow }}>!</Text>NG
        </Text>
      </BrutalBox>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: 'transparent',
  },
  logoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  logoBadgeText: {
    fontSize: 18,
    fontFamily: typography.headline,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
});
