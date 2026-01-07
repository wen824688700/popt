/**
 * Supabase Auth Callback 路由
 * 处理 OAuth 登录后的回调
 */
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 登录成功后重定向到首页
  return NextResponse.redirect(`${origin}/`);
}
