import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Svg, {
  Circle,
  Path,
  G,
  Line,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { LAYOUT } from '../theme/responsive';
import { DotGridBackground } from '../components/DotGridBackground';
import { BrutalBox } from '../components/BrutalBox';
import { OnboardingTopHeader } from '../components/OnboardingTopHeader';
import { OnboardingBottomBar } from '../components/OnboardingBottomBar';
import { UserAccount, authDb } from '../services/authDb';

interface OnboardingLocationScreenProps {
  user: UserAccount;
  onBack: () => void;
  onComplete: (updatedUser: UserAccount) => void;
}

// Radar Mascot SVG Illustration
function PopRadarIllustration() {
  return (
    <Svg width="100%" height={160} viewBox="0 0 340 160">
      <Defs>
        <LinearGradient id="mascotGrad" x1="20%" y1="0%" x2="80%" y2="100%">
          <Stop offset="0%" stopColor="#E51760" />
          <Stop offset="100%" stopColor="#9F1239" />
        </LinearGradient>
      </Defs>

      {/* Radar Guide Cross Lines */}
      <Line x1="30" y1="35" x2="170" y2="85" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <Line x1="310" y1="35" x2="170" y2="85" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <Line x1="30" y1="145" x2="170" y2="85" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <Line x1="310" y1="145" x2="170" y2="85" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

      {/* Outer Dashed Radar Circle */}
      <Circle
        cx="170"
        cy="90"
        r="54"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeDasharray="6, 6"
      />

      {/* Soft Mascot Shadow */}
      <Circle cx="172" cy="94" r="38" fill="#000000" opacity="0.2" />

      {/* Center Character Sphere */}
      <Circle
        cx="170"
        cy="90"
        r="36"
        fill="url(#mascotGrad)"
        stroke="#000000"
        strokeWidth="3.2"
      />

      {/* Big Anime Oval Eyes */}
      <G transform="translate(170, 90)">
        {/* Left Eye */}
        <Circle cx="-11" cy="-4" r="5" fill="#FFFFFF" stroke="#000" strokeWidth="1.8" />
        <Circle cx="-11" cy="-4" r="2.8" fill="#000000" />
        <Circle cx="-12" cy="-5.2" r="1.2" fill="#FFFFFF" />

        {/* Right Eye */}
        <Circle cx="11" cy="-4" r="5" fill="#FFFFFF" stroke="#000" strokeWidth="1.8" />
        <Circle cx="11" cy="-4" r="2.8" fill="#000000" />
        <Circle cx="10" cy="-5.2" r="1.2" fill="#FFFFFF" />

        {/* Rosy Blush Dashes */}
        <Line x1="-15" y1="5" x2="-8" y2="5" stroke="#FDE047" strokeWidth="2.2" strokeLinecap="round" />
        <Line x1="8" y1="5" x2="15" y2="5" stroke="#FDE047" strokeWidth="2.2" strokeLinecap="round" />

        {/* Cute Smile */}
        <Path d="M -3 3 Q 0 6 3 3" fill="none" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" />
      </G>

      {/* Star Sparkle (Top Right) */}
      <Path
        d="M 210 60 L 213 67 L 220 70 L 213 73 L 210 80 L 207 73 L 200 70 L 207 67 Z"
        fill="#FACC15"
        stroke="#000"
        strokeWidth="1.2"
      />

      {/* Small Pink Sparkle (Bottom Left) */}
      <Path
        d="M 134 116 L 136 121 L 141 123 L 136 125 L 134 130 L 132 125 L 127 123 L 132 121 Z"
        fill="#F472B6"
        stroke="#000"
        strokeWidth="1"
      />
    </Svg>
  );
}

export const OnboardingLocationScreen: React.FC<OnboardingLocationScreenProps> = ({
  user,
  onBack,
  onComplete,
}) => {
  const [locationAllowed, setLocationAllowed] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleAllowLocation = () => {
    setLocationAllowed(true);
    Alert.alert('Location Enabled', 'Distance will be shown in rough buckets. Your exact coordinates are never shared.');
  };

  const handlePickCity = () => {
    Alert.alert(
      'Pick Your City',
      'Select your metropolitan area:',
      [
        { text: 'San Francisco, CA', onPress: () => setSelectedCity('San Francisco') },
        { text: 'New York, NY', onPress: () => setSelectedCity('New York') },
        { text: 'London, UK', onPress: () => setSelectedCity('London') },
        { text: 'Tokyo, JP', onPress: () => setSelectedCity('Tokyo') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      const updated = await authDb.completeOnboarding(user.id);
      onComplete(updated || user);
    } catch {
      Alert.alert('Error', 'Unable to complete setup.');
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
                <MaterialCommunityIcons name="lightning-bolt" size={15} color={colors.textDark} />
                <Text style={styles.stepBadgeText}>
                  STEP 08 / 08 • THE FINAL STEP
                </Text>
              </BrutalBox>
            </View>

            {/* 3. Headline & Subtitle */}
            <View style={styles.headlineWrapper}>
              <Text style={styles.headlineTitle}>WHERE SHOULD WE LOOK?</Text>
              <Text style={styles.subtitleText}>
                We only ever show others a rough distance, never your exact location.
              </Text>
            </View>

            {/* 4. Radar Map Graphic Card */}
            <View style={styles.radarCardWrapper}>
              <BrutalBox
                backgroundColor={colors.lavender}
                borderColor={colors.borderBlack}
                borderWidth={2.6}
                borderRadius={20}
                shadowOffset={{ x: 3.5, y: 3.5 }}
                overflow="visible"
                style={styles.fullWidth}
                contentStyle={styles.radarCardContent}
              >
                {/* Top Right "POP RADAR" Angled Badge */}
                <View style={styles.popRadarBadgeWrapper}>
                  <View style={styles.popRadarBadge}>
                    <MaterialCommunityIcons name="lightning-bolt" size={13} color="#FFE600" />
                    <Text style={styles.popRadarText}>POP RADAR</Text>
                  </View>
                </View>

                {/* Floating "YOU ARE HERE" Pill */}
                <View style={styles.youAreHerePill}>
                  <View style={styles.redDot} />
                  <Text style={styles.youAreHereText}>
                    {selectedCity ? selectedCity.toUpperCase() : 'YOU ARE HERE'}
                  </Text>
                </View>

                {/* Vector Radar Illustration with Center Mascot */}
                <PopRadarIllustration />
              </BrutalBox>
            </View>

            {/* 5. "YOUR PRIVACY FIRST" Card */}
            <View style={styles.privacyCardOuterWrapper}>
              <BrutalBox
                backgroundColor={colors.cardWhite}
                borderColor={colors.borderBlack}
                borderWidth={2.6}
                borderRadius={20}
                shadowOffset={{ x: 3.5, y: 3.5 }}
                overflow="visible"
                style={styles.fullWidth}
                contentStyle={styles.privacyCardContent}
              >
                {/* Floating Yellow Privacy Badge */}
                <View style={styles.privacyBadgeWrapper}>
                  <View style={styles.privacyBadge}>
                    <Text style={styles.privacyBadgeText}>YOUR PRIVACY FIRST</Text>
                  </View>
                </View>

                {/* Row 1: Distance In Buckets */}
                <View style={styles.privacyRow}>
                  <View style={[styles.privacyIconBox, { backgroundColor: colors.accentYellow }]}>
                    <MaterialCommunityIcons name="ruler" size={18} color={colors.textDark} />
                  </View>
                  <View style={styles.privacyRowTextCol}>
                    <Text style={styles.privacyRowTitle}>DISTANCE IN BUCKETS</Text>
                    <Text style={styles.privacyRowDesc}>
                      Under 5 km, never an exact street or precise street address.
                    </Text>
                  </View>
                </View>

                {/* Hairline Divider */}
                <View style={styles.rowDivider} />

                {/* Row 2: Never Shared */}
                <View style={styles.privacyRow}>
                  <View style={[styles.privacyIconBox, { backgroundColor: '#FFD8E4' }]}>
                    <Feather name="lock" size={17} color="#E51760" />
                  </View>
                  <View style={styles.privacyRowTextCol}>
                    <Text style={styles.privacyRowTitle}>NEVER SHARED</Text>
                    <Text style={styles.privacyRowDesc}>
                      No one ever sees your GPS coordinates or live location trail.
                    </Text>
                  </View>
                </View>

                {/* Hairline Divider */}
                <View style={styles.rowDivider} />

                {/* Row 3: Change Anytime */}
                <View style={styles.privacyRow}>
                  <View style={[styles.privacyIconBox, { backgroundColor: colors.lavender }]}>
                    <Ionicons name="sync" size={18} color="#4338CA" />
                  </View>
                  <View style={styles.privacyRowTextCol}>
                    <Text style={styles.privacyRowTitle}>CHANGE ANYTIME</Text>
                    <Text style={styles.privacyRowDesc}>
                      Switch your neighborhood or pause discovery whenever you want.
                    </Text>
                  </View>
                </View>
              </BrutalBox>
            </View>

            {/* 6. Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              {/* Primary "⚡ ALLOW LOCATION" Button */}
              <BrutalBox
                backgroundColor={locationAllowed ? '#86EFAC' : colors.accentYellow}
                borderColor={colors.borderBlack}
                borderWidth={2.4}
                borderRadius={18}
                shadowOffset={{ x: 3, y: 3 }}
                onPress={handleAllowLocation}
                style={styles.fullWidth}
                contentStyle={styles.allowLocationContent}
              >
                <MaterialCommunityIcons
                  name={locationAllowed ? 'check-bold' : 'lightning-bolt'}
                  size={20}
                  color={colors.textDark}
                />
                <Text style={styles.allowLocationText}>
                  {locationAllowed ? 'LOCATION ENABLED' : 'ALLOW LOCATION'}
                </Text>
              </BrutalBox>

              {/* Secondary "🏙️ PICK MY CITY INSTEAD" Button */}
              <BrutalBox
                backgroundColor={colors.cardWhite}
                borderColor={colors.borderBlack}
                borderWidth={2.2}
                borderRadius={18}
                shadowOffset={{ x: 2.8, y: 2.8 }}
                onPress={handlePickCity}
                style={styles.fullWidth}
                contentStyle={styles.pickCityContent}
              >
                <MaterialCommunityIcons name="city-variant" size={18} color="#4B5563" />
                <Text style={styles.pickCityText}>
                  {selectedCity ? `CITY: ${selectedCity}` : 'PICK MY CITY INSTEAD'}
                </Text>
              </BrutalBox>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 7. Pinned Bottom Action Buttons */}
      <View style={styles.bottomBarWrapper}>
        <OnboardingBottomBar
          onNext={handleFinish}
          onSkip={() => handleFinish()}
          nextText={isSaving ? 'LAUNCHING...' : 'ENTER P!NG ➔'}
          isSaving={isSaving}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgCream,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButtonContent: {
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
    width: '100%', // Step 8 of 8
    height: '100%',
    backgroundColor: colors.primaryPink,
    borderRadius: 999,
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
    gap: 20,
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
    gap: 18,
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
  headlineTitle: {
    fontSize: 34,
    color: colors.textDark,
    fontFamily: typography.headline,
    letterSpacing: 0.5,
    lineHeight: 38,
    paddingTop: 1,
  },
  subtitleText: {
    fontSize: 13,
    fontFamily: typography.bodyMedium,
    color: '#333',
    lineHeight: 18,
  },

  /* Radar Card */
  radarCardWrapper: {
    width: '100%',
    marginTop: 2,
  },
  radarCardContent: {
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  popRadarBadgeWrapper: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    transform: [{ rotate: '4deg' }],
  },
  popRadarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryPink,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 2,
  },
  popRadarText: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  youAreHerePill: {
    position: 'absolute',
    top: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    gap: 6,
    zIndex: 10,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  youAreHereText: {
    fontSize: 10.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },

  /* Privacy Card */
  privacyCardOuterWrapper: {
    width: '100%',
    marginTop: 10,
  },
  privacyCardContent: {
    padding: 16,
    paddingTop: 22,
    position: 'relative',
    overflow: 'visible',
    gap: 12,
  },
  privacyBadgeWrapper: {
    position: 'absolute',
    top: -12,
    left: 14,
    zIndex: 10,
  },
  privacyBadge: {
    backgroundColor: colors.accentYellow,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  privacyBadgeText: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  privacyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyRowTextCol: {
    flex: 1,
    gap: 2,
  },
  privacyRowTitle: {
    fontSize: 13,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.3,
  },
  privacyRowDesc: {
    fontSize: 12,
    fontFamily: typography.bodyMedium,
    color: '#4B5563',
    lineHeight: 16,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    width: '100%',
  },

  /* Action Buttons */
  actionButtonsContainer: {
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  allowLocationContent: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  allowLocationText: {
    fontSize: 18,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.6,
  },
  pickCityContent: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pickCityText: {
    fontSize: 13,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },
});
