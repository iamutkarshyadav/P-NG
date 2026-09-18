import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { DotGridBackground } from '../components/DotGridBackground';
import { BrutalBox } from '../components/BrutalBox';
import { OnboardingTopHeader } from '../components/OnboardingTopHeader';
import { OnboardingBottomBar } from '../components/OnboardingBottomBar';
import { UserAccount, authDb } from '../services/authDb';

interface OnboardingAgeScreenProps {
  user: UserAccount;
  onBack: () => void;
  onComplete: (updatedUser: UserAccount) => void;
}

const MONTHS = [
  { num: 1, name: 'Jan' },
  { num: 2, name: 'Feb' },
  { num: 3, name: 'Mar' },
  { num: 4, name: 'Apr' },
  { num: 5, name: 'May' },
  { num: 6, name: 'Jun' },
  { num: 7, name: 'Jul' },
  { num: 8, name: 'Aug' },
  { num: 9, name: 'Sep' },
  { num: 10, name: 'Oct' },
  { num: 11, name: 'Nov' },
  { num: 12, name: 'Dec' },
];

function getZodiacSign(month: number, day: number): string {
  const cutoffDays = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];
  const signs = [
    'Capricorn',
    'Aquarius',
    'Pisces',
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
  ];
  const safeMonth = Math.min(Math.max(month, 1), 12);
  return day < cutoffDays[safeMonth - 1] ? signs[safeMonth - 1] : signs[safeMonth];
}

