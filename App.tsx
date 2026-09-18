import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Anton_400Regular } from '@expo-google-fonts/anton';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

import { colors } from './src/theme/colors';
import { typography } from './src/theme/typography';
import { DotGridBackground } from './src/components/DotGridBackground';
import { BrutalBox } from './src/components/BrutalBox';
import { PingLogoHeader } from './src/components/PingLogoHeader';
import { GoogleLogo } from './src/components/GoogleLogo';
import { authDb, UserAccount, ALEX_DEMO_ACCOUNT, SAM_DEMO_ACCOUNT, GOOGLE_DEMO_ACCOUNT } from './src/services/authDb';
import { AppHomeScreen } from './src/screens/AppHomeScreen';
import { OnboardingAgeScreen } from './src/screens/OnboardingAgeScreen';
import { OnboardingNameScreen } from './src/screens/OnboardingNameScreen';
import { OnboardingIdentityScreen } from './src/screens/OnboardingIdentityScreen';
import { OnboardingPreferencesScreen } from './src/screens/OnboardingPreferencesScreen';
import { OnboardingPhotosScreen } from './src/screens/OnboardingPhotosScreen';
import { OnboardingBioScreen } from './src/screens/OnboardingBioScreen';
import { OnboardingTagsScreen } from './src/screens/OnboardingTagsScreen';
import { OnboardingLocationScreen } from './src/screens/OnboardingLocationScreen';

