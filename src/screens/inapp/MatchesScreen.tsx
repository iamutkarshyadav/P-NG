import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Svg, {
  Rect,
  Circle,
  Path,
  G,
  Polygon,
} from 'react-native-svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { LAYOUT } from '../../theme/responsive';
import { BrutalBox } from '../../components/BrutalBox';
import { UserAccount } from '../../services/authDb';

interface MatchesScreenProps {
  user: UserAccount;
  onOpenChat?: (name: string) => void;
}

// Custom SVGs for New Matches and Conversations
function AvatarSora() {
  return (
    <Svg width="68" height="68" viewBox="0 0 70 70">
      <Circle cx="35" cy="35" r="33" fill="#FDE047" />
      {/* Background Room Graphic */}
      <Rect x="10" y="15" width="50" height="40" rx="6" fill="#F472B6" opacity="0.4" />
      {/* Person */}
      <G transform="translate(10, 8)">
        {/* Hair Violet */}
        <Circle cx="25" cy="22" r="18" fill="#7C3AED" />
        {/* Face */}
        <Circle cx="25" cy="25" r="14" fill="#FED7AA" />
        {/* Hair Fringe */}
        <Path d="M 12 18 Q 25 10 38 18 Q 30 14 25 16 Q 18 14 12 18 Z" fill="#7C3AED" />
        {/* Eyes */}
        <Circle cx="20" cy="24" r="2" fill="#18181B" />
        <Circle cx="30" cy="24" r="2" fill="#18181B" />
        {/* Smile */}
        <Path d="M 22 30 Q 25 33 28 30" fill="none" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round" />
        {/* Jacket */}
        <Path d="M 5 50 L 12 36 Q 25 34 38 36 L 45 50 Z" fill="#1D4ED8" stroke="#000" strokeWidth="1.5" />
      </G>
    </Svg>
  );
}

function AvatarMateo() {
  return (
    <Svg width="68" height="68" viewBox="0 0 70 70">
      <Circle cx="35" cy="35" r="33" fill="#BAE6FD" />
      <G transform="translate(10, 8)">
        {/* Curly Brown Hair */}
        <Circle cx="25" cy="20" r="19" fill="#78350F" />
        <Circle cx="13" cy="18" r="8" fill="#78350F" />
        <Circle cx="37" cy="18" r="8" fill="#78350F" />
        <Circle cx="25" cy="11" r="8" fill="#78350F" />
        {/* Face */}
        <Circle cx="25" cy="26" r="14" fill="#FDBA74" />
        {/* Eyes */}
        <Circle cx="20" cy="25" r="2" fill="#18181B" />
        <Circle cx="30" cy="25" r="2" fill="#18181B" />
        {/* Smile */}
        <Path d="M 21 31 Q 25 35 29 31" fill="none" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" />
        {/* Blue Blazer */}
        <Path d="M 4 50 L 12 37 Q 25 35 38 37 L 46 50 Z" fill="#1E3A8A" stroke="#000" strokeWidth="1.5" />
      </G>
    </Svg>
  );
}

function AvatarMaya() {
  return (
    <Svg width="68" height="68" viewBox="0 0 70 70">
      <Circle cx="35" cy="35" r="33" fill="#FEF08A" />
      <G transform="translate(10, 8)">
        {/* Orange Beanie */}
        <Path d="M 12 18 Q 25 8 38 18 L 38 24 Q 25 22 12 24 Z" fill="#EA580C" stroke="#000" strokeWidth="1.5" />
        <Circle cx="25" cy="7" r="4" fill="#EA580C" />
        {/* Face */}
        <Circle cx="25" cy="28" r="14" fill="#FED7AA" />
        {/* Black Hair strands */}
        <Path d="M 12 24 Q 9 36 12 42" stroke="#18181B" strokeWidth="3" fill="none" strokeLinecap="round" />
        <Path d="M 38 24 Q 41 36 38 42" stroke="#18181B" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Glasses */}
        <Circle cx="19" cy="27" r="5" fill="none" stroke="#000" strokeWidth="1.5" />
        <Circle cx="31" cy="27" r="5" fill="none" stroke="#000" strokeWidth="1.5" />
        <Path d="M 24 27 L 26 27" stroke="#000" strokeWidth="1.5" />
        {/* Smile */}
        <Path d="M 22 35 Q 25 38 28 35" fill="none" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round" />
        {/* Hoodie */}
        <Path d="M 6 50 L 13 39 Q 25 37 37 39 L 44 50 Z" fill="#0D9488" stroke="#000" strokeWidth="1.5" />
      </G>
    </Svg>
  );
}

