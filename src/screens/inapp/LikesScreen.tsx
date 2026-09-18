import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, {
  Rect,
  Circle,
  Path,
  G,
} from 'react-native-svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { BrutalBox } from '../../components/BrutalBox';
import { UserAccount } from '../../services/authDb';

interface LikesScreenProps {
  user: UserAccount;
}

interface LikeProfile {
  id: string;
  name: string;
  age: number;
  distance: string;
  commentType?: 'photo' | 'bio';
  commentText?: string;
  badgeExtra?: string;
  hairColor: string;
  bgColor: string;
}

const LIKE_PROFILES: LikeProfile[] = [
  {
    id: 'l1',
    name: 'Maya',
    age: 25,
    distance: '3 KM AWAY',
    commentType: 'photo',
    commentText: 'Your synth setup is unreal 🔥',
    hairColor: '#818CF8',
    bgColor: '#E0E7FF',
  },
  {
    id: 'l2',
    name: 'Jordan',
    age: 28,
    distance: '5 KM AWAY',
    commentType: 'bio',
    commentText: 'LIKED YOUR BIO',
    hairColor: '#F59E0B',
    bgColor: '#FEF3C7',
  },
  {
    id: 'l3',
    name: 'Elena',
    age: 24,
    distance: '1.2 KM AWAY',
    badgeExtra: 'JUST NOW',
    hairColor: '#06B6D4',
    bgColor: '#CFFAFE',
  },
  {
    id: 'l4',
    name: 'Sam',
    age: 26,
    distance: '8 KM AWAY',
    badgeExtra: 'HIGH VIBE 98%',
    hairColor: '#FB923C',
    bgColor: '#FFEDD5',
  },
];

function ProfileIllustration({ hair, bg }: { hair: string; bg: string }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 160 170" preserveAspectRatio="xMidYMid slice">
      <Rect width="160" height="170" fill={bg} />
      {/* Background Graphic Accents */}
      <Circle cx="130" cy="40" r="30" fill="#FFFFFF" opacity="0.35" />
      <Path d="M 20 20 L 25 32 L 37 35 L 25 38 L 20 50 L 15 38 L 3 35 L 15 32 Z" fill="#FFE600" opacity="0.75" />

      {/* Character */}
      <G transform="translate(15, 6)">
        {/* Hair Back */}
        <Circle cx="65" cy="70" r="42" fill={hair} stroke="#000" strokeWidth="2.5" />
        {/* Face */}
        <Path d="M 38 60 Q 65 52 92 60 Q 94 105 65 118 Q 36 105 38 60 Z" fill="#FED7AA" stroke="#000" strokeWidth="2.5" />
        {/* Hair Bangs */}
        <Path d="M 34 60 Q 65 30 96 60 Q 85 45 65 48 Q 45 45 34 60 Z" fill={hair} stroke="#000" strokeWidth="2" />
        {/* Eyes */}
        <Circle cx="52" cy="78" r="4.5" fill="#000" />
        <Circle cx="78" cy="78" r="4.5" fill="#000" />
        <Circle cx="50.5" cy="76" r="1.5" fill="#FFF" />
        <Circle cx="76.5" cy="76" r="1.5" fill="#FFF" />
        {/* Smile */}
        <Path d="M 58 95 Q 65 102 72 95" fill="none" stroke="#E11D48" strokeWidth="2.2" strokeLinecap="round" />
        {/* Shoulders */}
        <Path d="M 15 160 L 25 125 Q 65 118 105 125 L 115 160 Z" fill="#18181B" stroke="#000" strokeWidth="2.5" />
      </G>
    </Svg>
  );
}

