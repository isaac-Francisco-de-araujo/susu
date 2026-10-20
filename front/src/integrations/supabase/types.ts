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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      studio_appointments: {
        Row: {
          client_id: string
          created_at: string
          duration_minutes: number
          id: string
          notes: string
          price_cents: number
          procedure_id: string
          starts_at: string
          status: string
        }
        Insert: {
          client_id: string
          created_at?: string
          duration_minutes: number
          id?: string
          notes?: string
          price_cents: number
          procedure_id: string
          starts_at: string
          status?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string
          price_cents?: number
          procedure_id?: string
          starts_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "studio_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_appointments_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "studio_procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_clients: {
        Row: {
          birthday: string | null
          created_at: string
          id: string
          name: string
          notes: string
          phone: string
        }
        Insert: {
          birthday?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string
          phone: string
        }
        Update: {
          birthday?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string
          phone?: string
        }
        Relationships: []
      }
      studio_financial_entries: {
        Row: {
          amount_cents: number
          appointment_id: string | null
          created_at: string
          description: string
          id: string
          kind: string
          occurred_on: string
          payment_method: string
        }
        Insert: {
          amount_cents: number
          appointment_id?: string | null
          created_at?: string
          description: string
          id?: string
          kind: string
          occurred_on: string
          payment_method: string
        }
        Update: {
          amount_cents?: number
          appointment_id?: string | null
          created_at?: string
          description?: string
          id?: string
          kind?: string
          occurred_on?: string
          payment_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_financial_entries_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "studio_appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_procedures: {
        Row: {
          active: boolean
          created_at: string
          description: string
          duration_minutes: number
          id: string
          image_url: string
          name: string
          price_cents: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string
          duration_minutes: number
          id?: string
          image_url?: string
          name: string
          price_cents: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          duration_minutes?: number
          id?: string
          image_url?: string
          name?: string
          price_cents?: number
        }
        Relationships: []
      }
      studio_user_roles: {
        Row: {
          role: Database["public"]["Enums"]["studio_role"]
          user_id: string
        }
        Insert: {
          role: Database["public"]["Enums"]["studio_role"]
          user_id: string
        }
        Update: {
          role?: Database["public"]["Enums"]["studio_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      studio_financial_summary: {
        Args: { _from: string; _to: string }
        Returns: Json
      }
      studio_is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      studio_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      studio_role: ["admin"],
    },
  },
} as const
