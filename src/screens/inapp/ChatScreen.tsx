import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ListRenderItem,
  BackHandler,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { LAYOUT } from '../../theme/responsive';
import { DotGridBackground } from '../../components/DotGridBackground';
import { BrutalBox } from '../../components/BrutalBox';
import { ProfileAvatar } from '../../components/ProfileAvatar';
import { UserAccount } from '../../types/user';
import { useSignedUrls } from '../../hooks/useSignedUrls';
import { supabase } from '../../lib/supabase';
import {
  ChatMessage,
  MESSAGE_PAGE_SIZE,
  fetchMatches,
  fetchMessages,
  markRead,
  sendMessage,
  subscribeToMessages,
} from '../../services/chat';
import { unmatch } from '../../services/discover';
import { REPORT_REASONS, ReportReason, blockUser, reportUser } from '../../services/safety';
import { errorMessage } from '../../services/errors';
import { clockTime } from '../../lib/format';
import type { ChatTarget } from './MatchesScreen';

interface ChatScreenProps {
  target: ChatTarget;
  user: UserAccount;
  onBack: () => void;
}

const ICEBREAKER = 'Two truths and a lie, go!';

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(today) - startOf(d)) / 86_400_000);
  if (diffDays === 0) return 'TODAY';
  if (diffDays === 1) return 'YESTERDAY';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase();
}

type PendingMessage = ChatMessage & { pending?: true };
type ChatRow = { kind: 'day'; key: string; label: string } | { kind: 'msg'; key: string; msg: PendingMessage };

