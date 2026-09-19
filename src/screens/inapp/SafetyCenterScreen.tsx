import React, { useState } from 'react';
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
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { LAYOUT } from '../../theme/responsive';
import { DotGridBackground } from '../../components/DotGridBackground';
import { BrutalBox } from '../../components/BrutalBox';
import { UserAccount } from '../../types/user';
import { useSession } from '../../providers/SessionProvider';
import { updateProfile } from '../../services/profile';
import { errorMessage } from '../../services/errors';
import {
  countMyReports,
  devApproveVerification,
  fetchBlockedUsers,
  fetchVerificationState,
  submitVerificationSelfie,
  unblockUser,
} from '../../services/safety';

interface SafetyCenterScreenProps {
  user: UserAccount;
  onBack: () => void;
  onPreviewProfile?: () => void;
}

export const SafetyCenterScreen: React.FC<SafetyCenterScreenProps> = ({ user, onBack }) => {
  const { setUser, refreshUser } = useSession();
  const queryClient = useQueryClient();
  const [blockListOpen, setBlockListOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const verification = useQuery({
    queryKey: ['verification', user.id, user.isVerifiedReal],
    queryFn: () => fetchVerificationState(user.id, user.isVerifiedReal),
  });
  const blocked = useQuery({ queryKey: ['blocked'], queryFn: fetchBlockedUsers });
  const reports = useQuery({ queryKey: ['my-reports'], queryFn: countMyReports });

  const blockedCount = blocked.data?.length ?? 0;
  const state = verification.data ?? 'none';

  const handleVerify = async () => {
    if (state === 'verified') {
      Alert.alert('You are verified', 'Your profile shows the 100% REAL badge.');
      return;
    }
    if (state === 'pending') {
      Alert.alert('Waiting for review', 'We will update your badge as soon as our team has checked your selfie.');
      return;
    }
    setBusy('verify');
    try {
      const outcome = await submitVerificationSelfie(user.id);
      if (outcome === 'denied') {
        Alert.alert('Camera needed', 'Allow camera access in your device settings to take a verification selfie.');
      } else if (outcome === 'submitted') {
        await queryClient.invalidateQueries({ queryKey: ['verification'] });
        Alert.alert('Selfie submitted', 'Our team will review it and add the 100% REAL badge to your profile.');
        // Dev builds can approve themselves so the badge can be seen without a reviewer.
        await devApproveVerification();
        await refreshUser();
        await queryClient.invalidateQueries({ queryKey: ['verification'] });
      }
    } catch (e) {
      Alert.alert('Could not submit selfie', errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const handleStealth = async () => {
    setBusy('stealth');
    try {
      const next = !user.isHidden;
      setUser(await updateProfile(user, { is_hidden: next }));
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
    } catch (e) {
      Alert.alert('Could not update stealth mode', errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const handleUnblock = async (id: string, name: string) => {
    try {
      await unblockUser(user.id, id);
      await queryClient.invalidateQueries({ queryKey: ['blocked'] });
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
    } catch (e) {
      Alert.alert(`Could not unblock ${name}`, errorMessage(e));
    }
  };

  const verifyPill = state === 'verified' ? 'VERIFIED' : state === 'pending' ? 'IN REVIEW' : state === 'rejected' ? 'TRY AGAIN' : 'GET VERIFIED';
  const verifySub =
    state === 'verified'
      ? 'Your 100% REAL badge is live.'
      : state === 'pending'
        ? 'Selfie sent. Awaiting review.'
        : state === 'rejected'
          ? 'Last selfie was not accepted.'
          : 'Take a selfie to earn the badge.';

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
            <Text style={styles.screenHeading}>SAFETY CENTRE</Text>
            <Text style={styles.screenSubheading}>Verification, privacy controls, blocking and reporting</Text>
          </View>

          {/* HERO BANNER: YOUR SAFETY IS NOT AN AFTERTHOUGHT */}
          <BrutalBox
            backgroundColor="#E5E0FD"
            borderColor={colors.borderBlack}
            borderWidth={2.8}
            borderRadius={22}
            shadowOffset={{ x: 4, y: 4 }}
            style={styles.fullWidth}
            contentStyle={styles.heroContent}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.shieldBadge}>
                <Ionicons name="shield-outline" size={22} color="#000" />
              </View>
              <View style={styles.alwaysOnPill}>
                <Text style={styles.alwaysOnText}>ALWAYS ON</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>YOUR SAFETY IS NOT AN AFTERTHOUGHT.</Text>

            <Text style={styles.heroParagraph}>
              P!NG is built around real people. Report or block anyone in one tap, and our team reviews every report.
            </Text>

            {/* Bottom 100% Monitored row */}
            <View style={styles.monitoredRow}>
              <View style={styles.badgeStack}>
                <View style={[styles.miniCircleBadge, { backgroundColor: '#6EE7B7', zIndex: 3 }]}>
                  <Ionicons name="checkmark" size={12} color="#000" />
                </View>
                <View style={[styles.miniCircleBadge, { backgroundColor: '#F472B6', marginLeft: -8, zIndex: 2 }]}>
                  <Ionicons name="lock-closed" size={10} color="#000" />
                </View>
                <View style={[styles.miniCircleBadge, { backgroundColor: colors.accentYellow, marginLeft: -8, zIndex: 1 }]}>
                  <Ionicons name="shield" size={10} color="#000" />
                </View>
              </View>
              <Text style={styles.monitoredText}>EVERY REPORT REVIEWED</Text>
            </View>
          </BrutalBox>

          {/* SECTION 1: SAFETY TOOLKIT */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>SAFETY TOOLKIT</Text>
            <Text style={styles.sectionHint}>TAP TO CONFIGURE</Text>
          </View>

          {/* 2x2 Grid */}
          <View style={styles.gridContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleVerify}
              disabled={busy === 'verify'}
              style={styles.gridCol}
              accessibilityRole="button"
              accessibilityLabel="100% REAL"
            >
              <BrutalBox
                backgroundColor="#A7F3D0"
                borderColor={colors.borderBlack}
                borderWidth={2.4}
                borderRadius={18}
                shadowOffset={{ x: 3.5, y: 3.5 }}
                style={styles.fullWidth}
                contentStyle={styles.toolkitCardContent}
              >
                <View style={styles.toolkitIconBadge}>
                  <MaterialCommunityIcons name="check-decagram" size={18} color="#DC2626" />
                </View>
                <Text style={styles.toolkitTitle}>100% REAL</Text>
                <Text style={styles.toolkitSub}>{verifySub}</Text>
                <View style={styles.toolkitPill}>
                  {busy === 'verify' ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.toolkitPillText}>{verifyPill}</Text>}
                  {state === 'verified' && <View style={styles.redDot} />}
                </View>
              </BrutalBox>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleStealth}
              disabled={busy === 'stealth'}
              style={styles.gridCol}
              accessibilityRole="button"
              accessibilityLabel="STEALTH"
            >
              <BrutalBox
                backgroundColor="#FBCFE8"
                borderColor={colors.borderBlack}
                borderWidth={2.4}
                borderRadius={18}
                shadowOffset={{ x: 3.5, y: 3.5 }}
                style={styles.fullWidth}
                contentStyle={styles.toolkitCardContent}
              >
                <View style={styles.toolkitIconBadge}>
                  <Feather name="eye-off" size={18} color="#000" />
                </View>
                <Text style={styles.toolkitTitle}>STEALTH</Text>
                <Text style={styles.toolkitSub}>Hide your card from Discover. Matches can still chat.</Text>
                <View style={styles.toolkitPill}>
                  {busy === 'stealth' ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.toolkitPillText}>{user.isHidden ? 'HIDDEN' : 'VISIBLE'}</Text>}
                </View>
              </BrutalBox>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => Alert.alert('Reporting someone', 'Open your chat with them and tap the shield or the menu, then choose Report. We review every report.')}
              style={styles.gridCol}
              accessibilityRole="button"
              accessibilityLabel="REPORTS"
            >
              <BrutalBox
                backgroundColor="#FDE047"
                borderColor={colors.borderBlack}
                borderWidth={2.4}
                borderRadius={18}
                shadowOffset={{ x: 3.5, y: 3.5 }}
                style={styles.fullWidth}
                contentStyle={styles.toolkitCardContent}
              >
                <View style={styles.toolkitIconBadge}>
                  <MaterialCommunityIcons name="flag-outline" size={18} color="#000" />
                </View>
                <Text style={styles.toolkitTitle}>REPORTS</Text>
                <Text style={styles.toolkitSub}>Report from any chat. We review every report.</Text>
                <View style={styles.toolkitPill}>
                  <Text style={styles.toolkitPillText}>{reports.data ?? 0} FILED</Text>
                </View>
              </BrutalBox>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setBlockListOpen(true)}
              style={styles.gridCol}
              accessibilityRole="button"
              accessibilityLabel="BLOCK LIST"
            >
              <BrutalBox
                backgroundColor="#DDD6FE"
                borderColor={colors.borderBlack}
                borderWidth={2.4}
                borderRadius={18}
                shadowOffset={{ x: 3.5, y: 3.5 }}
                style={styles.fullWidth}
                contentStyle={styles.toolkitCardContent}
              >
                <View style={styles.toolkitIconBadge}>
                  <Feather name="slash" size={18} color="#DC2626" />
                </View>
                <Text style={styles.toolkitTitle}>BLOCK LIST</Text>
                <Text style={styles.toolkitSub}>Review the people you have blocked.</Text>
                <View style={styles.toolkitPill}>
                  <Text style={styles.toolkitPillText}>{blockedCount === 0 ? 'NONE BLOCKED' : `${blockedCount} BLOCKED`}</Text>
                </View>
              </BrutalBox>
            </TouchableOpacity>
          </View>

          {/* SECTION 2: THE 4 GOLDEN RULES */}
          <View style={styles.rulesHeadingRow}>
            <View style={styles.rulesTitleWithDot}>
              <View style={styles.rulesPinkDot} />
              <Text style={styles.rulesMainHeading}>THE 4 GOLDEN RULES</Text>
            </View>
            <View style={styles.nonNegotiablePill}>
              <Text style={styles.nonNegotiableText}>NON-NEGOTIABLE</Text>
            </View>
          </View>

          {/* Rule 1 */}
          <BrutalBox
            backgroundColor="#FFFFFF"
            borderColor={colors.borderBlack}
            borderWidth={2.4}
            borderRadius={18}
            shadowOffset={{ x: 3.5, y: 3.5 }}
            style={styles.fullWidth}
            contentStyle={styles.ruleCardContent}
          >
            <View style={[styles.ruleNumberSquare, { backgroundColor: '#BE185D' }]}>
              <Text style={styles.ruleNumberText}>1</Text>
            </View>
            <View style={styles.ruleTextCol}>
              <Text style={styles.ruleTitle}>Keep Chats Inside P!NG</Text>
              <Text style={styles.ruleBody}>
                Bad actors frequently try moving to unmoderated apps immediately. Protect your number.
              </Text>
            </View>
          </BrutalBox>

          {/* Rule 2 */}
          <BrutalBox
            backgroundColor="#FFFFFF"
            borderColor={colors.borderBlack}
            borderWidth={2.4}
            borderRadius={18}
            shadowOffset={{ x: 3.5, y: 3.5 }}
            style={styles.fullWidth}
            contentStyle={styles.ruleCardContent}
          >
            <View style={[styles.ruleNumberSquare, { backgroundColor: '#65A30D' }]}>
              <Text style={styles.ruleNumberText}>2</Text>
            </View>
            <View style={styles.ruleTextCol}>
              <Text style={styles.ruleTitle}>Zero Financial Transfers</Text>
              <Text style={styles.ruleBody}>
                Never send crypto, wire funds, or cash transfers for travel, emergencies, or "surprise gifts."
              </Text>
            </View>
          </BrutalBox>

          {/* Rule 3 */}
          <BrutalBox
            backgroundColor="#FFFFFF"
            borderColor={colors.borderBlack}
            borderWidth={2.4}
            borderRadius={18}
            shadowOffset={{ x: 3.5, y: 3.5 }}
            style={styles.fullWidth}
            contentStyle={styles.ruleCardContent}
          >
            <View style={[styles.ruleNumberSquare, { backgroundColor: '#4F46E5' }]}>
              <Text style={styles.ruleNumberText}>3</Text>
            </View>
            <View style={styles.ruleTextCol}>
              <Text style={styles.ruleTitle}>Meet in Daylight Public Places</Text>
              <Text style={styles.ruleBody}>
                Pick busy coffee shops or galleries. Always organize your own private transportation.
              </Text>
            </View>
          </BrutalBox>

          {/* Rule 4 */}
          <BrutalBox
            backgroundColor="#FFFFFF"
            borderColor={colors.borderBlack}
            borderWidth={2.4}
            borderRadius={18}
            shadowOffset={{ x: 3.5, y: 3.5 }}
            style={styles.fullWidth}
            contentStyle={styles.ruleCardContent}
          >
            <View style={[styles.ruleNumberSquare, { backgroundColor: '#18181B' }]}>
              <Text style={styles.ruleNumberText}>4</Text>
            </View>
            <View style={styles.ruleTextCol}>
              <Text style={styles.ruleTitle}>Trust Your Instincts</Text>
              <Text style={styles.ruleBody}>
                If something feels "off", you owe no one an explanation. Block, leave, and report instantly.
              </Text>
            </View>
          </BrutalBox>

          {/* SECTION 4: FOOTER HUMAN-FIRST SAFETY SQUAD */}
          <BrutalBox
            backgroundColor="#E5E7EB"
            borderColor={colors.borderBlack}
            borderWidth={2.4}
            borderRadius={20}
            shadowOffset={{ x: 3.5, y: 3.5 }}
            style={styles.fullWidth}
            contentStyle={styles.squadCardContent}
          >
            <View style={styles.squadCircleBadge}>
              <Text style={styles.squadNumberText}>10</Text>
            </View>
            <View style={styles.squadTextCol}>
              <Text style={styles.squadHeading}>HUMAN-FIRST SAFETY SQUAD</Text>
              <Text style={styles.squadBody}>
                All reports reviewed by verified staff in under 15 minutes.
              </Text>
            </View>
          </BrutalBox>
        </View>
      </ScrollView>

      <Modal transparent visible={blockListOpen} animationType="fade" onRequestClose={() => setBlockListOpen(false)}>
        <TouchableOpacity style={styles.blockOverlay} activeOpacity={1} onPress={() => setBlockListOpen(false)}>
          <BrutalBox
            backgroundColor="#FFFFFF"
            borderColor={colors.borderBlack}
            borderWidth={2.6}
            borderRadius={22}
            shadowOffset={{ x: 4, y: 4 }}
            style={styles.blockCard}
            contentStyle={styles.blockCardContent}
          >
            <Text style={styles.blockTitle}>BLOCKED PEOPLE</Text>
            {blocked.isLoading && <ActivityIndicator color={colors.primaryPink} />}
            {!blocked.isLoading && blockedCount === 0 && (
              <Text style={styles.blockEmpty}>You have not blocked anyone.</Text>
            )}
            {(blocked.data ?? []).map((b) => (
              <View key={b.userId} style={styles.blockRow}>
                <Text style={styles.blockName} numberOfLines={1}>
                  {b.name}
                </Text>
                <TouchableOpacity onPress={() => handleUnblock(b.userId, b.name)} accessibilityRole="button">
                  <Text style={styles.unblockText}>UNBLOCK</Text>
                </TouchableOpacity>
              </View>
            ))}
          </BrutalBox>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  blockOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  blockCard: {
    width: '100%',
    maxWidth: 340,
  },
  blockCardContent: {
    padding: 16,
    gap: 12,
  },
  blockTitle: {
    fontSize: 14,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.6,
  },
  blockEmpty: {
    fontSize: 14,
    fontFamily: typography.bodyMedium,
    color: colors.textMuted,
  },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  blockName: {
    flex: 1,
    fontSize: 16,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
    paddingRight: 12,
  },
  unblockText: {
    fontSize: 12,
    fontFamily: typography.bodyExtraBold,
    color: colors.primaryPink,
    letterSpacing: 0.5,
  },
  screenWrapper: {
    flex: 1,
    backgroundColor: '#FAF7F2',
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
    paddingTop: 14,
    gap: 18,
  },
  fullWidth: {
    width: '100%',
  },
  /* Hero Banner */
  heroContent: {
    padding: 18,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  shieldBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  alwaysOnPill: {
    backgroundColor: '#9F1239',
    borderRadius: 999,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  alwaysOnText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 10.5,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontFamily: typography.fonts.black,
    fontSize: 22,
    color: colors.textDark,
    lineHeight: 26,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroParagraph: {
    fontFamily: typography.fonts.medium,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 16,
  },
  monitoredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniCircleBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monitoredText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 11,
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  /* Section Header */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  sectionHeading: {
    fontFamily: typography.fonts.black,
    fontSize: 18,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  sectionHint: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 11,
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  /* 2x2 Grid */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCol: {
    width: '48%',
  },
  toolkitCardContent: {
    padding: 14,
    gap: 6,
  },
  toolkitIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  toolkitTitle: {
    fontFamily: typography.bodyBold,
    fontSize: 14.5,
    color: colors.textDark,
  },
  toolkitSub: {
    fontFamily: typography.fonts.medium,
    fontSize: 11,
    color: '#374151',
    lineHeight: 15,
    minHeight: 30,
  },
  toolkitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  toolkitPillText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 10,
    color: '#000',
    letterSpacing: 0.5,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  /* Rules Section */
  rulesHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  rulesTitleWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rulesPinkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryPink,
  },
  rulesMainHeading: {
    fontFamily: typography.fonts.black,
    fontSize: 18,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  nonNegotiablePill: {
    backgroundColor: colors.accentYellow,
    borderRadius: 6,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    paddingHorizontal: 8,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  nonNegotiableText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 10,
    color: '#000',
    letterSpacing: 0.5,
  },
  ruleCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  ruleNumberSquare: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  ruleNumberText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  ruleTextCol: {
    flex: 1,
  },
  ruleTitle: {
    fontFamily: typography.bodyBold,
    fontSize: 14,
    color: colors.textDark,
  },
  ruleBody: {
    fontFamily: typography.fonts.medium,
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
    marginTop: 2,
  },
  /* Footer Squad Card */
  squadCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  squadCircleBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6EE7B7',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  squadNumberText: {
    fontFamily: typography.fonts.black,
    fontSize: 18,
    color: '#000',
  },
  squadTextCol: {
    flex: 1,
  },
  squadHeading: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 12,
    color: '#9F1239',
    letterSpacing: 0.5,
  },
  squadBody: {
    fontFamily: typography.fonts.medium,
    fontSize: 12,
    color: '#1F2937',
    marginTop: 2,
    lineHeight: 16,
  },
});
