/**
 * Supabase Server 客户端
 * 用于 Server Components 和 Route Handlers
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
              });
            });
          } catch (error) {
            // 在 Server Component 中调用时可能会失败
            // 这是预期行为，但在 Route Handler 中应该成功
            console.error('设置 cookie 失败:', error);
          }
        },
      },
    }
  );
}
