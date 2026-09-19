import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { LAYOUT } from '../theme/responsive';
import { BrutalBox } from './BrutalBox';
import { UserAccount } from '../services/authDb';

export type InAppTab = 'discover' | 'likes' | 'matches' | 'profile';

interface InAppTopHeaderProps {
  user: UserAccount;
  activeTab?: InAppTab;
  onPressFilter?: () => void;
  onPressAvatar?: () => void;
  onPressSettings?: () => void;
}

export const InAppTopHeader: React.FC<InAppTopHeaderProps> = ({
  user,
  activeTab = 'discover',
  onPressFilter,
  onPressAvatar,
  onPressSettings,
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

      {/* Right: Tab-Specific Purposeful Action */}
      <View style={styles.actionsRow}>
        {activeTab === 'discover' && (
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
        )}

        {activeTab === 'likes' && (
          <BrutalBox
            backgroundColor={colors.lavender}
            borderColor={colors.borderBlack}
            borderWidth={2}
            borderRadius={999}
            shadowOffset={{ x: 2, y: 2 }}
            contentStyle={styles.statusPillBadge}
          >
            <Ionicons name="flash" size={12} color="#000" />
            <Text style={styles.statusPillText}>14 P!NGS</Text>
          </BrutalBox>
        )}

        {activeTab === 'matches' && (
          <BrutalBox
            backgroundColor={colors.accentYellow}
            borderColor={colors.borderBlack}
            borderWidth={2}
            borderRadius={999}
            shadowOffset={{ x: 2, y: 2 }}
            contentStyle={styles.statusPillBadge}
          >
            <Ionicons name="chatbubbles" size={12} color="#000" />
            <Text style={styles.statusPillText}>5 ACTIVE</Text>
          </BrutalBox>
        )}

        {activeTab === 'profile' && (
          <TouchableOpacity activeOpacity={0.8} onPress={onPressSettings}>
            <BrutalBox
              backgroundColor={colors.cardWhite}
              borderColor={colors.borderBlack}
              borderWidth={2}
              borderRadius={999}
              shadowOffset={{ x: 2.2, y: 2.2 }}
              contentStyle={styles.iconButtonContent}
            >
              <Feather name="settings" size={17} color={colors.textDark} />
            </BrutalBox>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
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
  statusPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },
  statusPillText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 10.5,
    color: '#000',
    letterSpacing: 0.4,
  },
});
