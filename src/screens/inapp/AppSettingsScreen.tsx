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
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { LAYOUT } from '../../theme/responsive';
import { DotGridBackground } from '../../components/DotGridBackground';
import { BrutalBox } from '../../components/BrutalBox';
import { UserAccount } from '../../services/authDb';

interface AppSettingsScreenProps {
  user: UserAccount;
  onBack: () => void;
  onPreviewProfile?: () => void;
}

export const AppSettingsScreen: React.FC<AppSettingsScreenProps> = ({
  user,
  onBack,
  onPreviewProfile,
}) => {
  // Notification States
  const [notifyMatches, setNotifyMatches] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifySuperpings, setNotifySuperpings] = useState(true);
  const [notifyEvents, setNotifyEvents] = useState(false);

  // Presence & Chat Privacy States
  const [showActiveStatus, setShowActiveStatus] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [approximateDistance, setApproximateDistance] = useState(false);

  // Experience & Feedback States
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  // Storage Cache State
  const [cacheSize, setCacheSize] = useState('148.4 MB');

  const handleClearCache = () => {
    Alert.alert(
      'Clear Media Cache',
      'Free up local temporary media, voice cache, and unpinned profile thumbnails?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: () => {
            setCacheSize('0.0 MB');
            Alert.alert('🧹 Cache Cleared', '148.4 MB of temporary media storage freed.');
          },
        },
      ]
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      'Download My P!NG Data',
      'Your GDPR & CCPA full profile archive will be compiled and sent to your verified email within 24 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Archive',
          onPress: () =>
            Alert.alert(
              '📦 Archive Queued',
              `A secure download link will be dispatched to ${user.email || 'your registered email'}.`
            ),
        },
      ]
    );
  };

  const handleShowLegal = (title: string, desc: string) => {
    Alert.alert(title, desc);
  };

  // Reusable Brutalist Toggle Component
  const renderBrutalToggle = (
    value: boolean,
    onToggle: () => void,
    activeIcon: keyof typeof Ionicons.glyphMap = 'flash'
  ) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggle}
      style={[styles.brutalToggle, value ? styles.brutalToggleOn : styles.brutalToggleOff]}
    >
      <View style={[styles.toggleKnob, value ? styles.toggleKnobOn : styles.toggleKnobOff]}>
        {value ? <Ionicons name={activeIcon} size={12} color="#000" /> : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screenWrapper}>
      <StatusBar style="dark" />
      <DotGridBackground />

      {/* Top Back Navigation (No bar, just the back button) */}
      <View style={styles.backNavRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Screen Title Block */}
          <View style={styles.screenHeader}>
            <Text style={styles.screenHeading}>APP SETTINGS</Text>
            <Text style={styles.screenSubheading}>Notification alerts, privacy options & system preferences</Text>
          </View>

          {/* CARD 1: PUSH & NOTIFICATIONS */}
          <View style={styles.cardWrapper}>
            <View style={styles.floatingBadgePink}>
              <Text style={styles.floatingBadgeText}>ALERTS & NOTIFICATIONS</Text>
            </View>

            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2.8}
              borderRadius={20}
              shadowOffset={{ x: 4, y: 4 }}
              style={styles.fullWidth}
              contentStyle={styles.cardContent}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardBigTitle}>MATCH & CHAT NOTIFICATIONS</Text>
                <Ionicons name="notifications-outline" size={22} color={colors.primaryPink} />
              </View>

              {/* Item 1: Matches */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>New Matches & P!NGs</Text>
                  <Text style={styles.toggleSub}>
                    Instant push alert when someone likes you back
                  </Text>
                </View>
                {renderBrutalToggle(notifyMatches, () => setNotifyMatches(!notifyMatches), 'heart')}
              </View>

              <View style={styles.divider} />

              {/* Item 2: Messages */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>Chat Messages & Voice Notes</Text>
                  <Text style={styles.toggleSub}>
                    Alert when an active match texts or leaves audio
                  </Text>
                </View>
                {renderBrutalToggle(notifyMessages, () => setNotifyMessages(!notifyMessages), 'chatbubble')}
              </View>

              <View style={styles.divider} />

              {/* Item 3: Superpings */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>Superpings & Priority Likes</Text>
                  <Text style={styles.toggleSub}>
                    Highlighted vibration & banner for high-vibe matches
                  </Text>
                </View>
                {renderBrutalToggle(notifySuperpings, () => setNotifySuperpings(!notifySuperpings), 'flash')}
              </View>

              <View style={styles.divider} />

              {/* Item 4: Events */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>Singles Events & Local Drops</Text>
                  <Text style={styles.toggleSub}>
                    Curated offline mixers and dating pop-ups
                  </Text>
                </View>
                {renderBrutalToggle(notifyEvents, () => setNotifyEvents(!notifyEvents), 'sparkles')}
              </View>
            </BrutalBox>
          </View>

          {/* CARD 2: PRESENCE & PRIVACY */}
          <View style={styles.cardWrapper}>
            <View style={styles.floatingBadgeYellow}>
              <Text style={styles.floatingBadgeText}>PRESENCE CONTROL</Text>
            </View>

            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2.8}
              borderRadius={20}
              shadowOffset={{ x: 4, y: 4 }}
              style={styles.fullWidth}
              contentStyle={styles.cardContent}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardBigTitle}>DISCOVERY & CHAT PRIVACY</Text>
                <Ionicons name="eye-outline" size={22} color="#D97706" />
              </View>

              {/* Item 1: Active dot */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>Show "Active Today" Status</Text>
                  <Text style={styles.toggleSub}>
                    Displays the green activity dot on your profile card
                  </Text>
                </View>
                {renderBrutalToggle(showActiveStatus, () => setShowActiveStatus(!showActiveStatus), 'ellipse')}
              </View>

              <View style={styles.divider} />

              {/* Item 2: Read Receipts */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>Read Receipts in Chat</Text>
                  <Text style={styles.toggleSub}>
                    Let matches see double checkmark when you view messages
                  </Text>
                </View>
                {renderBrutalToggle(readReceipts, () => setReadReceipts(!readReceipts), 'checkmark-done')}
              </View>

              <View style={styles.divider} />

              {/* Item 3: Approximate Distance */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>Approximate Distance Only</Text>
                  <Text style={styles.toggleSub}>
                    Display general borough/city instead of exact kilometers
                  </Text>
                </View>
                {renderBrutalToggle(approximateDistance, () => setApproximateDistance(!approximateDistance), 'navigate')}
              </View>
            </BrutalBox>
          </View>

          {/* CARD 3: EXPERIENCE & HAPTICS */}
          <View style={styles.cardWrapper}>
            <View style={styles.floatingBadgeLavender}>
              <Text style={styles.floatingBadgeText}>TACTILE & AUDIO</Text>
            </View>

            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2.8}
              borderRadius={20}
              shadowOffset={{ x: 4, y: 4 }}
              style={styles.fullWidth}
              contentStyle={styles.cardContent}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardBigTitle}>APP SENSORY FEEDBACK</Text>
                <Ionicons name="volume-high-outline" size={22} color="#4F46E5" />
              </View>

              {/* Item 1: Haptics */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>Neo-Brutalist Haptic Feedback</Text>
                  <Text style={styles.toggleSub}>
                    Tactile kick on right swipes & mutual match popups
                  </Text>
                </View>
                {renderBrutalToggle(hapticsEnabled, () => setHapticsEnabled(!hapticsEnabled), 'phone-portrait')}
              </View>

              <View style={styles.divider} />

              {/* Item 2: Sound Effects */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>In-App Sound Effects</Text>
                  <Text style={styles.toggleSub}>
                    Retro arcade ping sounds on message send and match
                  </Text>
                </View>
                {renderBrutalToggle(soundEffects, () => setSoundEffects(!soundEffects), 'musical-notes')}
              </View>
            </BrutalBox>
          </View>

          {/* CARD 4: STORAGE & ARCHIVE */}
          <View style={styles.cardWrapper}>
            <View style={styles.floatingBadgePink}>
              <Text style={styles.floatingBadgeText}>STORAGE & CACHE</Text>
            </View>

            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2.8}
              borderRadius={20}
              shadowOffset={{ x: 4, y: 4 }}
              style={styles.fullWidth}
              contentStyle={styles.cardContent}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardBigTitle}>MEDIA STORAGE & ARCHIVE</Text>
                <Ionicons name="server-outline" size={22} color={colors.textDark} />
              </View>

              {/* Row 1: Clear Cache */}
              <View style={styles.storageRow}>
                <View style={styles.storageIconBox}>
                  <Feather name="trash-2" size={18} color="#DC2626" />
                </View>
                <View style={styles.storageTextCol}>
                  <Text style={styles.storageTitle}>Temporary Photo & Audio Cache</Text>
                  <Text style={styles.storageMeta}>Currently using {cacheSize}</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleClearCache}
                  style={styles.clearCacheBtn}
                >
                  <Text style={styles.clearCacheBtnText}>CLEAR</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Row 2: GDPR Download Archive */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDownloadData}
                style={styles.storageRow}
              >
                <View style={[styles.storageIconBox, { backgroundColor: '#E0E7FF' }]}>
                  <Feather name="download" size={18} color="#4338CA" />
                </View>
                <View style={styles.storageTextCol}>
                  <Text style={styles.storageTitle}>Download My P!NG Data</Text>
                  <Text style={styles.storageMeta}>
                    GDPR / CCPA JSON archive of photos & chats
                  </Text>
                </View>
                <View style={styles.circleArrowBtn}>
                  <Feather name="arrow-right" size={18} color={colors.textDark} />
                </View>
              </TouchableOpacity>
            </BrutalBox>
          </View>

          {/* CARD 5: ABOUT & LEGAL */}
          <View style={styles.cardWrapper}>
            <View style={styles.floatingBadgeGrey}>
              <Text style={styles.floatingBadgeText}>SYSTEM SPEC</Text>
            </View>

            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2.8}
              borderRadius={20}
              shadowOffset={{ x: 4, y: 4 }}
              style={styles.fullWidth}
              contentStyle={styles.cardContent}
            >
              <View style={styles.legalHeaderRow}>
                <Text style={styles.appVersionTitle}>P!NG FOR MOBILE & WEB</Text>
                <View style={styles.versionPill}>
                  <Text style={styles.versionPillText}>V2.4.0 (BUILD 57)</Text>
                </View>
              </View>

              <Text style={styles.legalExplainer}>
                Crafted with pure neo-brutalist aesthetics. Designed for genuine romantic spark without paywalls, fake bots, or blurred previews.
              </Text>

              <View style={styles.legalLinksRow}>
                <TouchableOpacity
                  onPress={() =>
                    handleShowLegal('Terms of Service', 'P!NG Terms of Service (v2.4). All users must treat connections with respect.')
                  }
                  style={styles.legalLink}
                >
                  <Text style={styles.legalLinkText}>Terms</Text>
                </TouchableOpacity>
                <Text style={styles.legalDot}>•</Text>
                <TouchableOpacity
                  onPress={() =>
                    handleShowLegal('Privacy Policy', 'Zero third-party trackers. End-to-end encryption for all 1-on-1 chats.')
                  }
                  style={styles.legalLink}
                >
                  <Text style={styles.legalLinkText}>Privacy</Text>
                </TouchableOpacity>
                <Text style={styles.legalDot}>•</Text>
                <TouchableOpacity
                  onPress={() =>
                    handleShowLegal('Safety Guidelines', 'Our zero-tolerance harassment manifesto and real-world date checklist.')
                  }
                  style={styles.legalLink}
                >
                  <Text style={styles.legalLinkText}>Safety Standards</Text>
                </TouchableOpacity>
              </View>
            </BrutalBox>
          </View>

          {/* Bottom Security Banner */}
          <View style={styles.bottomBannerWrap}>
            <BrutalBox
              backgroundColor="#EDE9FE"
              borderColor={colors.borderBlack}
              borderWidth={2}
              borderRadius={12}
              shadowOffset={{ x: 2, y: 2 }}
              style={styles.fullWidth}
              contentStyle={styles.bottomBannerContent}
            >
              <Ionicons name="shield-checkmark" size={16} color="#6D28D9" />
              <Text style={styles.bottomBannerText}>
                100% PRIVATE • ZERO 3RD PARTY AD TRACKERS
              </Text>
            </BrutalBox>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: colors.bgCream,
  },
  backNavRow: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  screenHeader: {
    paddingTop: 4,
    paddingBottom: 4,
    gap: 4,
  },
  screenHeading: {
    fontFamily: typography.fonts.black,
    fontSize: 28,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  screenSubheading: {
    fontFamily: typography.fonts.medium,
    fontSize: 13,
    color: '#555555',
    letterSpacing: 0.1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 85,
  },
  container: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  cardWrapper: {
    position: 'relative',
    marginTop: 14,
  },
  floatingBadgePink: {
    position: 'absolute',
    top: -12,
    left: 16,
    zIndex: 10,
    backgroundColor: colors.primaryPink,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  floatingBadgeYellow: {
    position: 'absolute',
    top: -12,
    left: 16,
    zIndex: 10,
    backgroundColor: colors.accentYellow,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  floatingBadgeLavender: {
    position: 'absolute',
    top: -12,
    left: 16,
    zIndex: 10,
    backgroundColor: '#E2DCFE',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  floatingBadgeGrey: {
    position: 'absolute',
    top: -12,
    left: 16,
    zIndex: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  floatingBadgeText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 10.5,
    color: '#000',
    letterSpacing: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  cardContent: {
    padding: 16,
    paddingTop: 18,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardBigTitle: {
    fontFamily: typography.fonts.black,
    fontSize: 20,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  toggleTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  toggleTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: 14.5,
    color: colors.textDark,
  },
  toggleSub: {
    fontFamily: typography.fonts.medium,
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
  },
  divider: {
    height: 1.5,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  brutalToggle: {
    width: 52,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    padding: 2,
    justifyContent: 'center',
  },
  brutalToggleOn: {
    backgroundColor: '#E5E7EB',
  },
  brutalToggleOff: {
    backgroundColor: '#F3F4F6',
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleKnobOn: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accentYellow,
  },
  toggleKnobOff: {
    alignSelf: 'flex-start',
    backgroundColor: '#D1D5DB',
  },
  /* Storage Section */
  storageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  storageIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  storageTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  storageTitle: {
    fontFamily: typography.bodyBold,
    fontSize: 14,
    color: colors.textDark,
  },
  storageMeta: {
    fontFamily: typography.fonts.medium,
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  clearCacheBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  clearCacheBtnText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 11,
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  circleArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* Legal Spec */
  legalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  appVersionTitle: {
    fontFamily: typography.bodyBold,
    fontSize: 14,
    color: colors.textDark,
  },
  versionPill: {
    backgroundColor: '#E0E7FF',
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  versionPillText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 10,
    color: '#3730A3',
  },
  legalExplainer: {
    fontFamily: typography.fonts.medium,
    fontSize: 11.5,
    color: '#4B5563',
    lineHeight: 16,
    marginBottom: 12,
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1.5,
    borderTopColor: '#F3F4F6',
  },
  legalLink: {
    paddingVertical: 2,
  },
  legalLinkText: {
    fontFamily: typography.fonts.bold,
    fontSize: 11,
    color: colors.primaryPink,
    textDecorationLine: 'underline',
  },
  legalDot: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  bottomBannerWrap: {
    marginTop: 18,
    marginBottom: 10,
  },
  bottomBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  bottomBannerText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 11,
    color: '#4C1D95',
    letterSpacing: 0.5,
  },
});
