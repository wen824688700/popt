import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function requireEnv(name: string, value: string | undefined): string {
  if (value) return value;
  throw new Error(`Missing ${name}. Set it in your Vercel/Next.js environment variables.`);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createSupabaseClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL', supabaseUrl),
  requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', supabaseAnonKey),
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Back-compat helper: some parts of the app import `createClient()` from this module.
export function createClient() {
  return supabase;
}
