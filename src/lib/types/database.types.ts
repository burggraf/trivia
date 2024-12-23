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
      categories: {
        Row: {
          created_at: string
          id: number
          title: string
        }
        Insert: {
          created_at?: string
          id?: number
          title: string
        }
        Update: {
          created_at?: string
          id?: number
          title?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          address: string | null
          address2: string | null
          city: string | null
          contact_type: string | null
          country: string | null
          created_at: string
          email: string | null
          firstname: string | null
          groupid: string
          id: string
          lastname: string | null
          metadata: Json | null
          notes: string | null
          phone: string | null
          postal: string | null
          region: string | null
          updated_at: string
          userid: string | null
        }
        Insert: {
          address?: string | null
          address2?: string | null
          city?: string | null
          contact_type?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          firstname?: string | null
          groupid: string
          id?: string
          lastname?: string | null
          metadata?: Json | null
          notes?: string | null
          phone?: string | null
          postal?: string | null
          region?: string | null
          updated_at?: string
          userid?: string | null
        }
        Update: {
          address?: string | null
          address2?: string | null
          city?: string | null
          contact_type?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          firstname?: string | null
          groupid?: string
          id?: string
          lastname?: string | null
          metadata?: Json | null
          notes?: string | null
          phone?: string | null
          postal?: string | null
          region?: string | null
          updated_at?: string
          userid?: string | null
        }
        Relationships: []
      }
      duplicates: {
        Row: {
          a: string | null
          b: string | null
          c: string | null
          category: string | null
          created_at: string | null
          d: string | null
          difficulty: string | null
          duplicate_id: string | null
          embedding: string | null
          id: string | null
          metadata: Json | null
          question: string | null
          subcategory: string | null
          updated_at: string | null
        }
        Insert: {
          a?: string | null
          b?: string | null
          c?: string | null
          category?: string | null
          created_at?: string | null
          d?: string | null
          difficulty?: string | null
          duplicate_id?: string | null
          embedding?: string | null
          id?: string | null
          metadata?: Json | null
          question?: string | null
          subcategory?: string | null
          updated_at?: string | null
        }
        Update: {
          a?: string | null
          b?: string | null
          c?: string | null
          category?: string | null
          created_at?: string | null
          d?: string | null
          difficulty?: string | null
          duplicate_id?: string | null
          embedding?: string | null
          id?: string | null
          metadata?: Json | null
          question?: string | null
          subcategory?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      games: {
        Row: {
          created_at: string
          gamestate: string | null
          groupid: string
          id: string
          metadata: Json | null
          questions: string[] | null
        }
        Insert: {
          created_at?: string
          gamestate?: string | null
          groupid: string
          id?: string
          metadata?: Json | null
          questions?: string[] | null
        }
        Update: {
          created_at?: string
          gamestate?: string | null
          groupid?: string
          id?: string
          metadata?: Json | null
          questions?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "game_groupid_fkey"
            columns: ["groupid"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      games_answers: {
        Row: {
          answer: string
          correct: number | null
          created_at: string
          gameid: string
          id: string
          questionid: string
          userid: string
        }
        Insert: {
          answer: string
          correct?: number | null
          created_at?: string
          gameid: string
          id?: string
          questionid: string
          userid: string
        }
        Update: {
          answer?: string
          correct?: number | null
          created_at?: string
          gameid?: string
          id?: string
          questionid?: string
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_answers_gameid_fkey"
            columns: ["gameid"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_answers_questionid_fkey"
            columns: ["questionid"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_answers_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      games_keys: {
        Row: {
          id: string
          keys: string[]
        }
        Insert: {
          id: string
          keys: string[]
        }
        Update: {
          id?: string
          keys?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "games_keys_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games_users: {
        Row: {
          created_at: string
          gameid: string
          groupid: string | null
          id: string
          userid: string
        }
        Insert: {
          created_at?: string
          gameid: string
          groupid?: string | null
          id?: string
          userid: string
        }
        Update: {
          created_at?: string
          gameid?: string
          groupid?: string | null
          id?: string
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_users_gameid_fkey"
            columns: ["gameid"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_users_groupid_fkey"
            columns: ["groupid"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_users_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          title?: string
        }
        Relationships: []
      }
      groups_invites: {
        Row: {
          created_at: string
          created_by: string
          email: string
          expires_at: string
          groupid: string
          id: string
          metadata: Json | null
          user_role: string
        }
        Insert: {
          created_at?: string
          created_by: string
          email: string
          expires_at?: string
          groupid: string
          id?: string
          metadata?: Json | null
          user_role: string
        }
        Update: {
          created_at?: string
          created_by?: string
          email?: string
          expires_at?: string
          groupid?: string
          id?: string
          metadata?: Json | null
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_invites_groupid_fkey"
            columns: ["groupid"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups_users: {
        Row: {
          created_at: string
          groupid: string
          id: string
          user_role: string
          userid: string
        }
        Insert: {
          created_at?: string
          groupid: string
          id?: string
          user_role: string
          userid: string
        }
        Update: {
          created_at?: string
          groupid?: string
          id?: string
          user_role?: string
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_users_groupid_fkey"
            columns: ["groupid"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string
          id: string
          message: string | null
          metadata: Json | null
          sender: string | null
          sender_deleted_at: string | null
          sender_type: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          sender?: string | null
          sender_deleted_at?: string | null
          sender_type?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          sender?: string | null
          sender_deleted_at?: string | null
          sender_type?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_fkey"
            columns: ["sender"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages_recipients: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          messageid: string | null
          read_at: string | null
          recipient: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          messageid?: string | null
          read_at?: string | null
          recipient?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          messageid?: string | null
          read_at?: string | null
          recipient?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipients_messageid_fkey"
            columns: ["messageid"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipients_recipient_fkey1"
            columns: ["recipient"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          email: string
          firstname: string | null
          id: string
          lastname: string | null
          metadata: Json | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email: string
          firstname?: string | null
          id: string
          lastname?: string | null
          metadata?: Json | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string
          firstname?: string | null
          id?: string
          lastname?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          a: string | null
          b: string | null
          c: string | null
          category: string | null
          created_at: string
          d: string | null
          difficulty: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          question: string | null
          subcategory: string | null
          updated_at: string | null
        }
        Insert: {
          a?: string | null
          b?: string | null
          c?: string | null
          category?: string | null
          created_at?: string
          d?: string | null
          difficulty?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          question?: string | null
          subcategory?: string | null
          updated_at?: string | null
        }
        Update: {
          a?: string | null
          b?: string | null
          c?: string | null
          category?: string | null
          created_at?: string
          d?: string | null
          difficulty?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          question?: string | null
          subcategory?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      similar_questions: {
        Row: {
          created_at: string
          id: string
          id1: string
          id2: string
          similarity: number
        }
        Insert: {
          created_at?: string
          id?: string
          id1: string
          id2: string
          similarity: number
        }
        Update: {
          created_at?: string
          id?: string
          id1?: string
          id2?: string
          similarity?: number
        }
        Relationships: []
      }
      users_questions: {
        Row: {
          chosen: string | null
          correct: number | null
          created_at: string
          id: string
          questionid: string
          userid: string
        }
        Insert: {
          chosen?: string | null
          correct?: number | null
          created_at?: string
          id?: string
          questionid: string
          userid: string
        }
        Update: {
          chosen?: string | null
          correct?: number | null
          created_at?: string
          id?: string
          questionid?: string
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_questions_questionid_fkey"
            columns: ["questionid"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invite: {
        Args: {
          invite_id: string
        }
        Returns: boolean
      }
      find_and_insert_similar_questions: {
        Args: {
          offset_val: number
        }
        Returns: Json
      }
      get_game_status: {
        Args: {
          p_gameid: string
        }
        Returns: string
      }
      get_group_role: {
        Args: {
          group_id: string
        }
        Returns: string
      }
      get_group_role_for_user: {
        Args: {
          group_id: string
          user_id: string
        }
        Returns: string
      }
      get_group_users: {
        Args: {
          group_id: string
        }
        Returns: {
          id: string
          created_at: string
          user_role: string
          email: string
          last_sign_in_at: string
          raw_user_meta_data: Json
        }[]
      }
      get_my_groupids: {
        Args: Record<PropertyKey, never>
        Returns: {
          groupid: string
        }[]
      }
      get_my_groups: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          created_at: string
          metadata: Json
          user_role: string
        }[]
      }
      get_random_unseen_questions: {
        Args: {
          p_user_ids: string[]
          p_categories?: string[]
          p_difficulties?: string[]
          p_limit?: number
        }
        Returns: {
          id: string
          question: string
          a: string
          b: string
          c: string
          d: string
          category: string
          difficulty: string
        }[]
      }
      get_user_groupids: {
        Args: {
          p_userid: string
        }
        Returns: {
          groupid: string
        }[]
      }
      insert_game_answer: {
        Args: {
          p_userid: string
          p_gameid: string
          p_questionid: string
          p_answer: string
          p_question_index: number
        }
        Returns: undefined
      }
      is_backup_running: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      reject_invite: {
        Args: {
          invite_id: string
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
