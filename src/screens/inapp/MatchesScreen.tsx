import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { LAYOUT } from '../../theme/responsive';
import { BrutalBox } from '../../components/BrutalBox';
import { ProfileAvatar } from '../../components/ProfileAvatar';
import { useSignedUrls } from '../../hooks/useSignedUrls';
import { fetchMatches, MatchSummary } from '../../services/chat';
import { unmatch, type FeedProfile } from '../../services/discover';
import { DiscoveryProfileDetailScreen } from './DiscoveryProfileDetailScreen';
import { errorMessage } from '../../services/errors';
import { relativeShort } from '../../lib/format';
import { UserAccount } from '../../types/user';

export interface ChatTarget {
  matchId: string;
  partnerId?: string;
  partnerName: string;
}

interface MatchesScreenProps {
  user: UserAccount;
  onOpenChat: (target: ChatTarget) => void;
}

export const MatchesScreen: React.FC<MatchesScreenProps> = ({ user, onOpenChat }) => {
  const queryClient = useQueryClient();
  const matchesQuery = useQuery({ queryKey: ['matches'], queryFn: fetchMatches });
  const matches = useMemo(() => matchesQuery.data ?? [], [matchesQuery.data]);
  const fresh = matches.filter((m) => !m.lastMessage);
  const conversations = matches.filter((m) => m.lastMessage);

  const urls = useSignedUrls(matches.map((m) => m.photoPath).filter((p): p is string => Boolean(p)));
  const [selectedPartner, setSelectedPartner] = useState<MatchSummary | null>(null);

  const selectedFeedProfile = useMemo<FeedProfile | null>(() => {
    if (!selectedPartner) return null;
    const feed = queryClient.getQueryData<FeedProfile[]>(['feed']);
    const cached = feed?.find((f) => f.id === selectedPartner.partnerId);
    if (cached) return cached;
    return {
      id: selectedPartner.partnerId,
      name: selectedPartner.name,
      age: selectedPartner.age ?? 24,
      gender: null,
      bio: null,
      city: null,
      distanceKm: null,
      isVerified: selectedPartner.isVerified,
      lastActiveAt: null,
      tags: [],
      photoPaths: selectedPartner.photoPath ? [selectedPartner.photoPath] : [],
      languages: [],
      prompts: [],
    };
  }, [selectedPartner, queryClient]);

  const partnerPhotoPaths = useMemo(() => {
    if (selectedFeedProfile?.photoPaths && selectedFeedProfile.photoPaths.length > 0) {
      return selectedFeedProfile.photoPaths;
    }
    return selectedPartner?.photoPath ? [selectedPartner.photoPath] : [];
  }, [selectedFeedProfile, selectedPartner]);

  const partnerPhotoUrlsMap = useSignedUrls(partnerPhotoPaths);
  const partnerPhotoUrls = useMemo(() => {
    return partnerPhotoPaths.map((p) => partnerPhotoUrlsMap[p]).filter((u): u is string => Boolean(u));
  }, [partnerPhotoPaths, partnerPhotoUrlsMap]);

  const open = (m: MatchSummary) =>
    onOpenChat({ matchId: m.matchId, partnerId: m.partnerId, partnerName: m.name });

  const confirmUnmatch = (m: MatchSummary) => {
    Alert.alert('Unmatch?', `You and ${m.name} will no longer be able to message each other.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unmatch',
        style: 'destructive',
        onPress: async () => {
          try {
            await unmatch(m.matchId);
            await queryClient.invalidateQueries({ queryKey: ['matches'] });
          } catch (e) {
            Alert.alert('Could not unmatch', errorMessage(e));
          }
        },
      },
    ]);
  };

  if (matchesQuery.isLoading) {
    return (
      <View style={styles.stateWrap}>
        <ActivityIndicator size="large" color={colors.primaryPink} />
      </View>
    );
  }

  if (matchesQuery.isError) {
    return (
      <View style={styles.stateWrap}>
        <Text style={styles.stateTitle}>Can&apos;t load your matches</Text>
        <Text style={styles.stateBody}>{errorMessage(matchesQuery.error)}</Text>
        <BrutalBox backgroundColor={colors.accentYellow} borderRadius={16} onPress={() => matchesQuery.refetch()} contentStyle={styles.stateButton}>
          <Text style={styles.stateButtonText}>TRY AGAIN</Text>
        </BrutalBox>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={matchesQuery.isRefetching} onRefresh={() => matchesQuery.refetch()} tintColor={colors.primaryPink} colors={[colors.primaryPink]} />
        }
      >
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>MATCHES</Text>
            <BrutalBox
              backgroundColor={colors.accentYellow}
              borderColor={colors.borderBlack}
              borderWidth={2.2}
              borderRadius={999}
              shadowOffset={3}
              style={styles.activeChatsBadge}
            >
              <View style={styles.badgeContent}>
                <Ionicons name="flash" size={13} color={colors.textDark} />
                <Text style={styles.badgeText}>
                  {conversations.length} ACTIVE {conversations.length === 1 ? 'CHAT' : 'CHATS'}
                </Text>
              </View>
            </BrutalBox>
          </View>

          {matches.length === 0 && (
            <View style={styles.emptyBlock}>
              <MaterialCommunityIcons name="heart-broken-outline" size={40} color={colors.textDark} />
              <Text style={styles.stateTitle}>NO MATCHES YET</Text>
              <Text style={styles.stateBody}>
                When you and another member both P!NG each other, they will appear here. Head over to Discover to meet
                someone.
              </Text>
            </View>
          )}

          {fresh.length > 0 && (
            <>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>NEW MATCHES</Text>
                <BrutalBox
                  backgroundColor={colors.primaryPink}
                  borderColor={colors.borderBlack}
                  borderWidth={2}
                  borderRadius={999}
                  shadowOffset={2.5}
                  style={styles.newBadge}
                >
                  <View style={styles.newBadgeContent}>
                    <Ionicons name="flash" size={12} color="#FFFFFF" />
                    <Text style={styles.newBadgeText}>{fresh.length} NEW</Text>
                  </View>
                </BrutalBox>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matchesScroll}>
                {fresh.map((m) => (
                  <TouchableOpacity
                    key={m.matchId}
                    style={styles.matchItem}
                    activeOpacity={0.8}
                    onPress={() => open(m)}
                    onLongPress={() => confirmUnmatch(m)}
                    accessibilityRole="button"
                    accessibilityLabel={`Start chatting with ${m.name}`}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setSelectedPartner(m)}
                      style={styles.avatarWrapper}
                      accessibilityRole="button"
                      accessibilityLabel={`View ${m.name}'s profile`}
                    >
                      <View style={styles.avatarCircle}>
                        <ProfileAvatar uri={m.photoPath ? urls[m.photoPath] : null} seed={m.partnerId} size={64} />
                      </View>
                    </TouchableOpacity>
                    <Text style={styles.matchName}>
                      {m.name}
                      {m.age ? `, ${m.age}` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {conversations.length > 0 && (
            <>
              <View style={styles.conversationsHeaderRow}>
                <Text style={styles.sectionTitle}>CONVERSATIONS</Text>
                <Text style={styles.activeCounter}>{conversations.length} ACTIVE</Text>
              </View>

              {conversations.map((m) => {
                const mine = m.lastSenderId === user.id;
                return (
                  <TouchableOpacity
                    key={m.matchId}
                    activeOpacity={0.85}
                    onPress={() => open(m)}
                    onLongPress={() => confirmUnmatch(m)}
                    style={styles.convCardContainer}
                    accessibilityRole="button"
                    accessibilityLabel={`Open conversation with ${m.name}${m.unreadCount > 0 ? `, ${m.unreadCount} unread` : ''}`}
                  >
                    <BrutalBox
                      backgroundColor="#FFFFFF"
                      borderColor={colors.borderBlack}
                      borderWidth={2.4}
                      borderRadius={18}
                      shadowOffset={{ x: 3, y: 3 }}
                      contentStyle={styles.convCard}
                    >
                      <View style={styles.convRow}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => setSelectedPartner(m)}
                          style={styles.convAvatarWrap}
                          accessibilityRole="button"
                          accessibilityLabel={`View ${m.name}'s profile`}
                        >
                          <View style={styles.convAvatarBorder}>
                            <ProfileAvatar uri={m.photoPath ? urls[m.photoPath] : null} seed={m.partnerId} size={56} />
                          </View>
                        </TouchableOpacity>

                        <View style={styles.convDetails}>
                          <View style={styles.convTopLine}>
                            <Text style={styles.convName}>
                              {m.name}
                              {m.age ? `, ${m.age}` : ''}
                            </Text>
                            {m.lastMessageAt && <Text style={styles.convTime}>{relativeShort(m.lastMessageAt)}</Text>}
                          </View>

                          <Text style={m.unreadCount > 0 ? styles.convSnippet : styles.convSnippetMuted} numberOfLines={1}>
                            {mine ? 'You: ' : ''}
                            {m.lastMessage}
                          </Text>

                          {m.unreadCount > 0 && (
                            <View style={styles.convBottomLine}>
                              <View />
                              <View style={styles.unreadCountBadge}>
                                <Text style={styles.unreadCountText}>{m.unreadCount}</Text>
                              </View>
                            </View>
                          )}
                        </View>
                      </View>
                    </BrutalBox>
                  </TouchableOpacity>
                );
              })}
              <Text style={styles.hintText}>Tip: press and hold a match to unmatch.</Text>
            </>
          )}
        </View>
      </ScrollView>

      {/* Match Partner Profile Inspection Modal */}
      <Modal
        visible={!!selectedPartner && !!selectedFeedProfile}
        animationType="slide"
        onRequestClose={() => setSelectedPartner(null)}
      >
        {selectedPartner && selectedFeedProfile && (
          <DiscoveryProfileDetailScreen
            candidate={selectedFeedProfile}
            photoUrls={partnerPhotoUrls}
            onClose={() => setSelectedPartner(null)}
            showActions={false}
          />
        )}
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  stateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 14,
  },
  emptyBlock: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 40,
    paddingHorizontal: 12,
  },
  stateTitle: {
    fontSize: 20,
    fontFamily: typography.headline,
    color: colors.textDark,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  stateBody: {
    fontSize: 14,
    fontFamily: typography.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  stateButton: {
    paddingVertical: 12,
    paddingHorizontal: 26,
    alignItems: 'center',
  },
  stateButtonText: {
    fontSize: 15,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  hintText: {
    fontSize: 11.5,
    fontFamily: typography.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 95 : 85,
  },
  container: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: typography.headingHero,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  activeChatsBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 12,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: typography.headingHero,
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  newBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  newBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newBadgeText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  matchesScroll: {
    paddingBottom: 14,
    gap: 16,
  },
  matchItem: {
    alignItems: 'center',
    width: 82,
  },
  avatarWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
  },
  burstRing: {
    position: 'absolute',
    top: 1,
    left: 1,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownBadge: {
    position: 'absolute',
    bottom: -4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countdownTextYellow: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  countdownTextPink: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: '#FFFFFF',
  },
  matchName: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
  },
  conversationsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 12,
  },
  activeCounter: {
    fontSize: 12,
    fontFamily: typography.bodyExtraBold,
    color: '#6B7280',
    letterSpacing: 0.8,
  },
  convCardContainer: {
    marginBottom: 12,
  },
  convCard: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  yellowLeftBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 7,
    backgroundColor: colors.accentYellow,
  },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  convAvatarWrap: {
    position: 'relative',
    marginRight: 12,
  },
  convAvatarBorder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34D399',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  hourglassBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accentYellow,
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourglassEmoji: {
    fontSize: 11,
  },
  convDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  convTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  convName: {
    fontSize: 16,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  repliesPill: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  repliesPillText: {
    fontSize: 9,
    fontFamily: typography.bodyExtraBold,
    color: '#065F46',
  },
  convTime: {
    fontSize: 12,
    fontFamily: typography.bodyBold,
    color: '#6B7280',
  },
  convSnippet: {
    fontSize: 13.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    marginBottom: 4,
  },
  convSnippetMuted: {
    fontSize: 13.5,
    fontFamily: typography.bodySemiBold,
    color: '#4B5563',
    marginTop: 2,
  },
  convBottomLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  activeNowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeNowText: {
    fontSize: 11.5,
    fontFamily: typography.bodyBold,
    color: colors.primaryPink,
  },
  unreadCountBadge: {
    backgroundColor: colors.primaryPink,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
  },
  expiringPill: {
    backgroundColor: colors.accentYellow,
    borderWidth: 1.6,
    borderColor: colors.borderBlack,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  expiringPillText: {
    fontSize: 9.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  voiceNotePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F0EA',
    borderWidth: 1.4,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 4,
  },
  voiceNoteText: {
    fontSize: 12,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
  },
  voiceDuration: {
    color: '#6B7280',
  },
  limitBox: {
    marginTop: 8,
    padding: 16,
  },
  limitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  limitIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  limitTextGroup: {
    flex: 1,
  },
  limitTitle: {
    fontSize: 13.5,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
    marginBottom: 2,
  },
  limitPinkHighlight: {
    fontFamily: typography.bodyExtraBold,
    color: colors.primaryPink,
  },
  limitSubtitle: {
    fontSize: 12,
    fontFamily: typography.bodyMedium,
    color: '#4B5563',
    lineHeight: 16,
  },
});
