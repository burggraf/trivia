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
          id: string
          lastname: string | null
          metadata: Json | null
          notes: string | null
          orgid: string
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
          id?: string
          lastname?: string | null
          metadata?: Json | null
          notes?: string | null
          orgid: string
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
          id?: string
          lastname?: string | null
          metadata?: Json | null
          notes?: string | null
          orgid?: string
          phone?: string | null
          postal?: string | null
          region?: string | null
          updated_at?: string
          userid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_orgid_fkey"
            columns: ["orgid"]
            isOneToOne: false
            referencedRelation: "orgs"
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
      orgs: {
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
      orgs_invites: {
        Row: {
          created_at: string
          created_by: string
          email: string
          expires_at: string
          id: string
          metadata: Json | null
          orgid: string
          user_role: string
        }
        Insert: {
          created_at?: string
          created_by: string
          email: string
          expires_at?: string
          id?: string
          metadata?: Json | null
          orgid: string
          user_role: string
        }
        Update: {
          created_at?: string
          created_by?: string
          email?: string
          expires_at?: string
          id?: string
          metadata?: Json | null
          orgid?: string
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "orgs_invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orgs_invites_orgid_fkey"
            columns: ["orgid"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      orgs_users: {
        Row: {
          created_at: string
          id: string
          orgid: string
          user_role: string
          userid: string
        }
        Insert: {
          created_at?: string
          id?: string
          orgid: string
          user_role: string
          userid: string
        }
        Update: {
          created_at?: string
          id?: string
          orgid?: string
          user_role?: string
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "orgs_users_orgid_fkey"
            columns: ["orgid"]
            isOneToOne: false
            referencedRelation: "orgs"
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
      properties: {
        Row: {
          address: string | null
          address2: string | null
          baths: number | null
          beds: number | null
          city: string | null
          country: string | null
          created_at: string
          hoa_fees: number | null
          id: string
          land_area: number | null
          lat: number | null
          living_area: number | null
          lng: number | null
          metadata: Json | null
          notes: string | null
          orgid: string
          postal: string | null
          property_subtype: string | null
          property_type: string | null
          region: string | null
          subtitle: string | null
          title: string | null
          userid: string
          year_built: number | null
        }
        Insert: {
          address?: string | null
          address2?: string | null
          baths?: number | null
          beds?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          hoa_fees?: number | null
          id?: string
          land_area?: number | null
          lat?: number | null
          living_area?: number | null
          lng?: number | null
          metadata?: Json | null
          notes?: string | null
          orgid: string
          postal?: string | null
          property_subtype?: string | null
          property_type?: string | null
          region?: string | null
          subtitle?: string | null
          title?: string | null
          userid: string
          year_built?: number | null
        }
        Update: {
          address?: string | null
          address2?: string | null
          baths?: number | null
          beds?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          hoa_fees?: number | null
          id?: string
          land_area?: number | null
          lat?: number | null
          living_area?: number | null
          lng?: number | null
          metadata?: Json | null
          notes?: string | null
          orgid?: string
          postal?: string | null
          property_subtype?: string | null
          property_type?: string | null
          region?: string | null
          subtitle?: string | null
          title?: string | null
          userid?: string
          year_built?: number | null
        }
        Relationships: []
      }
      properties_contacts: {
        Row: {
          contact_type: string
          contactid: string
          created_at: string
          id: string
          metadata: Json | null
          notes: string | null
          orgid: string
          propertyid: string
        }
        Insert: {
          contact_type: string
          contactid: string
          created_at?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          orgid: string
          propertyid: string
        }
        Update: {
          contact_type?: string
          contactid?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          orgid?: string
          propertyid?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_contacts_contactid_fkey"
            columns: ["contactid"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_contacts_orgid_fkey"
            columns: ["orgid"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_contacts_propertyid_fkey"
            columns: ["propertyid"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          balance: number
          contactid: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          metadata: Json | null
          notes: string | null
          orgid: string
          parentid: string | null
          propertyid: string
          start_date: string | null
          status: string
          type: string
          updated_at: string
          userid: string
        }
        Insert: {
          amount?: number
          balance?: number
          contactid?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          orgid: string
          parentid?: string | null
          propertyid: string
          start_date?: string | null
          status: string
          type: string
          updated_at?: string
          userid: string
        }
        Update: {
          amount?: number
          balance?: number
          contactid?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          orgid?: string
          parentid?: string | null
          propertyid?: string
          start_date?: string | null
          status?: string
          type?: string
          updated_at?: string
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_contactid_fkey"
            columns: ["contactid"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_orgid_fkey"
            columns: ["orgid"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_propertyid_fkey"
            columns: ["propertyid"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions_events: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          notes: string | null
          orgid: string
          propertyid: string
          status: string
          transactionid: string
          type: string
          updated_at: string
          userid: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          orgid: string
          propertyid: string
          status: string
          transactionid: string
          type: string
          updated_at?: string
          userid: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          orgid?: string
          propertyid?: string
          status?: string
          transactionid?: string
          type?: string
          updated_at?: string
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_events_orgid_fkey"
            columns: ["orgid"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_events_propertyid_fkey"
            columns: ["propertyid"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_events_transactionid_fkey"
            columns: ["transactionid"]
            isOneToOne: false
            referencedRelation: "transactions"
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
      get_my_orgids: {
        Args: Record<PropertyKey, never>
        Returns: {
          orgid: string
        }[]
      }
      get_my_orgs: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          created_at: string
          metadata: Json
          user_role: string
        }[]
      }
      get_org_role: {
        Args: {
          org_id: string
        }
        Returns: string
      }
      get_org_role_for_user: {
        Args: {
          org_id: string
          user_id: string
        }
        Returns: string
      }
      get_org_users: {
        Args: {
          org_id: string
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
      get_user_orgids: {
        Args: {
          p_userid: string
        }
        Returns: {
          orgid: string
        }[]
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
