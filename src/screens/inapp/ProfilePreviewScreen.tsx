// src/screens/inapp/ProfilePreviewScreen.tsx
// Dating Profile Studio: switch seamlessly between Edit and Live Preview.
// Live preview uses UnifiedDatingProfileView for 100% parity with Discovery.

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { LAYOUT } from '../../theme/responsive';
import { DotGridBackground } from '../../components/DotGridBackground';
import { BrutalBox } from '../../components/BrutalBox';
import { UserAccount } from '../../types/user';
import { ProfileEditor } from '../../components/ProfileEditor';
import { UnifiedDatingProfileView } from '../../components/profile-view/UnifiedDatingProfileView';
import { fetchMyPrompts } from '../../services/prompts';
import { usePhotos } from '../../hooks/usePhotos';
import { fetchAllTags, fetchMyTagIds } from '../../services/tags';

export interface ProfilePreviewScreenProps {
  user: UserAccount;
  onBack: () => void;
  initialMode?: 'preview' | 'edit';
}

export const ProfilePreviewScreen: React.FC<ProfilePreviewScreenProps> = ({
  user,
  onBack,
  initialMode = 'preview',
}) => {
  const [mode, setMode] = useState<'preview' | 'edit'>(initialMode);
  const { photos } = usePhotos(user.id);
  const tagsQuery = useQuery({ queryKey: ['tags'], queryFn: fetchAllTags, staleTime: 10 * 60_000 });
  const myTagsQuery = useQuery({ queryKey: ['my-tags', user.id], queryFn: () => fetchMyTagIds(user.id) });
  const promptsQuery = useQuery({ queryKey: ['my-prompts', user.id], queryFn: fetchMyPrompts });
  const myTags = (tagsQuery.data ?? []).filter((t) => (myTagsQuery.data ?? []).includes(t.id));

  return (
    <View style={styles.screenWrapper}>
      <StatusBar style="dark" />
      <DotGridBackground />

      {/* Top Back Navigation */}
      <View style={styles.backNavRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Screen Title Block */}
          <View style={styles.screenHeader}>
            <Text style={styles.screenHeading}>DATING PROFILE STUDIO</Text>
            <Text style={styles.screenSubheading}>
              {mode === 'preview'
                ? 'This is live — exactly how potential matches experience your card.'
                : 'Craft your photos, vibe tags, prompts, anthem, and lifestyle.'}
            </Text>

            {/* Neo-Brutalist Mode Segmented Toggle */}
            <View style={styles.segmentControlRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setMode('edit')}
                style={styles.segmentBtnWrap}
              >
                <BrutalBox
                  backgroundColor={mode === 'edit' ? colors.accentYellow : '#FFFFFF'}
                  borderColor={colors.borderBlack}
                  borderWidth={2.4}
                  borderRadius={14}
                  shadowOffset={{ x: mode === 'edit' ? 2.5 : 1.5, y: mode === 'edit' ? 2.5 : 1.5 }}
                  contentStyle={styles.segmentBtnContent}
                >
                  <Feather name="edit-3" size={16} color={colors.textDark} />
                  <Text style={[styles.segmentBtnText, mode === 'edit' && styles.segmentBtnTextActive]}>
                    EDIT PROFILE
                  </Text>
                </BrutalBox>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setMode('preview')}
                style={styles.segmentBtnWrap}
              >
                <BrutalBox
                  backgroundColor={mode === 'preview' ? colors.accentYellow : '#FFFFFF'}
                  borderColor={colors.borderBlack}
                  borderWidth={2.4}
                  borderRadius={14}
                  shadowOffset={{ x: mode === 'preview' ? 2.5 : 1.5, y: mode === 'preview' ? 2.5 : 1.5 }}
                  contentStyle={styles.segmentBtnContent}
                >
                  <Feather name="eye" size={16} color={colors.textDark} />
                  <Text style={[styles.segmentBtnText, mode === 'preview' && styles.segmentBtnTextActive]}>
                    LIVE PREVIEW
                  </Text>
                </BrutalBox>
              </TouchableOpacity>
            </View>
          </View>

          {mode === 'edit' && <ProfileEditor user={user} onDone={() => setMode('preview')} />}
          {mode === 'preview' && (
            <UnifiedDatingProfileView
              profile={user}
              photoUrls={photos.map((p) => p.url).filter(Boolean) as string[]}
              prompts={promptsQuery.data ?? []}
              tags={myTags}
              isLivePreview={true}
            />
          )}
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
  scrollContent: {
    paddingBottom: 60,
  },
  container: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  screenHeader: {
    paddingTop: 4,
    paddingBottom: 4,
    gap: 6,
  },
  screenHeading: {
    fontFamily: typography.headline,
    fontSize: 26,
    color: colors.textDark,
    letterSpacing: 0.8,
  },
  screenSubheading: {
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  segmentControlRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  segmentBtnWrap: {
    flex: 1,
  },
  segmentBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 6,
  },
  segmentBtnText: {
    fontFamily: typography.headline,
    fontSize: 13,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  segmentBtnTextActive: {
    color: colors.textDark,
  },
});