export const ChatScreen: React.FC<ChatScreenProps> = ({ target, user, onBack }) => {
  const { matchId, partnerId, partnerName } = target;
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList<ChatRow>>(null);

  const [messages, setMessages] = useState<PendingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // Partner details come from the matches list (age, photo, verified).
  const matchesQuery = useQuery({ queryKey: ['matches'], queryFn: fetchMatches });
  const summary = matchesQuery.data?.find((m) => m.matchId === matchId);
  const partnerUserId = partnerId ?? summary?.partnerId;
  const urls = useSignedUrls(summary?.photoPath ? [summary.photoPath] : []);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => flatListRef.current?.scrollToEnd({ animated: true }));
  }, []);

  // Hardware back button navigation
  useEffect(() => {
    const onBackPress = () => {
      onBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [onBack]);

  // Guard against match deletion (unmatch or block while chat is open)
  useEffect(() => {
    const channel = supabase
      .channel(`match-guard:${matchId}`)
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
        () => {
          Alert.alert('Match Ended', 'This conversation is no longer active.', [
            { text: 'OK', onPress: onBack },
          ]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, onBack]);

  const markConversationRead = useCallback(() => {
    markRead(matchId)
      .then(() => queryClient.invalidateQueries({ queryKey: ['matches'] }))
      .catch(() => undefined); // a failed receipt must never block reading
  }, [matchId, queryClient]);

  // Initial page.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMessages(matchId)
      .then((page) => {
        if (cancelled) return;
        setMessages([...page].reverse());
        setHasMore(page.length === MESSAGE_PAGE_SIZE);
        setLoadError(null);
        markConversationRead();
      })
      .catch((e) => !cancelled && setLoadError(errorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [matchId, markConversationRead]);

  // Live messages and read receipts.
  useEffect(() => {
    return subscribeToMessages(
      matchId,
      (incoming) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev;
          // Replace our optimistic copy of the same message if it is still pending.
          const pendingIndex = prev.findIndex(
            (m) => m.pending && m.senderId === incoming.senderId && m.body === incoming.body
          );
          if (pendingIndex >= 0) {
            const next = [...prev];
            next[pendingIndex] = incoming;
            return next;
          }
          return [...prev, incoming];
        });
        if (incoming.senderId !== user.id) markConversationRead();
        scrollToEnd();
      },
      (updated) => setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m))),
      // Anything sent while the channel was connecting or reconnecting is fetched here.
      () => {
        fetchMessages(matchId)
          .then((latest) =>
            setMessages((prev) => {
              const known = new Set(prev.map((m) => m.id));
              const missing = latest.filter((m) => !known.has(m.id));
              if (missing.length === 0) return prev;
              return [...prev, ...missing].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
            })
          )
          .catch(() => undefined);
      }
    );
  }, [matchId, user.id, markConversationRead, scrollToEnd]);

  useEffect(() => {
    if (!loading) scrollToEnd();
  }, [loading, scrollToEnd]);

  const loadEarlier = async () => {
    const oldest = messages.find((m) => !m.pending);
    if (!oldest || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await fetchMessages(matchId, oldest.createdAt);
      setMessages((prev) => [...[...page].reverse(), ...prev]);
      setHasMore(page.length === MESSAGE_PAGE_SIZE);
    } catch (e) {
      Alert.alert('Could not load earlier messages', errorMessage(e));
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || sending) return;
    const tempId = `tmp-${Date.now()}`;
    const optimistic: PendingMessage = {
      id: tempId,
      matchId,
      senderId: user.id,
      body: text,
      createdAt: new Date().toISOString(),
      readAt: null,
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    if (textToSend === undefined) setInputText('');
    setSending(true);
    scrollToEnd();
    try {
      const saved = await sendMessage(matchId, user.id, text);
      setMessages((prev) => {
        // Realtime may already have swapped in the saved row.
        const withoutTemp = prev.filter((m) => m.id !== tempId);
        return withoutTemp.some((m) => m.id === saved.id) ? withoutTemp : [...withoutTemp, saved];
      });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      if (textToSend === undefined) setInputText(text);
      const msg = errorMessage(e);
      if (/participant|foreign key|can_message|not found/i.test(msg)) {
        Alert.alert('Conversation Ended', 'You can no longer message this match.', [
          { text: 'OK', onPress: onBack },
        ]);
      } else {
        Alert.alert('Message not sent', msg);
      }
    } finally {
      setSending(false);
    }
  };

  const handleBlock = () => {
    if (!partnerUserId) return;
    setMenuOpen(false);
    Alert.alert('Block ' + partnerName + '?', 'You will no longer see each other and this chat will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          try {
            await blockUser(user.id, partnerUserId);
            queryClient.invalidateQueries({ queryKey: ['matches'] });
            queryClient.invalidateQueries({ queryKey: ['feed'] });
            onBack();
          } catch (e) {
            Alert.alert('Could not block', errorMessage(e));
          }
        },
      },
    ]);
  };

  const handleUnmatch = () => {
    setMenuOpen(false);
    Alert.alert('Unmatch?', `You and ${partnerName} will no longer be able to message each other.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unmatch',
        style: 'destructive',
        onPress: async () => {
          try {
            await unmatch(matchId);
            queryClient.invalidateQueries({ queryKey: ['matches'] });
            onBack();
          } catch (e) {
            Alert.alert('Could not unmatch', errorMessage(e));
          }
        },
      },
    ]);
  };

  const handleReport = async (reason: ReportReason) => {
    if (!partnerUserId) return;
    setReportOpen(false);
    try {
      await reportUser(user.id, partnerUserId, reason);
      Alert.alert('Report sent', 'Thanks for keeping P!NG real. Our team will take a look. You can also block this person.');
    } catch (e) {
      Alert.alert('Could not send report', errorMessage(e));
    }
  };

  // Group messages under a day pill.
  const rows = useMemo(() => {
    const out: Array<{ kind: 'day'; key: string; label: string } | { kind: 'msg'; key: string; msg: PendingMessage }> = [];
    let lastDay = '';
    for (const msg of messages) {
      const label = dayLabel(msg.createdAt);
      if (label !== lastDay) {
        out.push({ kind: 'day', key: `day-${msg.id}`, label });
        lastDay = label;
      }
      out.push({ kind: 'msg', key: msg.id, msg });
    }
    return out;
  }, [messages]);

  const verified = summary?.isVerified ?? false;

  const renderRow: ListRenderItem<ChatRow> = ({ item: row }) => {
    if (row.kind === 'day') {
      return (
        <View key={row.key} style={styles.timestampContainer}>
          <BrutalBox
            backgroundColor="#FFFFFF"
            borderColor={colors.borderBlack}
            borderWidth={1.8}
            borderRadius={999}
            shadowOffset={{ x: 2, y: 2 }}
            contentStyle={styles.timestampPill}
          >
            <Feather name="clock" size={12} color={colors.primaryPink} />
            <Text style={styles.timestampText}>{row.label}</Text>
          </BrutalBox>
        </View>
      );
    }
    const { msg } = row;
    const mine = msg.senderId === user.id;
    return mine ? (
      <View key={row.key} style={styles.outgoingMsgContainer}>
        <BrutalBox
          backgroundColor={colors.primaryPink}
          borderColor={colors.borderBlack}
          borderWidth={2.2}
          borderRadius={18}
          shadowOffset={{ x: 3, y: 3 }}
          style={[styles.outgoingBubbleBox, msg.pending && styles.pendingBubble]}
          contentStyle={styles.outgoingBubbleContent}
        >
          <Text style={styles.outgoingMsgText}>{msg.body}</Text>
        </BrutalBox>
        <View style={styles.outgoingSubTimeRow}>
          <Text style={styles.outgoingSubTime}>
            {msg.pending ? 'Sending...' : clockTime(msg.createdAt)}
            {msg.readAt ? ' • READ' : ''}
          </Text>
          {!msg.pending && (
            <MaterialCommunityIcons
              name="check-all"
              size={15}
              color={msg.readAt ? colors.primaryPink : '#9CA3AF'}
            />
          )}
        </View>
      </View>
    ) : (
      <View key={row.key} style={styles.incomingMsgContainer}>
        <BrutalBox
          backgroundColor="#FFFFFF"
          borderColor={colors.borderBlack}
          borderWidth={2.2}
          borderRadius={18}
          shadowOffset={{ x: 3, y: 3 }}
          style={styles.incomingBubbleBox}
          contentStyle={styles.incomingBubbleContent}
        >
          <Text style={styles.incomingMsgText}>{msg.body}</Text>
        </BrutalBox>
        <Text style={styles.incomingSubTime}>{clockTime(msg.createdAt)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <DotGridBackground />

      <View style={styles.topHeaderBar}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onBack}
          style={styles.backIconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Back to matches"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>

        <Text style={styles.chatDirectTitle}>CHAT DIRECT</Text>

        <View style={styles.topRightRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setMenuOpen(true)}
            style={styles.moreIconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Chat options"
          >
            <Ionicons name="ellipsis-vertical" size={22} color={colors.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={flatListRef}
          data={rows}
          renderItem={renderRow}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={Platform.OS !== 'web'}
          initialNumToRender={20}
          maxToRenderPerBatch={15}
          windowSize={7}
          ListHeaderComponent={
            <View>
              <BrutalBox
                backgroundColor="#FFFFFF"
                borderColor={colors.borderBlack}
                borderWidth={2.4}
                borderRadius={18}
                shadowOffset={{ x: 3.5, y: 3.5 }}
                contentStyle={styles.contactCardContent}
              >
                <View style={styles.contactCardRow}>
                  <View style={styles.contactAvatarWrap}>
                    <View style={styles.contactAvatarBorder}>
                      <ProfileAvatar
                        uri={summary?.photoPath ? urls[summary.photoPath] : null}
                        seed={partnerUserId ?? matchId}
                        size={52}
                        accessibilityLabel={`Photo of ${partnerName}`}
                      />
                    </View>
                  </View>

                  <View style={styles.contactInfoCol}>
                    <Text style={styles.contactName}>
                      {partnerName.toUpperCase()}
                      {summary?.age ? `, ${summary.age}` : ''}
                    </Text>
                    {verified && (
                      <View style={styles.activePill}>
                        <Ionicons name="checkmark-done" size={12} color={colors.textDark} />
                        <Text style={styles.activePillText}>100% REAL</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.contactActionsRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setMenuOpen(true)}
                      accessibilityRole="button"
                      accessibilityLabel="Safety options"
                    >
                      <BrutalBox
                        backgroundColor="#FFFFFF"
                        borderColor={colors.borderBlack}
                        borderWidth={2}
                        borderRadius={999}
                        shadowOffset={{ x: 2, y: 2 }}
                        contentStyle={styles.actionRoundBtn}
                      >
                        <Ionicons name="shield-outline" size={17} color={colors.textDark} />
                      </BrutalBox>
                    </TouchableOpacity>
                  </View>
                </View>
              </BrutalBox>

              {showWarning && (
                <BrutalBox
                  backgroundColor={colors.primaryPink}
                  borderColor={colors.borderBlack}
                  borderWidth={2}
                  borderRadius={12}
                  shadowOffset={{ x: 2.5, y: 2.5 }}
                  style={styles.warningContainer}
                  contentStyle={styles.warningContent}
                >
                  <View style={styles.warningLeftRow}>
                    <Text style={styles.warningIcon}>⚠️</Text>
                    <Text style={styles.warningText} numberOfLines={1}>
                      KEEP CHATS IN P!NG. NEVER SEND MONEY.
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowWarning(false)}
                    style={styles.closeWarningBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss safety notice"
                  >
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </BrutalBox>
              )}

              {loading && <ActivityIndicator style={styles.centerSpinner} color={colors.primaryPink} />}

              {loadError && (
                <Text style={styles.chatNotice}>Could not load messages: {loadError}</Text>
              )}

              {hasMore && !loading && (
                <TouchableOpacity onPress={loadEarlier} disabled={loadingMore} style={styles.loadMore}>
                  <Text style={styles.loadMoreText}>{loadingMore ? 'LOADING...' : 'LOAD EARLIER MESSAGES'}</Text>
                </TouchableOpacity>
              )}

              {!loading && !loadError && messages.length === 0 && (
                <Text style={styles.chatNotice}>You matched! Say something to {partnerName}.</Text>
              )}
            </View>
          }
          ListFooterComponent={
            !loading && messages.length === 0 ? (
              <TouchableOpacity activeOpacity={0.85} onPress={() => handleSend(ICEBREAKER)}>
                <BrutalBox
                  backgroundColor={colors.accentYellow}
                  borderColor={colors.borderBlack}
                  borderWidth={2.2}
                  borderRadius={16}
                  shadowOffset={{ x: 3, y: 3 }}
                  style={styles.promptContainer}
                  contentStyle={styles.promptContent}
                >
                  <Ionicons name="flash" size={16} color={colors.primaryPink} />
                  <Text style={styles.promptText}>ICEBREAKER: {ICEBREAKER.toUpperCase()}</Text>
                </BrutalBox>
              </TouchableOpacity>
            ) : null
          }
        />

        <View style={styles.inputBarContainer}>
          <View style={styles.textInputBox}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Send a p!ng..."
              placeholderTextColor="#6B7280"
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
              maxLength={2000}
              accessibilityLabel="Message"
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <BrutalBox
              backgroundColor={inputText.trim() ? colors.accentYellow : '#E5E7EB'}
              borderColor={colors.borderBlack}
              borderWidth={2.2}
              borderRadius={999}
              shadowOffset={{ x: 2.5, y: 2.5 }}
              contentStyle={styles.sendFlashBtn}
            >
              <Ionicons name="flash" size={20} color={colors.textDark} />
            </BrutalBox>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal transparent visible={menuOpen} animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <BrutalBox
            backgroundColor="#FFFFFF"
            borderColor={colors.borderBlack}
            borderWidth={2.6}
            borderRadius={22}
            shadowOffset={{ x: 4, y: 4 }}
            style={styles.sheetCard}
            contentStyle={styles.sheetContent}
          >
            <Text style={styles.sheetTitle}>{partnerName.toUpperCase()}</Text>
            <TouchableOpacity
              style={styles.sheetRow}
              onPress={() => {
                setMenuOpen(false);
                setReportOpen(true);
              }}
              accessibilityRole="button"
            >
              <Feather name="flag" size={18} color={colors.textDark} />
              <Text style={styles.sheetRowText}>Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetRow} onPress={handleBlock} accessibilityRole="button">
              <Feather name="slash" size={18} color={colors.errorRed} />
              <Text style={[styles.sheetRowText, { color: colors.errorRed }]}>Block</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetRow} onPress={handleUnmatch} accessibilityRole="button">
              <Feather name="user-x" size={18} color={colors.textDark} />
              <Text style={styles.sheetRowText}>Unmatch</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetRow} onPress={() => setMenuOpen(false)} accessibilityRole="button">
              <Feather name="x" size={18} color={colors.textMuted} />
              <Text style={[styles.sheetRowText, { color: colors.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          </BrutalBox>
        </TouchableOpacity>
      </Modal>

      <Modal transparent visible={reportOpen} animationType="fade" onRequestClose={() => setReportOpen(false)}>
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setReportOpen(false)}>
          <BrutalBox
            backgroundColor="#FFFFFF"
            borderColor={colors.borderBlack}
            borderWidth={2.6}
            borderRadius={22}
            shadowOffset={{ x: 4, y: 4 }}
            style={styles.sheetCard}
            contentStyle={styles.sheetContent}
          >
            <Text style={styles.sheetTitle}>WHY ARE YOU REPORTING?</Text>
            {REPORT_REASONS.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={styles.sheetRow}
                onPress={() => handleReport(r.value)}
                accessibilityRole="button"
              >
                <Text style={styles.sheetRowText}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </BrutalBox>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centerSpinner: {
    marginVertical: 24,
  },
  chatNotice: {
    fontSize: 13.5,
    fontFamily: typography.bodyBold,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: 18,
    paddingHorizontal: 20,
  },
  loadMore: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  loadMoreText: {
    fontSize: 11.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.primaryPink,
    letterSpacing: 0.5,
  },
  pendingBubble: {
    opacity: 0.65,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheetCard: {
    width: '100%',
    maxWidth: 340,
  },
  sheetContent: {
    padding: 8,
  },
  sheetTitle: {
    fontSize: 13,
    fontFamily: typography.bodyExtraBold,
    color: colors.textMuted,
    letterSpacing: 0.6,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  sheetRowText: {
    fontSize: 16,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  keyboardContainer: {
    flex: 1,
  },

  /* Top Bar */
  topHeaderBar: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#FAF7F2',
  },
  backIconButton: {
    padding: 4,
  },
  chatDirectTitle: {
    fontSize: 26,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.8,
  },
  topRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moreIconButton: {
    padding: 4,
  },
  headerAvatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    overflow: 'hidden',
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },

  /* Scroll Content */
  scrollContent: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },

  /* Partner Contact Card */
  contactCardContent: {
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  contactCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatarWrap: {
    position: 'relative',
    marginRight: 12,
  },
  contactAvatarBorder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34D399',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contactInfoCol: {
    flex: 1,
    gap: 4,
  },
  contactName: {
    fontSize: 20,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    gap: 5,
  },
  greenActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  activePillText: {
    fontSize: 9.5,
    fontFamily: typography.bodyExtraBold,
    color: '#065F46',
    letterSpacing: 0.4,
  },
  contactActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionRoundBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Safety Warning Banner */
  warningContainer: {
    width: '100%',
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  warningLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  warningIcon: {
    fontSize: 16,
  },
  warningText: {
    fontSize: 11.5,
    fontFamily: typography.bodyExtraBold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  closeWarningBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },

  /* Timestamp Pill */
  timestampContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  timestampPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 6,
    backgroundColor: '#FFFDF8',
  },
  timestampText: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },

  /* Incoming Message */
  incomingMsgContainer: {
    alignSelf: 'flex-start',
    maxWidth: '84%',
  },
  incomingBubbleBox: {
    width: '100%',
  },
  incomingBubbleContent: {
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  incomingMsgText: {
    fontSize: 14.5,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
    lineHeight: 20,
  },
  incomingSubTime: {
    fontSize: 11,
    fontFamily: typography.bodyBold,
    color: '#6B7280',
    marginTop: 4,
    marginLeft: 4,
  },

  /* Outgoing Message */
  outgoingMsgContainer: {
    alignSelf: 'flex-end',
    maxWidth: '84%',
    alignItems: 'flex-end',
  },
  outgoingBubbleBox: {
    width: '100%',
  },
  outgoingBubbleContent: {
    padding: 14,
    backgroundColor: colors.primaryPink,
  },
  outgoingMsgText: {
    fontSize: 14.5,
    fontFamily: typography.bodyBold,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  outgoingSubTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginRight: 4,
  },
  outgoingSubTime: {
    fontSize: 11,
    fontFamily: typography.bodyBold,
    color: '#6B7280',
  },

  /* Ephemeral Media Card */
  mediaCardContainer: {
    width: '88%',
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
  mediaCardBox: {
    width: '100%',
  },
  mediaCardContent: {
    backgroundColor: '#FFFFFF',
  },
  ephemeralArea: {
    backgroundColor: '#C7D2FE',
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ephemeralTagWrap: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  ephemeralTagContent: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ephemeralTagText: {
    fontSize: 9.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  lockGraphicCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    marginBottom: 12,
  },
  unlockBtnWrapper: {
    width: '100%',
  },
  unlockBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  unlockBtnEmoji: {
    fontSize: 13,
  },
  unlockBtnText: {
    fontSize: 12.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  ephemeralSubtitle: {
    fontSize: 11.5,
    fontFamily: typography.bodyBold,
    color: '#4338CA',
    marginTop: 8,
  },
  mediaFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  mediaFooterTitle: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  mediaFooterTime: {
    fontSize: 11,
    fontFamily: typography.bodyBold,
    color: '#6B7280',
  },

  /* Audio P!NG Bubble */
  audioBubbleBox: {
    width: 210,
  },
  audioBubbleContent: {
    padding: 12,
    backgroundColor: colors.primaryPink,
  },
  audioBubbleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  audioPlayBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 1.8, height: 1.8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 28,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    borderWidth: 0.8,
    borderColor: colors.borderBlack,
  },
  audioSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingLeft: 4,
  },
  audioDurationText: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: '#FFFFFF',
  },
  audioPingBrand: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: colors.accentYellow,
    letterSpacing: 0.5,
  },

  /* Icebreaker Prompt */
  promptContainer: {
    width: '100%',
    marginVertical: 4,
  },
  promptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  promptText: {
    fontSize: 12.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.3,
  },

  /* Bottom Input Bar */
  inputBarContainer: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 14 : 10,
    backgroundColor: '#FAF7F2',
    gap: 8,
  },
  inputRoundBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInputBox: {
    flex: 1,
    height: 42,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  textInput: {
    fontSize: 14,
    fontFamily: typography.bodySemiBold,
    color: colors.textDark,
  },
  sendFlashBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
