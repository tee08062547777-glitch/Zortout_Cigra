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
          last_sync_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          {
            id: string;
            user_id: string;
            auto_sync_enabled: boolean;
            sync_interval_minutes: number;
            last_sync_at: string | null;
            created_at: string;
            updated_at: string;
          },
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<{
          auto_sync_enabled: boolean;
          sync_interval_minutes: number;
          last_sync_at: string;
          updated_at: string;
        }>;
      };
    };
  };
};
