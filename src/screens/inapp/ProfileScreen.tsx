import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, {
  Circle,
  Path,
  G,
  Rect,
} from 'react-native-svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { BrutalBox } from '../../components/BrutalBox';
import { UserAccount } from '../../services/authDb';

interface ProfileScreenProps {
  user: UserAccount;
  onLogout: () => void;
  onReplayOnboarding?: () => void;
  onEditProfile?: () => void;
}

function AvatarAlex() {
  return (
    <Svg width="140" height="140" viewBox="0 0 140 140">
      {/* Yellow Background Circle */}
      <Circle cx="70" cy="70" r="66" fill="#FFE600" />
      <Circle cx="70" cy="70" r="66" stroke="#000" strokeWidth="2.5" />

      <G transform="translate(15, 12)">
        {/* Face */}
        <Circle cx="55" cy="58" r="30" fill="#FED7AA" />

        {/* Yellow Beanie */}
        <Path
          d="M 26 44 Q 55 18 84 44 L 86 52 Q 55 48 24 52 Z"
          fill="#F59E0B"
          stroke="#000"
          strokeWidth="2.2"
        />
        {/* Beanie Ribbing Lines */}
        <Path d="M 36 34 L 38 48" stroke="#D97706" strokeWidth="1.8" />
        <Path d="M 48 27 L 49 47" stroke="#D97706" strokeWidth="1.8" />
        <Path d="M 62 27 L 61 47" stroke="#D97706" strokeWidth="1.8" />
        <Path d="M 74 34 L 72 48" stroke="#D97706" strokeWidth="1.8" />

        {/* Short Dark Hair peeking */}
        <Path d="M 23 50 Q 20 62 25 68" stroke="#18181B" strokeWidth="3" fill="none" strokeLinecap="round" />
        <Path d="M 87 50 Q 90 62 85 68" stroke="#18181B" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Eyebrows */}
        <Path d="M 38 52 Q 45 49 50 53" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M 60 53 Q 65 49 72 52" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />

        {/* Eyes */}
        <Circle cx="44" cy="59" r="4" fill="#18181B" />
        <Circle cx="66" cy="59" r="4" fill="#18181B" />
        <Circle cx="42.5" cy="57.5" r="1.5" fill="#FFF" />
        <Circle cx="64.5" cy="57.5" r="1.5" fill="#FFF" />

        {/* Nose */}
        <Path d="M 55 58 L 53 66 L 57 66" fill="none" stroke="#78350F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

        {/* Warm Smile */}
        <Path d="M 44 73 Q 55 83 66 73" fill="none" stroke="#991B1B" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M 47 74 Q 55 79 63 74" fill="#FFF" />

        {/* Ear & Earring */}
        <Circle cx="86" cy="62" r="2.5" fill="#FFF" stroke="#000" strokeWidth="1" />

        {/* Colorful Shirt */}
        <Path d="M 12 115 L 25 86 Q 55 80 85 86 L 98 115 Z" fill="#2563EB" stroke="#000" strokeWidth="2.4" />
        <Path d="M 40 84 L 55 102 L 70 84" fill="#DC2626" stroke="#000" strokeWidth="2" />
        <Circle cx="55" cy="108" r="2.5" fill="#FFE600" />
      </G>
    </Svg>
  );
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onLogout,
  onReplayOnboarding,
  onEditProfile,
}) => {
  const displayName = user.name || 'ALEX';
  const displayAge = user.age || 26;
  const displayBio =
    user.bio && user.bio.trim().length > 0
      ? user.bio
      : 'Beach walks, spicy tacos, art galleries & making analog synth music.';

  const handleEditPress = () => {
    if (onEditProfile) {
      onEditProfile();
    } else {
      Alert.alert('✏️ Edit Profile', 'Profile edit screen opening soon!');
    }
  };

  const handleManageInterests = () => {
    Alert.alert('✨ Manage Vibes', 'Add or change your interests and obsessions.');
  };

  const handleSettingItem = (title: string) => {
    Alert.alert(title, `Configure your ${title} settings.`);
  };

  const handleConfirmLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of P!NG?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: onLogout },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* 1. Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.titleWithDot}>
            <View style={styles.pinkDot} />
            <Text style={styles.headerTitle}>MY PROFILE</Text>
          </View>

          {/* Settings Gear Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSettingItem('All Settings')}
          >
            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2.2}
              borderRadius={999}
              shadowOffset={3}
              style={styles.gearButton}
            >
              <Ionicons name="settings-outline" size={20} color={colors.textDark} />
            </BrutalBox>
          </TouchableOpacity>
        </View>

        {/* 2. Hero Avatar Section */}
        <View style={styles.heroSection}>
          <View style={styles.avatarContainer}>
            <AvatarAlex />
            {/* 100% REAL Floating Badge */}
            <View style={styles.realBadgeWrapper}>
              <BrutalBox
                backgroundColor={colors.accentYellow}
                borderColor={colors.borderBlack}
                borderWidth={2}
                borderRadius={999}
                shadowOffset={2.5}
                style={styles.realBadge}
              >
                <View style={styles.realBadgeRow}>
                  <Ionicons name="shield-checkmark" size={12} color={colors.textDark} />
                  <Text style={styles.realBadgeText}>100% REAL</Text>
                </View>
              </BrutalBox>
            </View>
          </View>

          {/* User Name & Age */}
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>
              {displayName.toUpperCase()}, {displayAge}
            </Text>
            <Ionicons name="flash" size={22} color={colors.primaryPink} />
          </View>

          {/* Active Now Pill */}
          <View style={styles.activeNowPill}>
            <View style={styles.activeDot} />
            <Text style={styles.activeNowText}>ACTIVE NOW</Text>
          </View>

          {/* EDIT PROFILE & PHOTOS BUTTON */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleEditPress}
            style={styles.editButtonWrapper}
          >
            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2.4}
              borderRadius={16}
              shadowOffset={3.5}
              style={styles.editButton}
            >
              <View style={styles.editButtonContent}>
                <Text style={styles.editButtonEmoji}>✏️</Text>
                <Text style={styles.editButtonText}>EDIT PROFILE & PHOTOS</Text>
              </View>
            </BrutalBox>
          </TouchableOpacity>
        </View>

        {/* 3. Stats Trio (Pink, Yellow, Lavender) */}
        <View style={styles.statsRow}>
          {/* Stat 1: Pings Left */}
          <View style={styles.statCardWrap}>
            <BrutalBox
              backgroundColor="#FFD5E5"
              borderColor={colors.borderBlack}
              borderWidth={2.2}
              borderRadius={16}
              shadowOffset={3}
              style={styles.statCard}
            >
              <Text style={styles.statNumber}>84</Text>
              <View style={styles.statLabelRow}>
                <Ionicons name="flash" size={11} color="#D97706" />
                <Text style={styles.statLabel}>P!NGS</Text>
              </View>
            </BrutalBox>
          </View>

          {/* Stat 2: Free Likes */}
          <View style={styles.statCardWrap}>
            <BrutalBox
              backgroundColor={colors.accentYellow}
              borderColor={colors.borderBlack}
              borderWidth={2.2}
              borderRadius={16}
              shadowOffset={3}
              style={styles.statCard}
            >
              <Text style={styles.statNumber}>100%</Text>
              <View style={styles.statLabelRow}>
                <Ionicons name="heart" size={11} color={colors.primaryPink} />
                <Text style={styles.statLabel}>FREE LIKES</Text>
              </View>
            </BrutalBox>
          </View>

          {/* Stat 3: Reply Rate */}
          <View style={styles.statCardWrap}>
            <BrutalBox
              backgroundColor="#E2DCFE"
              borderColor={colors.borderBlack}
              borderWidth={2.2}
              borderRadius={16}
              shadowOffset={3}
              style={styles.statCard}
            >
              <Text style={styles.statNumber}>98%</Text>
              <View style={styles.statLabelRow}>
                <Ionicons name="chatbubble-ellipses" size={11} color="#4F46E5" />
                <Text style={styles.statLabel}>REPLY RATE</Text>
              </View>
            </BrutalBox>
          </View>
        </View>

        {/* 4. BIO & VIBES CONTAINER */}
        <View style={styles.bioContainerWrapper}>
          {/* Floating Attached Yellow Badge */}
          <View style={styles.bioBadgeWrap}>
            <BrutalBox
              backgroundColor={colors.accentYellow}
              borderColor={colors.borderBlack}
              borderWidth={2}
              borderRadius={8}
              shadowOffset={2}
              style={styles.bioBadge}
            >
              <Text style={styles.bioBadgeText}>BIO & VIBES</Text>
            </BrutalBox>
          </View>

          <BrutalBox
            backgroundColor="#FFFFFF"
            borderColor={colors.borderBlack}
            borderWidth={2.4}
            borderRadius={20}
            shadowOffset={3.5}
            style={styles.bioCard}
          >
            {/* About Me Section */}
            <View style={styles.aboutMeSection}>
              <View style={styles.sectionHeadingRow}>
                <Feather name="menu" size={14} color={colors.textDark} />
                <Text style={styles.sectionHeadingText}>ABOUT ME:</Text>
              </View>
              <Text style={styles.bioBodyText}>{displayBio}</Text>
            </View>

            <View style={styles.bioDivider} />

            {/* Interests & Obsessions Section */}
            <View style={styles.interestsSection}>
              <View style={styles.interestsHeaderRow}>
                <Text style={styles.interestsHeadingText}>
                  INTERESTS & OBSESSIONS:
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleManageInterests}
                >
                  <Text style={styles.manageLinkText}>MANAGE</Text>
                </TouchableOpacity>
              </View>

              {/* Interest Pills */}
              <View style={styles.chipsContainer}>
                <View style={[styles.chipPill, { backgroundColor: '#FFD5E5' }]}>
                  <Text style={styles.chipText}>Flat White Enthusiast</Text>
                </View>

                <View style={[styles.chipPill, { backgroundColor: '#E2DCFE' }]}>
                  <Text style={styles.chipText}>Bouldering 6B</Text>
                </View>

                <View style={[styles.chipPill, { backgroundColor: '#FFE600' }]}>
                  <Text style={styles.chipText}>Analog Vinyl</Text>
                </View>

                <View style={[styles.chipPill, { backgroundColor: '#FAF7F2' }]}>
                  <Text style={styles.chipText}>Modernist Design</Text>
                </View>

                <View style={[styles.chipPill, { backgroundColor: '#FFD5E5' }]}>
                  <Text style={styles.chipText}>Omakase Nights</Text>
                </View>

                <View style={[styles.chipPill, { backgroundColor: '#E2DCFE' }]}>
                  <Text style={styles.chipText}>35mm Film Photography</Text>
                </View>
              </View>
            </View>
          </BrutalBox>
        </View>

        {/* 5. SETTINGS LIST ITEMS */}
        <View style={styles.settingsList}>
          {/* Item 1: Preferences & Filters */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSettingItem('Preferences & Filters')}
            style={styles.settingItemWrap}
          >
            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2.2}
              borderRadius={18}
              shadowOffset={3}
              style={styles.settingItem}
            >
              <View style={styles.settingRow}>
                <View style={[styles.settingIconBox, { backgroundColor: '#FCE7F3' }]}>
                  <Ionicons name="options-outline" size={20} color={colors.primaryPink} />
                </View>
                <View style={styles.settingTextGroup}>
                  <Text style={styles.settingTitle}>Preferences & Filters</Text>
                  <Text style={styles.settingSubtitle} numberOfLines={1}>
                    Age, distance, relationship intent...
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.textDark} />
              </View>
            </BrutalBox>
          </TouchableOpacity>

          {/* Item 2: Safety Centre */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSettingItem('Safety Centre')}
            style={styles.settingItemWrap}
          >
            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2.2}
              borderRadius={18}
              shadowOffset={3}
              style={styles.settingItem}
            >
              <View style={styles.settingRow}>
                <View style={[styles.settingIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#D97706" />
                </View>
                <View style={styles.settingTextGroup}>
                  <Text style={styles.settingTitle}>Safety Centre</Text>
                  <Text style={styles.settingSubtitle} numberOfLines={1}>
                    Emergency resources, block list...
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.textDark} />
              </View>
            </BrutalBox>
          </TouchableOpacity>

          {/* Item 3: Account & Security */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSettingItem('Account & Security')}
            style={styles.settingItemWrap}
          >
            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2.2}
              borderRadius={18}
              shadowOffset={3}
              style={styles.settingItem}
            >
              <View style={styles.settingRow}>
                <View style={[styles.settingIconBox, { backgroundColor: '#E0E7FF' }]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#4F46E5" />
                </View>
                <View style={styles.settingTextGroup}>
                  <Text style={styles.settingTitle}>Account & Security</Text>
                  <Text style={styles.settingSubtitle} numberOfLines={1}>
                    Phone, active devices, sessions
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.textDark} />
              </View>
            </BrutalBox>
          </TouchableOpacity>

          {/* Item 4: All Settings */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSettingItem('All Settings')}
            style={styles.settingItemWrap}
          >
            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2.2}
              borderRadius={18}
              shadowOffset={3}
              style={styles.settingItem}
            >
              <View style={styles.settingRow}>
                <View style={[styles.settingIconBox, { backgroundColor: '#F3F4F6' }]}>
                  <Ionicons name="apps-outline" size={20} color={colors.textDark} />
                </View>
                <View style={styles.settingTextGroup}>
                  <Text style={styles.settingTitle}>All Settings</Text>
                  <Text style={styles.settingSubtitle} numberOfLines={1}>
                    Notifications, privacy, data & storage...
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.textDark} />
              </View>
            </BrutalBox>
          </TouchableOpacity>
        </View>

        {/* 6. PROMINENT LOG OUT BUTTON */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleConfirmLogout}
          style={styles.logoutButtonWrap}
        >
          <BrutalBox
            backgroundColor="#B5003D"
            borderColor={colors.borderBlack}
            borderWidth={2.4}
            borderRadius={16}
            shadowOffset={3.5}
            style={styles.logoutButton}
          >
            <View style={styles.logoutContent}>
              <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
              <Text style={styles.logoutText}>LOG OUT</Text>
            </View>
          </BrutalBox>
        </TouchableOpacity>

        {/* Developer Replay Mode for Quick Access */}
        {onReplayOnboarding && (
          <TouchableOpacity
            style={styles.replayLink}
            activeOpacity={0.7}
            onPress={onReplayOnboarding}
          >
            <Text style={styles.replayLinkText}>
              🔄 Replay 8 Onboarding Screens Flow
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 30,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pinkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryPink,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: typography.headingHero,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  gearButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 144,
    height: 144,
  },
  realBadgeWrapper: {
    position: 'absolute',
    bottom: 2,
    transform: [{ rotate: '-3deg' }],
  },
  realBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  realBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  realBadgeText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 10,
    color: colors.textDark,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  nameText: {
    fontSize: 28,
    fontFamily: typography.headingHero,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  activeNowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE7F3',
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 6,
    gap: 6,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primaryPink,
  },
  activeNowText: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: colors.primaryPink,
    letterSpacing: 0.5,
  },
  editButtonWrapper: {
    width: '100%',
    marginTop: 16,
  },
  editButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButtonEmoji: {
    fontSize: 16,
  },
  editButtonText: {
    fontSize: 16,
    fontFamily: typography.headingHero,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 22,
  },
  statCardWrap: {
    flex: 1,
  },
  statCard: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: typography.headingHero,
    color: colors.textDark,
    letterSpacing: 0.3,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 9.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.3,
  },
  bioContainerWrapper: {
    position: 'relative',
    marginBottom: 18,
    paddingTop: 10,
  },
  bioBadgeWrap: {
    position: 'absolute',
    top: 0,
    left: 14,
    zIndex: 10,
  },
  bioBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bioBadgeText: {
    fontSize: 10.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  bioCard: {
    padding: 16,
    paddingTop: 18,
  },
  aboutMeSection: {
    marginBottom: 12,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  sectionHeadingText: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: '#4B5563',
    letterSpacing: 0.5,
  },
  bioBodyText: {
    fontSize: 14.5,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
    lineHeight: 20,
  },
  bioDivider: {
    height: 1.5,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  interestsSection: {},
  interestsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  interestsHeadingText: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: '#4B5563',
    letterSpacing: 0.5,
  },
  manageLinkText: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: colors.primaryPink,
    letterSpacing: 0.5,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipPill: {
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 1.8, height: 1.8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  chipText: {
    fontSize: 12,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
  },
  settingsList: {
    gap: 10,
    marginBottom: 20,
  },
  settingItemWrap: {},
  settingItem: {
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTextGroup: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: typography.bodyMedium,
    color: '#6B7280',
  },
  logoutButtonWrap: {
    marginTop: 6,
    marginBottom: 14,
  },
  logoutButton: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutText: {
    fontSize: 18,
    fontFamily: typography.headingHero,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  replayLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  replayLinkText: {
    fontSize: 12,
    fontFamily: typography.bodyBold,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
});
