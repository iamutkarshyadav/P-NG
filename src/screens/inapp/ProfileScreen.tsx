import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { LAYOUT } from '../../theme/responsive';
import { BrutalBox } from '../../components/BrutalBox';
import { UserAccount } from '../../types/user';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ProfileAvatar } from '../../components/ProfileAvatar';
import { usePhotos } from '../../hooks/usePhotos';
import { fetchAllTags, fetchMyTagIds, saveMyTags } from '../../services/tags';
import { errorMessage } from '../../services/errors';
import { AccountSecurityScreen } from './AccountSecurityScreen';
import { PreferencesScreen } from './PreferencesScreen';
import { SafetyCenterScreen } from './SafetyCenterScreen';
import { AppSettingsScreen } from './AppSettingsScreen';
import { ProfilePreviewScreen } from './ProfilePreviewScreen';

interface ProfileScreenProps {
  user: UserAccount;
  onLogout: () => void;
  onSwitchToDemo?: (demo: 'alex' | 'sam') => void;
  onReplayOnboarding?: () => void;
  onEditProfile?: () => void;
  onSubScreenChange?: (isSubScreen: boolean) => void;
  initialSubScreen?: 'none' | 'account' | 'preferences' | 'safety' | 'settings' | 'preview';
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onLogout,
  onSwitchToDemo,
  onReplayOnboarding,
  onEditProfile,
  onSubScreenChange,
  initialSubScreen = 'none',
}) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const queryClient = useQueryClient();
  const tagsQuery = useQuery({ queryKey: ['tags'], queryFn: fetchAllTags, staleTime: 10 * 60_000 });
  const myTagsQuery = useQuery({ queryKey: ['my-tags', user.id], queryFn: () => fetchMyTagIds(user.id) });
  const { photos } = usePhotos(user.id);
  const [savingInterests, setSavingInterests] = useState(false);
  const allTags = useMemo(() => tagsQuery.data ?? [], [tagsQuery.data]);
  const myTagIds = useMemo(() => myTagsQuery.data ?? [], [myTagsQuery.data]);
  const userInterests = useMemo(
    () => allTags.filter((t) => myTagIds.includes(t.id)).map((t) => t.name),
    [allTags, myTagIds]
  );
  const [tempTagIds, setTempTagIds] = useState<number[]>([]);

  const [activeSubScreen, setActiveSubScreen] = useState<
    'none' | 'account' | 'preferences' | 'safety' | 'settings' | 'preview'
  >(initialSubScreen);

  useEffect(() => {
    if (initialSubScreen && initialSubScreen !== 'none') {
      setActiveSubScreen(initialSubScreen);
    }
  }, [initialSubScreen]);

  useEffect(() => {
    if (onSubScreenChange) {
      onSubScreenChange(activeSubScreen !== 'none');
    }
  }, [activeSubScreen, onSubScreenChange]);

  const displayName = user.name;
  const displayAge = user.age;
  const displayBio =
    user.bio && user.bio.trim().length > 0 ? user.bio : 'Add a short bio so people know who you are.';

  const handleEditPress = () => {
    if (onEditProfile) {
      onEditProfile();
    } else {
      setActiveSubScreen('preview');
    }
  };

  const handleManageInterests = () => {
    setTempTagIds([...myTagIds]);
    setShowInterestsModal(true);
  };

  const toggleTempInterest = (tagId: number) => {
    if (tempTagIds.includes(tagId)) {
      if (tempTagIds.length > 1) {
        setTempTagIds(tempTagIds.filter((id) => id !== tagId));
      } else {
        Alert.alert('Minimum Interests', 'Keep at least 1 interest so matches know your vibe.');
      }
    } else if (tempTagIds.length < 8) {
      setTempTagIds([...tempTagIds, tagId]);
    } else {
      Alert.alert('Maximum Reached', 'You can select up to 8 core interests.');
    }
  };

  const handleSaveInterests = async () => {
    setSavingInterests(true);
    try {
      await saveMyTags(user.id, tempTagIds);
      await queryClient.invalidateQueries({ queryKey: ['my-tags', user.id] });
      setShowInterestsModal(false);
    } catch (e) {
      Alert.alert('Could not save', errorMessage(e));
    } finally {
      setSavingInterests(false);
    }
  };

  const handleSettingItem = (title: string) => {
    if (title === 'Preferences & Filters') {
      setActiveSubScreen('preferences');
    } else if (title === 'Safety Centre') {
      setActiveSubScreen('safety');
    } else if (title === 'Account & Security') {
      setActiveSubScreen('account');
    } else if (title === 'All Settings') {
      setActiveSubScreen('settings');
    } else {
      Alert.alert(title, `Configure your ${title} settings.`);
    }
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(true);
  };

  const handleExecuteLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  // Sub-screen rendering
  if (activeSubScreen === 'account') {
    return (
      <AccountSecurityScreen
        user={user}
        onBack={() => setActiveSubScreen('none')}
        onPreviewProfile={() => setActiveSubScreen('preview')}
      />
    );
  }

  if (activeSubScreen === 'preferences') {
    return (
      <PreferencesScreen
        user={user}
        onBack={() => setActiveSubScreen('none')}
        onPreviewProfile={() => setActiveSubScreen('preview')}
      />
    );
  }

  if (activeSubScreen === 'safety') {
    return (
      <SafetyCenterScreen
        user={user}
        onBack={() => setActiveSubScreen('none')}
        onPreviewProfile={() => setActiveSubScreen('preview')}
      />
    );
  }

  if (activeSubScreen === 'settings') {
    return (
      <AppSettingsScreen
        user={user}
        onBack={() => setActiveSubScreen('none')}
        onPreviewProfile={() => setActiveSubScreen('preview')}
      />
    );
  }

  if (activeSubScreen === 'preview') {
    return (
      <ProfilePreviewScreen
        user={user}
        onBack={() => setActiveSubScreen('none')}
      />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>

        {/* 2. Hero Avatar Section */}
        <View style={styles.heroSection}>
          <View style={styles.avatarContainer}>
            <ProfileAvatar
              uri={photos[0]?.url}
              seed={user.id}
              size={132}
              style={styles.heroAvatar}
              accessibilityLabel="Your primary photo"
            />
            {user.isVerifiedReal && (
              <>
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
              </>
            )}
          </View>

          {/* User Name & Age */}
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>
              {displayName.toUpperCase()}{displayAge ? `, ${displayAge}` : ''}
            </Text>
            <Ionicons name="flash" size={22} color={colors.primaryPink} />
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
                {userInterests.length === 0 && <Text style={styles.bioBodyText}>No interests yet. Tap MANAGE to add some.</Text>}
                {userInterests.map((interest, idx) => {
                  const pillColors = ['#FFD5E5', '#E2DCFE', '#FFE600', '#FAF7F2', '#D1FAE5', '#FEF08A'];
                  const bg = pillColors[idx % pillColors.length];
                  return (
                    <View key={interest} style={[styles.chipPill, { backgroundColor: bg }]}>
                      <Text style={styles.chipText}>{interest}</Text>
                    </View>
                  );
                })}
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

        {/* 7. QUICK DEMO ACCOUNTS SWITCHER (dev builds only) */}
        {onSwitchToDemo && (
        <View style={styles.demoAccountsContainer}>
          <BrutalBox
            backgroundColor={colors.cardWhite}
            borderColor={colors.borderBlack}
            borderWidth={2.4}
            borderRadius={18}
            shadowOffset={{ x: 3.5, y: 3.5 }}
            style={styles.fullWidth}
            contentStyle={styles.demoAccountsCardContent}
          >
            <View style={styles.demoHeaderRow}>
              <Ionicons name="flash" size={15} color="#D97706" />
              <Text style={styles.demoHeaderTitle}>DEMO ACCOUNT QUICK SWITCH</Text>
            </View>
            <Text style={styles.demoHeaderSubtitle}>
              Instantly switch test sessions without manual typing:
            </Text>

            <View style={styles.demoButtonsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onSwitchToDemo?.('alex')}
                style={styles.demoBtnItem}
              >
                <BrutalBox
                  backgroundColor={user.email.includes('alex') ? colors.accentYellow : '#FAF7F2'}
                  borderColor={colors.borderBlack}
                  borderWidth={2}
                  borderRadius={12}
                  shadowOffset={{ x: 2, y: 2 }}
                  contentStyle={styles.demoBtnItemContent}
                >
                  <Text style={styles.demoBtnItemEmoji}>⚡</Text>
                  <Text style={styles.demoBtnItemLabel}>ALEX</Text>
                  {user.email.includes('alex') && (
                    <View style={styles.currentActiveDot} />
                  )}
                </BrutalBox>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onSwitchToDemo?.('sam')}
                style={styles.demoBtnItem}
              >
                <BrutalBox
                  backgroundColor={user.email.includes('sam') ? colors.primaryPink : '#FAF7F2'}
                  borderColor={colors.borderBlack}
                  borderWidth={2}
                  borderRadius={12}
                  shadowOffset={{ x: 2, y: 2 }}
                  contentStyle={styles.demoBtnItemContent}
                >
                  <Text style={styles.demoBtnItemEmoji}>❤️</Text>
                  <Text style={[styles.demoBtnItemLabel, user.email.includes('sam') && { color: '#FFF' }]}>
                    SAM
                  </Text>
                  {user.email.includes('sam') && (
                    <View style={styles.currentActiveDot} />
                  )}
                </BrutalBox>
              </TouchableOpacity>

            </View>
          </BrutalBox>
        </View>
        )}

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

      {/* Neo-Brutalist Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCardWrap}>
            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={3}
              borderRadius={20}
              shadowOffset={{ x: 5, y: 5 }}
              contentStyle={styles.modalCardContent}
            >
              {/* Floating Alert Tag */}
              <View style={styles.modalTagWrapper}>
                <View style={styles.modalTag}>
                  <Text style={styles.modalTagText}>⚠️ CONFIRM LOGOUT</Text>
                </View>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>LOG OUT OF P!NG?</Text>
                <Text style={styles.modalSubtitle}>
                  Logged in as <Text style={{ fontFamily: typography.bodyBold }}>{displayName}</Text> ({user.email}).
                  Your profile and preferences remain saved in the local demo database.
                </Text>

                <View style={styles.modalButtonsRow}>
                  {/* Cancel Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowLogoutModal(false)}
                    style={styles.modalBtnHalf}
                  >
                    <BrutalBox
                      backgroundColor="#EBE7E0"
                      borderColor={colors.borderBlack}
                      borderWidth={2.2}
                      borderRadius={12}
                      shadowOffset={{ x: 2.5, y: 2.5 }}
                      contentStyle={styles.modalBtnContent}
                    >
                      <Text style={styles.modalCancelText}>CANCEL</Text>
                    </BrutalBox>
                  </TouchableOpacity>

                  {/* Confirm Log Out Button */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleExecuteLogout}
                    style={styles.modalBtnHalf}
                  >
                    <BrutalBox
                      backgroundColor="#B5003D"
                      borderColor={colors.borderBlack}
                      borderWidth={2.2}
                      borderRadius={12}
                      shadowOffset={{ x: 2.5, y: 2.5 }}
                      contentStyle={styles.modalBtnContent}
                    >
                      <Text style={styles.modalLogoutText}>YES, LOG OUT</Text>
                    </BrutalBox>
                  </TouchableOpacity>
                </View>
              </View>
            </BrutalBox>
          </View>
        </View>
      </Modal>

      {/* Neo-Brutalist Manage Profile Interests Modal */}
      <Modal
        visible={showInterestsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInterestsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCardWrap}>
            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={3}
              borderRadius={20}
              shadowOffset={{ x: 5, y: 5 }}
              contentStyle={styles.modalCardContent}
            >
              {/* Floating Tag */}
              <View style={styles.modalTagWrapper}>
                <View style={[styles.modalTag, { backgroundColor: colors.accentYellow }]}>
                  <Text style={styles.modalTagText}>⚡ PROFILE VIBES</Text>
                </View>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>MANAGE INTERESTS</Text>
                <Text style={styles.modalSubtitle}>
                  Select passions & hobbies to showcase on your card ({tempTagIds.length}/8 active).
                </Text>

                <View style={styles.modalVibesGrid}>
                  {allTags.map((tag) => {
                    const item = tag.name;
                    const isSelected = tempTagIds.includes(tag.id);
                    return (
                      <TouchableOpacity
                        key={tag.id}
                        activeOpacity={0.75}
                        onPress={() => toggleTempInterest(tag.id)}
                        style={[
                          styles.vibeChoiceChip,
                          isSelected && styles.vibeChoiceChipActive,
                        ]}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={14} color="#000" style={{ marginRight: 4 }} />
                        )}
                        <Text
                          style={[
                            styles.vibeChoiceText,
                            isSelected && styles.vibeChoiceTextActive,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.modalButtonsRow}>
                  {/* Cancel */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowInterestsModal(false)}
                    style={styles.modalBtnHalf}
                  >
                    <BrutalBox
                      backgroundColor="#EBE7E0"
                      borderColor={colors.borderBlack}
                      borderWidth={2.2}
                      borderRadius={12}
                      shadowOffset={{ x: 2.5, y: 2.5 }}
                      contentStyle={styles.modalBtnContent}
                    >
                      <Text style={styles.modalCancelText}>CANCEL</Text>
                    </BrutalBox>
                  </TouchableOpacity>

                  {/* Save Button */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleSaveInterests}
                    style={styles.modalBtnHalf}
                  >
                    <BrutalBox
                      backgroundColor={colors.accentYellow}
                      borderColor={colors.borderBlack}
                      borderWidth={2.2}
                      borderRadius={12}
                      shadowOffset={{ x: 2.5, y: 2.5 }}
                      contentStyle={styles.modalBtnContent}
                    >
                      {savingInterests ? (
                        <ActivityIndicator color="#000" />
                      ) : (
                        <Text style={[styles.modalCancelText, { color: '#000' }]}>SAVE VIBES ⚡</Text>
                      )}
                    </BrutalBox>
                  </TouchableOpacity>
                </View>
              </View>
            </BrutalBox>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 105 : 95,
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
  heroAvatar: {
    borderWidth: 3,
    borderColor: colors.borderBlack,
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
  fullWidth: {
    width: '100%',
  },

  /* Neo-Brutalist Logout Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCardWrap: {
    width: '100%',
    maxWidth: 380,
  },
  modalCardContent: {
    padding: 20,
    paddingTop: 24,
    position: 'relative',
    overflow: 'visible',
  },
  modalTagWrapper: {
    position: 'absolute',
    top: -14,
    left: 16,
    zIndex: 10,
  },
  modalTag: {
    backgroundColor: colors.accentYellow,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  modalTagText: {
    fontSize: 10.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  modalBody: {
    gap: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: typography.bodyMedium,
    color: '#4B5563',
    lineHeight: 18,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalBtnHalf: {
    flex: 1,
  },
  modalBtnContent: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  modalLogoutText: {
    fontSize: 13,
    fontFamily: typography.bodyExtraBold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  /* Demo Accounts Quick Switcher */
  demoAccountsContainer: {
    marginTop: 6,
    marginBottom: 10,
    width: '100%',
  },
  demoAccountsCardContent: {
    padding: 14,
    gap: 8,
  },
  demoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoHeaderTitle: {
    fontSize: 12,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  demoHeaderSubtitle: {
    fontSize: 11.5,
    fontFamily: typography.bodyMedium,
    color: '#6B7280',
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  demoBtnItem: {
    flex: 1,
  },
  demoBtnItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    gap: 5,
    paddingHorizontal: 6,
    position: 'relative',
  },
  demoBtnItemEmoji: {
    fontSize: 13,
  },
  demoBtnItemLabel: {
    fontSize: 11.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  currentActiveDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryPink,
  },
  modalVibesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 14,
  },
  vibeChoiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  vibeChoiceChipActive: {
    backgroundColor: colors.accentYellow,
  },
  vibeChoiceText: {
    fontFamily: typography.fonts.bold,
    fontSize: 12,
    color: '#4B5563',
  },
  vibeChoiceTextActive: {
    color: '#000000',
  },
});
