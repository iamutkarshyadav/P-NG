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
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { LAYOUT } from '../../theme/responsive';
import { DotGridBackground } from '../../components/DotGridBackground';
import { BrutalBox } from '../../components/BrutalBox';
import { UserAccount } from '../../services/authDb';

interface SafetyCenterScreenProps {
  user: UserAccount;
  onBack: () => void;
  onPreviewProfile?: () => void;
}

export const SafetyCenterScreen: React.FC<SafetyCenterScreenProps> = ({
  onBack,
}) => {
  const [stealthActive, setStealthActive] = useState(true);

  const handleToolConfig = (toolName: string) => {
    if (toolName === 'STEALTH') {
      setStealthActive(!stealthActive);
      Alert.alert(
        'Stealth Mode',
        !stealthActive
          ? 'Stealth Shield activated! You are now hidden from mutual phone contacts.'
          : 'Stealth Shield turned off.'
      );
    } else if (toolName === '100% REAL') {
      Alert.alert(
        '100% Real Verification',
        'Your biometric live-match selfie is valid and verified. Next re-certification in 180 days.'
      );
    } else if (toolName === 'EPHEMERAL') {
      Alert.alert(
        'Ephemeral Chat Media',
        'Auto-destruct timer set to 5 seconds after recipient opens media in chat.'
      );
    } else if (toolName === 'BLOCK LIST') {
      Alert.alert(
        'Blocked Accounts',
        'You have 0 blocked users. You can report or block any match with instant 1-tap protection.'
      );
    }
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Screen Title Block */}
          <View style={styles.screenHeader}>
            <Text style={styles.screenHeading}>SAFETY CENTRE</Text>
            <Text style={styles.screenSubheading}>Real-time protection, discreet emergency exit & incident reporting</Text>
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
              P!NG is built on real humans, auto-expiring chats, and an absolute zero-tolerance policy for creeps and harassment.
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
              <Text style={styles.monitoredText}>100% END-TO-END MONITORED</Text>
            </View>
          </BrutalBox>

          {/* SECTION 1: SAFETY TOOLKIT */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>SAFETY TOOLKIT</Text>
            <Text style={styles.sectionHint}>TAP TO CONFIGURE</Text>
          </View>

          {/* 2x2 Grid */}
          <View style={styles.gridContainer}>
            {/* Card 1: 100% REAL (Mint) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleToolConfig('100% REAL')}
              style={styles.gridCol}
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
                <Text style={styles.toolkitSub}>Liveness checked & badge active.</Text>
                <View style={styles.toolkitPill}>
                  <Text style={styles.toolkitPillText}>VERIFIED</Text>
                  <View style={styles.redDot} />
                </View>
              </BrutalBox>
            </TouchableOpacity>

            {/* Card 2: STEALTH (Pink) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleToolConfig('STEALTH')}
              style={styles.gridCol}
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
                <Text style={styles.toolkitSub}>Hidden from mutuals & phone contacts.</Text>
                <View style={styles.toolkitPill}>
                  <Text style={styles.toolkitPillText}>
                    {stealthActive ? 'SHIELD ON' : 'SHIELD OFF'}
                  </Text>
                </View>
              </BrutalBox>
            </TouchableOpacity>

            {/* Card 3: EPHEMERAL (Yellow) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleToolConfig('EPHEMERAL')}
              style={styles.gridCol}
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
                  <MaterialCommunityIcons name="timer-lock-outline" size={18} color="#000" />
                </View>
                <Text style={styles.toolkitTitle}>EPHEMERAL</Text>
                <Text style={styles.toolkitSub}>Tap-to-reveal chat media rules.</Text>
                <View style={styles.toolkitPill}>
                  <Text style={styles.toolkitPillText}>5 SEC EXPIRY</Text>
                </View>
              </BrutalBox>
            </TouchableOpacity>

            {/* Card 4: BLOCK LIST (Lavender) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleToolConfig('BLOCK LIST')}
              style={styles.gridCol}
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
                  <Feather name="flag" size={18} color="#DC2626" />
                </View>
                <Text style={styles.toolkitTitle}>BLOCK LIST</Text>
                <Text style={styles.toolkitSub}>Review 0 blocked users, fast report.</Text>
                <View style={styles.toolkitPill}>
                  <Text style={styles.toolkitPillText}>CLEAN RECORD</Text>
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