function AvatarJulian() {
  return (
    <Svg width="68" height="68" viewBox="0 0 70 70">
      <Circle cx="35" cy="35" r="33" fill="#FED7AA" />
      <G transform="translate(10, 8)">
        {/* Hair */}
        <Path d="M 14 20 Q 25 10 36 18 Q 30 12 20 14 Z" fill="#451A03" />
        {/* Face */}
        <Circle cx="25" cy="25" r="14" fill="#FDBA74" />
        {/* Beard */}
        <Path d="M 16 27 Q 25 40 34 27 Q 35 36 25 38 Q 15 36 16 27 Z" fill="#451A03" opacity="0.6" />
        {/* Eyes */}
        <Circle cx="20" cy="24" r="2" fill="#18181B" />
        <Circle cx="30" cy="24" r="2" fill="#18181B" />
        {/* Smile */}
        <Path d="M 21 31 Q 25 34 29 31" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        {/* Jacket */}
        <Path d="M 5 50 L 12 36 Q 25 34 38 36 L 45 50 Z" fill="#B45309" stroke="#000" strokeWidth="1.5" />
      </G>
    </Svg>
  );
}

function AvatarPriya() {
  return (
    <Svg width="56" height="56" viewBox="0 0 60 60">
      <Circle cx="30" cy="30" r="28" fill="#FCE7F3" />
      <G transform="translate(5, 5)">
        {/* Dark Long Hair */}
        <Path d="M 10 20 Q 25 8 40 20 L 44 48 Q 25 50 6 48 Z" fill="#18181B" />
        {/* Face */}
        <Circle cx="25" cy="25" r="13" fill="#D97706" opacity="0.85" />
        {/* Eyes */}
        <Circle cx="20" cy="23" r="2" fill="#FFF" />
        <Circle cx="30" cy="23" r="2" fill="#FFF" />
        <Circle cx="20" cy="23" r="1" fill="#000" />
        <Circle cx="30" cy="23" r="1" fill="#000" />
        {/* Smile */}
        <Path d="M 21 29 Q 25 33 29 29" fill="none" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
        {/* Leather Jacket */}
        <Path d="M 4 48 L 12 36 Q 25 34 38 36 L 46 48 Z" fill="#18181B" stroke="#000" strokeWidth="1.5" />
      </G>
    </Svg>
  );
}

function AvatarKai() {
  return (
    <Svg width="56" height="56" viewBox="0 0 60 60">
      <Circle cx="30" cy="30" r="28" fill="#E0E7FF" />
      <G transform="translate(5, 5)">
        {/* Dark wavy hair */}
        <Path d="M 11 18 Q 25 8 39 18 Q 42 28 38 36 Q 30 18 25 20 Q 18 18 12 36 Z" fill="#1E293B" />
        {/* Face */}
        <Circle cx="25" cy="25" r="13" fill="#FED7AA" />
        {/* Glasses */}
        <Circle cx="20" cy="24" r="4.5" fill="none" stroke="#000" strokeWidth="1.2" />
        <Circle cx="30" cy="24" r="4.5" fill="none" stroke="#000" strokeWidth="1.2" />
        <Path d="M 24.5 24 L 25.5 24" stroke="#000" strokeWidth="1.2" />
        {/* Smile */}
        <Path d="M 22 30 Q 25 32 28 30" fill="none" stroke="#000" strokeWidth="1.2" strokeLinecap="round" />
        {/* Shirt */}
        <Path d="M 5 48 L 12 36 Q 25 35 38 36 L 45 48 Z" fill="#4F46E5" stroke="#000" strokeWidth="1.5" />
      </G>
    </Svg>
  );
}

function AvatarTaylor() {
  return (
    <Svg width="56" height="56" viewBox="0 0 60 60">
      <Circle cx="30" cy="30" r="28" fill="#FEF3C7" />
      <G transform="translate(5, 5)">
        {/* Afro curls */}
        <Circle cx="25" cy="20" r="18" fill="#3B1E08" />
        <Circle cx="12" cy="20" r="8" fill="#3B1E08" />
        <Circle cx="38" cy="20" r="8" fill="#3B1E08" />
        {/* Face */}
        <Circle cx="25" cy="25" r="13" fill="#A16207" />
        {/* Eyes */}
        <Circle cx="20" cy="23" r="2" fill="#FFF" />
        <Circle cx="30" cy="23" r="2" fill="#FFF" />
        <Circle cx="20" cy="23" r="1" fill="#000" />
        <Circle cx="30" cy="23" r="1" fill="#000" />
        {/* Big Smile */}
        <Path d="M 20 29 Q 25 34 30 29" fill="none" stroke="#FFF" strokeWidth="1.6" strokeLinecap="round" />
        {/* Blazer */}
        <Path d="M 5 48 L 12 36 Q 25 35 38 36 L 45 48 Z" fill="#065F46" stroke="#000" strokeWidth="1.5" />
      </G>
    </Svg>
  );
}

