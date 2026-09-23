import { supabase } from '../lib/supabase';
import { assertOk, unwrap } from './errors';

export interface MatchSummary {
  matchId: string;
  partnerId: string;
  name: string;
  age: number | null;
  isVerified: boolean;
  photoPath: string | null;
  matchedAt: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastSenderId: string | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

const MESSAGE_COLUMNS = 'id, match_id, sender_id, body, created_at, read_at' as const;
export const MESSAGE_PAGE_SIZE = 50;

interface MessageRow {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

export function toChatMessage(r: MessageRow): ChatMessage {
  return {
    id: r.id,
    matchId: r.match_id,
    senderId: r.sender_id,
    body: r.body,
    createdAt: r.created_at,
    readAt: r.read_at,
  };
}

export async function fetchMatches(): Promise<MatchSummary[]> {
  const rows = unwrap(await supabase.rpc('my_matches'));
  return rows.map((r) => ({
    matchId: r.match_id,
    partnerId: r.partner_id,
    name: r.display_name,
    age: r.age,
    isVerified: r.is_verified,
    photoPath: r.photo_path,
    matchedAt: r.matched_at,
    lastMessage: r.last_message,
    lastMessageAt: r.last_message_at,
    lastSenderId: r.last_sender_id,
    unreadCount: r.unread_count,
  }));
}

/** Position of a message in the conversation; ties on the timestamp are broken by id. */
export interface MessageCursor {
  createdAt: string;
  id: string;
}

/** Newest-first page of messages; pass the oldest loaded message as `before` to page back. */
export async function fetchMessages(matchId: string, before?: MessageCursor): Promise<ChatMessage[]> {
  let query = supabase
    .from('messages')
    .select(MESSAGE_COLUMNS)
    .eq('match_id', matchId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(MESSAGE_PAGE_SIZE);
  if (before) {
    query = query.or(
      `created_at.lt.${before.createdAt},and(created_at.eq.${before.createdAt},id.lt.${before.id})`
    );
  }
  return unwrap(await query).map(toChatMessage);
}

export async function sendMessage(matchId: string, senderId: string, body: string): Promise<ChatMessage> {
  const text = body.trim();
  if (!text) throw new Error('Type a message first.');
  const row = unwrap(
    await supabase
      .from('messages')
      .insert({ match_id: matchId, sender_id: senderId, body: text })
      .select(MESSAGE_COLUMNS)
      .single()
  );
  return toChatMessage(row);
}

export async function markRead(matchId: string): Promise<void> {
  assertOk(await supabase.rpc('mark_messages_read', { p_match: matchId }));
}

/**
 * Everything one open conversation needs, on a single channel scoped to this match: new messages, read receipts and
 * the match ending (unmatch or block by either side). Returns an unsubscribe function.
 */
export function subscribeToMessages(
  matchId: string,
  handlers: {
    onInsert: (message: ChatMessage) => void;
    onUpdate: (message: ChatMessage) => void;
    onEnded: () => void;
    /** Called each time the channel becomes live (first connect and every reconnect). */
    onLive?: () => void;
  }
): () => void {
  const channel = supabase
    .channel(`chat:${matchId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
      (payload) => handlers.onInsert(toChatMessage(payload.new as MessageRow))
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
      (payload) => handlers.onUpdate(toChatMessage(payload.new as MessageRow))
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
      (payload) => {
        if ((payload.new as { ended_at?: string | null }).ended_at) handlers.onEnded();
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') handlers.onLive?.();
    });
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Returns the matches list with `message` applied (last message, unread count, moved to the top), or null when the
 * match is not in the list yet (a brand-new match: the caller should refetch).
 */
export function applyMessageToMatches(
  matches: MatchSummary[],
  message: ChatMessage,
  myId: string
): MatchSummary[] | null {
  const index = matches.findIndex((m) => m.matchId === message.matchId);
  if (index < 0) return null;
  const current = matches[index];
  const updated: MatchSummary = {
    ...current,
    lastMessage: message.body,
    lastMessageAt: message.createdAt,
    lastSenderId: message.senderId,
    unreadCount: message.senderId === myId ? current.unreadCount : current.unreadCount + 1,
  };
  return [updated, ...matches.filter((_, i) => i !== index)];
}

export type InboxChange = { kind: 'message'; message: ChatMessage } | { kind: 'match' };

/**
 * Fires when a message arrives in any of the user's chats, or a match starts or ends (drives badges and the matches
 * list). Matches end with an UPDATE, which is checked against RLS and filtered to this user (a DELETE would go to
 * every connected client). Message inserts are limited to the user's own matches by RLS.
 */
export function subscribeToInbox(userId: string, onChange: (change: InboxChange) => void): () => void {
  const channel = supabase
    .channel(`inbox:${userId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) =>
      onChange({ kind: 'message', message: toChatMessage(payload.new as MessageRow) })
    );
  for (const column of ['user_a', 'user_b'] as const) {
    for (const event of ['INSERT', 'UPDATE'] as const) {
      channel.on('postgres_changes', { event, schema: 'public', table: 'matches', filter: `${column}=eq.${userId}` }, () =>
        onChange({ kind: 'match' })
      );
    }
  }
  channel.subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
