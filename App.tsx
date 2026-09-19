import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import { LAYOUT } from './src/theme/responsive';
import { env } from './src/lib/env';
import { DotGridBackground } from './src/components/DotGridBackground';
import { BrutalBox } from './src/components/BrutalBox';
import { PingLogoHeader } from './src/components/PingLogoHeader';
import { GoogleLogo } from './src/components/GoogleLogo';
import { SessionProvider, useSession } from './src/providers/SessionProvider';
import {
  DEV_ALEX,
  DEV_SAM,
  requestPasswordReset,
  resetDevSam,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  signUpWithEmail,
} from './src/services/auth';
import { AppHomeScreen } from './src/screens/AppHomeScreen';
import { AppLockGate } from './src/components/AppLockGate';
import { unregisterPush } from './src/services/push';
import { OnboardingAgeScreen } from './src/screens/OnboardingAgeScreen';
import { OnboardingNameScreen } from './src/screens/OnboardingNameScreen';
import { OnboardingIdentityScreen } from './src/screens/OnboardingIdentityScreen';
import { OnboardingPreferencesScreen } from './src/screens/OnboardingPreferencesScreen';
import { OnboardingPhotosScreen } from './src/screens/OnboardingPhotosScreen';
import { OnboardingBioScreen } from './src/screens/OnboardingBioScreen';
import { OnboardingTagsScreen } from './src/screens/OnboardingTagsScreen';
import { OnboardingLocationScreen } from './src/screens/OnboardingLocationScreen';
import type { UserAccount } from './src/types/user';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <AppShell />
        </SessionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function AppShell() {
  const [fontsLoaded] = useFonts({
    Anton_400Regular,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const { status, user, error: sessionError, setUser, retry } = useSession();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState<string>(env.enableDevLogins ? DEV_ALEX.email : '');
  const [password, setPassword] = useState<string>(env.enableDevLogins ? DEV_ALEX.password : '');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // The step shown while onboarding. null = resume from the step saved on the profile.
  const [stepOverride, setStepOverride] = useState<number | null>(null);
  const [replaying, setReplaying] = useState(false);

  // Reset local flow state whenever the session ends.
  useEffect(() => {
    if (status === 'signedOut') {
      setStepOverride(null);
      setReplaying(false);
    }
  }, [status]);

  /**
   * Dev quick fill (only rendered when env.enableDevLogins):
   * - ALEX: login route with the seeded account's credentials
   * - SAM: signup route; Sam is deleted first so signing up is always a brand-new account
   */
  const handleQuickFill = async (demo: 'alex' | 'sam') => {
    if (demo === 'alex') {
      setActiveTab('login');
      setEmail(DEV_ALEX.email);
      setPassword(DEV_ALEX.password);
      return;
    }
    await resetDevSam();
    setActiveTab('signup');
    setEmail(DEV_SAM.email);
    setPassword(DEV_SAM.password);
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const result = await signInWithGoogle();
      if (!result.ok) Alert.alert('Google Sign-In', result.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result =
        activeTab === 'login'
          ? await signInWithEmail(email, password)
          : await signUpWithEmail(email, password);
      if (!result.ok) {
        Alert.alert(activeTab === 'login' ? 'Login Failed' : 'Sign Up Failed', result.error);
      } else if (result.needsEmailConfirmation) {
        Alert.alert('Check your email', 'We sent you a confirmation link. Tap it, then log in.');
        setActiveTab('login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (env.enableDevLogins) {
      Alert.alert('Dev accounts', `Alex and Sam use the password: ${DEV_ALEX.password}`);
      return;
    }
    const result = await requestPasswordReset(email);
    Alert.alert(
      result.ok ? 'Check your email' : 'Reset password',
      result.ok ? 'If that address has an account, a reset link is on its way.' : result.error
    );
  };

  const handleLogout = async () => {
    await unregisterPush();
    await signOut();
    if (env.enableDevLogins) await handleQuickFill('alex');
  };

  if (!fontsLoaded || status === 'loading') {
    return (
      <View style={[styles.safeArea, styles.loadingCenter]}>
        <ActivityIndicator size="large" color={colors.primaryPink} />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={[styles.safeArea, styles.loadingCenter, styles.errorScreen]}>
        <Text style={styles.errorTitle}>Can&apos;t load your profile</Text>
        <Text style={styles.errorBody}>{sessionError}</Text>
        <BrutalBox
          backgroundColor={colors.accentYellow}
          borderRadius={16}
          onPress={retry}
          contentStyle={styles.errorButton}
        >
          <Text style={styles.errorButtonText}>TRY AGAIN</Text>
        </BrutalBox>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.forgotPasswordText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (user) {
    if (!user.hasCompletedOnboarding || replaying) {
      const step = stepOverride ?? user.onboardingStep;
      const advance = (to: number) => (updated: UserAccount) => {
        setUser(updated);
        setStepOverride(to);
      };

      switch (step) {
        case 1:
          return <OnboardingNameScreen user={user} onBack={handleLogout} onNext={advance(2)} />;
        case 2:
          return (
            <OnboardingAgeScreen user={user} onBack={() => setStepOverride(1)} onComplete={advance(3)} />
          );
        case 3:
          return (
            <OnboardingIdentityScreen
              user={user}
              onBack={() => setStepOverride(2)}
              onComplete={advance(4)}
            />
          );
        case 4:
          return (
            <OnboardingPreferencesScreen
              user={user}
              onBack={() => setStepOverride(3)}
              onNext={advance(5)}
            />
          );
        case 5:
          return (
            <OnboardingPhotosScreen user={user} onBack={() => setStepOverride(4)} onNext={advance(6)} />
          );
        case 6:
          return (
            <OnboardingBioScreen user={user} onBack={() => setStepOverride(5)} onNext={advance(7)} />
          );
        case 7:
          return (
            <OnboardingTagsScreen user={user} onBack={() => setStepOverride(6)} onNext={advance(8)} />
          );
        default:
          return (
            <OnboardingLocationScreen
              user={user}
              onBack={() => setStepOverride(7)}
              onComplete={(updated) => {
                setUser(updated);
                setReplaying(false);
                setStepOverride(null);
              }}
            />
          );
      }
    }

    return (
      <AppLockGate>
        <AppHomeScreen
          user={user}
          onLogout={handleLogout}
          onSwitchToDemo={
            env.enableDevLogins
              ? async (demo) => {
                  await unregisterPush();
                  await signOut();
                  await handleQuickFill(demo);
                }
              : undefined
          }
          onReplayOnboarding={
            env.enableDevLogins
              ? () => {
                  setStepOverride(1);
                  setReplaying(true);
                }
              : undefined
          }
        />
      </AppLockGate>
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
                      placeholder={'you@example.com'}
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
                  onPress={handleForgotPassword}
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

              {/* 7. Dev-only quick test fill (env.enableDevLogins) */}
              {env.enableDevLogins && (
                <View style={styles.quickFillWrapper}>
                  <View style={styles.quickFillDottedBox}>
                    <Text style={styles.quickFillLabel}>QUICK TEST FILL:</Text>
                  </View>

                  <BrutalBox
                    backgroundColor={colors.cardWhite}
                    borderColor={colors.borderBlack}
                    borderWidth={1.8}
                    borderRadius={999}
                    shadowOffset={{ x: 2, y: 2 }}
                    onPress={() => handleQuickFill('alex')}
                    contentStyle={[
                      styles.quickFillPill,
                      activeTab === 'login' && email.includes('alex') && styles.activeQuickPill,
                    ]}
                  >
                    <Ionicons name="flash" size={13} color="#E0A100" />
                    <Text style={styles.quickFillPillText}>ALEX</Text>
                  </BrutalBox>

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
                </View>
              )}

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
  errorScreen: {
    padding: 24,
    gap: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontFamily: typography.headline,
    color: colors.textDark,
    textAlign: 'center',
  },
  errorBody: {
    fontSize: 14,
    fontFamily: typography.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  errorButtonText: {
    fontSize: 16,
    fontFamily: typography.headline,
    color: colors.textDark,
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
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
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
