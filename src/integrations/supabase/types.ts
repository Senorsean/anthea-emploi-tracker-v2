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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      candidate_modules: {
        Row: {
          assigned_at: string
          candidate_id: string
          consultant_id: string | null
          id: string
          is_active: boolean
          module_id: string
        }
        Insert: {
          assigned_at?: string
          candidate_id: string
          consultant_id?: string | null
          id?: string
          is_active?: boolean
          module_id: string
        }
        Update: {
          assigned_at?: string
          candidate_id?: string
          consultant_id?: string | null
          id?: string
          is_active?: boolean
          module_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      mobility_area: {
        Row: {
          allowed_cities: string[]
          allowed_departments: string[]
          base_address: string | null
          base_lat: number | null
          base_lng: number | null
          created_at: string
          hybrid_ok: boolean
          id: string
          is_active: boolean
          max_commute_time_min: number
          radius_km: number
          relocation_ok: boolean
          remote_ok: boolean
          travel_modes: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          allowed_cities?: string[]
          allowed_departments?: string[]
          base_address?: string | null
          base_lat?: number | null
          base_lng?: number | null
          created_at?: string
          hybrid_ok?: boolean
          id?: string
          is_active?: boolean
          max_commute_time_min?: number
          radius_km?: number
          relocation_ok?: boolean
          remote_ok?: boolean
          travel_modes?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          allowed_cities?: string[]
          allowed_departments?: string[]
          base_address?: string | null
          base_lat?: number | null
          base_lng?: number | null
          created_at?: string
          hybrid_ok?: boolean
          id?: string
          is_active?: boolean
          max_commute_time_min?: number
          radius_km?: number
          relocation_ok?: boolean
          remote_ok?: boolean
          travel_modes?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          route: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          route: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          route?: string
          updated_at?: string
        }
        Relationships: []
      }
      occupations: {
        Row: {
          aliases: string[] | null
          created_at: string
          id: string
          label: string
          updated_at: string
        }
        Insert: {
          aliases?: string[] | null
          created_at?: string
          id?: string
          label: string
          updated_at?: string
        }
        Update: {
          aliases?: string[] | null
          created_at?: string
          id?: string
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          color_scheme_id: number | null
          created_at: string
          custom_sections: Json | null
          education: Json | null
          experiences: Json | null
          id: string
          interests: Json | null
          is_public: boolean | null
          languages: Json | null
          pdf_url: string | null
          personal_info: Json
          qr_code_url: string | null
          skills: Json | null
          template_id: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color_scheme_id?: number | null
          created_at?: string
          custom_sections?: Json | null
          education?: Json | null
          experiences?: Json | null
          id?: string
          interests?: Json | null
          is_public?: boolean | null
          languages?: Json | null
          pdf_url?: string | null
          personal_info?: Json
          qr_code_url?: string | null
          skills?: Json | null
          template_id: number
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color_scheme_id?: number | null
          created_at?: string
          custom_sections?: Json | null
          education?: Json | null
          experiences?: Json | null
          id?: string
          interests?: Json | null
          is_public?: boolean | null
          languages?: Json | null
          pdf_url?: string | null
          personal_info?: Json
          qr_code_url?: string | null
          skills?: Json | null
          template_id?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_resumes: {
        Row: {
          access_count: number | null
          created_at: string
          expires_at: string | null
          id: string
          resume_id: string
          share_token: string
        }
        Insert: {
          access_count?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          resume_id: string
          share_token: string
        }
        Update: {
          access_count?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          resume_id?: string
          share_token?: string
        }
        Relationships: []
      }
      template_colors: {
        Row: {
          accent_color: string | null
          background_color: string | null
          color_name: string
          created_at: string
          id: number
          is_default: boolean | null
          primary_color: string
          secondary_color: string | null
          template_id: number
          text_color: string | null
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          color_name: string
          created_at?: string
          id?: number
          is_default?: boolean | null
          primary_color: string
          secondary_color?: string | null
          template_id: number
          text_color?: string | null
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          color_name?: string
          created_at?: string
          id?: number
          is_default?: boolean | null
          primary_color?: string
          secondary_color?: string | null
          template_id?: number
          text_color?: string | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          created_at: string
          css_styles: string
          description: string | null
          display_order: number | null
          html_template: string
          id: number
          is_active: boolean | null
          name: string
          preview_image_url: string | null
        }
        Insert: {
          created_at?: string
          css_styles: string
          description?: string | null
          display_order?: number | null
          html_template: string
          id?: number
          is_active?: boolean | null
          name: string
          preview_image_url?: string | null
        }
        Update: {
          created_at?: string
          css_styles?: string
          description?: string | null
          display_order?: number | null
          html_template?: string
          id?: number
          is_active?: boolean | null
          name?: string
          preview_image_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          is_active?: boolean
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      candidate_has_module_access: {
        Args: { _candidate_id: string; _module_id: string }
        Returns: boolean
      }
      get_candidate_modules: {
        Args: { _candidate_id: string }
        Returns: {
          assigned_at: string
          category: string
          description: string
          module_id: string
          module_name: string
          route: string
        }[]
      }
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
        }[]
      }
      get_shared_resume: {
        Args: { token: string }
        Returns: {
          color_scheme_id: number
          custom_sections: Json
          education: Json
          experiences: Json
          interests: Json
          is_public: boolean
          languages: Json
          pdf_url: string
          personal_info: Json
          qr_code_url: string
          resume_id: string
          skills: Json
          template_id: number
          title: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_candidat: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_consultant: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "consultant" | "candidat"
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
      app_role: ["admin", "consultant", "candidat"],
    },
  },
} as const
