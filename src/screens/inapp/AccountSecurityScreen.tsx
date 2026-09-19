import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { LAYOUT } from '../../theme/responsive';
import { DotGridBackground } from '../../components/DotGridBackground';
import { BrutalBox } from '../../components/BrutalBox';
import { UserAccount } from '../../services/authDb';

interface AccountSecurityScreenProps {
  user: UserAccount;
  onBack: () => void;
  onPreviewProfile?: () => void;
}

export const AccountSecurityScreen: React.FC<AccountSecurityScreenProps> = ({
  user,
  onBack,
  onPreviewProfile,
}) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [biometricLockEnabled, setBiometricLockEnabled] = useState(true);
  const [pauseAccount, setPauseAccount] = useState(false);

  const handleRevokeDevice = (device: string) => {
    Alert.alert(
      'Revoke Device',
      `Are you sure you want to log out ${device}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: () => Alert.alert('Device Revoked', `${device} has been logged out.`),
        },
      ]
    );
  };

  const handleLogoutAllOther = () => {
    Alert.alert(
      'Log Out All Other Devices',
      'This will terminate all active sessions except your current device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out All',
          style: 'destructive',
          onPress: () => Alert.alert('Success', 'All other active sessions have been terminated.'),
        },
      ]
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      'Request Data Export',
      'Your GDPR data archive will be compiled and sent to your verified email within 24 hours.',
      [{ text: 'Request Archive', onPress: () => Alert.alert('Requested', 'Data export link will be sent to your email.') }]
    );
  };

  const handleResetMatches = () => {
    Alert.alert(
      'Reset All Matches & Swipes',
      'This will reset all your active swipe history and unmatch all connections. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => Alert.alert('Reset Complete', 'Your feed and matches have been cleared.'),
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'DELETE ACCOUNT PERMANENTLY',
      'This will permanently erase your profile, photos, chat history, and biometric data. This action is irreversible!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted.');
            onBack();
          },
        },
      ]
    );
  };

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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Screen Title Block */}
          <View style={styles.screenHeader}>
            <Text style={styles.screenHeading}>ACCOUNT & SECURITY</Text>
            <Text style={styles.screenSubheading}>Two-factor authentication, active devices & GDPR data control</Text>
          </View>

          {/* 2. VAULT SECURED HERO BANNER */}
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
              <Text style={styles.vaultTitle}>VAULT SECURED</Text>
              <Text style={styles.vaultSub}>LEVEL 3 SAFETY SHIELD ACTIVE</Text>
            </View>

            <View style={styles.vaultOkPill}>
              <View style={styles.okDot} />
              <Text style={styles.okText}>100% OK</Text>
            </View>
          </BrutalBox>

          {/* 3. VERIFIED CREDENTIALS */}
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>VERIFIED CREDENTIALS</Text>
              <View style={styles.tagLockTight}>
                <Text style={styles.tagLockTightText}>LOCK TIGHT</Text>
              </View>
            </View>

            {/* Credential 1: Phone */}
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
                <Feather name="smartphone" size={18} color="#444" />
              </View>
              <View style={styles.credTextCol}>
                <Text style={styles.credLabel}>PHONE NUMBER</Text>
                <Text style={styles.credValue}>+1 (555) 382-9014</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={13} color={colors.textDark} />
                <Text style={styles.verifiedBadgeText}>VERIFIED ✓</Text>
              </View>
            </BrutalBox>

            {/* Credential 2: Email */}
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
                  {user.email || 'alex.rivers@gmail.com'}
                </Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={13} color={colors.textDark} />
                <Text style={styles.verifiedBadgeText}>VERIFIED ✓</Text>
              </View>
            </BrutalBox>

            {/* Credential 3: 2FA */}
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
                <Feather name="key" size={18} color="#444" />
              </View>
              <View style={styles.credTextCol}>
                <Text style={styles.credLabel}>TWO-FACTOR AUTH (2FA)</Text>
                <Text style={[styles.credValue, { color: colors.primaryPink }]}>
                  SMS + Authenticator
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setTwoFactorEnabled(!twoFactorEnabled)}
                style={styles.enabledBadge}
              >
                <Text style={styles.enabledBadgeText}>
                  {twoFactorEnabled ? 'ENABLED ✓' : 'OFF'}
                </Text>
              </TouchableOpacity>
            </BrutalBox>

            {/* Credential 4: Biometric App Lock */}
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
                <Text style={styles.credLabel}>BIOMETRIC APP LOCK</Text>
                <Text style={styles.credValue}>
                  Face ID / PIN to Open App
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setBiometricLockEnabled(!biometricLockEnabled)}
                style={[
                  styles.enabledBadge,
                  !biometricLockEnabled && { backgroundColor: '#F3F4F6' },
                ]}
              >
                <Text style={styles.enabledBadgeText}>
                  {biometricLockEnabled ? 'ACTIVE ✓' : 'OFF'}
                </Text>
              </TouchableOpacity>
            </BrutalBox>
          </View>

          {/* 4. LOGGED IN DEVICES (2) */}
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
                <Text style={styles.deviceHeaderText}>LOGGED IN DEVICES (2)</Text>
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
              {/* Device 1: iPhone 15 Pro */}
              <View style={styles.deviceRow}>
                <View style={[styles.deviceIconBox, { backgroundColor: '#EDE9FE' }]}>
                  <Feather name="smartphone" size={18} color="#6D28D9" />
                </View>
                <View style={styles.deviceTextCol}>
                  <Text style={styles.deviceName}>iPhone 15 Pro ●</Text>
                  <Text style={styles.deviceMeta} numberOfLines={1}>
                    Brooklyn, NY • Ping App ...
                  </Text>
                </View>
                <View style={styles.currentDeviceBadge}>
                  <Text style={styles.currentDeviceText}>CURRENT</Text>
                </View>
              </View>

              <View style={styles.deviceDivider} />

              {/* Device 2: MacBook Pro 14 */}
              <View style={styles.deviceRow}>
                <View style={[styles.deviceIconBox, { backgroundColor: '#F3F4F6' }]}>
                  <Feather name="monitor" size={18} color="#374151" />
                </View>
                <View style={styles.deviceTextCol}>
                  <Text style={styles.deviceName}>MacBook Pro 14”</Text>
                  <Text style={styles.deviceMeta} numberOfLines={1}>
                    Chrome Browser • Active...
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.revokeBadge}
                  onPress={() => handleRevokeDevice('MacBook Pro 14"')}
                >
                  <Text style={styles.revokeText}>REVOKE</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.deviceDivider} />

              {/* Log Out All Other Devices */}
              <TouchableOpacity
                style={styles.logoutOtherBtn}
                onPress={handleLogoutAllOther}
                activeOpacity={0.8}
              >
                <Feather name="log-out" size={15} color="#9F1239" />
                <Text style={styles.logoutOtherText}>LOG OUT OF ALL OTHER DEVICES</Text>
              </TouchableOpacity>
            </BrutalBox>
          </View>

          {/* 5. DATA PRIVACY */}
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
              {/* Item 1: Download My P!NG Data */}
              <TouchableOpacity
                style={styles.privacyRow}
                onPress={handleDownloadData}
                activeOpacity={0.8}
              >
                <View style={[styles.deviceIconBox, { backgroundColor: '#E0E7FF' }]}>
                  <Feather name="download" size={18} color="#4338CA" />
                </View>
                <View style={styles.credTextCol}>
                  <Text style={styles.privacyTitle}>Download My P!NG Data</Text>
                  <Text style={styles.privacySub} numberOfLines={1}>
                    JSON archive of photos, chats...
                  </Text>
                </View>
                <View style={styles.circleArrowBtn}>
                  <Feather name="arrow-right" size={18} color={colors.textDark} />
                </View>
              </TouchableOpacity>

              <View style={styles.deviceDivider} />

              {/* Item 2: Pause Account */}
              <View style={styles.privacyRow}>
                <View style={[styles.deviceIconBox, { backgroundColor: '#FEF08A' }]}>
                  <Feather name="pause-circle" size={18} color="#854D0E" />
                </View>
                <View style={styles.credTextCol}>
                  <Text style={styles.privacyTitle}>Pause Account</Text>
                  <Text style={styles.privacySub} numberOfLines={1}>
                    Hide card temporarily, keep ...
                  </Text>
                </View>
                <Switch
                  value={pauseAccount}
                  onValueChange={setPauseAccount}
                  trackColor={{ false: '#D1D5DB', true: colors.accentYellow }}
                  thumbColor={pauseAccount ? '#000000' : '#FFFFFF'}
                />
              </View>
            </BrutalBox>
          </View>

          {/* 6. DANGER ZONE (Matching Hazard Stripes Banner) */}
          <View style={styles.dangerOuter}>
            {/* Caution Hazard Bar */}
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
                Proceed with extreme caution! Irreversible destructive actions live below. Once
                confirmed, there is no magic back-button.
              </Text>

              {/* Reset Matches Button */}
              <TouchableOpacity activeOpacity={0.85} onPress={handleResetMatches}>
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

              {/* Delete Account Button */}
              <TouchableOpacity activeOpacity={0.85} onPress={handleDeleteAccount}>
                <BrutalBox
                  backgroundColor="#9F1239"
                  borderColor={colors.borderBlack}
                  borderWidth={2.6}
                  borderRadius={16}
                  shadowOffset={{ x: 3, y: 3 }}
                  style={styles.fullWidth}
                  contentStyle={styles.deleteBtn}
                >
                  <MaterialCommunityIcons name="skull" size={20} color="#FFFFFF" />
                  <Text style={styles.deleteBtnText}>DELETE ACCOUNT PERMANENTLY</Text>
                </BrutalBox>
              </TouchableOpacity>
            </BrutalBox>
          </View>

          {/* 7. ENCRYPTED PROTOCOL FOOTER */}
          <View style={styles.footerWrap}>
            <BrutalBox
              backgroundColor="#EDE9FE"
              borderColor={colors.borderBlack}
              borderWidth={2}
              borderRadius={999}
              shadowOffset={{ x: 2, y: 2 }}
              contentStyle={styles.footerBadge}
            >
              <Feather name="lock" size={13} color="#4C1D95" />
              <Text style={styles.footerText}>ENCRYPTED WITH 256-BIT P!NG PROTOCOL</Text>
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
