export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      attempts: {
        Row: {
          ai_bad: string[]
          ai_good: string[]
          ai_score: number
          ai_summary: string
          answer: string
          correctness: number
          dose_msv_got: number
          id: string
          level_id: string
          option_id: string | null
          points_got: number
          reasoning: string | null
          task_id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          ai_bad?: string[]
          ai_good?: string[]
          ai_score?: number
          ai_summary?: string
          answer?: string
          correctness?: number
          dose_msv_got?: number
          id?: string
          level_id: string
          option_id?: string | null
          points_got?: number
          reasoning?: string | null
          task_id: string
          timestamp: string
          user_id?: string
        }
        Update: {
          ai_bad?: string[]
          ai_good?: string[]
          ai_score?: number
          ai_summary?: string
          answer?: string
          correctness?: number
          dose_msv_got?: number
          id?: string
          level_id?: string
          option_id?: string | null
          points_got?: number
          reasoning?: string | null
          task_id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempts_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      levels: {
        Row: {
          created_at: string
          id: string
          intro_text: string | null
          is_active: boolean
          ordering: number
          title: string
          topic_tag: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          intro_text?: string | null
          is_active?: boolean
          ordering: number
          title?: string
          topic_tag?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          intro_text?: string | null
          is_active?: boolean
          ordering?: number
          title?: string
          topic_tag?: string
          updated_at?: string
        }
        Relationships: []
      }
      options: {
        Row: {
          correctness: number
          cost: number
          dose_delta_msv: number
          id: string
          option_text: string
          points_awarded: number
          task_id: string
        }
        Insert: {
          correctness?: number
          cost?: number
          dose_delta_msv?: number
          id?: string
          option_text?: string
          points_awarded?: number
          task_id?: string
        }
        Update: {
          correctness?: number
          cost?: number
          dose_delta_msv?: number
          id?: string
          option_text?: string
          points_awarded?: number
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "options_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          evaluation_criteria: string
          example_answer: string
          id: string
          is_active: boolean
          level_id: string
          ordering: number
          prompt_text: string
          type: Database["public"]["Enums"]["task_type"]
        }
        Insert: {
          created_at?: string
          evaluation_criteria?: string
          example_answer?: string
          id?: string
          is_active?: boolean
          level_id?: string
          ordering: number
          prompt_text?: string
          type?: Database["public"]["Enums"]["task_type"]
        }
        Update: {
          created_at?: string
          evaluation_criteria?: string
          example_answer?: string
          id?: string
          is_active?: boolean
          level_id?: string
          ordering?: number
          prompt_text?: string
          type?: Database["public"]["Enums"]["task_type"]
        }
        Relationships: [
          {
            foreignKeyName: "tasks_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
        ]
      }
      user_level_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: string
          level_id: string
          started_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          level_id?: string
          started_at?: string
          user_id?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          level_id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_level_progress_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_level_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          email: string
          permission_level: Database["public"]["Enums"]["role"]
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          permission_level?: Database["public"]["Enums"]["role"]
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          permission_level?: Database["public"]["Enums"]["role"]
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          dose_msv: number
          knowledge_points: number
          user_id: string
        }
        Insert: {
          dose_msv?: number
          knowledge_points?: number
          user_id?: string
        }
        Update: {
          dose_msv?: number
          knowledge_points?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      role: "STUDENT" | "TEACHER" | "ADMIN"
      task_type: "MC" | "FREE"
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
    Enums: {
      role: ["STUDENT", "TEACHER", "ADMIN"],
      task_type: ["MC", "FREE"],
    },
  },
} as const

