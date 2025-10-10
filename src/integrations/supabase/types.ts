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
      activities: {
        Row: {
          completed: boolean
          created_at: string
          description: string
          id: string
          lead_id: string
          type: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          description: string
          id?: string
          lead_id: string
          type: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          description?: string
          id?: string
          lead_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_packages: {
        Row: {
          credits: number
          created_at: string
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          name: string
          price_brl: number
          updated_at: string
        }
        Insert: {
          credits: number
          created_at?: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price_brl: number
          updated_at?: string
        }
        Update: {
          credits?: number
          created_at?: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_brl?: number
          updated_at?: string
        }
        Relationships: []
      }
      credit_purchases: {
        Row: {
          amount_paid_brl: number
          completed_at: string | null
          created_at: string
          credits_purchased: number
          id: string
          package_id: string | null
          payment_method: string | null
          payment_status: string | null
          stripe_payment_id: string | null
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          amount_paid_brl: number
          completed_at?: string | null
          created_at?: string
          credits_purchased: number
          id?: string
          package_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          amount_paid_brl?: number
          completed_at?: string | null
          created_at?: string
          credits_purchased?: number
          id?: string
          package_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "credit_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_usage_history: {
        Row: {
          created_at: string
          credits_used: number
          domain: string | null
          email: string | null
          error_message: string | null
          id: string
          operation_type: string
          query_params: Json | null
          result_summary: Json | null
          success: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_used: number
          domain?: string | null
          email?: string | null
          error_message?: string | null
          id?: string
          operation_type: string
          query_params?: Json | null
          result_summary?: Json | null
          success?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          domain?: string | null
          email?: string | null
          error_message?: string | null
          id?: string
          operation_type?: string
          query_params?: Json | null
          result_summary?: Json | null
          success?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_usage_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          activities_count: number
          company: string
          created_at: string
          custom_fields: Json
          email: string
          first_name: string
          id: string
          is_archived: boolean
          job_title: string
          last_contact_date: string
          last_name: string
          next_follow_up: string | null
          notes_count: number
          phone: string
          pipeline_id: string
          priority: string
          revenue: number
          source: string
          stage_id: string
          tags: string[]
          temperature: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activities_count?: number
          company?: string
          created_at?: string
          custom_fields?: Json
          email: string
          first_name: string
          id?: string
          is_archived?: boolean
          job_title?: string
          last_contact_date?: string
          last_name: string
          next_follow_up?: string | null
          notes_count?: number
          phone?: string
          pipeline_id: string
          priority?: string
          revenue?: number
          source?: string
          stage_id: string
          tags?: string[]
          temperature?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activities_count?: number
          company?: string
          created_at?: string
          custom_fields?: Json
          email?: string
          first_name?: string
          id?: string
          is_archived?: boolean
          job_title?: string
          last_contact_date?: string
          last_name?: string
          next_follow_up?: string | null
          notes_count?: number
          phone?: string
          pipeline_id?: string
          priority?: string
          revenue?: number
          source?: string
          stage_id?: string
          tags?: string[]
          temperature?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string
          created_at: string
          id: string
          lead_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lead_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lead_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string
          created_at: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string
          created_at?: string
          full_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stages: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          order_index: number
          pipeline_id: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          order_index: number
          pipeline_id: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          order_index?: number
          pipeline_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          created_at: string
          credits: number
          id: string
          total_purchased: number | null
          total_used: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits?: number
          id?: string
          total_purchased?: number | null
          total_used?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          total_purchased?: number | null
          total_used?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: {
          p_user_id: string
          p_credits: number
          p_purchase_id?: string
        }
        Returns: boolean
      }
      debit_credits: {
        Args: {
          p_user_id: string
          p_credits: number
          p_operation_type: string
          p_domain?: string
          p_email?: string
          p_query_params?: Json
          p_result_summary?: Json
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
