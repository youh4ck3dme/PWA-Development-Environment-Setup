export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          is_pro: boolean;
          pro_unlocked_at: string | null;
          stripe_customer_id: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          is_pro?: boolean;
          pro_unlocked_at?: string | null;
          stripe_customer_id?: string | null;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          is_pro?: boolean;
          pro_unlocked_at?: string | null;
          stripe_customer_id?: string | null;
        };
        Relationships: [];
      };
      items: {
        Row: {
          id: string;
          owner_id: string;
          sku: string;
          name: string;
          category: string | null;
          quantity: number;
          reorder_point: number;
          location: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          sku: string;
          name: string;
          category?: string | null;
          quantity?: number;
          reorder_point?: number;
          location?: string | null;
          updated_at?: string;
        };
        Update: {
          sku?: string;
          name?: string;
          category?: string | null;
          quantity?: number;
          reorder_point?: number;
          location?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      stock_movements: {
        Row: {
          id: string;
          owner_id: string;
          item_id: string;
          delta: number;
          reason: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          item_id: string;
          delta: number;
          reason: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          notes?: string | null;
        };
        Relationships: [];
      };
      offline_sync_queue: {
        Row: {
          id: string;
          owner_id: string;
          operation: Json;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          operation: Json;
          status?: string;
          created_at?: string;
        };
        Update: {
          status?: string;
        };
        Relationships: [];
      };
      notification_subscriptions: {
        Row: {
          id: string;
          owner_id: string;
          endpoint: string;
          subscription: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          endpoint: string;
          subscription: Json;
          created_at?: string;
        };
        Update: {
          subscription?: Json;
        };
        Relationships: [];
      };
      checkout_sessions: {
        Row: {
          id: string;
          owner_id: string;
          stripe_checkout_session_id: string;
          payment_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          stripe_checkout_session_id: string;
          payment_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          payment_status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
