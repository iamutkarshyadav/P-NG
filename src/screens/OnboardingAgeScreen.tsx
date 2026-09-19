import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { LAYOUT } from '../theme/responsive';
import { DotGridBackground } from '../components/DotGridBackground';
import { BrutalBox } from '../components/BrutalBox';
import { OnboardingTopHeader } from '../components/OnboardingTopHeader';
import { OnboardingBottomBar } from '../components/OnboardingBottomBar';
import { UserAccount } from '../types/user';
import { updateProfile } from '../services/profile';
import { errorMessage } from '../services/errors';

interface OnboardingAgeScreenProps {
  user: UserAccount;
  onBack: () => void;
  onComplete: (updatedUser: UserAccount) => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_SHORT = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
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
  const today = new Date();
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
  // Committed birthdate
  const [initialYear, initialMonth, initialDay] = user.birthday
    ? user.birthday.split('-').map(Number)
    : [2000, 5, 14];
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);
  const [selectedDay, setSelectedDay] = useState<number>(initialDay);
  const [yearInputText, setYearInputText] = useState<string>(String(initialYear));

  // Confirmation Pop-up Modal State
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

  // User first name
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

  // Helper to clamp day when month/year changes
  const clampDay = (y: number, m: number, d: number) => {
    const max = getDaysInMonth(y, m);
    return Math.min(d, max);
  };

  // Month navigation
  const handlePrevMonth = () => {
    const nextMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    setSelectedMonth(nextMonth);
    setSelectedDay((curr) => clampDay(selectedYear, nextMonth, curr));
  };

  const handleNextMonth = () => {
    const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
    setSelectedMonth(nextMonth);
    setSelectedDay((curr) => clampDay(selectedYear, nextMonth, curr));
  };

  // Day navigation
  const handlePrevDay = () => {
    const maxDays = getDaysInMonth(selectedYear, selectedMonth);
    setSelectedDay((prev) => (prev <= 1 ? maxDays : prev - 1));
  };

  const handleNextDay = () => {
    const maxDays = getDaysInMonth(selectedYear, selectedMonth);
    setSelectedDay((prev) => (prev >= maxDays ? 1 : prev + 1));
  };

  // Year navigation
  const handlePrevYear = () => {
    const nextYear = Math.max(selectedYear - 1, 1920);
    setSelectedYear(nextYear);
    setYearInputText(String(nextYear));
    setSelectedDay((curr) => clampDay(nextYear, selectedMonth, curr));
  };

  const handleNextYear = () => {
    const currentYear = new Date().getFullYear();
    const nextYear = Math.min(selectedYear + 1, currentYear);
    setSelectedYear(nextYear);
    setYearInputText(String(nextYear));
    setSelectedDay((curr) => clampDay(nextYear, selectedMonth, curr));
  };

  const handleYearInput = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '').slice(0, 4);
    setYearInputText(clean);
    if (clean.length === 4) {
      const parsed = parseInt(clean, 10);
      const currentYear = new Date().getFullYear();
      if (!isNaN(parsed) && parsed >= 1920 && parsed <= currentYear) {
        setSelectedYear(parsed);
        setSelectedDay((currDay) => clampDay(parsed, selectedMonth, currDay));
      }
    }
  };

  const handleYearBlur = () => {
    const parsed = parseInt(yearInputText, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(parsed) || parsed < 1920 || parsed > currentYear) {
      setYearInputText(String(selectedYear));
    } else {
      setSelectedYear(parsed);
      setSelectedDay((currDay) => clampDay(parsed, selectedMonth, currDay));
    }
  };

  // Trigger Confirmation Modal from Bottom Bar or Date Selector
  const handleOpenConfirmModal = () => {
    setShowConfirmModal(true);
  };

  // Save profile upon user confirmation in popup
  const handleFinalConfirm = async () => {
    if (!is18Plus) {
      Alert.alert(
        'Age Restriction (18+)',
        'You must be at least 18 years old to join P!NG.'
      );
      return;
    }

    setShowConfirmModal(false);
    setIsSaving(true);
    try {
      onComplete(await updateProfile(user, { birthday: formattedDateStr, onboarding_step: 3 }));
    } catch (e) {
      Alert.alert('Could not save', errorMessage(e));
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
          <View style={styles.contentSection}>
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
                  STEP 02 / 08 • THE AGE CHECK
                </Text>
              </BrutalBox>
            </View>

            {/* 3. Modular Headline Text with 5px Black Underline */}
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

            {/* 4. CLEAN DATE SELECTOR CARD */}
            <View style={styles.cardOuterWrapper}>
              <BrutalBox
                backgroundColor={colors.cardWhite}
                borderColor={colors.borderBlack}
                borderWidth={2.8}
                borderRadius={22}
                shadowOffset={{ x: 4, y: 4 }}
                overflow="visible"
                style={styles.fullWidth}
                contentStyle={styles.dateCardContent}
              >
                {/* Floating Shield Badge */}
                <View style={styles.floatingShieldLabel}>
                  <Ionicons name="calendar-outline" size={13} color={colors.textDark} />
                  <Text style={styles.floatingShieldText}>
                    DATE OF BIRTH (18+ AGE GATE)
                  </Text>
                </View>

                {/* Big Clean Date Banner (Single Line, Never Wraps) */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleOpenConfirmModal}
                  style={styles.cleanDateBanner}
                >
                  <View style={styles.calendarIconSquare}>
                    <Feather name="calendar" size={19} color={colors.primaryPink} />
                  </View>

                  <View style={styles.dateBannerCol}>
                    <Text style={styles.dateBannerSub}>SELECTED BIRTHDATE (TAP TO CONFIRM)</Text>
                    <Text style={styles.dateBannerMain} numberOfLines={1}>
                      {MONTH_NAMES[selectedMonth - 1].toUpperCase()} {selectedDay}, {selectedYear}
                    </Text>
                  </View>

                  <View style={styles.isoDateBadge}>
                    <Text style={styles.isoDateText}>{formattedDateStr}</Text>
                  </View>
                </TouchableOpacity>

                {/* 3-Column Segmented Controller (MONTH | DAY | YEAR) */}
                <View style={styles.segmentedColumnsRow}>
                  {/* Column 1: MONTH */}
                  <View style={styles.segmentCol}>
                    <Text style={styles.segmentColTitle}>MONTH</Text>
                    <View style={styles.segmentValueCard}>
                      <Text style={styles.segmentMonthText}>
                        {MONTH_SHORT[selectedMonth - 1]}
                      </Text>
                    </View>
                    <View style={styles.colButtonsRow}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={handlePrevMonth}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="chevron-back" size={18} color={colors.textDark} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={handleNextMonth}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="chevron-forward" size={18} color={colors.textDark} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Column 2: DAY */}
                  <View style={styles.segmentCol}>
                    <Text style={styles.segmentColTitle}>DAY</Text>
                    <View style={styles.segmentValueCard}>
                      <Text style={styles.segmentDayText}>{selectedDay}</Text>
                    </View>
                    <View style={styles.colButtonsRow}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={handlePrevDay}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="remove" size={18} color={colors.textDark} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={handleNextDay}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add" size={18} color={colors.textDark} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Column 3: YEAR */}
                  <View style={styles.segmentCol}>
                    <Text style={styles.segmentColTitle}>YEAR</Text>
                    <View style={styles.segmentValueCard}>
                      <TextInput
                        style={styles.segmentYearInput}
                        value={yearInputText}
                        onChangeText={handleYearInput}
                        onBlur={handleYearBlur}
                        keyboardType="number-pad"
                        maxLength={4}
                        selectTextOnFocus
                      />
                    </View>
                    <View style={styles.colButtonsRow}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={handlePrevYear}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="remove" size={18} color={colors.textDark} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={handleNextYear}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add" size={18} color={colors.textDark} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Privacy Assurance Row */}
                <View style={styles.privacyRow}>
                  <Feather name="lock" size={13} color={colors.primaryPink} />
                  <Text style={styles.privacyText}>
                    NEVER SHOWN ON YOUR DATING CARDS
                  </Text>
                </View>
              </BrutalBox>
            </View>

            {/* 5. ASTRO LOGIC BANNER (LIVE REACTIVE) */}
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
        </View>
      </ScrollView>

      {/* 6. Pinned Bottom Navigation Dual Buttons (SKIP + NEXT) */}
      <View style={styles.bottomBarWrapper}>
        <OnboardingBottomBar
          onNext={handleOpenConfirmModal}
          onSkip={handleOpenConfirmModal}
          isSaving={isSaving}
        />
      </View>

      {/* ========================================================================= */}
      {/* 7. AUTHENTIC NEO-BRUTALIST AGE CONFIRMATION MODAL                          */}
      {/* ========================================================================= */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowConfirmModal(false)}
          />

          <View style={styles.modalContentWrapper}>
            <BrutalBox
              backgroundColor={colors.cardWhite}
              borderColor={colors.borderBlack}
              borderWidth={3}
              borderRadius={22}
              shadowOffset={{ x: 5, y: 5 }}
              style={styles.fullWidth}
              contentStyle={styles.modalCardInner}
            >
              {/* Modal Top Bar */}
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalHeaderLabel}>CONFIRM AGE</Text>

                <TouchableOpacity
                  onPress={() => setShowConfirmModal(false)}
                  style={styles.modalCloseCircle}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={18} color={colors.textDark} />
                </TouchableOpacity>
              </View>

              {/* Punchy Hero Headline */}
              <View style={styles.modalHeroSection}>
                <Text style={styles.modalHeroSub}>HEY {displayFirstName},</Text>
                <Text style={styles.modalHeroTitle}>
                  YOU ARE <Text style={styles.modalHeroAge}>{age}</Text>?
                </Text>
              </View>

              {/* Dating Card Profile Preview Box */}
              <View style={styles.datingCardPreview}>
                <Text style={styles.previewHeaderLabel}>HOW YOU'LL APPEAR ON P!NG</Text>

                <View style={styles.previewCardBody}>
                  <Text style={styles.previewNameAge}>
                    {displayFirstName}, <Text style={styles.previewAgeNumber}>{age}</Text>
                  </Text>
                  <Text style={styles.previewSubtext}>
                    Born {MONTH_NAMES[selectedMonth - 1]} {selectedDay}, {selectedYear} • {zodiac} ♉
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              {is18Plus ? (
                <View style={styles.modalActionsCol}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleFinalConfirm}
                    style={styles.fullWidth}
                  >
                    <BrutalBox
                      backgroundColor={colors.accentYellow}
                      borderColor={colors.borderBlack}
                      borderWidth={2.6}
                      borderRadius={14}
                      shadowOffset={{ x: 3, y: 3 }}
                      style={styles.fullWidth}
                      contentStyle={styles.modalPrimaryBtn}
                    >
                      <Text style={styles.modalPrimaryBtnText}>
                        YES, I'M {age} ➔
                      </Text>
                    </BrutalBox>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowConfirmModal(false)}
                    style={styles.modalSecondaryBtn}
                  >
                    <Text style={styles.modalSecondaryBtnText}>
                      NO, EDIT BIRTHDATE
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.modalActionsCol}>
                  <View style={styles.underageAlertBlock}>
                    <Ionicons name="warning" size={16} color="#B42318" />
                    <Text style={styles.underageAlertText}>
                      You must be at least 18 years old to join P!NG. You cannot proceed at age {age}.
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setShowConfirmModal(false)}
                    style={styles.fullWidth}
                  >
                    <BrutalBox
                      backgroundColor="#FEE2E2"
                      borderColor="#B42318"
                      borderWidth={2.4}
                      borderRadius={14}
                      shadowOffset={{ x: 3, y: 3 }}
                      style={styles.fullWidth}
                      contentStyle={styles.modalPrimaryBtn}
                    >
                      <Text style={[styles.modalPrimaryBtnText, { color: '#B42318' }]}>
                        ← FIX BIRTHDATE
                      </Text>
                    </BrutalBox>
                  </TouchableOpacity>
                </View>
              )}
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    alignItems: 'flex-start',
    gap: 18,
  },
  bottomBarWrapper: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
  },
  contentSection: {
    width: '100%',
    alignItems: 'flex-start',
    gap: 14,
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

  /* ===== DATE CARD & SELECTOR STYLES ===== */
  cardOuterWrapper: {
    width: '100%',
    marginTop: 6,
  },
  dateCardContent: {
    padding: 16,
    paddingTop: 24,
    gap: 14,
    position: 'relative',
    overflow: 'visible',
  },
  floatingShieldLabel: {
    position: 'absolute',
    top: -13,
    left: 14,
    zIndex: 99,
    backgroundColor: colors.accentYellow,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 3.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  floatingShieldText: {
    fontSize: 10.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  cleanDateBanner: {
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
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBannerCol: {
    flex: 1,
    justifyContent: 'center',
  },
  dateBannerSub: {
    fontSize: 8.5,
    fontFamily: typography.bodyExtraBold,
    color: '#777',
    letterSpacing: 0.4,
  },
  dateBannerMain: {
    fontSize: 16.5,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
    letterSpacing: 0.4,
    marginTop: 1,
  },
  isoDateBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.6,
    borderColor: colors.borderBlack,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  isoDateText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.textDark,
  },

  /* 3-Column Segmented Selector */
  segmentedColumnsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  segmentCol: {
    flex: 1,
    gap: 6,
    alignItems: 'center',
  },
  segmentColTitle: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: '#555',
    letterSpacing: 0.5,
  },
  segmentValueCard: {
    width: '100%',
    height: 42,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentMonthText: {
    fontSize: 15,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  segmentDayText: {
    fontSize: 17,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
  },
  segmentYearInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
  },
  colButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
  },
  stepperBtn: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Privacy Row */
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 2,
  },
  privacyText: {
    fontSize: 11,
    fontFamily: typography.bodyBold,
    color: '#555',
    letterSpacing: 0.4,
  },

  /* Astro Logic Banner */
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
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  astroSubtext: {
    fontSize: 12,
    fontFamily: typography.bodyMedium,
    color: '#333',
    marginTop: 2,
    lineHeight: 16,
  },

  /* ===== AUTHENTIC NEO-BRUTALIST CONFIRMATION MODAL STYLES ===== */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContentWrapper: {
    width: '100%',
    maxWidth: 380,
  },
  modalCardInner: {
    padding: 22,
    gap: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalHeaderLabel: {
    fontSize: 11.5,
    fontFamily: typography.bodyExtraBold,
    color: '#888',
    letterSpacing: 0.8,
  },
  modalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeroSection: {
    gap: 2,
  },
  modalHeroSub: {
    fontSize: 13,
    fontFamily: typography.bodyExtraBold,
    color: '#666',
    letterSpacing: 0.6,
  },
  modalHeroTitle: {
    fontSize: 34,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.5,
    lineHeight: 38,
  },
  modalHeroAge: {
    color: colors.primaryPink,
  },
  datingCardPreview: {
    backgroundColor: '#FAF8F5',
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  previewHeaderLabel: {
    fontSize: 9.5,
    fontFamily: typography.bodyExtraBold,
    color: '#777',
    letterSpacing: 0.5,
  },
  previewCardBody: {
    gap: 2,
  },
  previewNameAge: {
    fontSize: 24,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  previewAgeNumber: {
    color: colors.primaryPink,
  },
  previewSubtext: {
    fontSize: 12.5,
    fontFamily: typography.bodyMedium,
    color: '#444',
  },
  modalActionsCol: {
    gap: 8,
    marginTop: 2,
  },
  modalPrimaryBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryBtnText: {
    fontSize: 15,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.6,
  },
  modalSecondaryBtn: {
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryBtnText: {
    fontSize: 12,
    fontFamily: typography.bodyExtraBold,
    color: '#666',
    letterSpacing: 0.5,
  },
  underageAlertBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1.6,
    borderColor: '#B42318',
    borderRadius: 10,
    padding: 10,
  },
  underageAlertText: {
    fontSize: 12,
    fontFamily: typography.bodyBold,
    color: '#B42318',
    flex: 1,
    lineHeight: 16,
  },
});
