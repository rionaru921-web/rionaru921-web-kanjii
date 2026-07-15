export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      manual_plan_members: {
        Row: {
          attendance_status: string
          created_at: string
          email: string | null
          guest_secret: string | null
          id: string
          name: string
          note: string | null
          organizer_discount: string | null
          plan_id: string
          role: string
          tier_level: string
          updated_at: string
          weight_override: number | null
        }
        Insert: {
          attendance_status?: string
          created_at?: string
          email?: string | null
          guest_secret?: string | null
          id?: string
          name: string
          note?: string | null
          organizer_discount?: string | null
          plan_id: string
          role?: string
          tier_level?: string
          updated_at?: string
          weight_override?: number | null
        }
        Update: {
          attendance_status?: string
          created_at?: string
          email?: string | null
          guest_secret?: string | null
          id?: string
          name?: string
          note?: string | null
          organizer_discount?: string | null
          plan_id?: string
          role?: string
          tier_level?: string
          updated_at?: string
          weight_override?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "manual_plan_members_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "manual_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_plans: {
        Row: {
          created_at: string
          dietary_notes: string | null
          end_date: string | null
          event_date: string | null
          fee_amount: number | null
          fee_breakdown: Json
          id: string
          is_shared: boolean
          memo: string | null
          payment_deadline: string | null
          payment_methods: Json
          rounding_unit: number
          share_token: string
          split_mode: string
          status: string
          title: string
          updated_at: string
          user_id: string
          venue_address: string | null
          venue_hotpepper_id: string | null
          venue_lat: number | null
          venue_lng: number | null
          venue_map_url: string | null
          venue_name: string | null
          venue_url: string | null
        }
        Insert: {
          created_at?: string
          dietary_notes?: string | null
          end_date?: string | null
          event_date?: string | null
          fee_amount?: number | null
          fee_breakdown?: Json
          id?: string
          is_shared?: boolean
          memo?: string | null
          payment_deadline?: string | null
          payment_methods?: Json
          rounding_unit?: number
          share_token?: string
          split_mode?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
          venue_address?: string | null
          venue_hotpepper_id?: string | null
          venue_lat?: number | null
          venue_lng?: number | null
          venue_map_url?: string | null
          venue_name?: string | null
          venue_url?: string | null
        }
        Update: {
          created_at?: string
          dietary_notes?: string | null
          end_date?: string | null
          event_date?: string | null
          fee_amount?: number | null
          fee_breakdown?: Json
          id?: string
          is_shared?: boolean
          memo?: string | null
          payment_deadline?: string | null
          payment_methods?: Json
          rounding_unit?: number
          share_token?: string
          split_mode?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          venue_address?: string | null
          venue_hotpepper_id?: string | null
          venue_lat?: number | null
          venue_lng?: number | null
          venue_map_url?: string | null
          venue_name?: string | null
          venue_url?: string | null
        }
        Relationships: []
      }
      nomikai_history: {
        Row: {
          budget_per_person: number | null
          created_at: string | null
          id: string
          memo: string | null
          participant_count: number | null
          participants: Json | null
          restaurant_address: string | null
          restaurant_genre: string | null
          restaurant_name: string | null
          scheduled_at: string | null
          title: string
          total_amount: number | null
          user_id: string
          warikan_result: Json | null
        }
        Insert: {
          budget_per_person?: number | null
          created_at?: string | null
          id?: string
          memo?: string | null
          participant_count?: number | null
          participants?: Json | null
          restaurant_address?: string | null
          restaurant_genre?: string | null
          restaurant_name?: string | null
          scheduled_at?: string | null
          title: string
          total_amount?: number | null
          user_id: string
          warikan_result?: Json | null
        }
        Update: {
          budget_per_person?: number | null
          created_at?: string | null
          id?: string
          memo?: string | null
          participant_count?: number | null
          participants?: Json | null
          restaurant_address?: string | null
          restaurant_genre?: string | null
          restaurant_name?: string | null
          scheduled_at?: string | null
          title?: string
          total_amount?: number | null
          user_id?: string
          warikan_result?: Json | null
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          bank_account_holder: string | null
          bank_account_number: string | null
          bank_account_type: string | null
          bank_branch: string | null
          bank_name: string | null
          created_at: string | null
          id: string
          line_pay_id: string | null
          memo: string | null
          paypay_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_account_type?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          created_at?: string | null
          id?: string
          line_pay_id?: string | null
          memo?: string | null
          paypay_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_account_type?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          created_at?: string | null
          id?: string
          line_pay_id?: string | null
          memo?: string | null
          paypay_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          is_premium: boolean | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          is_premium?: boolean | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_premium?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      share_tokens: {
        Row: {
          created_at: string | null
          expires_at: string | null
          history_id: string
          history_type: string
          token: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          history_id: string
          history_type: string
          token: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          history_id?: string
          history_type?: string
          token?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      travel_history: {
        Row: {
          budget_per_person: number | null
          budget_split: Json | null
          created_at: string | null
          destination: string | null
          end_date: string | null
          id: string
          memo: string | null
          participant_count: number | null
          participants: Json | null
          plan_data: Json | null
          start_date: string | null
          title: string
          total_amount: number | null
          user_id: string
        }
        Insert: {
          budget_per_person?: number | null
          budget_split?: Json | null
          created_at?: string | null
          destination?: string | null
          end_date?: string | null
          id?: string
          memo?: string | null
          participant_count?: number | null
          participants?: Json | null
          plan_data?: Json | null
          start_date?: string | null
          title: string
          total_amount?: number | null
          user_id: string
        }
        Update: {
          budget_per_person?: number | null
          budget_split?: Json | null
          created_at?: string | null
          destination?: string | null
          end_date?: string | null
          id?: string
          memo?: string | null
          participant_count?: number | null
          participants?: Json | null
          plan_data?: Json | null
          start_date?: string | null
          title?: string
          total_amount?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
