import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { BrutalBox } from '../BrutalBox';
import { useQuery } from '@tanstack/react-query';
import { fetchAllTags, VibeTag } from '../../services/tags';

interface DatingProfileTagsShowcaseProps {
  tags: (string | VibeTag)[];
}

interface EnrichedTag {
  id: string | number;
  name: string;
  emoji: string;
  category: 'lifestyle' | 'music' | 'creative' | 'food';
  tint: string;
}

const CATEGORY_THEMES = {
  music: {
    label: 'MUSIC & BEATS',
    bg: '#EDE9FE',
    border: '#000000',
    icon: 'musical-notes',
    badgeBg: '#DDD6FE',
  },
  food: {
    label: 'FOOD & TASTE',
    bg: '#FEF08A',
    border: '#000000',
    icon: 'restaurant',
    badgeBg: '#FDE047',
  },
  lifestyle: {
    label: 'LIFESTYLE & VIBE',
    bg: '#CCFBF1',
    border: '#000000',
    icon: 'flash',
    badgeBg: '#99F6E4',
  },
  creative: {
    label: 'CREATIVE & MIND',
    bg: '#FFE4E6',
    border: '#000000',
    icon: 'color-palette',
    badgeBg: '#FECDD3',
  },
} as const;

export const DatingProfileTagsShowcase: React.FC<DatingProfileTagsShowcaseProps> = ({ tags }) => {
  const allTagsQuery = useQuery({ queryKey: ['tags'], queryFn: fetchAllTags, staleTime: 10 * 60_000 });
  const allTags = allTagsQuery.data ?? [];

  // Normalize tags into EnrichedTag objects
  const enrichedTags: EnrichedTag[] = useMemo(() => {
    if (!tags || tags.length === 0) return [];
    return tags.map((t, idx) => {
      if (typeof t === 'object' && t !== null && 'name' in t) {
        return {
          id: t.id ?? idx,
          name: t.name,
          emoji: t.emoji || '⚡',
          category: t.category || 'lifestyle',
          tint: t.tint || '#FFFFFF',
        };
      }
      // String name lookup
      const found = allTags.find((at) => at.name.toLowerCase() === String(t).toLowerCase());
      if (found) {
        return {
          id: found.id,
          name: found.name,
          emoji: found.emoji,
          category: found.category,
          tint: found.tint,
        };
      }
      return {
        id: idx,
        name: String(t),
        emoji: '⚡',
        category: 'lifestyle' as const,
        tint: '#FFFFFF',
      };
    });
  }, [tags, allTags]);

  if (enrichedTags.length === 0) return null;

  const topVibe = enrichedTags[0];
  const otherVibes = enrichedTags.slice(1);

  return (
    <View style={styles.cardWrapper}>
      {/* Floating Header Badge */}
      <View style={styles.floatingBadgeYellow}>
        <Ionicons name="sparkles" size={13} color="#000" />
        <Text style={styles.floatingBadgeText}>OBSESSIONS & VIBES</Text>
      </View>

      <BrutalBox
        backgroundColor="#FFFFFF"
        borderColor={colors.borderBlack}
        borderWidth={2.8}
        borderRadius={24}
        shadowOffset={{ x: 4, y: 4 }}
        style={styles.fullWidth}
        contentStyle={styles.containerContent}
      >
        {/* Top Section Header */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionHeading}>WHAT MAKES ME TICK</Text>
            <Text style={styles.sectionSubtitle}>Passions, quirks, and everyday rituals</Text>
          </View>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{enrichedTags.length} PASSIONS</Text>
          </View>
        </View>

        {/* 1. Featured Top Vibe Sticker Banner */}
        {topVibe && (
          <View style={styles.featuredVibeWrap}>
            <View style={styles.featuredRibbon}>
              <Ionicons name="star" size={11} color="#000" />
              <Text style={styles.featuredRibbonText}>CORE OBSESSION</Text>
            </View>

            <BrutalBox
              backgroundColor={CATEGORY_THEMES[topVibe.category]?.bg || colors.accentYellow}
              borderColor={colors.borderBlack}
              borderWidth={2.4}
              borderRadius={16}
              shadowOffset={{ x: 3, y: 3 }}
              contentStyle={styles.featuredVibeContent}
            >
              <View style={styles.featuredEmojiBox}>
                <Text style={styles.featuredEmojiText}>{topVibe.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featuredCategoryText}>
                  {CATEGORY_THEMES[topVibe.category]?.label || 'LIFESTYLE'}
                </Text>
                <Text style={styles.featuredNameText}>{topVibe.name}</Text>
              </View>
              <View style={styles.featuredSparkleBox}>
                <Feather name="arrow-up-right" size={18} color="#000" />
              </View>
            </BrutalBox>
          </View>
        )}

        {/* 2. Bento Sticker Grid for Other Vibes */}
        {otherVibes.length > 0 && (
          <View style={styles.stickersGrid}>
            {otherVibes.map((tag) => {
              const theme = CATEGORY_THEMES[tag.category] || CATEGORY_THEMES.lifestyle;
              return (
                <View key={tag.name} style={styles.stickerWrapper}>
                  <BrutalBox
                    backgroundColor={theme.bg}
                    borderColor={colors.borderBlack}
                    borderWidth={2.2}
                    borderRadius={14}
                    shadowOffset={{ x: 2.5, y: 2.5 }}
                    contentStyle={styles.stickerContent}
                  >
                    <View style={styles.stickerEmojiBadge}>
                      <Text style={styles.stickerEmojiText}>{tag.emoji}</Text>
                    </View>
                    <View style={styles.stickerTextCol}>
                      <Text style={styles.stickerCategoryText}>{tag.category.toUpperCase()}</Text>
                      <Text style={styles.stickerNameText} numberOfLines={2}>
                        {tag.name}
                      </Text>
                    </View>
                  </BrutalBox>
                </View>
              );
            })}
          </View>
        )}
      </BrutalBox>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'relative',
    marginTop: 8,
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
  floatingBadgeYellow: {
    position: 'absolute',
    top: -12,
    left: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
    fontSize: 11,
    color: '#000',
    letterSpacing: 0.5,
  },
  containerContent: {
    padding: 16,
    paddingTop: 22,
    gap: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 2,
  },
  sectionHeading: {
    fontFamily: typography.headline,
    fontSize: 17,
    color: colors.textDark,
    letterSpacing: 0.6,
  },
  sectionSubtitle: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  countPill: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countPillText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 10,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  featuredVibeWrap: {
    position: 'relative',
    marginTop: 4,
  },
  featuredRibbon: {
    position: 'absolute',
    top: -9,
    right: 14,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.accentYellow,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  featuredRibbonText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 9.5,
    color: '#000',
    letterSpacing: 0.4,
  },
  featuredVibeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  featuredEmojiBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredEmojiText: {
    fontSize: 22,
  },
  featuredCategoryText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 10,
    color: '#374151',
    letterSpacing: 0.6,
  },
  featuredNameText: {
    fontFamily: typography.headline,
    fontSize: 16,
    color: colors.textDark,
    letterSpacing: 0.3,
    marginTop: 1,
  },
  featuredSparkleBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
  },
  stickersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 2,
  },
  stickerWrapper: {
    width: '48.5%',
  },
  stickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 9,
    gap: 8,
    minHeight: 56,
  },
  stickerEmojiBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerEmojiText: {
    fontSize: 16,
  },
  stickerTextCol: {
    flex: 1,
  },
  stickerCategoryText: {
    fontFamily: typography.bodyBold,
    fontSize: 8.5,
    color: '#4B5563',
    letterSpacing: 0.5,
  },
  stickerNameText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 12,
    color: colors.textDark,
    lineHeight: 15,
  },
});
