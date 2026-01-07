/**
 * Supabase Auth Callback 路由
 * 处理 OAuth 登录后的回调
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');
  const origin = requestUrl.origin;

  console.log('[Auth Callback] 收到请求:', { 
    code: code?.substring(0, 10), 
    error, 
    origin,
    url: requestUrl.href 
  });

  // 如果有错误，重定向到首页并显示错误
  if (error) {
    console.error('[Auth Callback] OAuth 错误:', error, error_description);
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent(error_description || error)}`
    );
  }

  // 如果没有授权码，直接重定向
  if (!code) {
    console.warn('[Auth Callback] 缺少授权码');
    return NextResponse.redirect(origin);
  }

  // 交换授权码为会话
  try {
    const cookieStore = cookies();
    const response = NextResponse.redirect(`${origin}/`);

    // 创建 Supabase 客户端，直接在响应中设置 cookie
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // 同时设置到请求和响应中
              try {
                cookieStore.set(name, value, options);
              } catch (e) {
                // 在某些情况下可能失败，忽略
              }
              response.cookies.set(name, value, {
                ...options,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
              });
            });
          },
        },
      }
    );

    // 交换授权码
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('[Auth Callback] 交换会话失败:', exchangeError);
      return NextResponse.redirect(
        `${origin}/?error=${encodeURIComponent('登录失败，请重试')}`
      );
    }

    console.log('[Auth Callback] 登录成功:', { 
      userId: data.user?.id,
      email: data.user?.email 
    });

    return response;
  } catch (err) {
    console.error('[Auth Callback] 异常:', err);
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent('登录处理失败')}`
    );
  }
}