export const MatchesScreen: React.FC<MatchesScreenProps> = ({
  user,
  onOpenChat,
}) => {
  const handleChatPress = (name: string) => {
    if (onOpenChat) {
      onOpenChat(name);
    } else {
      Alert.alert(`💬 Opening Chat with ${name}`, 'Send a P!NG message to start chatting!');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* 1. Header Row */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>MATCHES</Text>

          {/* Badge: 5 ACTIVE CHATS */}
          <BrutalBox
            backgroundColor={colors.accentYellow}
            borderColor={colors.borderBlack}
            borderWidth={2.2}
            borderRadius={999}
            shadowOffset={3}
            style={styles.activeChatsBadge}
          >
            <View style={styles.badgeContent}>
              <Ionicons name="flash" size={13} color={colors.textDark} />
              <Text style={styles.badgeText}>5 ACTIVE CHATS</Text>
            </View>
          </BrutalBox>
        </View>

        {/* 2. NEW MATCHES CAROUSEL */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>NEW MATCHES</Text>
          <BrutalBox
            backgroundColor={colors.primaryPink}
            borderColor={colors.borderBlack}
            borderWidth={2}
            borderRadius={999}
            shadowOffset={2.5}
            style={styles.newBadge}
          >
            <View style={styles.newBadgeContent}>
              <Ionicons name="flash" size={12} color="#FFFFFF" />
              <Text style={styles.newBadgeText}>4 NEW</Text>
            </View>
          </BrutalBox>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.matchesScroll}
        >
          {/* Match 1: Sora, 24 */}
          <TouchableOpacity
            style={styles.matchItem}
            activeOpacity={0.8}
            onPress={() => handleChatPress('Sora')}
          >
            <View style={styles.avatarWrapper}>
              {/* Sunburst ring behind Sora */}
              <View style={styles.burstRing}>
                <Svg width="74" height="74" viewBox="0 0 76 76">
                  <Circle cx="38" cy="38" r="35" fill="#FFE600" />
                  <Circle cx="38" cy="38" r="35" stroke="#000" strokeWidth="2" strokeDasharray="6 4" />
                </Svg>
              </View>
              <View style={styles.avatarCircle}>
                <AvatarSora />
              </View>
              {/* Urgent Countdown Badge */}
              <BrutalBox
                backgroundColor={colors.accentYellow}
                borderColor={colors.borderBlack}
                borderWidth={2}
                borderRadius={999}
                shadowOffset={2.5}
                style={styles.countdownBadge}
              >
                <Text style={styles.countdownTextYellow}>🚨 3H LEFT</Text>
              </BrutalBox>
            </View>
            <Text style={styles.matchName}>Sora, 24</Text>
          </TouchableOpacity>

          {/* Match 2: Mateo, 28 */}
          <TouchableOpacity
            style={styles.matchItem}
            activeOpacity={0.8}
            onPress={() => handleChatPress('Mateo')}
          >
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <AvatarMateo />
              </View>
              <BrutalBox
                backgroundColor={colors.primaryPink}
                borderColor={colors.borderBlack}
                borderWidth={2}
                borderRadius={999}
                shadowOffset={2.5}
                style={styles.countdownBadge}
              >
                <Text style={styles.countdownTextPink}>47H LEFT</Text>
              </BrutalBox>
            </View>
            <Text style={styles.matchName}>Mateo, 28</Text>
          </TouchableOpacity>

          {/* Match 3: Maya, 25 */}
          <TouchableOpacity
            style={styles.matchItem}
            activeOpacity={0.8}
            onPress={() => handleChatPress('Maya')}
          >
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <AvatarMaya />
              </View>
              <BrutalBox
                backgroundColor={colors.primaryPink}
                borderColor={colors.borderBlack}
                borderWidth={2}
                borderRadius={999}
                shadowOffset={2.5}
                style={styles.countdownBadge}
              >
                <Text style={styles.countdownTextPink}>32H LEFT</Text>
              </BrutalBox>
            </View>
            <Text style={styles.matchName}>Maya, 25</Text>
          </TouchableOpacity>

          {/* Match 4: Julian, 29 */}
          <TouchableOpacity
            style={styles.matchItem}
            activeOpacity={0.8}
            onPress={() => handleChatPress('Julian')}
          >
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <AvatarJulian />
              </View>
              <BrutalBox
                backgroundColor={colors.primaryPink}
                borderColor={colors.borderBlack}
                borderWidth={2}
                borderRadius={999}
                shadowOffset={2.5}
                style={styles.countdownBadge}
              >
                <Text style={styles.countdownTextPink}>18H LEFT</Text>
              </BrutalBox>
            </View>
            <Text style={styles.matchName}>Julian, 29</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 3. CONVERSATIONS SECTION */}
        <View style={styles.conversationsHeaderRow}>
          <Text style={styles.sectionTitle}>CONVERSATIONS</Text>
          <Text style={styles.activeCounter}>3 ACTIVE</Text>
        </View>

        {/* Conversation 1: Priya, 27 */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleChatPress('Priya')}
          style={styles.convCardContainer}
        >
          <BrutalBox
            backgroundColor="#FFFFFF"
            borderColor={colors.borderBlack}
            borderWidth={2.4}
            borderRadius={18}
            shadowOffset={{ x: 3, y: 3 }}
            contentStyle={styles.convCard}
          >
            <View style={styles.convRow}>
              {/* Avatar with Online Dot */}
              <View style={styles.convAvatarWrap}>
                <View style={styles.convAvatarBorder}>
                  <AvatarPriya />
                </View>
                {/* Green Active Dot */}
                <View style={styles.onlineDot} />
              </View>

              {/* Message Details */}
              <View style={styles.convDetails}>
                <View style={styles.convTopLine}>
                  <View style={styles.nameBadgeGroup}>
                    <Text style={styles.convName}>Priya, 27</Text>
                    <View style={styles.repliesPill}>
                      <Text style={styles.repliesPillText}>USUALLY REPLIES</Text>
                    </View>
                  </View>
                  <Text style={styles.convTime}>12:40 PM</Text>
                </View>

                <Text style={styles.convSnippet} numberOfLines={1}>
                  Let’s check out that flea market...
                </Text>

                <View style={styles.convBottomLine}>
                  <View style={styles.activeNowRow}>
                    <MaterialCommunityIcons
                      name="check-all"
                      size={16}
                      color={colors.primaryPink}
                    />
                    <Text style={styles.activeNowText}>Active now</Text>
                  </View>
                  {/* Unread Count Badge */}
                  <View style={styles.unreadCountBadge}>
                    <Text style={styles.unreadCountText}>2</Text>
                  </View>
                </View>
              </View>
            </View>
          </BrutalBox>
        </TouchableOpacity>

        {/* Conversation 2: Kai, 26 (With Yellow Warning Bar & Expiring Notice) */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleChatPress('Kai')}
          style={styles.convCardContainer}
        >
          <BrutalBox
            backgroundColor="#FFFFFF"
            borderColor={colors.borderBlack}
            borderWidth={2.4}
            borderRadius={18}
            shadowOffset={{ x: 3, y: 3 }}
            overflow="hidden"
            contentStyle={styles.convCard}
          >
            {/* Yellow accent on left border */}
            <View style={styles.yellowLeftBorder} />

            <View style={[styles.convRow, { paddingLeft: 10 }]}>
              {/* Avatar with Hourglass Badge */}
              <View style={styles.convAvatarWrap}>
                <View style={styles.convAvatarBorder}>
                  <AvatarKai />
                </View>
                {/* Yellow Hourglass Dot */}
                <View style={styles.hourglassBadge}>
                  <Text style={styles.hourglassEmoji}>⏳</Text>
                </View>
              </View>

              {/* Message Details */}
              <View style={styles.convDetails}>
                {/* Expiring Notice Pill */}
                <View style={styles.expiringPill}>
                  <Text style={styles.expiringPillText}>
                    ⏰ EXPIRES IN 5H — SAY SOMETHING
                  </Text>
                </View>

                <View style={styles.convTopLine}>
                  <Text style={styles.convName}>Kai, 26</Text>
                  <Text style={styles.convTime}>Yesterday</Text>
                </View>

                <Text style={styles.convSnippetMuted} numberOfLines={1}>
                  Hey Alex! Loved your Moog...
                </Text>
              </View>
            </View>
          </BrutalBox>
        </TouchableOpacity>

        {/* Conversation 3: Taylor, 28 (Voice Note) */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleChatPress('Taylor')}
          style={styles.convCardContainer}
        >
          <BrutalBox
            backgroundColor="#FFFFFF"
            borderColor={colors.borderBlack}
            borderWidth={2.4}
            borderRadius={18}
            shadowOffset={{ x: 3, y: 3 }}
            contentStyle={styles.convCard}
          >
            <View style={styles.convRow}>
              {/* Avatar */}
              <View style={styles.convAvatarWrap}>
                <View style={styles.convAvatarBorder}>
                  <AvatarTaylor />
                </View>
              </View>

              {/* Message Details */}
              <View style={styles.convDetails}>
                <View style={styles.convTopLine}>
                  <Text style={styles.convName}>Taylor, 28</Text>
                  <Text style={styles.convTime}>2d ago</Text>
                </View>

                {/* Voice Note Pill */}
                <View style={styles.voiceNotePill}>
                  <Feather name="mic" size={14} color={colors.primaryPink} />
                  <Text style={styles.voiceNoteText}>
                    Sent a voice note <Text style={styles.voiceDuration}>(0:24)</Text>
                  </Text>
                </View>
              </View>
            </View>
          </BrutalBox>
        </TouchableOpacity>

        {/* 4. Conversation Limit Box */}
        <BrutalBox
          backgroundColor="#E2DCFE"
          borderColor={colors.borderBlack}
          borderWidth={2.4}
          borderRadius={20}
          shadowOffset={4}
          style={styles.limitBox}
        >
          <View style={styles.limitContent}>
            <View style={styles.limitIconBubble}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.textDark} />
            </View>
            <View style={styles.limitTextGroup}>
              <Text style={styles.limitTitle}>
                You have <Text style={styles.limitPinkHighlight}>5 of 8</Text> conversations open.
              </Text>
              <Text style={styles.limitSubtitle}>
                Reply or close one to unlock new matches.
              </Text>
            </View>
          </View>
        </BrutalBox>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 95 : 85,
  },
  container: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: typography.headingHero,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  activeChatsBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 12,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: typography.headingHero,
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  newBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  newBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newBadgeText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  matchesScroll: {
    paddingBottom: 14,
    gap: 16,
  },
  matchItem: {
    alignItems: 'center',
    width: 82,
  },
  avatarWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
  },
  burstRing: {
    position: 'absolute',
    top: 1,
    left: 1,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownBadge: {
    position: 'absolute',
    bottom: -4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countdownTextYellow: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  countdownTextPink: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: '#FFFFFF',
  },
  matchName: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
  },
  conversationsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 12,
  },
  activeCounter: {
    fontSize: 12,
    fontFamily: typography.bodyExtraBold,
    color: '#6B7280',
    letterSpacing: 0.8,
  },
  convCardContainer: {
    marginBottom: 12,
  },
  convCard: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  yellowLeftBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 7,
    backgroundColor: colors.accentYellow,
  },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  convAvatarWrap: {
    position: 'relative',
    marginRight: 12,
  },
  convAvatarBorder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34D399',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  hourglassBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accentYellow,
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourglassEmoji: {
    fontSize: 11,
  },
  convDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  convTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  convName: {
    fontSize: 16,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  repliesPill: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  repliesPillText: {
    fontSize: 9,
    fontFamily: typography.bodyExtraBold,
    color: '#065F46',
  },
  convTime: {
    fontSize: 12,
    fontFamily: typography.bodyBold,
    color: '#6B7280',
  },
  convSnippet: {
    fontSize: 13.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    marginBottom: 4,
  },
  convSnippetMuted: {
    fontSize: 13.5,
    fontFamily: typography.bodySemiBold,
    color: '#4B5563',
    marginTop: 2,
  },
  convBottomLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  activeNowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeNowText: {
    fontSize: 11.5,
    fontFamily: typography.bodyBold,
    color: colors.primaryPink,
  },
  unreadCountBadge: {
    backgroundColor: colors.primaryPink,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
  },
  expiringPill: {
    backgroundColor: colors.accentYellow,
    borderWidth: 1.6,
    borderColor: colors.borderBlack,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  expiringPillText: {
    fontSize: 9.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  voiceNotePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F0EA',
    borderWidth: 1.4,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 4,
  },
  voiceNoteText: {
    fontSize: 12,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
  },
  voiceDuration: {
    color: '#6B7280',
  },
  limitBox: {
    marginTop: 8,
    padding: 16,
  },
  limitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  limitIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  limitTextGroup: {
    flex: 1,
  },
  limitTitle: {
    fontSize: 13.5,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
    marginBottom: 2,
  },
  limitPinkHighlight: {
    fontFamily: typography.bodyExtraBold,
    color: colors.primaryPink,
  },
  limitSubtitle: {
    fontSize: 12,
    fontFamily: typography.bodyMedium,
    color: '#4B5563',
    lineHeight: 16,
  },
});
