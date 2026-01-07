/**
 * 认证测试页面
 * 用于诊断 Supabase 认证问题
 */
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthTestPage() {
  const [status, setStatus] = useState<any>({
    loading: true,
    session: null,
    user: null,
    error: null,
    cookies: [],
    env: {},
  });

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        
        // 获取会话
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // 获取用户
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        // 获取 cookies
        const cookies = document.cookie.split(';').map(c => c.trim());
        
        // 获取环境变量
        const env = {
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
          origin: window.location.origin,
        };

        setStatus({
          loading: false,
          session,
          user,
          sessionError,
          userError,
          cookies,
          env,
        });
      } catch (error) {
        setStatus({
          loading: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    checkAuth();
  }, []);

  if (status.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">检查认证状态...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">认证状态诊断</h1>

        {/* 环境变量 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">🔧</span>
            环境变量
          </h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(status.env, null, 2)}
          </pre>
        </div>

        {/* 会话状态 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            {status.session ? (
              <><span className="mr-2">✅</span>会话状态（已登录）</>
            ) : (
              <><span className="mr-2">❌</span>会话状态（未登录）</>
            )}
          </h2>
          {status.sessionError && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-red-800 font-medium">错误：</p>
              <p className="text-red-600">{status.sessionError.message}</p>
            </div>
          )}
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(status.session, null, 2)}
          </pre>
        </div>

        {/* 用户信息 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            {status.user ? (
              <><span className="mr-2">✅</span>用户信息</>
            ) : (
              <><span className="mr-2">❌</span>用户信息（无）</>
            )}
          </h2>
          {status.userError && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-red-800 font-medium">错误：</p>
              <p className="text-red-600">{status.userError.message}</p>
            </div>
          )}
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(status.user, null, 2)}
          </pre>
        </div>

        {/* Cookies */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">🍪</span>
            Cookies ({status.cookies.length})
          </h2>
          <div className="space-y-2">
            {status.cookies.length > 0 ? (
              status.cookies.map((cookie: string, i: number) => (
                <div key={i} className="bg-gray-100 p-2 rounded text-sm font-mono">
                  {cookie}
                </div>
              ))
            ) : (
              <p className="text-gray-500">没有找到 cookies</p>
            )}
          </div>
        </div>

        {/* 错误信息 */}
        {status.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-800">❌ 错误</h2>
            <p className="text-red-600">{status.error}</p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">操作</h2>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              刷新页面
            </button>
            <button
              onClick={() => {
                document.cookie.split(';').forEach(c => {
                  document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
                });
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              清除所有 Cookies
            </button>
            <a
              href="/"
              className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              返回首页
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
