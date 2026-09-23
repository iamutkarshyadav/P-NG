import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { LAYOUT } from '../theme/responsive';
import { DotGridBackground } from '../components/DotGridBackground';
import { BrutalBox } from '../components/BrutalBox';
import { OnboardingTopHeader } from '../components/OnboardingTopHeader';
import { OnboardingBottomBar } from '../components/OnboardingBottomBar';
import { OnboardingHeadline } from '../components/OnboardingHeadline';
import { UserAccount } from '../types/user';
import { useQuery } from '@tanstack/react-query';
import { fetchAllTags, fetchMyTagIds, saveMyTags } from '../services/tags';
import { updateProfile } from '../services/profile';
import { errorMessage } from '../services/errors';

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

const CATEGORIES: TagCategory[] = ['ALL', 'LIFESTYLE', 'MUSIC', 'CREATIVE', 'FOOD'];

export const OnboardingTagsScreen: React.FC<OnboardingTagsScreenProps> = ({
  user,
  onBack,
  onNext,
}) => {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const tagsQuery = useQuery({ queryKey: ['tags'], queryFn: fetchAllTags, staleTime: 10 * 60_000 });
  const myTagsQuery = useQuery({
    queryKey: ['my-tags', user.id],
    queryFn: () => fetchMyTagIds(user.id),
    staleTime: 0,
  });

  // Resume: start from the tags already saved for this user.
  useEffect(() => {
    if (myTagsQuery.data) setSelectedTagIds(myTagsQuery.data.map(String));
  }, [myTagsQuery.data]);

  const allTags: VibeTag[] = useMemo(
    () =>
      (tagsQuery.data ?? []).map((t) => ({
        id: String(t.id),
        name: t.name,
        emoji: t.emoji,
        category: t.category.toUpperCase() as TagCategory,
        tint: t.tint,
      })),
    [tagsQuery.data]
  );
  const [activeCategory, setActiveCategory] = useState<TagCategory>('ALL');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const filteredTags = useMemo(() => {
    if (activeCategory === 'ALL') return allTags;
    return allTags.filter((tag) => tag.category === activeCategory);
  }, [activeCategory, allTags]);

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
    if (selectedTagIds.length < 1) {
      Alert.alert('Pick a tag', 'Choose at least 1 vibe tag to showcase your vibe.');
      return;
    }
    setIsSaving(true);
    try {
      await saveMyTags(selectedTagIds.map(Number));
      onNext(await updateProfile(user, { onboarding_step: 8 }));
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
      <OnboardingTopHeader onBack={onBack} onPrevStep={onBack} user={user} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.contentSection}>
            {/* 2. Unified Headline with 5px Black Underline */}
            <OnboardingHeadline
              step="07"
              line1="PICK YOUR"
              focalWord="TOP PASSIONS"
              subtitle="Pick up to 8 tags that define what you&apos;re all about."
            />

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

            {/* 6. Guidance Box */}
            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2.4}
              borderRadius={16}
              shadowOffset={{ x: 3.5, y: 3.5 }}
              style={styles.fullWidth}
              contentStyle={styles.tipCardContent}
            >
              <Text style={styles.tipText}>
                Your selected tags appear on your profile card to highlight shared interests.
              </Text>
            </BrutalBox>
          </View>
        </View>
      </ScrollView>

      {/* 7. Pinned Bottom Action Buttons */}
      <View style={styles.bottomBarWrapper}>
        <OnboardingBottomBar
          onNext={handleNext}
          onBack={onBack}
          showSkip={false}
          disabled={selectedTagIds.length < 1}
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
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  tipText: {
    fontSize: 12,
    fontFamily: typography.bodyBold,
    color: '#4B5563',
    lineHeight: 17,
  },
});
