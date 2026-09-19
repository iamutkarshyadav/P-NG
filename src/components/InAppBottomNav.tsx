import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { LAYOUT } from '../theme/responsive';

export type InAppTab = 'discover' | 'likes' | 'matches' | 'profile';

interface InAppBottomNavProps {
  activeTab: InAppTab;
  onSelectTab: (tab: InAppTab) => void;
  likesCount?: number;
  hasUnreadMatches?: boolean;
}

export const InAppBottomNav: React.FC<InAppBottomNavProps> = ({
  activeTab,
  onSelectTab,
  likesCount = 9,
  hasUnreadMatches = true,
}) => {
  return (
    <View style={styles.navBarWrapper}>
      <View style={styles.navBarContainer}>
        {/* 1. DISCOVER TAB */}
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.75}
          onPress={() => onSelectTab('discover')}
        >
          <View style={styles.iconSlot}>
            <View
              style={[
                styles.iconPill,
                activeTab === 'discover' && styles.activeIconPill,
              ]}
            >
              <Ionicons
                name={activeTab === 'discover' ? 'compass' : 'compass-outline'}
                size={22}
                color={colors.textDark}
              />
            </View>
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'discover' && styles.activeTabLabel,
            ]}
          >
            DISCOVER
          </Text>
        </TouchableOpacity>

        {/* 2. LIKES TAB */}
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.75}
          onPress={() => onSelectTab('likes')}
        >
          <View style={styles.iconSlot}>
            <View
              style={[
                styles.iconPill,
                activeTab === 'likes' && styles.activeIconPill,
              ]}
            >
              <Ionicons
                name={activeTab === 'likes' ? 'heart' : 'heart-outline'}
                size={22}
                color={colors.textDark}
              />
            </View>
            {/* Notification Badge: "9" */}
            <View style={styles.likesBadge}>
              <Text style={styles.likesBadgeText}>{likesCount}</Text>
            </View>
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'likes' && styles.activeTabLabel,
            ]}
          >
            LIKES
          </Text>
        </TouchableOpacity>

        {/* 3. MATCHES TAB */}
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.75}
          onPress={() => onSelectTab('matches')}
        >
          <View style={styles.iconSlot}>
            <View
              style={[
                styles.iconPill,
                activeTab === 'matches' && styles.activeIconPill,
              ]}
            >
              <Ionicons
                name={
                  activeTab === 'matches'
                    ? 'chatbubble-ellipses'
                    : 'chatbubble-ellipses-outline'
                }
                size={22}
                color={colors.textDark}
              />
            </View>
            {/* Yellow Notification Dot */}
            {hasUnreadMatches && <View style={styles.matchesDot} />}
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'matches' && styles.activeTabLabel,
            ]}
          >
            MATCHES
          </Text>
        </TouchableOpacity>

        {/* 4. PROFILE TAB */}
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.75}
          onPress={() => onSelectTab('profile')}
        >
          <View style={styles.iconSlot}>
            <View
              style={[
                styles.iconPill,
                activeTab === 'profile' && styles.activeIconPill,
              ]}
            >
              <Ionicons
                name={
                  activeTab === 'profile'
                    ? 'person-circle'
                    : 'person-circle-outline'
                }
                size={23}
                color={colors.textDark}
              />
            </View>
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'profile' && styles.activeTabLabel,
            ]}
          >
            PROFILE
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navBarWrapper: {
    position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    width: '100%',
    backgroundColor: '#FAF7F2',
    borderTopWidth: 1.5,
    borderTopColor: '#EBE7DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBarContainer: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlot: {
    width: 52,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconPill: {
    width: 50,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeIconPill: {
    backgroundColor: colors.accentYellow,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: '#71717A',
    letterSpacing: 0.8,
    marginTop: 4,
    lineHeight: 13,
  },
  activeTabLabel: {
    color: colors.textDark,
  },
  likesBadge: {
    position: 'absolute',
    top: -2,
    right: 4,
    backgroundColor: colors.primaryPink,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 999,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  likesBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: typography.bodyExtraBold,
    lineHeight: 11,
  },
  matchesDot: {
    position: 'absolute',
    top: 1,
    right: 8,
    backgroundColor: colors.accentYellow,
    borderWidth: 1.2,
    borderColor: colors.borderBlack,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
