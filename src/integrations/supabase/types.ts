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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alunas: {
        Row: {
          created_at: string | null
          curso_atual: string | null
          cursos_adquiridos: Json | null
          data_cadastro: string
          data_primeira_compra: string | null
          data_ultima_compra: string | null
          email: string
          id: number
          nome: string
          observacoes_mentora: string | null
          observacoes_mentora_tabela: Json | null
          principais_dificuldades: string[] | null
          status: string | null
          tempo_base: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          curso_atual?: string | null
          cursos_adquiridos?: Json | null
          data_cadastro?: string
          data_primeira_compra?: string | null
          data_ultima_compra?: string | null
          email: string
          id?: number
          nome: string
          observacoes_mentora?: string | null
          observacoes_mentora_tabela?: Json | null
          principais_dificuldades?: string[] | null
          status?: string | null
          tempo_base?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          curso_atual?: string | null
          cursos_adquiridos?: Json | null
          data_cadastro?: string
          data_primeira_compra?: string | null
          data_ultima_compra?: string | null
          email?: string
          id?: number
          nome?: string
          observacoes_mentora?: string | null
          observacoes_mentora_tabela?: Json | null
          principais_dificuldades?: string[] | null
          status?: string | null
          tempo_base?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      aluno_cursos: {
        Row: {
          created_at: string | null
          id: number
          id_aluna: number
          id_curso: number
          id_versao: number | null
          status_evolucao: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          id_aluna: number
          id_curso: number
          id_versao?: number | null
          status_evolucao?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          id_aluna?: number
          id_curso?: number
          id_versao?: number | null
          status_evolucao?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aluno_cursos_id_aluna_fkey"
            columns: ["id_aluna"]
            isOneToOne: false
            referencedRelation: "alunas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aluno_cursos_id_curso_fkey"
            columns: ["id_curso"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aluno_cursos_id_versao_fkey"
            columns: ["id_versao"]
            isOneToOne: false
            referencedRelation: "curso_versoes"
            referencedColumns: ["id"]
          },
        ]
      }
      curso_versoes: {
        Row: {
          created_at: string | null
          data_fim_vigencia: string | null
          data_inicio_vigencia: string
          id: number
          id_curso: number
          updated_at: string | null
          user_id: string
          versao: string
        }
        Insert: {
          created_at?: string | null
          data_fim_vigencia?: string | null
          data_inicio_vigencia: string
          id?: number
          id_curso: number
          updated_at?: string | null
          user_id: string
          versao: string
        }
        Update: {
          created_at?: string | null
          data_fim_vigencia?: string | null
          data_inicio_vigencia?: string
          id?: number
          id_curso?: number
          updated_at?: string | null
          user_id?: string
          versao?: string
        }
        Relationships: [
          {
            foreignKeyName: "curso_versoes_id_curso_fkey"
            columns: ["id_curso"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      cursos: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: number
          nome: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: number
          nome: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: number
          nome?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fichas_compartilhadas: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          id_aluna: number
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          id_aluna: number
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          id_aluna?: number
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fichas_compartilhadas_id_aluna_fkey"
            columns: ["id_aluna"]
            isOneToOne: false
            referencedRelation: "alunas"
            referencedColumns: ["id"]
          },
        ]
      }
      observacoes_mentora: {
        Row: {
          created_at: string | null
          id: string
          id_aluna: number
          observacoes: string | null
          plano_acao: string
          prazo_execucao: string | null
          status: Database["public"]["Enums"]["observacao_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          id_aluna: number
          observacoes?: string | null
          plano_acao: string
          prazo_execucao?: string | null
          status?: Database["public"]["Enums"]["observacao_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          id_aluna?: number
          observacoes?: string | null
          plano_acao?: string
          prazo_execucao?: string | null
          status?: Database["public"]["Enums"]["observacao_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "observacoes_mentora_id_aluna_fkey"
            columns: ["id_aluna"]
            isOneToOne: false
            referencedRelation: "alunas"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_acao: {
        Row: {
          created_at: string | null
          data_fim_prevista: string | null
          data_fim_real: string | null
          data_inicio: string | null
          etapas: string[] | null
          etapas_concluidas: string[] | null
          id: number
          id_aluna: number
          objetivo: string
          resultado_esperado: string | null
          resultados_obtidos: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio?: string | null
          etapas?: string[] | null
          etapas_concluidas?: string[] | null
          id?: number
          id_aluna: number
          objetivo: string
          resultado_esperado?: string | null
          resultados_obtidos?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio?: string | null
          etapas?: string[] | null
          etapas_concluidas?: string[] | null
          id?: number
          id_aluna?: number
          objetivo?: string
          resultado_esperado?: string | null
          resultados_obtidos?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planos_acao_id_aluna_fkey"
            columns: ["id_aluna"]
            isOneToOne: false
            referencedRelation: "alunas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendas: {
        Row: {
          created_at: string | null
          id: number
          id_aluna: number
          observacoes: string | null
          periodo: string
          produtos: string[] | null
          user_id: string
          valor_vendido: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          id_aluna: number
          observacoes?: string | null
          periodo: string
          produtos?: string[] | null
          user_id: string
          valor_vendido?: number
        }
        Update: {
          created_at?: string | null
          id?: number
          id_aluna?: number
          observacoes?: string | null
          periodo?: string
          produtos?: string[] | null
          user_id?: string
          valor_vendido?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_id_aluna_fkey"
            columns: ["id_aluna"]
            isOneToOne: false
            referencedRelation: "alunas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_tempo_base: {
        Args: { p_data_cadastro: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      curso_status: "nao_iniciado" | "em_andamento" | "pausado" | "concluido"
      observacao_status:
        | "iniciado"
        | "em_andamento"
        | "cancelado"
        | "interrompido"
      plano_status: "iniciado" | "em_andamento" | "cancelado" | "interrompido"
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
      app_role: ["admin", "user"],
      curso_status: ["nao_iniciado", "em_andamento", "pausado", "concluido"],
      observacao_status: [
        "iniciado",
        "em_andamento",
        "cancelado",
        "interrompido",
      ],
      plano_status: ["iniciado", "em_andamento", "cancelado", "interrompido"],
    },
  },
} as const