function calculateAge(year: number, month: number, day: number): number {
  const today = new Date(2026, 8, 18); // System date
  let age = today.getFullYear() - year;
  const m = today.getMonth() + 1 - month;
  if (m < 0 || (m === 0 && today.getDate() < day)) {
    age--;
  }
  return age;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export const OnboardingAgeScreen: React.FC<OnboardingAgeScreenProps> = ({
  user,
  onBack,
  onComplete,
}) => {
  // Committed birthdate on the screen
  const [selectedYear, setSelectedYear] = useState<number>(2000);
  const [selectedMonth, setSelectedMonth] = useState<number>(5);
  const [selectedDay, setSelectedDay] = useState<number>(14);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [tempYear, setTempYear] = useState<string>('2000');
  const [tempMonth, setTempMonth] = useState<number>(5);
  const [tempDay, setTempDay] = useState<number>(14);

  const [isSaving, setIsSaving] = useState(false);

  // Modular User Name extracted from DB
  const displayFirstName = useMemo(() => {
    if (!user.name) return 'THERE';
    const first = user.name.trim().split(' ')[0];
    return first.toUpperCase();
  }, [user.name]);

  // Formatted date string (YYYY-MM-DD)
  const formattedDateStr = useMemo(() => {
    return `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  }, [selectedYear, selectedMonth, selectedDay]);

  // Age calculation and 18+ check
  const age = useMemo(
    () => calculateAge(selectedYear, selectedMonth, selectedDay),
    [selectedYear, selectedMonth, selectedDay]
  );
  const is18Plus = age >= 18;

  // Zodiac calculation
  const zodiac = useMemo(
    () => getZodiacSign(selectedMonth, selectedDay),
    [selectedMonth, selectedDay]
  );

  // Open modal and sync temporary state
  const handleOpenModal = () => {
    setTempYear(String(selectedYear));
    setTempMonth(selectedMonth);
    setTempDay(selectedDay);
    setIsModalOpen(true);
  };

  // Temp days in month
  const tempNumYear = parseInt(tempYear, 10) || 2000;
  const tempMaxDays = getDaysInMonth(tempNumYear, tempMonth);
  const activeTempDay = Math.min(tempDay, tempMaxDays);

  const handleConfirmModal = () => {
    setSelectedYear(tempNumYear);
    setSelectedMonth(tempMonth);
    setSelectedDay(activeTempDay);
    setIsModalOpen(false);
  };

  const handleNext = async () => {
    if (!is18Plus) {
      Alert.alert(
        'Age Restriction',
        'You must be at least 18 years old to join P!NG.'
      );
      return;
    }

    setIsSaving(true);
    try {
      const updated = await authDb.updateUserProfile(user.id, {
        birthday: formattedDateStr,
        age,
        zodiacSign: zodiac,
      });

      if (updated) {
        onComplete(updated);
      } else {
        Alert.alert('Error', 'Could not save onboarding profile. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <DotGridBackground />

      {/* 1. Universal Neo-Brutalist Onboarding Top Header */}
      <OnboardingTopHeader onBack={onBack} user={user} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* 2. Step Badge Pill */}
          <View style={styles.stepBadgeWrapper}>
            <BrutalBox
              backgroundColor={colors.accentYellow}
              borderColor={colors.borderBlack}
              borderWidth={2.2}
              borderRadius={999}
              shadowOffset={{ x: 2.2, y: 2.2 }}
              contentStyle={styles.stepBadgeContent}
            >
              <MaterialCommunityIcons name="cake-variant" size={15} color={colors.textDark} />
              <Text style={styles.stepBadgeText}>
                STEP 01 / 08 • THE AGE CHECK
              </Text>
            </BrutalBox>
          </View>

          {/* 3. Modular Headline Text with Bulletproof 5px Black Border Underline on BIRTHDAY? */}
          <View style={styles.headlineWrapper}>
            <Text style={styles.headlineLine1}>HEY {displayFirstName},</Text>
            <Text style={styles.headlineLine2}>WHEN'S YOUR</Text>
            <View style={styles.birthdayUnderlineWrapper}>
              <Text style={styles.headlineBirthday}>BIRTHDAY?</Text>
            </View>
            <Text style={styles.subtitleText}>
              Your age is public. Your birth date stays strictly private.
            </Text>
          </View>

          {/* 4. Date of Birth Card with Tap-to-Open Popup */}
          <View style={styles.cardOuterWrapper}>
            <BrutalBox
              backgroundColor={colors.cardWhite}
              borderColor={colors.borderBlack}
              borderWidth={2.8}
              borderRadius={22}
              shadowOffset={{ x: 4, y: 4 }}
              overflow="visible"
              style={styles.fullWidth}
              contentStyle={styles.dobCardContent}
            >
              {/* Overlapping Floating Yellow Shield Label (Uncropped) */}
              <View style={styles.floatingShieldLabel}>
                <Ionicons name="shield-checkmark" size={13} color={colors.textDark} />
                <Text style={styles.floatingShieldText}>
                  DATE OF BIRTH (18+ AGE GATE)
                </Text>
              </View>

              {/* Interactive Date Box: Tapping opens the Date Picker Popup */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleOpenModal}
                style={styles.dateSelectorBox}
              >
                <View style={styles.calendarIconSquare}>
                  <Feather name="calendar" size={20} color={colors.primaryPink} />
                </View>

                <View style={styles.dateTextCol}>
                  <Text style={styles.selectedDateLabel}>SELECTED DATE (TAP TO CHANGE)</Text>
                  <Text style={styles.dateValueText}>{formattedDateStr}</Text>
                </View>

                {/* Show 18+ adult badge when valid */}
                {is18Plus && (
                  <View style={styles.agePillGreen}>
                    <Text style={styles.agePillGreenText}>{age} (18+)</Text>
                    <Ionicons name="checkmark-circle" size={15} color="#027A48" />
                  </View>
                )}

                {/* Tap indicator arrow */}
                <Ionicons name="chevron-down-circle" size={20} color="#666" style={{ marginLeft: 4 }} />
              </TouchableOpacity>

              {/* Warning banner when underage: No confusing pills in front of the date, just this clear warning */}
              {!is18Plus && (
                <View style={styles.underageWarningBanner}>
                  <Ionicons name="warning" size={16} color="#FFFFFF" />
                  <Text style={styles.underageWarningText}>
                    YOU MUST BE 18+ TO USE P!NG
                  </Text>
                </View>
              )}

              {/* Privacy Subtext */}
              <View style={styles.privacyRow}>
                <Feather name="lock" size={13} color={colors.primaryPink} />
                <Text style={styles.privacyText}>
                  NEVER SHOWN ON YOUR DATING CARDS
                </Text>
              </View>
            </BrutalBox>
          </View>

          {/* 5. Astro Logic Active Banner */}
          <BrutalBox
            backgroundColor={colors.lavender}
            borderColor={colors.borderBlack}
            borderWidth={2.6}
            borderRadius={18}
            shadowOffset={{ x: 3, y: 3 }}
            style={styles.fullWidth}
            contentStyle={styles.astroContent}
          >
            <View style={styles.astroIconCircle}>
              <MaterialCommunityIcons name="party-popper" size={22} color={colors.textDark} />
            </View>

            <View style={styles.astroTextCol}>
              <Text style={styles.astroTitle}>ASTRO LOGIC ACTIVE</Text>
              <Text style={styles.astroSubtext}>
                {zodiac} season match bonuses unlocked automatically on your feed!
              </Text>
            </View>
          </BrutalBox>
        </View>
      </ScrollView>

      {/* 6. Sticky Bottom CTA Button */}
      <View style={styles.bottomCtaContainer}>
        <BrutalBox
          backgroundColor={colors.accentYellow}
          borderColor={colors.borderBlack}
          borderWidth={2.6}
          borderRadius={999}
          shadowOffset={{ x: 3.5, y: 3.5 }}
          onPress={handleNext}
          disabled={isSaving}
          contentStyle={styles.nextButtonContent}
        >
          <Text style={styles.nextButtonText}>
            {isSaving ? 'SAVING...' : 'NEXT ➔'}
          </Text>
        </BrutalBox>
      </View>

      {/* ========================================================================= */}
      {/* 7. PERFECT NEO-BRUTALIST DATE SELECTOR POPUP MODAL */}
      {/* ========================================================================= */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setIsModalOpen(false)}
          />

          <View style={styles.modalContentWrapper}>
            <BrutalBox
              backgroundColor={colors.cardWhite}
              borderColor={colors.borderBlack}
              borderWidth={3}
              borderRadius={24}
              shadowOffset={{ x: 5, y: 5 }}
              style={styles.modalCard}
              contentStyle={styles.modalCardInner}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <View style={styles.miniCalendarBadge}>
                    <Feather name="calendar" size={16} color="#FFFFFF" />
                  </View>
                  <Text style={styles.modalTitle}>SELECT BIRTHDATE</Text>
                </View>

                <TouchableOpacity
                  onPress={() => setIsModalOpen(false)}
                  style={styles.closeBtn}
                >
                  <Ionicons name="close" size={20} color={colors.textDark} />
                </TouchableOpacity>
              </View>

              {/* Modal Preview Date Box */}
              <View style={styles.modalPreviewBox}>
                <Text style={styles.modalPreviewLabel}>SELECTED:</Text>
                <Text style={styles.modalPreviewDate}>
                  {tempNumYear}-{String(tempMonth).padStart(2, '0')}-{String(activeTempDay).padStart(2, '0')}
                </Text>
              </View>

              {/* 1. Year Selector Stepper */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionLabel}>1. BIRTH YEAR</Text>
                <View style={styles.yearRow}>
                  <TouchableOpacity
                    style={styles.stepperPill}
                    onPress={() => setTempYear(String(tempNumYear - 5))}
                  >
                    <Text style={styles.stepperPillText}>-5</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.stepperPill}
                    onPress={() => setTempYear(String(tempNumYear - 1))}
                  >
                    <Ionicons name="remove" size={16} color="#000" />
                  </TouchableOpacity>

                  <TextInput
                    style={styles.yearInputBox}
                    value={tempYear}
                    onChangeText={(val) => setTempYear(val.replace(/[^0-9]/g, '').slice(0, 4))}
                    keyboardType="number-pad"
                    maxLength={4}
                    placeholder="2000"
                  />

                  <TouchableOpacity
                    style={styles.stepperPill}
                    onPress={() => setTempYear(String(tempNumYear + 1))}
                  >
                    <Ionicons name="add" size={16} color="#000" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.stepperPill}
                    onPress={() => setTempYear(String(tempNumYear + 5))}
                  >
                    <Text style={styles.stepperPillText}>+5</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 2. Month Selector Grid */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionLabel}>2. MONTH</Text>
                <View style={styles.monthsGrid}>
                  {MONTHS.map((m) => {
                    const isActive = tempMonth === m.num;
                    return (
                      <TouchableOpacity
                        key={m.num}
                        onPress={() => setTempMonth(m.num)}
                        style={[
                          styles.monthChip,
                          isActive && styles.monthChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.monthChipText,
                            isActive && styles.monthChipTextActive,
                          ]}
                        >
                          {m.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 3. Day Selector Stepper / Input */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionLabel}>3. DAY OF MONTH (1 - {tempMaxDays})</Text>
                <View style={styles.dayRow}>
                  <TouchableOpacity
                    style={styles.stepperPill}
                    onPress={() => setTempDay(Math.max(activeTempDay - 1, 1))}
                  >
                    <Ionicons name="remove" size={16} color="#000" />
                  </TouchableOpacity>

                  <View style={styles.dayDisplayBox}>
                    <Text style={styles.dayDisplayText}>{activeTempDay}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.stepperPill}
                    onPress={() => setTempDay(Math.min(activeTempDay + 1, tempMaxDays))}
                  >
                    <Ionicons name="add" size={16} color="#000" />
                  </TouchableOpacity>

                  {/* Quick Day Chips */}
                  <View style={styles.quickDaysRow}>
                    {[1, 14, 15, 20, 28].map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.quickDayPill, activeTempDay === d && styles.quickDayPillActive]}
                        onPress={() => setTempDay(d)}
                      >
                        <Text style={[styles.quickDayPillText, activeTempDay === d && styles.quickDayPillTextActive]}>
                          {d}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Quick Presets inside modal */}
              <View style={styles.modalPresetsRow}>
                <TouchableOpacity
                  style={styles.modalPresetBtn}
                  onPress={() => {
                    setTempYear('2000');
                    setTempMonth(5);
                    setTempDay(14);
                  }}
                >
                  <Text style={styles.modalPresetText}>⚡ Adult: 2000-05-14 (Age 26)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalPresetBtn, styles.modalPresetBtnRed]}
                  onPress={() => {
                    setTempYear('2010');
                    setTempMonth(9);
                    setTempDay(22);
                  }}
                >
                  <Text style={[styles.modalPresetText, styles.modalPresetTextRed]}>
                    ⚠️ Underage: 2010-09-22 (Age 15)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Confirm / Apply Button */}
              <BrutalBox
                backgroundColor={colors.accentYellow}
                borderColor={colors.borderBlack}
                borderWidth={2.4}
                borderRadius={14}
                shadowOffset={{ x: 3, y: 3 }}
                onPress={handleConfirmModal}
                contentStyle={styles.confirmBtn}
              >
                <Text style={styles.confirmBtnText}>APPLY BIRTHDATE ➔</Text>
              </BrutalBox>
            </BrutalBox>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgCream,
  },
  topNavContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: colors.bgCream,
    gap: 12,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniLogoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  miniLogoText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: typography.headline,
    letterSpacing: 0.5,
  },
  stepIndicatorText: {
    fontSize: 12.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.6,
  },
  avatarButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '12.5%', // Step 1 of 8
    height: '100%',
    backgroundColor: colors.primaryPink,
    borderRadius: 999,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 110,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'flex-start',
    gap: 16,
  },
  fullWidth: {
    width: '100%',
  },
  stepBadgeWrapper: {
    alignSelf: 'flex-start',
    marginTop: 0,
  },
  stepBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 6,
  },
  stepBadgeText: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  headlineWrapper: {
    width: '100%',
    gap: 0,
    marginTop: -8,
    paddingTop: 2,
    overflow: 'visible',
  },
  headlineLine1: {
    fontSize: 34,
    color: colors.textDark,
    fontFamily: typography.headline,
    letterSpacing: 0.5,
    lineHeight: 38,
    paddingTop: 1,
  },
  headlineLine2: {
    fontSize: 34,
    color: colors.textDark,
    fontFamily: typography.headline,
    letterSpacing: 0.5,
    lineHeight: 38,
    paddingTop: 1,
  },
  birthdayUnderlineWrapper: {
    alignSelf: 'flex-start',
    borderBottomWidth: 5,
    borderBottomColor: '#000000',
    paddingBottom: 2,
    paddingTop: 1,
    marginBottom: 4,
  },
  headlineBirthday: {
    fontSize: 36,
    color: colors.primaryPink,
    fontFamily: typography.headline,
    letterSpacing: 0.5,
    lineHeight: 40,
    paddingTop: 1,
  },
  subtitleText: {
    fontSize: 13,
    fontFamily: typography.bodyMedium,
    color: '#333',
    marginTop: 4,
    lineHeight: 18,
  },
  cardOuterWrapper: {
    width: '100%',
    marginTop: 8,
  },
  dobCardContent: {
    padding: 18,
    paddingTop: 26,
    gap: 14,
    position: 'relative',
    overflow: 'visible',
  },
  floatingShieldLabel: {
    position: 'absolute',
    top: -14,
    left: 14,
    zIndex: 99,
    backgroundColor: colors.accentYellow,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 3.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  floatingShieldText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  dateSelectorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    borderRadius: 14,
    backgroundColor: '#FAF8F5',
    padding: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  calendarIconSquare: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTextCol: {
    flex: 1,
  },
  selectedDateLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#666',
    letterSpacing: 0.4,
  },
  dateValueText: {
    fontSize: 19,
    fontWeight: '900',
    color: colors.textDark,
    letterSpacing: 0.6,
  },
  agePillGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FADF',
    borderWidth: 1.8,
    borderColor: '#027A48',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    gap: 4,
  },
  agePillGreenText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#027A48',
  },
  underageWarningBanner: {
    backgroundColor: colors.primaryPink,
    borderRadius: 999,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  underageWarningText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 4,
  },
  privacyText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#555',
    letterSpacing: 0.4,
  },
  astroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  astroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentYellow,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  astroTextCol: {
    flex: 1,
  },
  astroTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  astroSubtext: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginTop: 2,
    lineHeight: 16,
  },
  bottomCtaContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  nextButtonContent: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 22,
    color: colors.textDark,
    fontFamily: typography.headline,
    letterSpacing: 0.8,
  },

  /* ================= MODAL POPUP STYLES ================= */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContentWrapper: {
    width: '100%',
    maxWidth: 360,
  },
  modalCard: {
    width: '100%',
  },
  modalCardInner: {
    padding: 18,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniCalendarBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primaryPink,
    borderWidth: 1.6,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0ECE1',
    borderWidth: 1.6,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF8F5',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modalPreviewLabel: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#666',
  },
  modalPreviewDate: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textDark,
    fontFamily: 'monospace',
  },
  modalSection: {
    gap: 6,
  },
  modalSectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#555',
    letterSpacing: 0.4,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperPill: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperPillText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.textDark,
  },
  yearInputBox: {
    flex: 1,
    height: 38,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 10,
    backgroundColor: '#FAF8F5',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: colors.textDark,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  monthChip: {
    width: '23%',
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthChipActive: {
    backgroundColor: colors.accentYellow,
  },
  monthChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textDark,
  },
  monthChipTextActive: {
    fontWeight: '900',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayDisplayBox: {
    width: 44,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDisplayText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textDark,
  },
  quickDaysRow: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
    justifyContent: 'flex-end',
  },
  quickDayPill: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.4,
    borderColor: colors.borderBlack,
    backgroundColor: '#FFFFFF',
  },
  quickDayPillActive: {
    backgroundColor: colors.accentYellow,
  },
  quickDayPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.textDark,
  },
  quickDayPillTextActive: {
    fontWeight: '900',
  },
  modalPresetsRow: {
    flexDirection: 'column',
    gap: 6,
  },
  modalPresetBtn: {
    backgroundColor: '#FFF8D6',
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  modalPresetText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textDark,
  },
  modalPresetBtnRed: {
    backgroundColor: '#FEE4E2',
    borderColor: '#B42318',
  },
  modalPresetTextRed: {
    color: '#B42318',
  },
  confirmBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textDark,
    letterSpacing: 0.6,
  },
});
