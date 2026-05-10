export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          created_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'cuenta_corriente' | 'tarjeta_credito'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'cuenta_corriente' | 'tarjeta_credito'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'cuenta_corriente' | 'tarjeta_credito'
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          is_active?: boolean
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          account_id: string
          category_id: string
          date: string
          merchant: string
          amount: number
          currency: 'CLP' | 'USD' | 'EUR' | 'JPY'
          amount_clp: number
          exchange_rate_used: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          category_id: string
          date: string
          merchant: string
          amount: number
          currency: 'CLP' | 'USD' | 'EUR' | 'JPY'
          amount_clp: number
          exchange_rate_used?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          category_id?: string
          date?: string
          merchant?: string
          amount?: number
          currency?: 'CLP' | 'USD' | 'EUR' | 'JPY'
          amount_clp?: number
          exchange_rate_used?: number
          created_at?: string
          updated_at?: string
        }
      }
      exchange_rates: {
        Row: {
          id: string
          from_currency: string
          to_currency: string
          rate: number
          fetched_at: string
        }
        Insert: {
          id?: string
          from_currency: string
          to_currency?: string
          rate: number
          fetched_at?: string
        }
        Update: {
          id?: string
          from_currency?: string
          to_currency?: string
          rate?: number
          fetched_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
