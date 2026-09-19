import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { LAYOUT } from '../../theme/responsive';
import { DotGridBackground } from '../../components/DotGridBackground';
import { BrutalBox } from '../../components/BrutalBox';
import { UserAccount } from '../../types/user';
import { useSession } from '../../providers/SessionProvider';
import { changePassword } from '../../services/auth';
import { deleteMyAccount, exportMyData, resetMySwipes, signOutOtherSessions } from '../../services/account';
import { isLockEnabled, isLockSupported, setLockEnabled } from '../../services/appLock';
import { updateProfile } from '../../services/profile';
import { errorMessage } from '../../services/errors';

interface AccountSecurityScreenProps {
  user: UserAccount;
  onBack: () => void;
  onPreviewProfile?: () => void;
}

export const AccountSecurityScreen: React.FC<AccountSecurityScreenProps> = ({ user, onBack }) => {
  const { setUser } = useSession();
  const queryClient = useQueryClient();
  const [lockSupported, setLockSupported] = useState(false);
  const [lockOn, setLockOn] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    isLockSupported().then(setLockSupported);
    isLockEnabled().then(setLockOn);
  }, []);

  const run = async (label: string, task: () => Promise<void>, failTitle: string) => {
    setBusy(label);
    try {
      await task();
    } catch (e) {
      Alert.alert(failTitle, errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const handleToggleLock = async (next: boolean) => {
    const ok = await setLockEnabled(next);
    if (ok) setLockOn(next);
    else if (next) Alert.alert('Could not turn on app lock', 'Set up Face ID, fingerprint or a screen lock on this device first.');
  };

  const handleChangePassword = () =>
    run('password', async () => {
      if (newPassword !== confirmPassword) throw new Error('The two passwords do not match.');
      const result = await changePassword(newPassword);
      if (!result.ok) throw new Error(result.error);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordOpen(false);
      Alert.alert('Password updated', 'Use your new password next time you log in.');
    }, 'Could not change password');

  const handleLogoutOthers = () =>
    Alert.alert('Log out other devices', 'Every other device signed in to your account will be logged out.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log them out',
        style: 'destructive',
        onPress: () =>
          run('others', async () => {
            await signOutOtherSessions();
            Alert.alert('Done', 'All other sessions were logged out.');
          }, 'Could not log out other devices'),
      },
    ]);

  const handleDownload = () => run('export', exportMyData, 'Could not export your data');

  const handlePause = (next: boolean) =>
    run('pause', async () => {
      setUser(await updateProfile(user, { is_paused: next }));
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
    }, 'Could not update your account');

  const handleReset = () =>
    Alert.alert(
      'Reset all matches & swipes',
      'This deletes your swipe history and unmatches everyone, including your chats. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset everything',
          style: 'destructive',
          onPress: () =>
            run('reset', async () => {
              await resetMySwipes();
              await queryClient.invalidateQueries();
              Alert.alert('Reset complete', 'Your feed and matches were cleared.');
            }, 'Could not reset'),
        },
      ]
    );

  const handleDelete = () =>
    Alert.alert(
      'Delete account permanently',
      'This erases your profile, photos, matches and chats. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete permanently',
          style: 'destructive',
          onPress: () => run('delete', deleteMyAccount, 'Could not delete your account'),
        },
      ]
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
            <Text style={styles.screenHeading}>ACCOUNT & SECURITY</Text>
            <Text style={styles.screenSubheading}>Password, app lock, sessions and your data</Text>
          </View>

          <BrutalBox
            backgroundColor={colors.accentYellow}
            borderColor={colors.borderBlack}
            borderWidth={2.8}
            borderRadius={20}
            shadowOffset={{ x: 4, y: 4 }}
            style={styles.fullWidth}
            contentStyle={styles.vaultContent}
          >
            <View style={styles.vaultIconSquare}>
              <Ionicons name="shield" size={22} color={colors.primaryPink} />
            </View>
            <View style={styles.vaultTextCol}>
              <Text style={styles.vaultTitle}>{user.isVerifiedReal ? 'VERIFIED PROFILE' : 'NOT VERIFIED YET'}</Text>
              <Text style={styles.vaultSub}>
                {user.isVerifiedReal ? 'YOUR PROFILE HAS THE 100% REAL BADGE' : 'VERIFY IN THE SAFETY CENTRE'}
              </Text>
            </View>
          </BrutalBox>

          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>SIGN-IN</Text>
            </View>

            <BrutalBox
              backgroundColor={colors.cardWhite}
              borderColor={colors.borderBlack}
              borderWidth={2.4}
              borderRadius={18}
              shadowOffset={{ x: 3.5, y: 3.5 }}
              style={styles.fullWidth}
              contentStyle={styles.credCardContent}
            >
              <View style={styles.credIconBox}>
                <Feather name="at-sign" size={18} color="#444" />
              </View>
              <View style={styles.credTextCol}>
                <Text style={styles.credLabel}>EMAIL ADDRESS</Text>
                <Text style={styles.credValue} numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
            </BrutalBox>

            <BrutalBox
              backgroundColor={colors.cardWhite}
              borderColor={colors.borderBlack}
              borderWidth={2.4}
              borderRadius={18}
              shadowOffset={{ x: 3.5, y: 3.5 }}
              style={styles.fullWidth}
              contentStyle={styles.passwordCardContent}
            >
              <TouchableOpacity
                style={styles.passwordHeaderRow}
                onPress={() => setPasswordOpen((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel="Change password"
              >
                <View style={styles.credIconBox}>
                  <Feather name="key" size={18} color="#444" />
                </View>
                <View style={styles.credTextCol}>
                  <Text style={styles.credLabel}>PASSWORD</Text>
                  <Text style={styles.credValue}>Change your password</Text>
                </View>
                <Feather name={passwordOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textDark} />
              </TouchableOpacity>

              {passwordOpen && (
                <View style={styles.passwordForm}>
                  <TextInput
                    style={styles.passwordInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="New password (8+ characters)"
                    placeholderTextColor="#888"
                    secureTextEntry
                    autoCapitalize="none"
                    accessibilityLabel="New password"
                  />
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor="#888"
                    secureTextEntry
                    autoCapitalize="none"
                    accessibilityLabel="Confirm new password"
                  />
                  <BrutalBox
                    backgroundColor={colors.accentYellow}
                    borderRadius={12}
                    onPress={handleChangePassword}
                    disabled={busy === 'password'}
                    contentStyle={styles.passwordSave}
                  >
                    {busy === 'password' ? (
                      <ActivityIndicator color={colors.textDark} />
                    ) : (
                      <Text style={styles.passwordSaveText}>UPDATE PASSWORD</Text>
                    )}
                  </BrutalBox>
                </View>
              )}
            </BrutalBox>

            {lockSupported && (
              <BrutalBox
                backgroundColor={colors.cardWhite}
                borderColor={colors.borderBlack}
                borderWidth={2.4}
                borderRadius={18}
                shadowOffset={{ x: 3.5, y: 3.5 }}
                style={styles.fullWidth}
                contentStyle={styles.credCardContent}
              >
                <View style={styles.credIconBox}>
                  <Ionicons name="finger-print-outline" size={18} color="#444" />
                </View>
                <View style={styles.credTextCol}>
                  <Text style={styles.credLabel}>APP LOCK</Text>
                  <Text style={styles.credValue}>Biometrics or passcode to open</Text>
                </View>
                <Switch
                  value={lockOn}
                  onValueChange={handleToggleLock}
                  trackColor={{ false: '#D1D5DB', true: colors.accentYellow }}
                  thumbColor={lockOn ? '#000000' : '#FFFFFF'}
                  accessibilityLabel="App lock"
                />
              </BrutalBox>
            )}
          </View>

          <View style={styles.sectionWrapper}>
            <View style={styles.devicesHeaderWrap}>
              <BrutalBox
                backgroundColor={colors.accentYellow}
                borderColor={colors.borderBlack}
                borderWidth={2}
                borderRadius={8}
                shadowOffset={{ x: 2, y: 2 }}
                contentStyle={styles.deviceHeaderBadge}
              >
                <Text style={styles.deviceHeaderText}>SESSIONS</Text>
              </BrutalBox>
            </View>

            <BrutalBox
              backgroundColor={colors.cardWhite}
              borderColor={colors.borderBlack}
              borderWidth={2.6}
              borderRadius={20}
              shadowOffset={{ x: 4, y: 4 }}
              style={styles.fullWidth}
              contentStyle={styles.deviceCardBox}
            >
              <TouchableOpacity
                style={styles.logoutOtherBtn}
                onPress={handleLogoutOthers}
                disabled={busy === 'others'}
                activeOpacity={0.8}
                accessibilityRole="button"
              >
                <Feather name="log-out" size={15} color="#9F1239" />
                <Text style={styles.logoutOtherText}>LOG OUT OF ALL OTHER DEVICES</Text>
              </TouchableOpacity>
            </BrutalBox>
          </View>

          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>DATA PRIVACY</Text>
              <View style={styles.tagGdpr}>
                <Text style={styles.tagGdprText}>GDPR & CCPA</Text>
              </View>
            </View>

            <BrutalBox
              backgroundColor={colors.cardWhite}
              borderColor={colors.borderBlack}
              borderWidth={2.6}
              borderRadius={20}
              shadowOffset={{ x: 4, y: 4 }}
              style={styles.fullWidth}
              contentStyle={styles.privacyCardContent}
            >
              <TouchableOpacity
                style={styles.privacyRow}
                onPress={handleDownload}
                disabled={busy === 'export'}
                activeOpacity={0.8}
                accessibilityRole="button"
              >
                <View style={[styles.deviceIconBox, { backgroundColor: '#E0E7FF' }]}>
                  <Feather name="download" size={18} color="#4338CA" />
                </View>
                <View style={styles.credTextCol}>
                  <Text style={styles.privacyTitle}>Download My P!NG Data</Text>
                  <Text style={styles.privacySub} numberOfLines={1}>
                    JSON copy of your profile, swipes and chats
                  </Text>
                </View>
                {busy === 'export' ? (
                  <ActivityIndicator color={colors.textDark} />
                ) : (
                  <View style={styles.circleArrowBtn}>
                    <Feather name="arrow-right" size={18} color={colors.textDark} />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.deviceDivider} />

              <View style={styles.privacyRow}>
                <View style={[styles.deviceIconBox, { backgroundColor: '#FEF08A' }]}>
                  <Feather name="pause-circle" size={18} color="#854D0E" />
                </View>
                <View style={styles.credTextCol}>
                  <Text style={styles.privacyTitle}>Pause Account</Text>
                  <Text style={styles.privacySub} numberOfLines={2}>
                    Hide your card from Discover. Matches and chats stay.
                  </Text>
                </View>
                <Switch
                  value={user.isPaused}
                  onValueChange={handlePause}
                  disabled={busy === 'pause'}
                  trackColor={{ false: '#D1D5DB', true: colors.accentYellow }}
                  thumbColor={user.isPaused ? '#000000' : '#FFFFFF'}
                  accessibilityLabel="Pause account"
                />
              </View>
            </BrutalBox>
          </View>

          <View style={styles.dangerOuter}>
            <View style={styles.hazardBar}>
              {[...Array(16)].map((_, i) => (
                <View key={i} style={styles.hazardStripe} />
              ))}
            </View>

            <BrutalBox
              backgroundColor="#FFE4E6"
              borderColor={colors.borderBlack}
              borderWidth={2.8}
              borderRadius={22}
              shadowOffset={{ x: 4, y: 4 }}
              style={styles.fullWidth}
              contentStyle={styles.dangerContent}
            >
              <View style={styles.dangerHeaderRow}>
                <View style={styles.dangerTitleGroup}>
                  <Feather name="alert-triangle" size={20} color="#9F1239" />
                  <Text style={styles.dangerTitle}>DANGER ZONE</Text>
                </View>
                <View style={styles.noUndoBadge}>
                  <Text style={styles.noUndoText}>NO UNDO</Text>
                </View>
              </View>

              <Text style={styles.dangerExplainer}>
                These actions are permanent. Once confirmed there is no way back.
              </Text>

              <TouchableOpacity activeOpacity={0.85} onPress={handleReset} disabled={busy === 'reset'} accessibilityRole="button">
                <BrutalBox
                  backgroundColor="#FFFFFF"
                  borderColor={colors.borderBlack}
                  borderWidth={2.4}
                  borderRadius={14}
                  shadowOffset={{ x: 3, y: 3 }}
                  style={styles.fullWidth}
                  contentStyle={styles.resetBtn}
                >
                  <Feather name="rotate-ccw" size={16} color={colors.textDark} />
                  <Text style={styles.resetBtnText}>RESET ALL MATCHES & SWIPES</Text>
                </BrutalBox>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.85} onPress={handleDelete} disabled={busy === 'delete'} accessibilityRole="button">
                <BrutalBox
                  backgroundColor="#9F1239"
                  borderColor={colors.borderBlack}
                  borderWidth={2.6}
                  borderRadius={16}
                  shadowOffset={{ x: 3, y: 3 }}
                  style={styles.fullWidth}
                  contentStyle={styles.deleteBtn}
                >
                  {busy === 'delete' ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="skull" size={20} color="#FFFFFF" />
                      <Text style={styles.deleteBtnText}>DELETE ACCOUNT PERMANENTLY</Text>
                    </>
                  )}
                </BrutalBox>
              </TouchableOpacity>
            </BrutalBox>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  passwordCardContent: {
    padding: 14,
    gap: 12,
  },
  passwordHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  passwordForm: {
    gap: 10,
    paddingTop: 4,
  },
  passwordInput: {
    height: 46,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: typography.bodySemiBold,
    color: colors.textDark,
  },
  passwordSave: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  passwordSaveText: {
    fontSize: 14,
    fontFamily: typography.headline,
    color: colors.textDark,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
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
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 100 : 85,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    gap: 16,
  },
  fullWidth: {
    width: '100%',
  },

  /* Vault Banner */
  vaultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  vaultIconSquare: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultTextCol: {
    flex: 1,
  },
  vaultTitle: {
    fontSize: 15,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.3,
  },
  vaultSub: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: '#555',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  vaultOkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.6,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    gap: 5,
  },
  okDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#E11D48',
  },
  okText: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },

  /* Sections */
  sectionWrapper: {
    width: '100%',
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  sectionHeading: {
    fontSize: 22,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  tagLockTight: {
    backgroundColor: '#EDE9FE',
    borderWidth: 1.6,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagLockTightText: {
    fontSize: 9.5,
    fontFamily: typography.bodyExtraBold,
    color: '#5B21B6',
    letterSpacing: 0.4,
  },
  tagGdpr: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1.6,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagGdprText: {
    fontSize: 9.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },

  /* Credential Cards */
  credCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  credIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FAF8F5',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  credTextCol: {
    flex: 1,
  },
  credLabel: {
    fontSize: 9.5,
    fontFamily: typography.bodyExtraBold,
    color: '#666',
    letterSpacing: 0.4,
  },
  credValue: {
    fontSize: 14,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentYellow,
    borderWidth: 1.6,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  enabledBadge: {
    backgroundColor: colors.accentYellow,
    borderWidth: 1.6,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  enabledBadgeText: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },

  /* Devices */
  devicesHeaderWrap: {
    alignSelf: 'flex-start',
    marginBottom: -4,
  },
  deviceHeaderBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  deviceHeaderText: {
    fontSize: 10.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  deviceCardBox: {
    padding: 14,
    gap: 12,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deviceIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceTextCol: {
    flex: 1,
  },
  deviceName: {
    fontSize: 14,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
  },
  deviceMeta: {
    fontSize: 11,
    fontFamily: typography.bodyMedium,
    color: '#666',
    marginTop: 2,
  },
  currentDeviceBadge: {
    backgroundColor: colors.accentYellow,
    borderWidth: 1.6,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  currentDeviceText: {
    fontSize: 9.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  revokeBadge: {
    backgroundColor: '#9F1239',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
  },
  revokeText: {
    fontSize: 9.5,
    fontFamily: typography.bodyExtraBold,
    color: '#FFFFFF',
  },
  deviceDivider: {
    height: 1.2,
    backgroundColor: '#E5E7EB',
    width: '100%',
  },
  logoutOtherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 12,
    paddingVertical: 10,
    gap: 8,
  },
  logoutOtherText: {
    fontSize: 12,
    fontFamily: typography.bodyExtraBold,
    color: '#9F1239',
    letterSpacing: 0.5,
  },

  /* Privacy Card */
  privacyCardContent: {
    padding: 14,
    gap: 12,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  privacyTitle: {
    fontSize: 14,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
  },
  privacySub: {
    fontSize: 11,
    fontFamily: typography.bodyMedium,
    color: '#666',
    marginTop: 2,
  },
  circleArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.6,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Danger Zone */
  dangerOuter: {
    width: '100%',
    marginTop: 6,
  },
  hazardBar: {
    flexDirection: 'row',
    height: 12,
    backgroundColor: '#000000',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 4,
  },
  hazardStripe: {
    width: 14,
    height: '100%',
    backgroundColor: colors.accentYellow,
    marginRight: 10,
    transform: [{ skewX: '-25deg' }],
  },
  dangerContent: {
    padding: 16,
    gap: 12,
  },
  dangerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dangerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dangerTitle: {
    fontSize: 26,
    fontFamily: typography.headline,
    color: '#9F1239',
    letterSpacing: 0.5,
  },
  noUndoBadge: {
    backgroundColor: '#9F1239',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  noUndoText: {
    fontSize: 9.5,
    fontFamily: typography.bodyExtraBold,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  dangerExplainer: {
    fontSize: 12,
    fontFamily: typography.bodyMedium,
    color: '#4B5563',
    lineHeight: 17,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  resetBtnText: {
    fontSize: 12.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  deleteBtnText: {
    fontSize: 13,
    fontFamily: typography.bodyExtraBold,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },

  /* Footer */
  footerWrap: {
    alignSelf: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 7,
  },
  footerText: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: '#4C1D95',
    letterSpacing: 0.5,
  },
});
