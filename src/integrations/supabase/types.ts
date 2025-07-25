export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      custom_orders: {
        Row: {
          created_at: string
          custom_order: number[]
          id: string
          order_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_order: number[]
          id?: string
          order_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_order?: number[]
          id?: string
          order_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string | null
          created_at: string | null
          description: string | null
          id: string
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      juz_memorization: {
        Row: {
          created_at: string | null
          date_memorized: string | null
          end_page: number | null
          id: string
          is_memorized: boolean
          juz_number: number
          memorized_surahs: number[] | null
          start_page: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date_memorized?: string | null
          end_page?: number | null
          id?: string
          is_memorized?: boolean
          juz_number: number
          memorized_surahs?: number[] | null
          start_page?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date_memorized?: string | null
          end_page?: number | null
          id?: string
          is_memorized?: boolean
          juz_number?: number
          memorized_surahs?: number[] | null
          start_page?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      memorization_planner_schedule: {
        Row: {
          completed: boolean
          created_at: string | null
          date: string
          end_line: number
          id: string
          is_overdue: boolean
          is_postponed: boolean
          page: number
          postponed_from_date: string | null
          postponed_to_date: string | null
          start_line: number
          surah: string
          task: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean
          created_at?: string | null
          date: string
          end_line: number
          id?: string
          is_overdue?: boolean
          is_postponed?: boolean
          page: number
          postponed_from_date?: string | null
          postponed_to_date?: string | null
          start_line: number
          surah: string
          task: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean
          created_at?: string | null
          date?: string
          end_line?: number
          id?: string
          is_overdue?: boolean
          is_postponed?: boolean
          page?: number
          postponed_from_date?: string | null
          postponed_to_date?: string | null
          start_line?: number
          surah?: string
          task?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      memorization_planner_settings: {
        Row: {
          created_at: string | null
          days_of_week: string[]
          id: string
          juz_order: string
          lines_per_day: number
          start_date: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          days_of_week?: string[]
          id?: string
          juz_order?: string
          lines_per_day?: number
          start_date?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          days_of_week?: string[]
          id?: string
          juz_order?: string
          lines_per_day?: number
          start_date?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      murajah_daily_cycles: {
        Row: {
          completed: boolean
          content: string
          created_at: string
          cycle_type: string
          date: string
          id: string
          is_overdue: boolean
          is_postponed: boolean
          original_date: string | null
          postponed_to_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          content: string
          created_at?: string
          cycle_type: string
          date: string
          id?: string
          is_overdue?: boolean
          is_postponed?: boolean
          original_date?: string | null
          postponed_to_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          content?: string
          created_at?: string
          cycle_type?: string
          date?: string
          id?: string
          is_overdue?: boolean
          is_postponed?: boolean
          original_date?: string | null
          postponed_to_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      postponed_murajah_cycles: {
        Row: {
          content: string
          created_at: string
          cycle_type: string
          id: string
          original_date: string
          postponed_from_date: string
          target_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          cycle_type: string
          id?: string
          original_date: string
          postponed_from_date: string
          target_date: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          cycle_type?: string
          id?: string
          original_date?: string
          postponed_from_date?: string
          target_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      weak_spots: {
        Row: {
          ayah_number: number
          created_at: string
          id: string
          status: string
          surah_number: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ayah_number: number
          created_at?: string
          id?: string
          status?: string
          surah_number: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ayah_number?: number
          created_at?: string
          id?: string
          status?: string
          surah_number?: number
          updated_at?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
