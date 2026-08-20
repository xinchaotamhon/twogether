import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseConfig {
  url: string;
  publishableKey: string;
}

type ViteEnv = Record<string, string | undefined>;

export function readSupabaseConfig(env: ViteEnv = import.meta.env as ViteEnv): SupabaseConfig | null {
  const url = env.VITE_SUPABASE_URL?.trim();
  const publishableKey = (env.VITE_SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_PUBLISHABLE_KEY)?.trim();
  if (!url || !publishableKey || url.includes("your-project-ref")) return null;
  return { url, publishableKey };
}

export function createSupabaseBrowserClient(config = readSupabaseConfig()): SupabaseClient | null {
  if (!config) return null;
  return createClient(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}
