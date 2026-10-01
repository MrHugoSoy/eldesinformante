// Generado desde el esquema de Supabase (proyecto eldesinformante). No editar a mano:
// se vuelve a generar cuando cambian las migraciones.

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
      autores: {
        Row: {
          creado_en: string
          id: string
          medio_id: string | null
          nombre: string
          perfil_id: string | null
        }
        Insert: {
          creado_en?: string
          id?: string
          medio_id?: string | null
          nombre: string
          perfil_id?: string | null
        }
        Update: {
          creado_en?: string
          id?: string
          medio_id?: string | null
          nombre?: string
          perfil_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "autores_medio_id_fkey"
            columns: ["medio_id"]
            isOneToOne: false
            referencedRelation: "medios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autores_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autores_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "ranking_semanal"
            referencedColumns: ["id"]
          },
        ]
      }
      calificaciones: {
        Row: {
          contenido: number
          contexto: number
          creado_en: string
          fuente: number
          id: string
          noticia_id: string
          usuario_id: string
        }
        Insert: {
          contenido: number
          contexto: number
          creado_en?: string
          fuente: number
          id?: string
          noticia_id: string
          usuario_id?: string
        }
        Update: {
          contenido?: number
          contexto?: number
          creado_en?: string
          fuente?: number
          id?: string
          noticia_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calificaciones_noticia_id_fkey"
            columns: ["noticia_id"]
            isOneToOne: false
            referencedRelation: "feed_noticias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calificaciones_noticia_id_fkey"
            columns: ["noticia_id"]
            isOneToOne: false
            referencedRelation: "noticias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calificaciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calificaciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "ranking_semanal"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          nombre: string
          orden: number
          slug: string
        }
        Insert: {
          nombre: string
          orden?: number
          slug: string
        }
        Update: {
          nombre?: string
          orden?: number
          slug?: string
        }
        Relationships: []
      }
      comentarios: {
        Row: {
          autor_id: string
          creado_en: string
          destacado: boolean
          editado_en: string | null
          id: string
          noticia_id: string
          oculto: boolean
          texto: string
        }
        Insert: {
          autor_id?: string
          creado_en?: string
          destacado?: boolean
          editado_en?: string | null
          id?: string
          noticia_id: string
          oculto?: boolean
          texto: string
        }
        Update: {
          autor_id?: string
          creado_en?: string
          destacado?: boolean
          editado_en?: string | null
          id?: string
          noticia_id?: string
          oculto?: boolean
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comentarios_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "ranking_semanal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comentarios_noticia_id_fkey"
            columns: ["noticia_id"]
            isOneToOne: false
            referencedRelation: "feed_noticias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comentarios_noticia_id_fkey"
            columns: ["noticia_id"]
            isOneToOne: false
            referencedRelation: "noticias"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_reputacion: {
        Row: {
          creado_en: string
          id: string
          motivo: string
          origen_id: string | null
          puntos: number
          referencia_id: string | null
          usuario_id: string
        }
        Insert: {
          creado_en?: string
          id?: string
          motivo: string
          origen_id?: string | null
          puntos: number
          referencia_id?: string | null
          usuario_id: string
        }
        Update: {
          creado_en?: string
          id?: string
          motivo?: string
          origen_id?: string | null
          puntos?: number
          referencia_id?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_reputacion_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_reputacion_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "ranking_semanal"
            referencedColumns: ["id"]
          },
        ]
      }
      guardados: {
        Row: {
          creado_en: string
          noticia_id: string
          usuario_id: string
        }
        Insert: {
          creado_en?: string
          noticia_id: string
          usuario_id?: string
        }
        Update: {
          creado_en?: string
          noticia_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardados_noticia_id_fkey"
            columns: ["noticia_id"]
            isOneToOne: false
            referencedRelation: "feed_noticias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardados_noticia_id_fkey"
            columns: ["noticia_id"]
            isOneToOne: false
            referencedRelation: "noticias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardados_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardados_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "ranking_semanal"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          creado_en: string
          noticia_id: string
          usuario_id: string
        }
        Insert: {
          creado_en?: string
          noticia_id: string
          usuario_id?: string
        }
        Update: {
          creado_en?: string
          noticia_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_noticia_id_fkey"
            columns: ["noticia_id"]
            isOneToOne: false
            referencedRelation: "feed_noticias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_noticia_id_fkey"
            columns: ["noticia_id"]
            isOneToOne: false
            referencedRelation: "noticias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "ranking_semanal"
            referencedColumns: ["id"]
          },
        ]
      }
      medios: {
        Row: {
          creado_en: string
          dominio: string | null
          id: string
          logo_url: string | null
          nombre: string
          verificado: boolean
        }
        Insert: {
          creado_en?: string
          dominio?: string | null
          id?: string
          logo_url?: string | null
          nombre: string
          verificado?: boolean
        }
        Update: {
          creado_en?: string
          dominio?: string | null
          id?: string
          logo_url?: string | null
          nombre?: string
          verificado?: boolean
        }
        Relationships: []
      }
      notificaciones: {
        Row: {
          actor_id: string | null
          creado_en: string
          id: string
          leida: boolean
          noticia_id: string | null
          tipo: string
          usuario_id: string
        }
        Insert: {
          actor_id?: string | null
          creado_en?: string
          id?: string
          leida?: boolean
          noticia_id?: string | null
          tipo: string
          usuario_id: string
        }
        Update: {
          actor_id?: string | null
          creado_en?: string
          id?: string
          leida?: boolean
          noticia_id?: string | null
          tipo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_noticia_id_fkey"
            columns: ["noticia_id"]
            isOneToOne: false
            referencedRelation: "noticias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_comunidad: {
        Row: {
          autor_id: string
          creado_en: string
          estado: string
          fuente_url: string
          id: string
          moderada: boolean
          noticia_id: string
          texto: string
          votos_no_utiles: number
          votos_utiles: number
        }
        Insert: {
          autor_id?: string
          creado_en?: string
          estado?: string
          fuente_url: string
          id?: string
          moderada?: boolean
          noticia_id: string
          texto: string
          votos_no_utiles?: number
          votos_utiles?: number
        }
        Update: {
          autor_id?: string
          creado_en?: string
          estado?: string
          fuente_url?: string
          id?: string
          moderada?: boolean
          noticia_id?: string
          texto?: string
          votos_no_utiles?: number
          votos_utiles?: number
        }
        Relationships: [
          {
            foreignKeyName: "notas_comunidad_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_comunidad_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "ranking_semanal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_comunidad_noticia_id_fkey"
            columns: ["noticia_id"]
            isOneToOne: false
            referencedRelation: "feed_noticias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_comunidad_noticia_id_fkey"
            columns: ["noticia_id"]
            isOneToOne: false
            referencedRelation: "noticias"
            referencedColumns: ["id"]
          },
        ]
      }
      noticias: {
        Row: {
          autor_id: string | null
          busqueda: unknown
          categoria_slug: string
          ciudad: string | null
          contenido: string | null
          creado_en: string
          creado_por: string | null
          destacada: boolean
          estado: string
          id: string
          imagen_url: string | null
          publicado_en: string
          resumen: string
          slug: string
          titulo: string
          url_original: string | null
        }
        Insert: {
          autor_id?: string | null
          busqueda?: unknown
          categoria_slug: string
          ciudad?: string | null
          contenido?: string | null
          creado_en?: string
          creado_por?: string | null
          destacada?: boolean
          estado?: string
          id?: string
          imagen_url?: string | null
          publicado_en?: string
          resumen: string
          slug: string
          titulo: string
          url_original?: string | null
        }
        Update: {
          autor_id?: string | null
          busqueda?: unknown
          categoria_slug?: string
          ciudad?: string | null
          contenido?: string | null
          creado_en?: string
          creado_por?: string | null
          destacada?: boolean
          estado?: string
          id?: string
          imagen_url?: string | null
          publicado_en?: string
          resumen?: string
          slug?: string
          titulo?: string
          url_original?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "noticias_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "autores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noticias_categoria_slug_fkey"
            columns: ["categoria_slug"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "noticias_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noticias_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "ranking_semanal"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles: {
        Row: {
          avatar_url: string | null
          creado_en: string
          descripcion: string | null
          es_editor: boolean
          fuente_verificada: boolean
          id: string
          nombre: string
          puntos: number
          reputacion: number
          usuario: string | null
        }
        Insert: {
          avatar_url?: string | null
          creado_en?: string
          descripcion?: string | null
          es_editor?: boolean
          fuente_verificada?: boolean
          id: string
          nombre: string
          puntos?: number
          reputacion?: number
          usuario?: string | null
        }
        Update: {
          avatar_url?: string | null
          creado_en?: string
          descripcion?: string | null
          es_editor?: boolean
          fuente_verificada?: boolean
          id?: string
          nombre?: string
          puntos?: number
          reputacion?: number
          usuario?: string | null
        }
        Relationships: []
      }
      votos_nota: {
        Row: {
          creado_en: string
          nota_id: string
          usuario_id: string
          util: boolean
        }
        Insert: {
          creado_en?: string
          nota_id: string
          usuario_id?: string
          util: boolean
        }
        Update: {
          creado_en?: string
          nota_id?: string
          usuario_id?: string
          util?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "votos_nota_nota_id_fkey"
            columns: ["nota_id"]
            isOneToOne: false
            referencedRelation: "notas_comunidad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votos_nota_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votos_nota_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "ranking_semanal"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      credibilidad_autores: {
        Row: {
          autor_id: string | null
          contenido: number | null
          contexto: number | null
          fuente: number | null
          total_noticias: number | null
        }
        Relationships: [
          {
            foreignKeyName: "noticias_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "autores"
            referencedColumns: ["id"]
          },
        ]
      }
      credibilidad_medios: {
        Row: {
          contenido: number | null
          contexto: number | null
          fuente: number | null
          medio_id: string | null
          total_noticias: number | null
        }
        Relationships: [
          {
            foreignKeyName: "autores_medio_id_fkey"
            columns: ["medio_id"]
            isOneToOne: false
            referencedRelation: "medios"
            referencedColumns: ["id"]
          },
        ]
      }
      credibilidad_noticias: {
        Row: {
          contenido: number | null
          contexto: number | null
          fuente: number | null
          noticia_id: string | null
          total_calificaciones: number | null
        }
        Relationships: [
          {
            foreignKeyName: "calificaciones_noticia_id_fkey"
            columns: ["noticia_id"]
            isOneToOne: false
            referencedRelation: "feed_noticias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calificaciones_noticia_id_fkey"
            columns: ["noticia_id"]
            isOneToOne: false
            referencedRelation: "noticias"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_noticias: {
        Row: {
          autor_id: string | null
          categoria_slug: string | null
          ciudad: string | null
          contenido: string | null
          creado_en: string | null
          creado_por: string | null
          cred_contenido: number | null
          cred_contexto: number | null
          cred_fuente: number | null
          destacada: boolean | null
          estado: string | null
          id: string | null
          imagen_url: string | null
          publicado_en: string | null
          resumen: string | null
          slug: string | null
          titulo: string | null
          total_calificaciones: number | null
          total_comentarios: number | null
          total_likes: number | null
          url_original: string | null
        }
        Relationships: [
          {
            foreignKeyName: "noticias_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "autores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noticias_categoria_slug_fkey"
            columns: ["categoria_slug"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "noticias_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noticias_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "ranking_semanal"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_semanal: {
        Row: {
          avatar_url: string | null
          descripcion: string | null
          fuente_verificada: boolean | null
          id: string | null
          nombre: string | null
          puntos: number | null
          puntos_semana: number | null
          reputacion: number | null
          usuario: string | null
        }
        Relationships: []
      }
      tendencias_semana: {
        Row: {
          actividad: number | null
          nombre: string | null
          slug: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      editor_estado_nota: {
        Args: { p_estado: string; p_nota: string }
        Returns: undefined
      }
      editor_marcar_usuario: {
        Args: { p_editor?: boolean; p_fuente_verificada?: boolean; p_usuario: string }
        Returns: undefined
      }
      editor_moderar_comentario: {
        Args: { p_comentario: string; p_destacado?: boolean; p_oculto?: boolean }
        Returns: undefined
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
    Enums: {},
  },
} as const