export default function App() {
  const [fontsLoaded] = useFonts({
    Anton_400Regular,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState<UserAccount | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState(ALEX_DEMO_ACCOUNT.email);
  const [password, setPassword] = useState(ALEX_DEMO_ACCOUNT.password);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(1);

  // Initialize DB and check active session
  useEffect(() => {
    async function init() {
      await authDb.initDb();
      const session = await authDb.getActiveSession();
      if (session) {
        setLoggedInUser(session);
      }
      setLoading(false);
    }
    init();
  }, []);

  /**
   * Development Quick Fill Handler:
   * - ALEX: switches to 'login' route, pre-fills Alex credentials, ensures Alex exists in DB
   * - SAM: switches to 'signup' route, pre-fills Sam credentials, purges Sam from DB so it's always a new account
   */
  const handleQuickFill = async (demo: 'alex' | 'sam' | 'google') => {
    if (demo === 'google') {
      setActiveTab('login');
      setEmail(GOOGLE_DEMO_ACCOUNT.email);
      setPassword('google_sso_verified');
      return;
    }

    await authDb.prepareDemoMode(demo);

    if (demo === 'alex') {
      setActiveTab('login');
      setEmail(ALEX_DEMO_ACCOUNT.email);
      setPassword(ALEX_DEMO_ACCOUNT.password);
    } else {
      setActiveTab('signup');
      setEmail(SAM_DEMO_ACCOUNT.email);
      setPassword(SAM_DEMO_ACCOUNT.password);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const result = await authDb.signInWithGoogle();
      if (result.success && result.user) {
        setLoggedInUser(result.user);
      } else {
        Alert.alert('Google Sign-In Failed', result.error || 'Could not sign in with Google.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter both your email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeTab === 'login') {
        const result = await authDb.logIn(email, password);
        if (result.success && result.user) {
          setLoggedInUser(result.user);
        } else {
          Alert.alert('Login Failed', result.error || 'Invalid credentials.');
        }
      } else {
        const result = await authDb.signUp(email, password);
        if (result.success && result.user) {
          setLoggedInUser(result.user);
        } else {
          Alert.alert('Sign Up Failed', result.error || 'Could not create account.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await authDb.logOut();
    setLoggedInUser(null);
    setOnboardingStep(1);
    // Reset to Alex on auth screen
    handleQuickFill('alex');
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={[styles.safeArea, styles.loadingCenter]}>
        <ActivityIndicator size="large" color={colors.primaryPink} />
      </View>
    );
  }

  // If user is authenticated
  if (loggedInUser) {
    // When user signups for the first time (or onboarding is incomplete), chain through Steps 1 to 7
    if (!loggedInUser.hasCompletedOnboarding) {
      if (onboardingStep === 1) {
        return (
          <OnboardingAgeScreen
            user={loggedInUser}
            onBack={handleLogout}
            onComplete={(updatedUser) => {
              setLoggedInUser(updatedUser);
              setOnboardingStep(2);
            }}
          />
        );
      }

      if (onboardingStep === 2) {
        return (
          <OnboardingNameScreen
            user={loggedInUser}
            onBack={() => setOnboardingStep(1)}
            onNext={(updatedUser) => {
              setLoggedInUser(updatedUser);
              setOnboardingStep(3);
            }}
          />
        );
      }

      if (onboardingStep === 3) {
        return (
          <OnboardingIdentityScreen
            user={loggedInUser}
            onBack={() => setOnboardingStep(2)}
            onComplete={(updatedUser) => {
              setLoggedInUser(updatedUser);
              setOnboardingStep(4);
            }}
          />
        );
      }

      if (onboardingStep === 4) {
        return (
          <OnboardingPreferencesScreen
            user={loggedInUser}
            onBack={() => setOnboardingStep(3)}
            onNext={(updatedUser) => {
              setLoggedInUser(updatedUser);
              setOnboardingStep(5);
            }}
          />
        );
      }

      if (onboardingStep === 5) {
        return (
          <OnboardingPhotosScreen
            user={loggedInUser}
            onBack={() => setOnboardingStep(4)}
            onNext={(updatedUser) => {
              setLoggedInUser(updatedUser);
              setOnboardingStep(6);
            }}
          />
        );
      }

      if (onboardingStep === 6) {
        return (
          <OnboardingBioScreen
            user={loggedInUser}
            onBack={() => setOnboardingStep(5)}
            onNext={(updatedUser) => {
              setLoggedInUser(updatedUser);
              setOnboardingStep(7);
            }}
          />
        );
      }

      if (onboardingStep === 7) {
        return (
          <OnboardingTagsScreen
            user={loggedInUser}
            onBack={() => setOnboardingStep(6)}
            onNext={(updatedUser) => {
              setLoggedInUser(updatedUser);
              setOnboardingStep(8);
            }}
          />
        );
      }

      if (onboardingStep === 8) {
        return (
          <OnboardingLocationScreen
            user={loggedInUser}
            onBack={() => setOnboardingStep(7)}
            onComplete={(updatedUser) => {
              setLoggedInUser(updatedUser);
            }}
          />
        );
      }
    }

    return (
      <AppHomeScreen
        user={loggedInUser}
        onLogout={handleLogout}
        onSwitchToDemo={async (demo) => {
          await handleLogout();
          await handleQuickFill(demo);
        }}
        onReplayOnboarding={() => {
          setOnboardingStep(1);
          setLoggedInUser({
            ...loggedInUser,
            hasCompletedOnboarding: false,
          });
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      {/* Halftone Dot Grid & Organic Header Backdrop */}
      <DotGridBackground />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* ── TOP SECTION: Header & Status Badges ── */}
            <View style={styles.topSection}>
              {/* 1. Header Branded P!NG Card */}
              <PingLogoHeader />

              {/* 2. Subheader Banner */}
              <BrutalBox
                backgroundColor={colors.primaryPink}
                borderColor={colors.borderBlack}
                borderWidth={2.4}
                borderRadius={999}
                shadowOffset={{ x: 2.5, y: 2.5 }}
                style={styles.bannerContainer}
                contentStyle={styles.bannerContent}
              >
                <Text style={styles.bannerText}>
                  NO BOTS. NO GHOSTS. JUST REAL P!NGS.
                </Text>
              </BrutalBox>

              {/* 3. Status Badge: "NO BOTS ALLOWED!" */}
              <BrutalBox
                backgroundColor={colors.cardWhite}
                borderColor={colors.borderBlack}
                borderWidth={2.2}
                borderRadius={999}
                shadowOffset={{ x: 2.5, y: 2.5 }}
                style={styles.noBotsContainer}
                contentStyle={styles.noBotsContent}
              >
                <View style={styles.redDot} />
                <Text style={styles.noBotsText}>NO BOTS ALLOWED!</Text>
              </BrutalBox>
            </View>

            {/* ── CENTER SECTION: Tab Switcher, Form Card, and Social Login ── */}
            <View style={styles.centerSection}>
              {/* 4. Tab Switcher: Log In / Sign Up */}
              <BrutalBox
                backgroundColor={colors.cardWhite}
                borderColor={colors.borderBlack}
                borderWidth={2.6}
                borderRadius={999}
                shadowOffset={{ x: 3, y: 3 }}
                style={styles.tabsWrapper}
                contentStyle={styles.tabsContent}
              >
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === 'login' && styles.activeTabButton,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setActiveTab('login')}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      activeTab === 'login' && styles.activeTabText,
                    ]}
                  >
                    Log In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === 'signup' && styles.activeTabButton,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setActiveTab('signup')}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      activeTab === 'signup' && styles.activeTabText,
                    ]}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </BrutalBox>

              {/* 5. Main Form Card */}
              <BrutalBox
                backgroundColor={colors.cardWhite}
                borderColor={colors.borderBlack}
                borderWidth={2.6}
                borderRadius={24}
                shadowOffset={{ x: 4, y: 4 }}
                style={styles.formCard}
                contentStyle={styles.formCardContent}
              >
                {/* Email Input Field with Floating Label */}
                <View style={styles.inputGroup}>
                  <View style={styles.floatingLabelContainer}>
                    <View style={styles.floatingLabel}>
                      <Text style={styles.floatingLabelText}>EMAIL</Text>
                    </View>
                  </View>
                  <View style={styles.inputBox}>
                    <Feather
                      name="mail"
                      size={18}
                      color="#444"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      onChangeText={setEmail}
                      placeholder={activeTab === 'login' ? 'alex@ping.app' : 'your@email.com'}
                      placeholderTextColor="#888"
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                {/* Password Input Field with Floating Label */}
                <View style={styles.inputGroup}>
                  <View style={styles.floatingLabelContainer}>
                    <View style={styles.floatingLabel}>
                      <Text style={styles.floatingLabelText}>PASSWORD</Text>
                    </View>
                  </View>
                  <View style={styles.inputBox}>
                    <Feather
                      name="lock"
                      size={18}
                      color="#444"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••••"
                      placeholderTextColor="#888"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIconButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#444"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Primary Action Button: "⚡ SEND P!NG" or "CREATE ACCOUNT" */}
                <BrutalBox
                  backgroundColor={colors.accentYellow}
                  borderColor={colors.borderBlack}
                  borderWidth={2.4}
                  borderRadius={18}
                  shadowOffset={{ x: 3, y: 3 }}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  contentStyle={styles.ctaButtonContent}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={colors.textDark} />
                  ) : (
                    <>
                      <Ionicons
                        name="flash"
                        size={18}
                        color={colors.textDark}
                        style={styles.ctaIcon}
                      />
                      <Text style={styles.ctaButtonText}>
                        {activeTab === 'login' ? 'SEND P!NG' : 'CREATE ACCOUNT'}
                      </Text>
                    </>
                  )}
                </BrutalBox>

                {/* Forgot Password Link */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    Alert.alert(
                      'Demo Account Password',
                      'All demo accounts (Alex & Sam) use the password: password123'
                    )
                  }
                  style={styles.forgotPasswordButton}
                >
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>

                {/* Neo-Brutalist "OR CONTINUE WITH" Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <View style={styles.dividerBadge}>
                    <Text style={styles.dividerBadgeText}>OR CONTINUE WITH</Text>
                  </View>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google SSO Button */}
                <BrutalBox
                  backgroundColor="#FFFFFF"
                  borderColor={colors.borderBlack}
                  borderWidth={2.4}
                  borderRadius={16}
                  shadowOffset={{ x: 3, y: 3 }}
                  onPress={handleGoogleSignIn}
                  disabled={isSubmitting}
                  contentStyle={styles.googleSsoContent}
                >
                  <View style={styles.googleIconBadge}>
                    <GoogleLogo size={20} />
                  </View>
                  <Text style={styles.googleSsoText}>
                    {activeTab === 'login' ? 'CONTINUE WITH GOOGLE' : 'SIGN UP WITH GOOGLE'}
                  </Text>
                </BrutalBox>
              </BrutalBox>
            </View>

            {/* ── BOTTOM SECTION: Retention, Test Fill & Trust Footnote ── */}
            <View style={styles.bottomSection}>
              {/* 6. Value Proposition Banner */}
              <BrutalBox
                backgroundColor={colors.lavender}
                borderColor={colors.borderBlack}
                borderWidth={2.4}
                borderRadius={999}
                shadowOffset={{ x: 3, y: 3 }}
                style={styles.valuePropContainer}
                contentStyle={styles.valuePropContent}
              >
                <View style={styles.starCircle}>
                  <Ionicons name="star" size={11} color="#FFFFFF" />
                </View>
                <Text style={styles.valuePropText}>
                  Seeing who liked you is{' '}
                </Text>
                <View style={styles.freeBadge}>
                  <Text style={styles.freeBadgeText}>100% FREE</Text>
                </View>
                <Text style={styles.valuePropText}> forever!</Text>
              </BrutalBox>

              {/* 7. Bottom Quick Test Fill Bar */}
              <View style={styles.quickFillWrapper}>
                <View style={styles.quickFillDottedBox}>
                  <Text style={styles.quickFillLabel}>QUICK TEST FILL:</Text>
                </View>

                {/* ALEX (Login Route) */}
                <BrutalBox
                  backgroundColor={colors.cardWhite}
                  borderColor={colors.borderBlack}
                  borderWidth={1.8}
                  borderRadius={999}
                  shadowOffset={{ x: 2, y: 2 }}
                  onPress={() => handleQuickFill('alex')}
                  contentStyle={[
                    styles.quickFillPill,
                    activeTab === 'login' && email.includes('alex') && !email.includes('google') && styles.activeQuickPill,
                  ]}
                >
                  <Ionicons name="flash" size={13} color="#E0A100" />
                  <Text style={styles.quickFillPillText}>ALEX</Text>
                </BrutalBox>

                {/* SAM (Sign Up Route - Always New Account) */}
                <BrutalBox
                  backgroundColor={colors.cardWhite}
                  borderColor={colors.borderBlack}
                  borderWidth={1.8}
                  borderRadius={999}
                  shadowOffset={{ x: 2, y: 2 }}
                  onPress={() => handleQuickFill('sam')}
                  contentStyle={[
                    styles.quickFillPill,
                    activeTab === 'signup' && email.includes('sam') && styles.activeQuickPill,
                  ]}
                >
                  <Ionicons name="heart" size={13} color={colors.primaryPink} />
                  <Text style={styles.quickFillPillText}>SAM</Text>
                </BrutalBox>

                {/* GOOGLE (One-Tap Google SSO Demo) */}
                <BrutalBox
                  backgroundColor={colors.cardWhite}
                  borderColor={colors.borderBlack}
                  borderWidth={1.8}
                  borderRadius={999}
                  shadowOffset={{ x: 2, y: 2 }}
                  onPress={handleGoogleSignIn}
                  contentStyle={[
                    styles.quickFillPill,
                    email.includes('google') && styles.activeQuickPill,
                  ]}
                >
                  <GoogleLogo size={13} />
                  <Text style={styles.quickFillPillText}>GOOGLE</Text>
                </BrutalBox>
              </View>

              {/* 8. Trust Footnote */}
              <Text style={styles.trustFootnote}>
                ★ 100% REAL VERIFIED PROFILES • NO BOTS • P!NG SAFELY ★
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgCream,
  },
  loadingCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 420,
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 16,
  },
  topSection: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  centerSection: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },

  /* Subheader Banner */
  bannerContainer: {
    width: '100%',
  },
  bannerContent: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  bannerText: {
    color: '#FFFFFF',
    fontFamily: typography.headline,
    fontSize: 14,
    letterSpacing: 0.8,
  },

  /* "NO BOTS ALLOWED!" Tag */
  noBotsContainer: {
    alignSelf: 'center',
  },
  noBotsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 5,
    gap: 7,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53935',
  },
  noBotsText: {
    color: colors.textDark,
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    letterSpacing: 0.5,
  },

  /* Segmented Tab Switcher */
  tabsWrapper: {
    width: '100%',
  },
  tabsContent: {
    flexDirection: 'row',
    padding: 3,
    height: 48,
  },
  tabButton: {
    flex: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: colors.primaryPink,
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
  },
  activeTabText: {
    color: '#FFFFFF',
  },

  /* Main Form Card */
  formCard: {
    width: '100%',
  },
  formCardContent: {
    padding: 22,
    paddingTop: 24,
    gap: 16,
  },

  /* Input Fields with Floating Yellow Badges */
  inputGroup: {
    position: 'relative',
    marginTop: 6,
  },
  floatingLabelContainer: {
    position: 'absolute',
    top: -12,
    left: 14,
    zIndex: 10,
  },
  floatingLabel: {
    backgroundColor: colors.accentYellow,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  floatingLabelText: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    height: 52,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontFamily: typography.bodySemiBold,
    color: colors.textDark,
  },
  eyeIconButton: {
    padding: 4,
  },

  /* Primary CTA Button */
  ctaButtonContent: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ctaIcon: {
    marginRight: 2,
  },
  ctaButtonText: {
    color: colors.textDark,
    fontSize: 20,
    fontFamily: typography.headline,
    letterSpacing: 0.8,
  },

  /* Forgot Password Link */
  forgotPasswordButton: {
    alignSelf: 'center',
    marginTop: -4,
  },
  forgotPasswordText: {
    fontSize: 12.5,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
    textDecorationLine: 'underline',
  },

  /* Neo-Brutalist "OR CONTINUE WITH" Divider */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.borderBlack,
  },
  dividerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: colors.bgCream,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    marginHorizontal: 8,
  },
  dividerBadgeText: {
    fontSize: 9.5,
    fontFamily: typography.bodyExtraBold,
    color: '#555555',
    letterSpacing: 0.6,
  },

  /* Google SSO Button */
  googleSsoContent: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  googleIconBadge: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleSsoText: {
    fontSize: 13.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },

  /* Retention Banner */
  valuePropContainer: {
    width: '100%',
  },
  valuePropContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    flexWrap: 'wrap',
  },
  starCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primaryPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  valuePropText: {
    fontSize: 12,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
  },
  freeBadge: {
    backgroundColor: colors.primaryPink,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  freeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontFamily: typography.bodyExtraBold,
  },

  /* Bottom Quick Test Fill Bar */
  quickFillWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 4,
  },
  quickFillDottedBox: {
    borderWidth: 1.4,
    borderStyle: 'dashed',
    borderColor: '#666666',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quickFillLabel: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: '#333333',
    letterSpacing: 0.4,
  },
  quickFillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 4,
  },
  activeQuickPill: {
    backgroundColor: '#FFF9D6',
  },
  quickFillPillText: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },

  /* Trust Footnote */
  trustFootnote: {
    fontSize: 9.5,
    fontFamily: typography.bodyBold,
    color: '#888888',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
