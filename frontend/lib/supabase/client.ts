<<<<<<< HEAD
/**
 * Supabase 浏览器客户端
 * 用于 Client Components
 */
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
=======
import { createClient } from '@supabase/supabase-js';

function requireEnv(name: string, value: string | undefined): string {
  if (value) return value;
  throw new Error(`Missing ${name}. Set it in your Vercel/Next.js environment variables.`);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(
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

>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
