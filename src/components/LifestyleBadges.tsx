import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { BrutalBox } from './BrutalBox';
import { getLifestyleBadges, LifestyleAttributes, LifestyleBadgeItem } from '../types/lifestyle';

interface LifestyleBadgesProps {
  profile: LifestyleAttributes;
  variant?: 'compact' | 'full';
  syncBadgeText?: string;
}

const renderBadgeIcon = (badge: LifestyleBadgeItem, size: number = 18) => {
  if (badge.iconFamily === 'MaterialCommunityIcons') {
    return <MaterialCommunityIcons name={badge.iconName as any} size={size} color="#18181B" />;
  }
  if (badge.iconFamily === 'Feather') {
    return <Feather name={badge.iconName as any} size={size} color="#18181B" />;
  }
  return <Ionicons name={badge.iconName as any} size={size} color="#18181B" />;
};

export const LifestyleBadges: React.FC<LifestyleBadgesProps> = ({
  profile,
  variant = 'compact',
  syncBadgeText,
}) => {
  const badges = getLifestyleBadges(profile);
  if (badges.length === 0) return null;

  if (variant === 'compact') {
    return (
      <View style={styles.compactWrap}>
        {badges.map((b) => (
          <BrutalBox
            key={b.key}
            backgroundColor={b.tint || '#FFFFFF'}
            borderColor={colors.borderBlack}
            borderWidth={1.8}
            borderRadius={12}
            shadowOffset={{ x: 2, y: 2 }}
            contentStyle={styles.compactBadgeContent}
          >
            <View style={styles.compactIconWrap}>{renderBadgeIcon(b, 14)}</View>
            <Text style={styles.compactBadgeText}>{b.label}</Text>
          </BrutalBox>
        ))}
      </View>
    );
  }

  return (
    <BrutalBox
      backgroundColor="#FFFFFF"
      borderColor={colors.borderBlack}
      borderWidth={2.6}
      borderRadius={22}
      shadowOffset={{ x: 4, y: 4 }}
      contentStyle={styles.fullCardContent}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleWrap}>
          <Feather name="activity" size={16} color="#18181B" style={{ marginRight: 6 }} />
          <Text style={styles.sectionHeaderTitle}>THE VITALS & LIFESTYLE</Text>
        </View>

        {syncBadgeText ? (
          <View style={styles.syncedPill}>
            <Text style={styles.syncedPillText}>{syncBadgeText}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.subtitle}>Deal-breakers, quirks & lifestyle compatibility sync</Text>

      {/* Stack of Neo-Brutalist Badges */}
      <View style={styles.badgeList}>
        {badges.map((b) => (
          <BrutalBox
            key={b.key}
            backgroundColor={b.tint || '#FFFFFF'}
            borderColor={colors.borderBlack}
            borderWidth={2}
            borderRadius={16}
            shadowOffset={{ x: 2, y: 2 }}
            contentStyle={styles.fullRowContent}
          >
            <View style={styles.iconWrap}>
              {renderBadgeIcon(b, 19)}
            </View>

            <View style={styles.rowTextCol}>
              <Text style={styles.rowTitle}>{b.title}</Text>
              <Text style={styles.rowLabel}>{b.label}</Text>
            </View>
          </BrutalBox>
        ))}
      </View>
    </BrutalBox>
  );
};

const styles = StyleSheet.create({
  compactWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  compactBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 6,
  },
  compactIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  compactBadgeText: {
    fontSize: 12.5,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.3,
  },
  fullCardContent: {
    padding: 18,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 2,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sectionHeaderTitle: {
    fontSize: 17,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.6,
  },
  syncedPill: {
    backgroundColor: colors.accentYellow,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  syncedPillText: {
    fontSize: 10.5,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12.5,
    fontFamily: typography.bodyMedium,
    color: '#6B7280',
    marginBottom: 10,
    lineHeight: 18,
  },
  badgeList: {
    gap: 9,
  },
  fullRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    gap: 12,
  },
  iconWrap: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextCol: {
    flex: 1,
    gap: 1.5,
  },
  rowTitle: {
    fontSize: 10,
    fontFamily: typography.headline,
    color: '#6B7280',
    letterSpacing: 0.8,
  },
  rowLabel: {
    fontSize: 14,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.2,
  },
});
