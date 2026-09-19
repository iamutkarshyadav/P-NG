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

/** Newest-first page of messages; pass the oldest loaded timestamp as `before` to page back. */
export async function fetchMessages(matchId: string, before?: string): Promise<ChatMessage[]> {
  let query = supabase
    .from('messages')
    .select(MESSAGE_COLUMNS)
    .eq('match_id', matchId)
    .order('created_at', { ascending: false })
    .limit(MESSAGE_PAGE_SIZE);
  if (before) query = query.lt('created_at', before);
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

/** Live inserts and read-receipt updates for one conversation. Returns an unsubscribe function. */
export function subscribeToMessages(
  matchId: string,
  onInsert: (message: ChatMessage) => void,
  onUpdate: (message: ChatMessage) => void,
  /** Called each time the channel becomes live (first connect and every reconnect). */
  onLive?: () => void
): () => void {
  const channel = supabase
    .channel(`messages:${matchId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
      (payload) => onInsert(toChatMessage(payload.new as MessageRow))
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
      (payload) => onUpdate(toChatMessage(payload.new as MessageRow))
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') onLive?.();
    });
  return () => {
    supabase.removeChannel(channel);
  };
}

/** Fires whenever any message or match involving the user appears (drives badges and the matches list). */
export function subscribeToInbox(userId: string, onChange: () => void): () => void {
  const channel = supabase
    .channel(`inbox:${userId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, onChange)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, onChange)
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'matches' }, onChange)
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
