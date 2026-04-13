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
  public: {
    Tables: {
      agent_logs: {
        Row: {
          action: string
          agent_type: string
          created_at: string
          details: Json | null
          id: string
          project_id: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          action: string
          agent_type: string
          created_at?: string
          details?: Json | null
          id?: string
          project_id?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          agent_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          project_id?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      generated_apps: {
        Row: {
          code_snapshot: Json | null
          created_at: string
          deploy_url: string | null
          id: string
          project_id: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          code_snapshot?: Json | null
          created_at?: string
          deploy_url?: string | null
          id?: string
          project_id: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          code_snapshot?: Json | null
          created_at?: string
          deploy_url?: string | null
          id?: string
          project_id?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "generated_apps_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      managed_agents: {
        Row: {
          agent_native_score: number | null
          anthropic_agent_id: string | null
          created_at: string
          id: string
          mcp_config: Json | null
          metadata: Json | null
          model: string
          name: string
          sandbox_config: Json | null
          status: string
          system_prompt: string | null
          tools: Json
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          agent_native_score?: number | null
          anthropic_agent_id?: string | null
          created_at?: string
          id?: string
          mcp_config?: Json | null
          metadata?: Json | null
          model?: string
          name: string
          sandbox_config?: Json | null
          status?: string
          system_prompt?: string | null
          tools?: Json
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          agent_native_score?: number | null
          anthropic_agent_id?: string | null
          created_at?: string
          id?: string
          mcp_config?: Json | null
          metadata?: Json | null
          model?: string
          name?: string
          sandbox_config?: Json | null
          status?: string
          system_prompt?: string | null
          tools?: Json
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      managed_environments: {
        Row: {
          agent_id: string | null
          anthropic_environment_id: string | null
          config: Json | null
          created_at: string
          id: string
          name: string
          packages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          anthropic_environment_id?: string | null
          config?: Json | null
          created_at?: string
          id?: string
          name?: string
          packages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          anthropic_environment_id?: string | null
          config?: Json | null
          created_at?: string
          id?: string
          name?: string
          packages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "managed_environments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "managed_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      managed_events: {
        Row: {
          approval_status: string | null
          created_at: string
          event_data: Json
          event_type: string
          id: string
          requires_approval: boolean
          session_id: string
        }
        Insert: {
          approval_status?: string | null
          created_at?: string
          event_data?: Json
          event_type: string
          id?: string
          requires_approval?: boolean
          session_id: string
        }
        Update: {
          approval_status?: string | null
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          requires_approval?: boolean
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "managed_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "managed_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      managed_sessions: {
        Row: {
          agent_id: string
          anthropic_session_id: string | null
          approval_mode: string
          cost_data: Json | null
          created_at: string
          environment_id: string | null
          id: string
          last_event_at: string | null
          metadata: Json | null
          status: string
          updated_at: string
          user_id: string
          workflow_run_id: string | null
        }
        Insert: {
          agent_id: string
          anthropic_session_id?: string | null
          approval_mode?: string
          cost_data?: Json | null
          created_at?: string
          environment_id?: string | null
          id?: string
          last_event_at?: string | null
          metadata?: Json | null
          status?: string
          updated_at?: string
          user_id: string
          workflow_run_id?: string | null
        }
        Update: {
          agent_id?: string
          anthropic_session_id?: string | null
          approval_mode?: string
          cost_data?: Json | null
          created_at?: string
          environment_id?: string | null
          id?: string
          last_event_at?: string | null
          metadata?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
          workflow_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "managed_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "managed_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "managed_sessions_environment_id_fkey"
            columns: ["environment_id"]
            isOneToOne: false
            referencedRelation: "managed_environments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "managed_sessions_workflow_run_id_fkey"
            columns: ["workflow_run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          paid_at: string | null
          project_id: string | null
          revenuecat_id: string | null
          status: string
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          paid_at?: string | null
          project_id?: string | null
          revenuecat_id?: string | null
          status?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          paid_at?: string | null
          project_id?: string | null
          revenuecat_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_admin: boolean
          project_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_admin?: boolean
          project_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_admin?: boolean
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_submissions: {
        Row: {
          budget_range: string | null
          created_at: string
          description: string
          features: string | null
          id: string
          project_name: string
          project_type: string
          status: string
          tech_requirements: string | null
          timeline: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_range?: string | null
          created_at?: string
          description: string
          features?: string | null
          id?: string
          project_name: string
          project_type: string
          status?: string
          tech_requirements?: string | null
          timeline?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_range?: string | null
          created_at?: string
          description?: string
          features?: string | null
          id?: string
          project_name?: string
          project_type?: string
          status?: string
          tech_requirements?: string | null
          timeline?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          assigned_to: string | null
          client_id: string
          created_at: string
          description: string | null
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          ai_reasoning: string | null
          counter_offer_details: Json | null
          created_at: string
          currency: string
          id: string
          price: number
          project_id: string | null
          proposed_scope: string
          status: string
          timeline: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_reasoning?: string | null
          counter_offer_details?: Json | null
          created_at?: string
          currency?: string
          id?: string
          price?: number
          project_id?: string | null
          proposed_scope: string
          status?: string
          timeline?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_reasoning?: string | null
          counter_offer_details?: Json | null
          created_at?: string
          currency?: string
          id?: string
          price?: number
          project_id?: string | null
          proposed_scope?: string
          status?: string
          timeline?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workflow_runs: {
        Row: {
          agent_native_score: Json | null
          agent_results: Json | null
          architecture_json: Json | null
          client_id: string | null
          client_name: string | null
          created_at: string
          current_status: string
          deployment_type: string | null
          final_agreed_quote: Json | null
          generated_code_bundle: string | null
          id: string
          live_app_url: string | null
          metadata: Json | null
          negotiation_history: Json | null
          planner_output: Json | null
          project_description: string | null
          project_id: string | null
          quote_data: Json | null
          raw_client_prompt: string
          status_history: Json | null
          stripe_session_id: string | null
          super_admin_override: Json | null
          updated_at: string
          user_id: string
          validation_passed: boolean | null
        }
        Insert: {
          agent_native_score?: Json | null
          agent_results?: Json | null
          architecture_json?: Json | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          current_status?: string
          deployment_type?: string | null
          final_agreed_quote?: Json | null
          generated_code_bundle?: string | null
          id?: string
          live_app_url?: string | null
          metadata?: Json | null
          negotiation_history?: Json | null
          planner_output?: Json | null
          project_description?: string | null
          project_id?: string | null
          quote_data?: Json | null
          raw_client_prompt?: string
          status_history?: Json | null
          stripe_session_id?: string | null
          super_admin_override?: Json | null
          updated_at?: string
          user_id: string
          validation_passed?: boolean | null
        }
        Update: {
          agent_native_score?: Json | null
          agent_results?: Json | null
          architecture_json?: Json | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          current_status?: string
          deployment_type?: string | null
          final_agreed_quote?: Json | null
          generated_code_bundle?: string | null
          id?: string
          live_app_url?: string | null
          metadata?: Json | null
          negotiation_history?: Json | null
          planner_output?: Json | null
          project_description?: string | null
          project_id?: string | null
          quote_data?: Json | null
          raw_client_prompt?: string
          status_history?: Json | null
          stripe_session_id?: string | null
          super_admin_override?: Json | null
          updated_at?: string
          user_id?: string
          validation_passed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_runs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client"
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
  public: {
    Enums: {
      app_role: ["admin", "client"],
    },
  },
} as const
