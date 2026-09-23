import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Constants from 'expo-constants';
import { useQueryClient } from '@tanstack/react-query';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { LAYOUT } from '../../theme/responsive';
import { env } from '../../lib/env';
import { DotGridBackground } from '../../components/DotGridBackground';
import { BrutalBox } from '../../components/BrutalBox';
import { UserAccount } from '../../types/user';
import { useSettings } from '../../hooks/useSettings';
import { SettingsRow } from '../../services/profile';
import { registerForPush } from '../../services/push';
import { errorMessage } from '../../services/errors';
import { FEEDBACK_CATEGORIES, FeedbackCategory, submitFeedback } from '../../services/feedback';

interface AppSettingsScreenProps {
  user: UserAccount;
  onBack: () => void;
  onPreviewProfile?: () => void;
}

type BoolSetting = {
  [K in keyof SettingsRow]: SettingsRow[K] extends boolean ? K : never;
}[keyof SettingsRow];

export const AppSettingsScreen: React.FC<AppSettingsScreenProps> = ({ user, onBack }) => {
  const queryClient = useQueryClient();
  const { settings, isLoading, error, update } = useSettings(user.id);
  const [feedbackCategory, setFeedbackCategory] = useState<FeedbackCategory>('bug');
  const [feedbackText, setFeedbackText] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const handleSendFeedback = async () => {
    setSendingFeedback(true);
    try {
      await submitFeedback(user.id, feedbackCategory, feedbackText);
      setFeedbackText('');
      Alert.alert('Thank you!', 'Your feedback was sent to the team.');
    } catch (e) {
      Alert.alert('Could not send feedback', errorMessage(e));
    } finally {
      setSendingFeedback(false);
    }
  };

  const toggle = async (key: BoolSetting) => {
    if (!settings) return;
    const next = !settings[key];
    await update({ [key]: next } as Partial<SettingsRow>);
    // Turning a notification on is the moment to ask the OS for permission.
    if (next && key.startsWith('notify_')) {
      const result = await registerForPush();
      if (!result.ok && result.reason === 'denied') {
        Alert.alert('Notifications are off', 'Allow notifications for P!NG in your device settings to receive alerts.');
      }
    }
  };

  const handleClearCache = () =>
    Alert.alert('Clear image cache', 'Downloaded photos will be fetched again when you need them.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear cache',
        style: 'destructive',
        onPress: async () => {
          await Image.clearDiskCache();
          await Image.clearMemoryCache();
          queryClient.removeQueries({ queryKey: ['signed-urls'] });
          Alert.alert('Cache cleared', 'Cached photos were removed from this device.');
        },
      },
    ]);

  const openLink = (title: string, url: string) =>
    Linking.openURL(url).catch(() => Alert.alert(title, `Could not open ${url}`));

  const version = Constants.expoConfig?.version ?? '1.0.0';
  const legalLinks: Array<{ label: string; url: string }> = [
    env.termsUrl ? { label: 'Terms', url: env.termsUrl } : null,
    env.privacyUrl ? { label: 'Privacy', url: env.privacyUrl } : null,
    env.supportEmail ? { label: 'Support', url: `mailto:${env.supportEmail}` } : null,
  ].filter((l): l is { label: string; url: string } => l !== null);

  // Reusable brutalist toggle bound to a real setting.
  const renderToggle = (key: BoolSetting, activeIcon: keyof typeof Ionicons.glyphMap = 'flash') => {
    const value = settings?.[key] ?? false;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={!settings}
        onPress={() => toggle(key)}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled: !settings }}
        style={[styles.brutalToggle, value ? styles.brutalToggleOn : styles.brutalToggleOff, !settings && styles.toggleDisabled]}
      >
        <View style={[styles.toggleKnob, value ? styles.toggleKnobOn : styles.toggleKnobOff]}>
          {value ? <Ionicons name={activeIcon} size={12} color="#000" /> : null}
        </View>
      </TouchableOpacity>
    );
  };

  const row = (title: string, sub: string, key: BoolSetting, icon: keyof typeof Ionicons.glyphMap, last = false) => (
    <>
      <View style={styles.toggleRow}>
        <View style={styles.toggleTextCol}>
          <Text style={styles.toggleTitle}>{title}</Text>
          <Text style={styles.toggleSub}>{sub}</Text>
        </View>
        {renderToggle(key, icon)}
      </View>
      {!last && <View style={styles.divider} />}
    </>
  );

  return (
    <View style={styles.screenWrapper}>
      <StatusBar style="dark" />
      <DotGridBackground />

      <View style={styles.backNavRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.screenHeader}>
            <Text style={styles.screenHeading}>APP SETTINGS</Text>
            <Text style={styles.screenSubheading}>Notifications, privacy and device options</Text>
            {isLoading && <ActivityIndicator color={colors.primaryPink} />}
            {error && <Text style={styles.screenSubheading}>Could not load your settings: {errorMessage(error)}</Text>}
          </View>

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
                <Text style={styles.cardBigTitle}>PUSH NOTIFICATIONS</Text>
                <Ionicons name="notifications-outline" size={22} color={colors.primaryPink} />
              </View>
              {row('New Matches', 'Alert when you and someone else P!NG each other', 'notify_matches', 'heart')}
              {row('Chat Messages', 'Alert when a match sends you a message', 'notify_messages', 'chatbubble')}
              {row('Super P!NGs', 'Alert when someone sends you a Super P!NG', 'notify_superpings', 'flash', true)}
            </BrutalBox>
          </View>

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
              {row('Show "Active" Status', 'Shows the green activity pill on your card', 'show_active_status', 'ellipse')}
              {row('Read Receipts', 'Let matches see when you have read their messages', 'read_receipts', 'checkmark-done')}
              {row('Approximate Distance', 'Show distance in rough 5 km steps instead of exact', 'approximate_distance', 'navigate', true)}
            </BrutalBox>
          </View>

          <View style={styles.cardWrapper}>
            <View style={styles.floatingBadgeLavender}>
              <Text style={styles.floatingBadgeText}>FEEL</Text>
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
                <Text style={styles.cardBigTitle}>HAPTIC FEEDBACK</Text>
                <Ionicons name="phone-portrait-outline" size={22} color="#4F46E5" />
              </View>
              {row('Haptics', 'A tactile tap when you P!NG someone or match', 'haptics', 'phone-portrait', true)}
            </BrutalBox>
          </View>

          <View style={styles.cardWrapper}>
            <View style={styles.floatingBadgePink}>
              <Text style={styles.floatingBadgeText}>STORAGE & DATA</Text>
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
                <Text style={styles.cardBigTitle}>PHOTOS & YOUR DATA</Text>
                <Ionicons name="server-outline" size={22} color={colors.textDark} />
              </View>

              <View style={styles.storageRow}>
                <View style={styles.storageIconBox}>
                  <Feather name="trash-2" size={18} color="#DC2626" />
                </View>
                <View style={styles.storageTextCol}>
                  <Text style={styles.storageTitle}>Image cache</Text>
                  <Text style={styles.storageMeta}>Photos saved on this device for speed</Text>
                </View>
                <TouchableOpacity activeOpacity={0.8} onPress={handleClearCache} style={styles.clearCacheBtn} accessibilityRole="button">
                  <Text style={styles.clearCacheBtnText}>CLEAR</Text>
                </TouchableOpacity>
              </View>
            </BrutalBox>
          </View>

          <View style={styles.cardWrapper}>
            <View style={styles.floatingBadgeYellow}>
              <Text style={styles.floatingBadgeText}>BETA FEEDBACK</Text>
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
                <Text style={styles.cardBigTitle}>TELL US WHAT BROKE</Text>
                <Ionicons name="chatbox-ellipses-outline" size={22} color={colors.primaryPink} />
              </View>

              <View style={styles.feedbackChips}>
                {FEEDBACK_CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c.value}
                    onPress={() => setFeedbackCategory(c.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: feedbackCategory === c.value }}
                    style={[styles.feedbackChip, feedbackCategory === c.value && styles.feedbackChipActive]}
                  >
                    <Text style={styles.feedbackChipText}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.feedbackInput}
                value={feedbackText}
                onChangeText={setFeedbackText}
                placeholder="What happened, or what would make P!NG better?"
                placeholderTextColor="#888"
                multiline
                maxLength={2000}
                accessibilityLabel="Feedback message"
              />

              <BrutalBox
                backgroundColor={feedbackText.trim().length >= 5 ? colors.accentYellow : '#E5E7EB'}
                borderColor={colors.borderBlack}
                borderWidth={2.2}
                borderRadius={14}
                shadowOffset={{ x: 3, y: 3 }}
                onPress={handleSendFeedback}
                disabled={sendingFeedback || feedbackText.trim().length < 5}
                contentStyle={styles.feedbackSend}
              >
                {sendingFeedback ? (
                  <ActivityIndicator color={colors.textDark} />
                ) : (
                  <Text style={styles.feedbackSendText}>SEND FEEDBACK</Text>
                )}
              </BrutalBox>
            </BrutalBox>
          </View>

          <View style={styles.cardWrapper}>
            <View style={styles.floatingBadgeGrey}>
              <Text style={styles.floatingBadgeText}>ABOUT</Text>
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
                <Text style={styles.appVersionTitle}>P!NG</Text>
                <View style={styles.versionPill}>
                  <Text style={styles.versionPillText}>V{version}</Text>
                </View>
              </View>
              <Text style={styles.legalExplainer}>
                Genuine connections, no paywalls on who liked you and no fake profiles.
              </Text>
              {legalLinks.length > 0 && (
                <View style={styles.legalLinksRow}>
                  {legalLinks.map((link, i) => (
                    <React.Fragment key={link.label}>
                      {i > 0 && <Text style={styles.legalDot}>•</Text>}
                      <TouchableOpacity onPress={() => openLink(link.label, link.url)} style={styles.legalLink} accessibilityRole="link">
                        <Text style={styles.legalLinkText}>{link.label}</Text>
                      </TouchableOpacity>
                    </React.Fragment>
                  ))}
                </View>
              )}
            </BrutalBox>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  feedbackChips: { flexDirection: 'row', gap: 8 },
  feedbackChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    backgroundColor: '#FAF7F2',
  },
  feedbackChipActive: { backgroundColor: colors.accentYellow },
  feedbackChipText: { fontSize: 12, fontFamily: typography.bodyExtraBold, color: colors.textDark, letterSpacing: 0.4 },
  feedbackInput: {
    minHeight: 100,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 10,
    fontSize: 14,
    fontFamily: typography.bodyMedium,
    color: colors.textDark,
    textAlignVertical: 'top',
  },
  feedbackSend: { paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  feedbackSendText: { fontSize: 15, fontFamily: typography.headline, color: colors.textDark, letterSpacing: 0.5 },
  toggleDisabled: {
    opacity: 0.5,
  },
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
