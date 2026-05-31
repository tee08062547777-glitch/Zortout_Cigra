import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          pid: number;
          sku: string;
          product_name: string;
          full_name: string;
          variant: string | null;
          stock: number;
          unit: string | null;
          image_url: string | null;
          updated_at: string;
        };
        Insert: Omit<
          {
            pid: number;
            sku: string;
            product_name: string;
            full_name: string;
            variant: string | null;
            stock: number;
            unit: string | null;
            image_url: string | null;
            updated_at: string;
          },
          "updated_at"
        > & {
          updated_at?: string;
        };
        Update: Partial<{
          pid: number;
          sku: string;
          product_name: string;
          full_name: string;
          variant: string | null;
          stock: number;
          unit: string | null;
          image_url: string | null;
          updated_at: string;
        }>;
      };
      sync_settings: {
        Row: {
          id: string;
          user_id: string;
          auto_sync_enabled: boolean;
          sync_interval_minutes: number;
          last_sync_by_user_id: string | null;
          last_sync_by_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          {
            id: string;
            user_id: string;
            auto_sync_enabled: boolean;
            sync_interval_minutes: number;
            last_sync_by_user_id: string | null;
            last_sync_by_email: string | null;
            created_at: string;
            updated_at: string;
          },
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<{
          auto_sync_enabled: boolean;
          sync_interval_minutes: number;
          last_sync_by_user_id: string | null;
          last_sync_by_email: string | null;
          updated_at: string;
        }>;
      };
      categories: {
        Row: {
          id: string;
          label: string;
          icon: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          label: string;
          icon?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          label: string;
          icon: string | null;
          sort_order: number;
          updated_at: string;
        }>;
      };
      category_keywords: {
        Row: {
          id: string;
          category_id: string;
          keyword: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          keyword: string;
          created_at?: string;
        };
        Update: Partial<{
          category_id: string;
          keyword: string;
        }>;
      };
    };
  };
};
