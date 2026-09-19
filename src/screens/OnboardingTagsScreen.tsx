import React, { useState, useMemo } from 'react';
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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { LAYOUT } from '../theme/responsive';
import { DotGridBackground } from '../components/DotGridBackground';
import { BrutalBox } from '../components/BrutalBox';
import { OnboardingTopHeader } from '../components/OnboardingTopHeader';
import { OnboardingBottomBar } from '../components/OnboardingBottomBar';
import { UserAccount, authDb } from '../services/authDb';

interface OnboardingTagsScreenProps {
  user: UserAccount;
  onBack: () => void;
  onNext: (updatedUser: UserAccount) => void;
}

type TagCategory = 'ALL' | 'LIFESTYLE' | 'MUSIC' | 'CREATIVE' | 'FOOD';

interface VibeTag {
  id: string;
  name: string;
  emoji: string;
  category: TagCategory;
  tint?: string;
}

const ALL_VIBE_TAGS: VibeTag[] = [
  { id: '1', emoji: '☕', name: 'Flat White Enthusiast', category: 'FOOD', tint: '#FFF' },
  { id: '2', emoji: '🧗', name: 'Bouldering 6B', category: 'LIFESTYLE', tint: '#FFF' },
  { id: '3', emoji: '📻', name: 'Analog Vinyl', category: 'MUSIC', tint: '#FFF' },
  { id: '4', emoji: '🥞', name: 'Matcha Mornings', category: 'FOOD', tint: '#FFF' },
  { id: '5', emoji: '🌮', name: 'Spicy Tacos & Curry', category: 'FOOD', tint: '#FFF4EB' },
  { id: '6', emoji: '🍣', name: 'Omakase Nights', category: 'FOOD', tint: '#EEF2FF' },
  { id: '7', emoji: '💬', name: '2 AM Conversations', category: 'LIFESTYLE', tint: '#FFF' },
  { id: '8', emoji: '🥐', name: 'Artisanal Bakery', category: 'FOOD', tint: '#FFF1EC' },
  { id: '9', emoji: '🏃', name: 'Sunrise Miles', category: 'LIFESTYLE', tint: '#FFF' },
  { id: '10', emoji: '🎹', name: 'Retro Synthwave', category: 'MUSIC', tint: '#F0F5FF' },
  { id: '11', emoji: '⚡', name: 'Underground Techno', category: 'MUSIC', tint: '#FFF' },
  { id: '12', emoji: '🎸', name: 'Indie Gigs & Fest', category: 'MUSIC', tint: '#FDF2F8' },
  { id: '13', emoji: '🎷', name: 'Late Night Jazz', category: 'MUSIC', tint: '#FFF' },
  { id: '14', emoji: '🏄', name: 'Dawn Patrol Surfing', category: 'LIFESTYLE', tint: '#ECFEFF' },
  { id: '15', emoji: '🚐', name: 'Unplanned Road Trips', category: 'LIFESTYLE', tint: '#F5F3FF' },
  { id: '16', emoji: '🛹', name: 'Street Skateboarding', category: 'LIFESTYLE', tint: '#FCE7F3' },
  { id: '17', emoji: '🏕️', name: 'Wild Mountain Camping', category: 'LIFESTYLE', tint: '#FFF' },
  { id: '18', emoji: '👾', name: '16-Bit Arcade & SNES', category: 'CREATIVE', tint: '#EEF2FF' },
  { id: '19', emoji: '📐', name: 'Modernist Design', category: 'CREATIVE', tint: '#FFF' },
  { id: '20', emoji: '📷', name: '35mm Film Photography', category: 'CREATIVE', tint: '#FFE4E6' },
  { id: '21', emoji: '⌨️', name: 'Custom Clicky Switches', category: 'CREATIVE', tint: '#F0FDFA' },
  { id: '22', emoji: '♟️', name: 'Strategy Board Games', category: 'CREATIVE', tint: '#F5F3FF' },
];

const CATEGORIES: TagCategory[] = ['ALL', 'LIFESTYLE', 'MUSIC', 'CREATIVE', 'FOOD'];

