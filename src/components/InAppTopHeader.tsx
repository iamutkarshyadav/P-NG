import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import Svg, { Circle, Path, G, Rect } from 'react-native-svg';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { BrutalBox } from './BrutalBox';
import { UserAccount } from '../services/authDb';

interface InAppTopHeaderProps {
  user: UserAccount;
  onPressFilter?: () => void;
  onPressAvatar?: () => void;
}

function MiniTealAvatar() {
  return (
    <Svg width="36" height="36" viewBox="0 0 40 40">
      <Circle cx="20" cy="20" r="19" fill="#0D9488" />
      <G transform="translate(4, 3)">
        {/* Teal hair */}
        <Circle cx="16" cy="15" r="12" fill="#06B6D4" />
        {/* Face */}
        <Circle cx="16" cy="16" r="8" fill="#FED7AA" />
        {/* Bangs */}
        <Path d="M 9 14 Q 16 9 23 14 Q 20 12 16 13 Q 12 12 9 14 Z" fill="#06B6D4" />
        {/* Eyes */}
        <Circle cx="13" cy="16" r="1.2" fill="#18181B" />
        <Circle cx="19" cy="16" r="1.2" fill="#18181B" />
        {/* Smile */}
        <Path d="M 14.5 19 Q 16 21 17.5 19" fill="none" stroke="#E11D48" strokeWidth="1" strokeLinecap="round" />
        {/* Jacket */}
        <Path d="M 5 30 L 9 23 Q 16 21 23 23 L 27 30 Z" fill="#F59E0B" stroke="#000" strokeWidth="1" />
      </G>
    </Svg>
  );
}

export const InAppTopHeader: React.FC<InAppTopHeaderProps> = ({
  user,
  onPressFilter,
  onPressAvatar,
}) => {
  return (
    <View style={styles.headerContainer}>
      {/* Left: Single Iconic Branded P!NG Logo Badge */}
      <View style={styles.brandRow}>
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

      {/* Right: Filter Sliders Button + Profile Avatar */}
      <View style={styles.actionsRow}>
        {/* Filter Sliders Button with Pink Alert Dot */}
        <TouchableOpacity activeOpacity={0.8} onPress={onPressFilter}>
          <BrutalBox
            backgroundColor={colors.cardWhite}
            borderColor={colors.borderBlack}
            borderWidth={2}
            borderRadius={999}
            shadowOffset={{ x: 2.2, y: 2.2 }}
            contentStyle={styles.iconButtonContent}
          >
            <Feather name="sliders" size={17} color={colors.textDark} />
            <View style={styles.filterDot} />
          </BrutalBox>
        </TouchableOpacity>

        {/* Profile Avatar Circle */}
        <TouchableOpacity activeOpacity={0.85} onPress={onPressAvatar}>
          <View style={styles.avatarBorderWrap}>
            <MiniTealAvatar />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  logoBadgeText: {
    fontSize: 17,
    fontFamily: typography.headline,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButtonContent: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primaryPink,
  },
  avatarBorderWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    overflow: 'hidden',
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
});
