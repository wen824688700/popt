/**
 * Supabase 认证辅助函数
 * 用于客户端组件
 */
import { createClient } from './supabase/client';

/**
 * Google 登录（PKCE 流程）
 */
export async function signInWithGoogle() {
  const supabase = createClient();
  
  // 使用环境变量或当前域名
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Google 登录失败:', error);
    throw error;
  }

  return data;
}

/**
 * 登出
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('登出失败:', error);
    throw error;
  }
}

/**
 * 获取当前用户
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('获取用户失败:', error);
    return null;
  }
  
  return user;
}

/**
 * 获取当前会话
 */
export async function getSession() {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('获取会话失败:', error);
    return null;
  }
  
  return session;
}
