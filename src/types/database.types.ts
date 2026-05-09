/** Auto-generated from Supabase; regenerate via MCP `generate_typescript_types` or `supabase gen types`. */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      ai_chat_history: {
        Row: {
          created_at: string;
          id: string;
          messages_json: Json;
          prompt_metadata: Json;
          title: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          messages_json?: Json;
          prompt_metadata?: Json;
          title?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          messages_json?: Json;
          prompt_metadata?: Json;
          title?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      ai_prompt_versions: {
        Row: {
          created_at: string;
          id: string;
          metadata: Json;
          prompt_text: string;
          slug: string;
          updated_by: string | null;
          version: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          metadata?: Json;
          prompt_text: string;
          slug: string;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          metadata?: Json;
          prompt_text?: string;
          slug?: string;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [];
      };
      astrology_reports: {
        Row: {
          ai_summary: string | null;
          arranged_marriage_score: number | null;
          confidence_score: number | null;
          created_at: string;
          full_report_json: Json;
          hybrid_score: number | null;
          id: string;
          kundli_id: string | null;
          love_marriage_score: number | null;
          prediction_meta: Json;
          prompt_version: string | null;
          user_id: string;
        };
        Insert: {
          ai_summary?: string | null;
          arranged_marriage_score?: number | null;
          confidence_score?: number | null;
          created_at?: string;
          full_report_json?: Json;
          hybrid_score?: number | null;
          id?: string;
          kundli_id?: string | null;
          love_marriage_score?: number | null;
          prediction_meta?: Json;
          prompt_version?: string | null;
          user_id: string;
        };
        Update: {
          ai_summary?: string | null;
          arranged_marriage_score?: number | null;
          confidence_score?: number | null;
          created_at?: string;
          full_report_json?: Json;
          hybrid_score?: number | null;
          id?: string;
          kundli_id?: string | null;
          love_marriage_score?: number | null;
          prediction_meta?: Json;
          prompt_version?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          author_id: string | null;
          content_md: string;
          cover_image_url: string | null;
          created_at: string;
          excerpt: string | null;
          id: string;
          published: boolean;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id?: string | null;
          content_md?: string;
          cover_image_url?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          published?: boolean;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          content_md?: string;
          cover_image_url?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          published?: boolean;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      compatibility_checks: {
        Row: {
          analysis: string | null;
          compatibility_score: number | null;
          created_at: string;
          id: string;
          person_one_kundli: string;
          person_two_kundli: string;
          user_id: string;
        };
        Insert: {
          analysis?: string | null;
          compatibility_score?: number | null;
          created_at?: string;
          id?: string;
          person_one_kundli: string;
          person_two_kundli: string;
          user_id: string;
        };
        Update: {
          analysis?: string | null;
          compatibility_score?: number | null;
          created_at?: string;
          id?: string;
          person_one_kundli?: string;
          person_two_kundli?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      consultations: {
        Row: {
          created_at: string;
          id: string;
          notes: string | null;
          scheduled_at: string;
          status: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          scheduled_at: string;
          status?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          scheduled_at?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      google_auth_links: {
        Row: {
          created_at: string;
          google_sub: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          google_sub: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          google_sub?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      kundli_data: {
        Row: {
          birth_city: string | null;
          birth_date: string | null;
          birth_time: string | null;
          created_at: string;
          id: string;
          latitude: number | null;
          longitude: number | null;
          raw_chart_json: Json;
          timezone: string | null;
          user_id: string;
        };
        Insert: {
          birth_city?: string | null;
          birth_date?: string | null;
          birth_time?: string | null;
          created_at?: string;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          raw_chart_json?: Json;
          timezone?: string | null;
          user_id: string;
        };
        Update: {
          birth_city?: string | null;
          birth_date?: string | null;
          birth_time?: string | null;
          created_at?: string;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          raw_chart_json?: Json;
          timezone?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      phone_auth_links: {
        Row: {
          created_at: string;
          phone_e164: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          phone_e164: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          phone_e164?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      predictions: {
        Row: {
          band: string | null;
          benchmark: number | null;
          country: string;
          created_at: string;
          engine: string | null;
          id: string;
          input: Json;
          max_score: number | null;
          result: Json;
          score: number | null;
          summary: string | null;
        };
        Insert: {
          band?: string | null;
          benchmark?: number | null;
          country: string;
          created_at?: string;
          engine?: string | null;
          id?: string;
          input: Json;
          max_score?: number | null;
          result: Json;
          score?: number | null;
          summary?: string | null;
        };
        Update: {
          band?: string | null;
          benchmark?: number | null;
          country?: string;
          created_at?: string;
          engine?: string | null;
          id?: string;
          input?: Json;
          max_score?: number | null;
          result?: Json;
          score?: number | null;
          summary?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          created_at: string;
          current_period_end: string | null;
          id: string;
          metadata: Json;
          plan_key: string | null;
          provider: string | null;
          status: string;
          stripe_customer_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_period_end?: string | null;
          id?: string;
          metadata?: Json;
          plan_key?: string | null;
          provider?: string | null;
          status?: string;
          stripe_customer_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          current_period_end?: string | null;
          id?: string;
          metadata?: Json;
          plan_key?: string | null;
          provider?: string | null;
          status?: string;
          stripe_customer_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      whatsapp_otp_challenges: {
        Row: {
          attempts: number;
          code_hash: string;
          consumed_at: string | null;
          created_at: string;
          expires_at: string;
          id: string;
          phone_e164: string;
          salt: string;
        };
        Insert: {
          attempts?: number;
          code_hash: string;
          consumed_at?: string | null;
          created_at?: string;
          expires_at: string;
          id?: string;
          phone_e164: string;
          salt: string;
        };
        Update: {
          attempts?: number;
          code_hash?: string;
          consumed_at?: string | null;
          created_at?: string;
          expires_at?: string;
          id?: string;
          phone_e164?: string;
          salt?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          is_admin: boolean;
          role: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          is_admin?: boolean;
          role?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          is_admin?: boolean;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T] extends { Row: infer R } ? R : never;
