// Generated from the Supabase schema (generate_typescript_types). Regenerate after every migration.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Rel = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type Gender = 'woman' | 'man' | 'non_binary' | 'other';
type Intention = 'long_term' | 'short_term' | 'friends' | 'figuring_out';
type Moderation = 'pending' | 'approved' | 'rejected';
type ReportReason =
  | 'fake_profile'
  | 'harassment'
  | 'inappropriate_photos'
  | 'spam'
  | 'underage'
  | 'other';
type SwipeAction = 'like' | 'pass' | 'superping';
type VerifyStatus = 'pending' | 'approved' | 'rejected';

export type Database = {
  __InternalSupabase: { PostgrestVersion: '14.5' };
  public: {
    Tables: {
      app_config: {
        Row: { key: string; value: Json };
        Insert: { key: string; value: Json };
        Update: { key?: string; value?: Json };
        Relationships: [];
      };
      blocks: {
        Row: { blocked_id: string; blocker_id: string; created_at: string };
        Insert: { blocked_id: string; blocker_id: string; created_at?: string };
        Update: { blocked_id?: string; blocker_id?: string; created_at?: string };
        Relationships: Rel[];
      };
      match_reads: {
        Row: { last_read_at: string; match_id: string; user_id: string };
        Insert: { last_read_at?: string; match_id: string; user_id: string };
        Update: { last_read_at?: string; match_id?: string; user_id?: string };
        Relationships: Rel[];
      };
      matches: {
        Row: { created_at: string; id: string; user_a: string; user_b: string };
        Insert: { created_at?: string; id?: string; user_a: string; user_b: string };
        Update: { created_at?: string; id?: string; user_a?: string; user_b?: string };
        Relationships: Rel[];
      };
      messages: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          match_id: string;
          read_at: string | null;
          sender_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          match_id: string;
          read_at?: string | null;
          sender_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          match_id?: string;
          read_at?: string | null;
          sender_id?: string;
        };
        Relationships: Rel[];
      };
      photos: {
        Row: {
          created_at: string;
          height: number | null;
          id: string;
          moderation: Moderation;
          position: number;
          storage_path: string;
          user_id: string;
          width: number | null;
        };
        Insert: {
          created_at?: string;
          height?: number | null;
          id?: string;
          moderation?: Moderation;
          position: number;
          storage_path: string;
          user_id: string;
          width?: number | null;
        };
        Update: {
          created_at?: string;
          height?: number | null;
          id?: string;
          moderation?: Moderation;
          position?: number;
          storage_path?: string;
          user_id?: string;
          width?: number | null;
        };
        Relationships: Rel[];
      };
      profile_tags: {
        Row: { created_at: string; tag_id: number; user_id: string };
        Insert: { created_at?: string; tag_id: number; user_id: string };
        Update: { created_at?: string; tag_id?: number; user_id?: string };
        Relationships: Rel[];
      };
      profiles: {
        Row: {
          bio: string | null;
          birthday: string | null;
          city: string | null;
          created_at: string;
          display_name: string;
          gender: Gender | null;
          id: string;
          is_hidden: boolean;
          is_paused: boolean;
          is_seed: boolean;
          is_verified: boolean;
          last_active_at: string;
          location: unknown;
          onboarding_completed_at: string | null;
          onboarding_step: number;
          show_gender: boolean;
          updated_at: string;
        };
        Insert: {
          bio?: string | null;
          birthday?: string | null;
          city?: string | null;
          created_at?: string;
          display_name?: string;
          gender?: Gender | null;
          id: string;
          is_hidden?: boolean;
          is_paused?: boolean;
          is_seed?: boolean;
          is_verified?: boolean;
          last_active_at?: string;
          location?: unknown;
          onboarding_completed_at?: string | null;
          onboarding_step?: number;
          show_gender?: boolean;
          updated_at?: string;
        };
        Update: {
          bio?: string | null;
          birthday?: string | null;
          city?: string | null;
          created_at?: string;
          display_name?: string;
          gender?: Gender | null;
          id?: string;
          is_hidden?: boolean;
          is_paused?: boolean;
          is_seed?: boolean;
          is_verified?: boolean;
          last_active_at?: string;
          location?: unknown;
          onboarding_completed_at?: string | null;
          onboarding_step?: number;
          show_gender?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      prompt_suggestions: {
        Row: { id: number; sort: number; text: string };
        Insert: { id?: never; sort?: number; text: string };
        Update: { id?: never; sort?: number; text?: string };
        Relationships: [];
      };
      push_tokens: {
        Row: { id: string; platform: string; token: string; updated_at: string; user_id: string };
        Insert: { id?: string; platform: string; token: string; updated_at?: string; user_id: string };
        Update: { id?: string; platform?: string; token?: string; updated_at?: string; user_id?: string };
        Relationships: Rel[];
      };
      reports: {
        Row: {
          created_at: string;
          details: string | null;
          id: string;
          reason: ReportReason;
          reported_id: string;
          reporter_id: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          details?: string | null;
          id?: string;
          reason: ReportReason;
          reported_id: string;
          reporter_id: string;
          status?: string;
        };
        Update: {
          created_at?: string;
          details?: string | null;
          id?: string;
          reason?: ReportReason;
          reported_id?: string;
          reporter_id?: string;
          status?: string;
        };
        Relationships: Rel[];
      };
      swipes: {
        Row: { action: SwipeAction; created_at: string; swiper_id: string; target_id: string };
        Insert: { action: SwipeAction; created_at?: string; swiper_id: string; target_id: string };
        Update: { action?: SwipeAction; created_at?: string; swiper_id?: string; target_id?: string };
        Relationships: Rel[];
      };
      tags: {
        Row: {
          category: string;
          emoji: string;
          id: number;
          name: string;
          slug: string;
          sort: number;
          tint: string;
        };
        Insert: {
          category: string;
          emoji: string;
          id?: never;
          name: string;
          slug: string;
          sort?: number;
          tint?: string;
        };
        Update: {
          category?: string;
          emoji?: string;
          id?: never;
          name?: string;
          slug?: string;
          sort?: number;
          tint?: string;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          intention: Intention;
          interested_in: Gender[];
          max_age: number;
          max_distance_km: number;
          min_age: number;
          strict_distance: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          intention?: Intention;
          interested_in?: Gender[];
          max_age?: number;
          max_distance_km?: number;
          min_age?: number;
          strict_distance?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          intention?: Intention;
          interested_in?: Gender[];
          max_age?: number;
          max_distance_km?: number;
          min_age?: number;
          strict_distance?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: Rel[];
      };
      user_settings: {
        Row: {
          approximate_distance: boolean;
          haptics: boolean;
          notify_events: boolean;
          notify_matches: boolean;
          notify_messages: boolean;
          notify_superpings: boolean;
          read_receipts: boolean;
          show_active_status: boolean;
          sound_effects: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          approximate_distance?: boolean;
          haptics?: boolean;
          notify_events?: boolean;
          notify_matches?: boolean;
          notify_messages?: boolean;
          notify_superpings?: boolean;
          read_receipts?: boolean;
          show_active_status?: boolean;
          sound_effects?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          approximate_distance?: boolean;
          haptics?: boolean;
          notify_events?: boolean;
          notify_matches?: boolean;
          notify_messages?: boolean;
          notify_superpings?: boolean;
          read_receipts?: boolean;
          show_active_status?: boolean;
          sound_effects?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: Rel[];
      };
      verifications: {
        Row: {
          created_at: string;
          id: string;
          reviewed_at: string | null;
          selfie_path: string;
          status: VerifyStatus;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          reviewed_at?: string | null;
          selfie_path: string;
          status?: VerifyStatus;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          reviewed_at?: string | null;
          selfie_path?: string;
          status?: VerifyStatus;
          user_id?: string;
        };
        Relationships: Rel[];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      age_years: { Args: { b: string }; Returns: number };
      can_message: { Args: { m: string }; Returns: boolean };
      can_view_photos: { Args: { p_owner: string }; Returns: boolean };
      complete_onboarding: { Args: never; Returns: undefined };
      // Dev-only helper (supabase/seed-dev.sql); absent on production projects.
      dev_move_seeds_near_me: { Args: never; Returns: undefined };
      discover_feed: {
        Args: { p_limit?: number };
        Returns: {
          age: number;
          bio: string;
          city: string;
          display_name: string;
          distance_km: number;
          gender: Gender;
          id: string;
          is_verified: boolean;
          last_active_at: string;
          photo_paths: string[];
          tags: string[];
        }[];
      };
      is_blocked_between: { Args: { a: string; b: string }; Returns: boolean };
      is_match_participant: { Args: { m: string }; Returns: boolean };
      likes_received: {
        Args: never;
        Returns: {
          age: number;
          display_name: string;
          distance_km: number;
          id: string;
          is_superping: boolean;
          is_verified: boolean;
          liked_at: string;
          photo_paths: string[];
        }[];
      };
      mark_messages_read: { Args: { p_match: string }; Returns: undefined };
      my_matches: {
        Args: never;
        Returns: {
          age: number;
          display_name: string;
          is_verified: boolean;
          last_message: string;
          last_message_at: string;
          last_sender_id: string;
          match_id: string;
          matched_at: string;
          partner_id: string;
          photo_path: string;
          unread_count: number;
        }[];
      };
      record_swipe: {
        Args: { p_action: SwipeAction; p_target: string };
        Returns: { match_id: string; matched: boolean }[];
      };
      register_push_token: { Args: { p_platform: string; p_token: string }; Returns: undefined };
      set_location: { Args: { p_city?: string; p_lat: number; p_lng: number }; Returns: undefined };
      unmatch: { Args: { p_match: string }; Returns: undefined };
      zodiac_sign: { Args: { b: string }; Returns: string };
    };
    Enums: {
      gender_t: Gender;
      intention_t: Intention;
      moderation_t: Moderation;
      report_reason_t: ReportReason;
      swipe_action_t: SwipeAction;
      verify_status_t: VerifyStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