export const OnboardingTagsScreen: React.FC<OnboardingTagsScreenProps> = ({
  user,
  onBack,
  onNext,
}) => {
  // Pre-seed with the exact tags shown in ref/onBoarding6.png
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(['1', '2', '3']);
  const [activeCategory, setActiveCategory] = useState<TagCategory>('ALL');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const filteredTags = useMemo(() => {
    if (activeCategory === 'ALL') return ALL_VIBE_TAGS;
    return ALL_VIBE_TAGS.filter((tag) => tag.category === activeCategory);
  }, [activeCategory]);

  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
    } else {
      if (selectedTagIds.length >= 8) {
        Alert.alert('Max Tags Reached', 'You can pick up to 8 tags.');
        return;
      }
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const handleNext = async () => {
    setIsSaving(true);
    try {
      const selectedNames = ALL_VIBE_TAGS.filter((t) => selectedTagIds.includes(t.id)).map(
        (t) => t.name
      );
      const updated = await authDb.updateUserProfile(user.id, {
        // sync selected tags
      });
      onNext(updated || user);
    } catch {
      Alert.alert('Error', 'Unable to save tags.');
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
                  STEP 07 / 08 • VIBE TAGS
                </Text>
              </BrutalBox>
            </View>

            {/* 3. Headline & Subtitle */}
            <View style={styles.headlineWrapper}>
              <Text style={styles.headlineTitle}>WHAT ARE YOU INTO?</Text>
              <Text style={styles.subtitleText}>
                Pick up to 8 tags. These help us match your vibe.
              </Text>
            </View>

            {/* 4. Category Filter Buttons */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesRow}
            >
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <BrutalBox
                    key={cat}
                    backgroundColor={isActive ? colors.primaryPink : colors.cardWhite}
                    borderColor={colors.borderBlack}
                    borderWidth={2.2}
                    borderRadius={999}
                    shadowOffset={{ x: 2.5, y: 2.5 }}
                    onPress={() => setActiveCategory(cat)}
                    contentStyle={styles.categoryPillContent}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        isActive && styles.categoryPillTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </BrutalBox>
                );
              })}
            </ScrollView>

            {/* 5. Vibe Tags Cloud / Flow */}
            <View style={styles.tagsCloudContainer}>
              {filteredTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <View key={tag.id} style={styles.tagPillWrapper}>
                    <BrutalBox
                      backgroundColor={isSelected ? colors.accentYellow : tag.tint || '#FFFFFF'}
                      borderColor={colors.borderBlack}
                      borderWidth={2.2}
                      borderRadius={999}
                      shadowOffset={{ x: 2.8, y: 2.8 }}
                      onPress={() => handleToggleTag(tag.id)}
                      contentStyle={styles.tagPillContent}
                    >
                      <Text style={styles.tagEmoji}>{tag.emoji}</Text>
                      <Text style={styles.tagNameText}>{tag.name}</Text>
                      {isSelected && (
                        <Feather
                          name="check"
                          size={15}
                          color={colors.textDark}
                          style={styles.checkIcon}
                        />
                      )}
                    </BrutalBox>
                  </View>
                );
              })}
            </View>

            {/* 6. Tip Banner */}
            <BrutalBox
              backgroundColor={colors.lavender}
              borderColor={colors.borderBlack}
              borderWidth={2.4}
              borderRadius={18}
              shadowOffset={{ x: 3.5, y: 3.5 }}
              style={styles.fullWidth}
              contentStyle={styles.tipCardContent}
            >
              <View style={styles.tipBoltBadge}>
                <MaterialCommunityIcons name="lightning-bolt" size={17} color={colors.textDark} />
              </View>
              <Text style={styles.tipText}>
                Selected tags boost shared interest matching by 80%.
              </Text>
            </BrutalBox>
          </View>
        </View>
      </ScrollView>

      {/* 7. Pinned Bottom Action Buttons */}
      <View style={styles.bottomBarWrapper}>
        <OnboardingBottomBar
          onNext={handleNext}
          onSkip={() => handleNext()}
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
    width: '87.5%', // Step 7 of 8
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

  /* Categories Filter Row */
  categoriesRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  categoryPillContent: {
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  categoryPillText: {
    fontSize: 12,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },

  /* Tags Cloud */
  tagsCloudContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tagPillWrapper: {
    alignSelf: 'flex-start',
  },
  tagPillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  tagEmoji: {
    fontSize: 14,
  },
  tagNameText: {
    fontSize: 13,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
  },
  checkIcon: {
    marginLeft: 2,
  },

  /* Tip Banner */
  tipCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  tipBoltBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentYellow,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
    lineHeight: 17,
  },
});
