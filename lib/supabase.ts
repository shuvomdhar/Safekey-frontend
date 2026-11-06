import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "placeholder-anon-key";

/**
 * `true` when both Supabase env vars are present. Auth screens show a setup
 * notice instead of failing with a network error when they are missing.
 */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Browser Supabase client. Supabase owns sign-up, sign-in, Google OAuth and
 * password resets. The session persists in the browser, tokens refresh
 * automatically, and every API request sends the access token as a bearer
 * token. Safekey keeps no session cookie of its own.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce"
  }
});
