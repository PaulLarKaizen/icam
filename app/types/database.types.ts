export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.18'
  }
  public: {
    Tables: {
      icam_profiles: {
        Row: {
          account_status: string
          activated_at: string | null
          activated_by: string | null
          created_at: string
          display_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: string
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          display_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: string
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          display_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'icam_profiles_activated_by_fkey'
            columns: ['activated_by']
            isOneToOne: false
            referencedRelation: 'icam_profiles'
            referencedColumns: ['user_id']
          }
        ]
      }
      icam_roles: {
        Row: {
          created_at: string
          description: string
          role_code: string
          role_name: string
        }
        Insert: {
          created_at?: string
          description: string
          role_code: string
          role_name: string
        }
        Update: {
          created_at?: string
          description?: string
          role_code?: string
          role_name?: string
        }
        Relationships: []
      }
      icam_permissions: {
        Row: {
          created_at: string
          description: string
          permission_code: string
        }
        Insert: {
          created_at?: string
          description: string
          permission_code: string
        }
        Update: {
          created_at?: string
          description?: string
          permission_code?: string
        }
        Relationships: []
      }
      icam_role_permissions: {
        Row: {
          created_at: string
          permission_code: string
          role_code: string
        }
        Insert: {
          created_at?: string
          permission_code: string
          role_code: string
        }
        Update: {
          created_at?: string
          permission_code?: string
          role_code?: string
        }
        Relationships: [
          {
            foreignKeyName: 'icam_role_permissions_permission_code_fkey'
            columns: ['permission_code']
            isOneToOne: false
            referencedRelation: 'icam_permissions'
            referencedColumns: ['permission_code']
          },
          {
            foreignKeyName: 'icam_role_permissions_role_code_fkey'
            columns: ['role_code']
            isOneToOne: false
            referencedRelation: 'icam_roles'
            referencedColumns: ['role_code']
          },
        ]
      }
      icam_user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assignment_reason: string
          id: string
          revoked_at: string | null
          revoked_by: string | null
          revocation_reason: string | null
          role_code: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_reason: string
          id?: string
          revoked_at?: string | null
          revoked_by?: string | null
          revocation_reason?: string | null
          role_code: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_reason?: string
          id?: string
          revoked_at?: string | null
          revoked_by?: string | null
          revocation_reason?: string | null
          role_code?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'icam_user_roles_assigned_by_fkey'
            columns: ['assigned_by']
            isOneToOne: false
            referencedRelation: 'icam_profiles'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'icam_user_roles_revoked_by_fkey'
            columns: ['revoked_by']
            isOneToOne: false
            referencedRelation: 'icam_profiles'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'icam_user_roles_role_code_fkey'
            columns: ['role_code']
            isOneToOne: false
            referencedRelation: 'icam_roles'
            referencedColumns: ['role_code']
          },
          {
            foreignKeyName: 'icam_user_roles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'icam_profiles'
            referencedColumns: ['user_id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

type DefaultSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  TableName extends keyof DefaultSchema['Tables'],
  Schema extends keyof Database = 'public',
> = Database[Schema]['Tables'][TableName] extends {
  Row: infer R
}
  ? R
  : never

export type TablesInsert<
  TableName extends keyof DefaultSchema['Tables'],
  Schema extends keyof Database = 'public',
> = Database[Schema]['Tables'][TableName] extends {
  Insert: infer I
}
  ? I
  : never

export type TablesUpdate<
  TableName extends keyof DefaultSchema['Tables'],
  Schema extends keyof Database = 'public',
> = Database[Schema]['Tables'][TableName] extends {
  Update: infer U
}
  ? U
  : never

export type Enums<
  EnumName extends keyof DefaultSchema['Enums'],
  Schema extends keyof Database = 'public',
> = Database[Schema]['Enums'][EnumName]

export type CompositeTypes<
  CompositeTypeName extends keyof DefaultSchema['CompositeTypes'],
  Schema extends keyof Database = 'public',
> = Database[Schema]['CompositeTypes'][CompositeTypeName]

export const Constants = {
  public: {
    Enums: {},
  },
} as const
