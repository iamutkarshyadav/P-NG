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
      feedback: {
        Row: {
          app_version: string | null;
          category: string;
          created_at: string;
          id: string;
          message: string;
          platform: string | null;
          user_id: string;
        };
        Insert: {
          app_version?: string | null;
          category: string;
          created_at?: string;
          id?: string;
          message: string;
          platform?: string | null;
          user_id: string;
        };
        Update: {
          app_version?: string | null;
          category?: string;
          created_at?: string;
          id?: string;
          message?: string;
          platform?: string | null;
          user_id?: string;
        };
        Relationships: Rel[];
      };
      match_reads: {
        Row: { last_read_at: string; match_id: string; user_id: string };
        Insert: { last_read_at?: string; match_id: string; user_id: string };
        Update: { last_read_at?: string; match_id?: string; user_id?: string };
        Relationships: Rel[];
      };
      matches: {
        Row: {
          created_at: string;
          end_reason: 'unmatched' | 'blocked' | 'reset' | null;
          ended_at: string | null;
          ended_by: string | null;
          id: string;
          user_a: string;
          user_b: string;
        };
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
          hometown: string | null;
          languages: string[];
          show_politics: boolean;
          show_religion: boolean;
          anthem_artist: string | null;
          anthem_track: string | null;
          bio: string | null;
          birthday: string | null;
          city: string | null;
          created_at: string;
          dating_intention: string | null;
          display_name: string;
          drinking_habits: string | null;
          education_level: string | null;
          family_plans: string | null;
          gender: Gender | null;
          height_cm: number | null;
          id: string;
          is_hidden: boolean;
          is_paused: boolean;
          is_seed: boolean;
          is_verified: boolean;
          last_active_at: string;
          location: unknown;
          occupation: string | null;
          onboarding_completed_at: string | null;
          onboarding_step: number;
          pet_preference: string | null;
          photo_2_prompt: string | null;
          photo_3_prompt: string | null;
          politics: string | null;
          pronouns: string | null;
          religion: string | null;
          show_gender: boolean;
          smoking_habits: string | null;
          updated_at: string;
          voice_note_duration: string | null;
          voice_note_prompt: string | null;
          workout_habits: string | null;
          zodiac_sign: string | null;
        };
        Insert: {
          hometown?: string | null;
          languages?: string[];
          show_politics?: boolean;
          show_religion?: boolean;
          anthem_artist?: string | null;
          anthem_track?: string | null;
          bio?: string | null;
          birthday?: string | null;
          city?: string | null;
          created_at?: string;
          dating_intention?: string | null;
          display_name?: string;
          drinking_habits?: string | null;
          education_level?: string | null;
          family_plans?: string | null;
          gender?: Gender | null;
          height_cm?: number | null;
          id: string;
          is_hidden?: boolean;
          is_paused?: boolean;
          is_seed?: boolean;
          is_verified?: boolean;
          last_active_at?: string;
          location?: unknown;
          occupation?: string | null;
          onboarding_completed_at?: string | null;
          onboarding_step?: number;
          pet_preference?: string | null;
          photo_2_prompt?: string | null;
          photo_3_prompt?: string | null;
          politics?: string | null;
          pronouns?: string | null;
          religion?: string | null;
          show_gender?: boolean;
          smoking_habits?: string | null;
          updated_at?: string;
          voice_note_duration?: string | null;
          voice_note_prompt?: string | null;
          workout_habits?: string | null;
          zodiac_sign?: string | null;
        };
        Update: {
          hometown?: string | null;
          languages?: string[];
          show_politics?: boolean;
          show_religion?: boolean;
          anthem_artist?: string | null;
          anthem_track?: string | null;
          bio?: string | null;
          birthday?: string | null;
          city?: string | null;
          created_at?: string;
          dating_intention?: string | null;
          display_name?: string;
          drinking_habits?: string | null;
          education_level?: string | null;
          family_plans?: string | null;
          gender?: Gender | null;
          height_cm?: number | null;
          id?: string;
          is_hidden?: boolean;
          is_paused?: boolean;
          is_seed?: boolean;
          is_verified?: boolean;
          last_active_at?: string;
          location?: unknown;
          occupation?: string | null;
          onboarding_completed_at?: string | null;
          onboarding_step?: number;
          pet_preference?: string | null;
          photo_2_prompt?: string | null;
          photo_3_prompt?: string | null;
          politics?: string | null;
          pronouns?: string | null;
          religion?: string | null;
          show_gender?: boolean;
          smoking_habits?: string | null;
          updated_at?: string;
          voice_note_duration?: string | null;
          voice_note_prompt?: string | null;
          workout_habits?: string | null;
          zodiac_sign?: string | null;
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
      profile_prompts: {
        Row: { answer: string; photo_path: string | null; prompt: string; slot: number; updated_at: string; user_id: string };
        Insert: never;
        Update: never;
        Relationships: Rel[];
      };
      reports: {
        // Created only through the report_user() RPC; clients can read these columns of their own reports.
        Row: {
          created_at: string;
          details: string | null;
          id: string;
          reason: ReportReason;
          reported_id: string | null;
          reporter_id: string;
          status: string;
        };
        Insert: never;
        Update: never;
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
          filter_drinking: string[];
          filter_family: string[];
          filter_intentions: string[];
          filter_pets: string[];
          filter_smoking: string[];
          filter_workout: string[];
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
          filter_drinking?: string[];
          filter_family?: string[];
          filter_intentions?: string[];
          filter_pets?: string[];
          filter_smoking?: string[];
          filter_workout?: string[];
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
          filter_drinking?: string[];
          filter_family?: string[];
          filter_intentions?: string[];
          filter_pets?: string[];
          filter_smoking?: string[];
          filter_workout?: string[];
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
          challenge: string | null;
          created_at: string;
          id: string;
          reviewed_at: string | null;
          selfie_path: string;
          status: VerifyStatus;
          user_id: string;
        };
        Insert: {
          challenge?: string | null;
          created_at?: string;
          id?: string;
          reviewed_at?: string | null;
          selfie_path: string;
          status?: VerifyStatus;
          user_id: string;
        };
        Update: {
          challenge?: string | null;
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
      blocked_users: {
        Args: never;
        Returns: { blocked_at: string; display_name: string; user_id: string }[];
      };
      can_message: { Args: { m: string }; Returns: boolean };
      can_view_photos: { Args: { p_owner: string }; Returns: boolean };
      complete_onboarding: { Args: never; Returns: undefined };
      export_my_data: { Args: never; Returns: Json };
      reset_my_swipes: { Args: never; Returns: undefined };
      discover_feed: {
        Args: {
          p_limit?: number;
          p_intentions?: string[];
          p_drinking?: string[];
          p_smoking?: string[];
          p_workout?: string[];
          p_pets?: string[];
          p_family?: string[];
        };
        Returns: {
          age: number;
          anthem_artist: string | null;
          anthem_track: string | null;
          bio: string;
          city: string;
          dating_intention: string | null;
          display_name: string;
          distance_km: number;
          drinking_habits: string | null;
          education_level: string | null;
          family_plans: string | null;
          gender: Gender;
          height_cm: number | null;
          hometown: string | null;
          languages: string[];
          id: string;
          is_verified: boolean;
          last_active_at: string;
          occupation: string | null;
          pet_preference: string | null;
          photo_2_prompt: string | null;
          photo_3_prompt: string | null;
          photo_paths: string[];
          politics: string | null;
          prompts: Json;
          pronouns: string | null;
          religion: string | null;
          smoking_habits: string | null;
          tags: string[];
          voice_note_duration: string | null;
          voice_note_prompt: string | null;
          workout_habits: string | null;
          zodiac_sign: string | null;
        }[];
      };
      get_profile_details: {
        Args: { p_target: string };
        Returns: {
          age: number;
          anthem_artist: string | null;
          anthem_track: string | null;
          bio: string | null;
          city: string | null;
          dating_intention: string | null;
          display_name: string;
          distance_km: number | null;
          drinking_habits: string | null;
          education_level: string | null;
          family_plans: string | null;
          gender: Gender | null;
          height_cm: number | null;
          hometown: string | null;
          id: string;
          is_verified: boolean;
          languages: string[];
          last_active_at: string | null;
          occupation: string | null;
          pet_preference: string | null;
          photo_2_prompt: string | null;
          photo_3_prompt: string | null;
          photo_paths: string[];
          politics: string | null;
          prompts: Json;
          pronouns: string | null;
          religion: string | null;
          smoking_habits: string | null;
          tags: string[];
          voice_note_duration: string | null;
          voice_note_prompt: string | null;
          workout_habits: string | null;
          zodiac_sign: string | null;
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
      set_my_prompts: {
        Args: { p_prompts: Array<{ slot: number; prompt: string; answer: string }> };
        Returns: undefined;
      };
      verification_challenge: { Args: never; Returns: string };
      submit_verification: { Args: { p_selfie_path: string }; Returns: undefined };
      report_user: {
        Args: { p_details?: string; p_match?: string; p_reason: ReportReason; p_reported: string };
        Returns: undefined;
      };
      register_push_token: { Args: { p_platform: string; p_token: string }; Returns: undefined };
      set_location: { Args: { p_city?: string; p_lat: number; p_lng: number }; Returns: undefined };
      superpings_left: { Args: never; Returns: number };
      reorder_photos: { Args: { p_ordered_ids: string[] }; Returns: undefined };
      likes_count: { Args: never; Returns: number };
      set_my_tags: { Args: { p_tag_ids: number[] }; Returns: undefined };
      undo_last_swipe: { Args: never; Returns: string };
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
