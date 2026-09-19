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

export interface PreferenceFilters {
  selectedGenders: string[];
  selectedIntention: string;
  minAge: number;
  maxAge: number;
  maxDistance: number;
  strictDistance: boolean;
}

interface PreferencesScreenProps {
  user?: UserAccount;
  onBack: () => void;
  onPreviewProfile?: () => void;
  onApplyFilters?: (filters: PreferenceFilters) => void;
}

export const PreferencesScreen: React.FC<PreferencesScreenProps> = ({
  onBack,
  onApplyFilters,
}) => {
  // Gender preference selection (multi-select)
  const [selectedGenders, setSelectedGenders] = useState<string[]>(['Women']);
  // Dating intention selection (single or multi)
  const [selectedIntention, setSelectedIntention] = useState<string>('Long-term');
  // Age range
  const [minAge] = useState(23);
  const [maxAge] = useState(33);
  // Distance
  const [maxDistance] = useState(25);
  // Strict distance boundary
  const [strictDistance, setStrictDistance] = useState(true);
  // Vibes list
  const [vibes, setVibes] = useState<Array<{ id: string; label: string; icon: string; bg: string }>>([
    { id: '1', label: 'Flat White Enthusiast', icon: '☕', bg: '#FFD5E5' },
    { id: '2', label: 'Analog Vinyl', icon: '📻', bg: '#FFE600' },
    { id: '3', label: 'Bouldering', icon: '🧗', bg: '#E2DCFE' },
  ]);

  const toggleGender = (gender: string) => {
    if (gender === 'Everyone') {
      setSelectedGenders(['Everyone']);
      return;
    }
    let updated = selectedGenders.filter((g) => g !== 'Everyone');
    if (updated.includes(gender)) {
      if (updated.length > 1) {
        updated = updated.filter((g) => g !== gender);
      }
    } else {
      updated.push(gender);
    }
    setSelectedGenders(updated);
  };

  const handleRemoveVibe = (id: string) => {
    setVibes(vibes.filter((v) => v.id !== id));
  };

  const handleAddVibe = () => {
    const suggestions = [
      { label: 'Modular Synths', icon: '🎹', bg: '#FEF08A' },
      { label: '35mm Film', icon: '📷', bg: '#FED7AA' },
      { label: 'Omakase Nights', icon: '🍣', bg: '#FECDD3' },
      { label: 'Bauhaus Design', icon: '📐', bg: '#E0E7FF' },
    ];
    const unadded = suggestions.filter((s) => !vibes.some((v) => v.label === s.label));
    if (unadded.length > 0) {
      const next = unadded[0];
      setVibes([...vibes, { id: String(Date.now()), ...next }]);
    } else {
      Alert.alert('All Vibes Added', 'You have already added popular curated vibes.');
    }
  };

  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters({
        selectedGenders,
        selectedIntention,
        minAge,
        maxAge,
        maxDistance,
        strictDistance,
      });
    }
    Alert.alert('⚡ Filters Applied', 'Your swipe feed has been re-indexed.', [
      { text: 'OK', onPress: onBack },
    ]);
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
            <Text style={styles.screenHeading}>DISCOVERY PREFERENCES</Text>
            <Text style={styles.screenSubheading}>Configure your discovery radar, age criteria & matching algorithm</Text>
          </View>

          {/* CARD 1: WHO YOU WANT TO MEET (TARGET RADAR) */}
          <View style={styles.cardWrapper}>
            <View style={styles.floatingBadgePink}>
              <Text style={styles.floatingBadgeText}>TARGET RADAR</Text>
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
              {/* Header inside card */}
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardBigTitle}>WHO YOU WANT TO MEET</Text>
                <Ionicons name="heart-outline" size={24} color={colors.primaryPink} />
              </View>

              {/* Subheading 1: Gender */}
              <View style={styles.subHeadingRow}>
                <Text style={styles.subHeadingTitle}>GENDER PREFERENCE</Text>
                <Text style={styles.subHeadingHint}>Select Multiple</Text>
              </View>

              <View style={styles.chipsRow}>
                {['Women', 'Men', 'Non-Binary', 'Everyone'].map((gender) => {
                  const isSelected = selectedGenders.includes(gender);
                  return (
                    <TouchableOpacity
                      key={gender}
                      activeOpacity={0.75}
                      onPress={() => toggleGender(gender)}
                      style={[
                        styles.chipBtn,
                        isSelected && styles.genderChipSelected,
                      ]}
                    >
                      {isSelected && <Ionicons name="checkmark" size={15} color="#000" style={{ marginRight: 4 }} />}
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {gender}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Subheading 2: Dating Intention */}
              <View style={[styles.subHeadingRow, { marginTop: 22 }]}>
                <Text style={styles.subHeadingTitle}>DATING INTENTION</Text>
                <Text style={styles.priorityLockText}>PRIORITY LOCK</Text>
              </View>

              <View style={styles.chipsRow}>
                {[
                  { key: 'Long-term', label: 'Long-term', icon: 'flame' },
                  { key: 'Casual / Fun', label: 'Casual / Fun', icon: null },
                  { key: 'New Friends', label: 'New Friends', icon: null },
                  { key: 'Open to Options', label: 'Open to Options', icon: null },
                ].map((item) => {
                  const isSelected = selectedIntention === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      activeOpacity={0.75}
                      onPress={() => setSelectedIntention(item.key)}
                      style={[
                        styles.chipBtn,
                        isSelected && styles.intentChipSelected,
                      ]}
                    >
                      {item.icon && isSelected && (
                        <Ionicons name={item.icon as any} size={15} color="#FFF" style={{ marginRight: 4 }} />
                      )}
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.intentTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </BrutalBox>
          </View>

          {/* CARD 2: DISCOVERY RADIUS & AGE */}
          <View style={styles.cardWrapper}>
            <View style={styles.floatingBadgeYellow}>
              <Text style={styles.floatingBadgeText}>DISCOVERY RADIUS & AGE</Text>
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
              {/* Age Range Row */}
              <View style={styles.sliderHeaderRow}>
                <Text style={styles.sliderTitle}>AGE RANGE</Text>
                <View style={styles.pinkPill}>
                  <Text style={styles.pinkPillText}>
                    {minAge} – {maxAge} Yrs Old
                  </Text>
                </View>
              </View>

              {/* Dual Range Track Visualization */}
              <View style={styles.sliderTrackContainer}>
                <View style={styles.trackBackground}>
                  {/* Pink active range highlight */}
                  <View style={[styles.trackActiveSegmentPink, { left: '16%', width: '38%' }]} />
                  {/* Left Thumb */}
                  <View style={[styles.thumbCircle, { left: '16%' }]}>
                    <View style={styles.innerDot} />
                  </View>
                  {/* Right Thumb */}
                  <View style={[styles.thumbCircle, { left: '54%' }]}>
                    <View style={styles.innerDot} />
                  </View>
                </View>
                <View style={styles.scaleRow}>
                  <Text style={styles.scaleText}>18</Text>
                  <Text style={styles.scaleText}>25</Text>
                  <Text style={styles.scaleText}>35</Text>
                  <Text style={styles.scaleText}>45</Text>
                  <Text style={styles.scaleText}>55+</Text>
                </View>
              </View>

              {/* Max Distance Row */}
              <View style={[styles.sliderHeaderRow, { marginTop: 24 }]}>
                <Text style={styles.sliderTitle}>MAX DISTANCE</Text>
                <View style={styles.yellowPill}>
                  <Feather name="navigation" size={13} color="#000" style={{ marginRight: 4 }} />
                  <Text style={styles.yellowPillText}>Up to {maxDistance} km</Text>
                </View>
              </View>

              {/* Distance Track Visualization */}
              <View style={styles.sliderTrackContainer}>
                <View style={styles.trackBackground}>
                  {/* Yellow active segment */}
                  <View style={[styles.trackActiveSegmentYellow, { width: '48%' }]} />
                  {/* Distance Thumb */}
                  <View style={[styles.thumbCircle, { left: '48%' }]}>
                    <View style={styles.innerDotYellow} />
                  </View>
                </View>
                <View style={styles.scaleRow}>
                  <Text style={styles.scaleText}>1 km</Text>
                  <Text style={styles.scaleText}>15 km</Text>
                  <Text style={styles.scaleText}>50 km</Text>
                  <Text style={styles.scaleText}>100 km (State)</Text>
                </View>
              </View>

              {/* Strict Distance Boundary Row */}
              <View style={styles.strictBoundaryRow}>
                <View style={styles.strictBoundaryTextCol}>
                  <Text style={styles.strictTitle}>Strict Distance Boundary</Text>
                  <Text style={styles.strictSub}>
                    Only show candidates strictly within range
                  </Text>
                </View>

                {/* Custom Brutal Toggle */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setStrictDistance(!strictDistance)}
                  style={[
                    styles.brutalToggle,
                    strictDistance ? styles.brutalToggleOn : styles.brutalToggleOff,
                  ]}
                >
                  <View
                    style={[
                      styles.toggleKnob,
                      strictDistance ? styles.toggleKnobOn : styles.toggleKnobOff,
                    ]}
                  >
                    {strictDistance ? (
                      <Ionicons name="flash" size={12} color="#000" />
                    ) : null}
                  </View>
                </TouchableOpacity>
              </View>
            </BrutalBox>
          </View>

          {/* CARD 3: MUST-HAVE VIBES */}
          <BrutalBox
            backgroundColor="#FFFFFF"
            borderColor={colors.borderBlack}
            borderWidth={2.8}
            borderRadius={20}
            shadowOffset={{ x: 4, y: 4 }}
            style={styles.fullWidth}
            contentStyle={styles.cardContent}
          >
            <View style={styles.vibesHeaderRow}>
              <View>
                <Text style={styles.vibesTitle}>MUST-HAVE VIBES</Text>
                <Text style={styles.vibesSub}>MATCHES REQUIRE AT LEAST 2 MUTUAL SPARKS</Text>
              </View>
              <View style={styles.symbolBadge}>
                <Ionicons name="shapes" size={16} color="#000" />
              </View>
            </View>

            {/* Vibes Chips */}
            <View style={styles.vibesChipsWrap}>
              {vibes.map((vibe) => (
                <View
                  key={vibe.id}
                  style={[styles.vibeChip, { backgroundColor: vibe.bg }]}
                >
                  <Text style={styles.vibeIcon}>{vibe.icon}</Text>
                  <Text style={styles.vibeLabel}>{vibe.label}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveVibe(vibe.id)}
                    style={styles.removeVibeBtn}
                  >
                    <Ionicons name="close" size={14} color="#000" />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                onPress={handleAddVibe}
                style={styles.addVibeBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.addVibeText}>+ Add Vibe...</Text>
              </TouchableOpacity>
            </View>

            {/* Sparkle callout box */}
            <View style={styles.sparkleCallout}>
              <MaterialCommunityIcons
                name="creation"
                size={22}
                color={colors.primaryPink}
                style={{ marginRight: 10 }}
              />
              <Text style={styles.sparkleCalloutText}>
                Profiles with 3+ overlapping passions receive instant priority highlight in your deck.
              </Text>
            </View>
          </BrutalBox>

          {/* 5. APPLY FILTERS CTA */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleApply}
            style={styles.applyBtnWrapper}
          >
            <BrutalBox
              backgroundColor={colors.accentYellow}
              borderColor={colors.borderBlack}
              borderWidth={2.8}
              borderRadius={18}
              shadowOffset={{ x: 4, y: 4 }}
              style={styles.fullWidth}
              contentStyle={styles.applyBtnContent}
            >
              <Text style={styles.applyBtnText}>APPLY FILTERS ⚡</Text>
            </BrutalBox>
          </TouchableOpacity>

          <Text style={styles.applySubtext}>
            CHANGES UPDATE YOUR SWIPE FEED INSTANTLY
          </Text>
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
  /* Card Wrappers & Badges */
  cardWrapper: {
    position: 'relative',
    marginTop: 10,
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
  floatingBadgeText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 10.5,
    color: '#000',
    letterSpacing: 0.5,
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
    fontFamily: typography.headline,
    fontSize: 20,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  subHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  subHeadingTitle: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 11,
    color: '#4B5563',
    letterSpacing: 0.5,
  },
  subHeadingHint: {
    fontFamily: typography.bodyBold,
    fontSize: 11,
    color: '#6B7280',
  },
  priorityLockText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 10.5,
    color: colors.primaryPink,
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2.5, height: 2.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  chipText: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    color: colors.textDark,
  },
  genderChipSelected: {
    backgroundColor: colors.accentYellow,
  },
  chipTextSelected: {
    fontFamily: typography.bodyBold,
    color: '#000',
  },
  intentChipSelected: {
    backgroundColor: colors.primaryPink,
  },
  intentTextSelected: {
    fontFamily: typography.bodyBold,
    color: '#FFFFFF',
  },
  /* Sliders & Visual Controls */
  sliderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sliderTitle: {
    fontFamily: typography.headline,
    fontSize: 18,
    color: colors.textDark,
  },
  pinkPill: {
    backgroundColor: '#FCE7F3',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  pinkPillText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 11.5,
    color: '#000',
  },
  yellowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentYellow,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  yellowPillText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 11.5,
    color: '#000',
  },
  sliderTrackContainer: {
    width: '100%',
    paddingVertical: 6,
  },
  trackBackground: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    position: 'relative',
    justifyContent: 'center',
  },
  trackActiveSegmentPink: {
    position: 'absolute',
    height: '100%',
    backgroundColor: colors.primaryPink,
    borderRadius: 4,
  },
  trackActiveSegmentYellow: {
    position: 'absolute',
    left: 0,
    height: '100%',
    backgroundColor: colors.accentYellow,
    borderRadius: 4,
  },
  thumbCircle: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -13 }],
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
  },
  innerDotYellow: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentYellow,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  scaleText: {
    fontFamily: typography.fonts.bold,
    fontSize: 11,
    color: '#6B7280',
  },
  /* Strict Boundary */
  strictBoundaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1.5,
    borderTopColor: '#F3F4F6',
  },
  strictBoundaryTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  strictTitle: {
    fontFamily: typography.bodyBold,
    fontSize: 14.5,
    color: colors.textDark,
  },
  strictSub: {
    fontFamily: typography.fonts.medium,
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
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
  /* Must-Have Vibes */
  vibesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  vibesTitle: {
    fontFamily: typography.headline,
    fontSize: 20,
    color: colors.textDark,
  },
  vibesSub: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 10.5,
    color: '#6B7280',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  symbolBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentYellow,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  vibesChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  vibeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingLeft: 10,
    paddingRight: 8,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 2.5, height: 2.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    gap: 6,
  },
  vibeIcon: {
    fontSize: 14,
  },
  vibeLabel: {
    fontFamily: typography.fonts.bold,
    fontSize: 13,
    color: colors.textDark,
  },
  removeVibeBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  addVibeBtn: {
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 2.5, height: 2.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    justifyContent: 'center',
  },
  addVibeText: {
    fontFamily: typography.fonts.bold,
    fontSize: 13,
    color: colors.textDark,
  },
  sparkleCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 12,
  },
  sparkleCalloutText: {
    flex: 1,
    fontFamily: typography.fonts.medium,
    fontSize: 11,
    color: '#374151',
    lineHeight: 16,
  },
  /* Apply Button */
  applyBtnWrapper: {
    marginTop: 8,
  },
  applyBtnContent: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontFamily: typography.fonts.black,
    fontSize: 20,
    color: '#000',
    letterSpacing: 0.8,
  },
  applySubtext: {
    fontFamily: typography.bodyMedium,
    fontSize: 11.5,
    color: '#6B7280',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginTop: 4,
  },
});