export const LikesScreen: React.FC<LikesScreenProps> = ({ user }) => {
  const [profiles, setProfiles] = useState<LikeProfile[]>(LIKE_PROFILES);

  const handleAction = (id: string, name: string, type: 'match' | 'pass') => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    if (type === 'match') {
      Alert.alert('🎉 IT’S A MATCH!', `You connected with ${name}! Check your Matches tab.`);
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
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>LIKES YOU</Text>
            <View style={styles.redDot} />
          </View>

          {/* Badge: 14 PEOPLE P!NGED YOU */}
          <BrutalBox
            backgroundColor={colors.lavender}
            borderColor={colors.borderBlack}
            borderWidth={2}
            borderRadius={999}
            shadowOffset={{ x: 2, y: 2 }}
            contentStyle={styles.badgeContent}
          >
            <MaterialCommunityIcons name="lightning-bolt" size={13} color={colors.textDark} />
            <Text style={styles.badgeText}>14 PEOPLE P!NGED YOU</Text>
          </BrutalBox>
        </View>

        {/* 2. Value Banner: ALWAYS FREE. NEVER BLURRED. */}
        <BrutalBox
          backgroundColor={colors.accentYellow}
          borderColor={colors.borderBlack}
          borderWidth={2.4}
          borderRadius={18}
          shadowOffset={{ x: 3.5, y: 3.5 }}
          style={styles.fullWidth}
          contentStyle={styles.bannerContent}
        >
          <View style={styles.starCircle}>
            <Ionicons name="star" size={16} color={colors.accentYellow} />
          </View>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitle}>ALWAYS FREE. NEVER BLURRED.</Text>
            <Text style={styles.bannerSubtitle}>
              NO PAYWALLS. NO BLURRY BAIT. JUST PURE CONNECTION.
            </Text>
          </View>
        </BrutalBox>

        {/* 3. 2x2 Grid of Profile Cards matching ref/inApp2.png */}
        <View style={styles.grid}>
          {profiles.map((item) => (
            <View key={item.id} style={styles.gridCardWrapper}>
              <BrutalBox
                backgroundColor={colors.cardWhite}
                borderColor={colors.borderBlack}
                borderWidth={2.4}
                borderRadius={18}
                shadowOffset={{ x: 3.5, y: 3.5 }}
                overflow="hidden"
                style={styles.cardBox}
                contentStyle={styles.cardContent}
              >
                {/* Photo Area */}
                <View style={styles.cardPhotoWrapper}>
                  <ProfileIllustration hair={item.hairColor} bg={item.bgColor} />

                  {/* 100% REAL Badge */}
                  <View style={styles.realBadge}>
                    <Ionicons name="checkmark-done" size={11} color={colors.textDark} />
                    <Text style={styles.realBadgeText}>100% REAL</Text>
                  </View>

                  {/* Comment Callout Pill */}
                  {item.commentType === 'photo' && (
                    <View style={styles.commentBox}>
                      <View style={styles.commentTag}>
                        <Text style={styles.commentTagText}>P!NGED YOUR PHOTO</Text>
                      </View>
                      <Text style={styles.commentText} numberOfLines={2}>
                        "{item.commentText}"
                      </Text>
                    </View>
                  )}

                  {item.commentType === 'bio' && (
                    <View style={styles.bioCommentBox}>
                      <MaterialCommunityIcons name="lightning-bolt" size={12} color={colors.textDark} />
                      <Text style={styles.bioCommentText}>{item.commentText}</Text>
                    </View>
                  )}

                  {/* Extra Badge (JUST NOW / HIGH VIBE) */}
                  {item.badgeExtra && (
                    <View
                      style={[
                        styles.extraBadge,
                        item.badgeExtra === 'JUST NOW'
                          ? { backgroundColor: colors.accentYellow }
                          : { backgroundColor: colors.lavender },
                      ]}
                    >
                      <Text style={styles.extraBadgeText}>{item.badgeExtra}</Text>
                    </View>
                  )}
                </View>

                {/* Info Area */}
                <View style={styles.cardBottom}>
                  <Text style={styles.cardName}>
                    {item.name}, {item.age}
                  </Text>
                  <View style={styles.distanceBadge}>
                    <Text style={styles.distanceText}>{item.distance}</Text>
                  </View>
                </View>
              </BrutalBox>

              {/* Centered Overlapping Circular Action Buttons matching ref/inApp2.png */}
              <View style={styles.overlappingActions}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleAction(item.id, item.name, 'pass')}
                  style={styles.actionBtnPass}
                >
                  <Feather name="x" size={18} color={colors.textDark} />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleAction(item.id, item.name, 'match')}
                  style={styles.actionBtnHeart}
                >
                  <Ionicons name="heart" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 28,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 12,
  },
  fullWidth: {
    width: '100%',
  },

  /* Header */
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E11D48',
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },

  /* Value Proposition Banner */
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  starCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  bannerSubtitle: {
    fontSize: 9.5,
    fontFamily: typography.bodyExtraBold,
    color: '#374151',
    letterSpacing: 0.3,
    marginTop: 2,
  },

  /* 2x2 Grid of Profiles */
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 24,
  },
  gridCardWrapper: {
    width: '48%',
    position: 'relative',
  },
  cardBox: {
    width: '100%',
  },
  cardContent: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
  },
  cardPhotoWrapper: {
    width: '100%',
    height: 180,
    position: 'relative',
    overflow: 'hidden',
  },
  realBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentYellow,
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    gap: 3,
  },
  realBadgeText: {
    fontSize: 8.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  commentBox: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 10,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  commentTag: {
    backgroundColor: colors.primaryPink,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    alignSelf: 'flex-start',
    marginBottom: 3,
  },
  commentTagText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontFamily: typography.bodyExtraBold,
  },
  commentText: {
    fontSize: 9.5,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
  },
  bioCommentBox: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.6,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  bioCommentText: {
    fontSize: 8.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  extraBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  extraBadgeText: {
    fontSize: 8.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },

  /* Bottom Card Info */
  cardBottom: {
    padding: 10,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
    gap: 3,
  },
  cardName: {
    fontSize: 16,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  distanceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderWidth: 1.2,
    borderColor: '#9CA3AF',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  distanceText: {
    fontSize: 8.5,
    fontFamily: typography.bodyBold,
    color: '#4B5563',
  },

  /* Centered Overlapping Action Buttons */
  overlappingActions: {
    position: 'absolute',
    bottom: -16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    zIndex: 20,
  },
  actionBtnPass: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  actionBtnHeart: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryPink,
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
});
