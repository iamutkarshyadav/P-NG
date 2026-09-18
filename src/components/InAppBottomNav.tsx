import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

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
    <View style={styles.navBarContainer}>
      {/* 1. DISCOVER TAB */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.8}
        onPress={() => onSelectTab('discover')}
      >
        <View
          style={[
            styles.iconWrapper,
            activeTab === 'discover' && styles.activeIconWrapper,
          ]}
        >
          <Ionicons
            name={activeTab === 'discover' ? 'compass' : 'compass-outline'}
            size={22}
            color={colors.textDark}
          />
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
        activeOpacity={0.8}
        onPress={() => onSelectTab('likes')}
      >
        <View style={styles.iconWithBadge}>
          <View
            style={[
              styles.iconWrapper,
              activeTab === 'likes' && styles.activeIconWrapper,
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
        activeOpacity={0.8}
        onPress={() => onSelectTab('matches')}
      >
        <View style={styles.iconWithBadge}>
          <View
            style={[
              styles.iconWrapper,
              activeTab === 'matches' && styles.activeIconWrapper,
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
        activeOpacity={0.8}
        onPress={() => onSelectTab('profile')}
      >
        <View
          style={[
            styles.iconWrapper,
            activeTab === 'profile' && styles.activeIconWrapper,
          ]}
        >
          <Ionicons
            name={activeTab === 'profile' ? 'person-circle' : 'person-circle-outline'}
            size={24}
            color={colors.textDark}
          />
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
  );
};

const styles = StyleSheet.create({
  navBarContainer: {
    height: 70,
    backgroundColor: '#FAF7F2',
    borderTopWidth: 1.5,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minWidth: 70,
    gap: 2,
  },
  iconWithBadge: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapper: {
    backgroundColor: colors.accentYellow,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: '#6B7280',
    letterSpacing: 0.6,
  },
  activeTabLabel: {
    color: colors.textDark,
  },
  likesBadge: {
    position: 'absolute',
    top: -2,
    right: 2,
    backgroundColor: colors.primaryPink,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 8,
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
  },
  matchesDot: {
    position: 'absolute',
    top: 0,
    right: 6,
    backgroundColor: colors.accentYellow,
    borderWidth: 1.2,
    borderColor: colors.borderBlack,
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
});
