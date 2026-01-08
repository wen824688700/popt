'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackClient() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[Auth Callback] 开始处理回调');
        console.log('[Auth Callback] URL:', window.location.href);
        
        // Supabase 会自动处理 URL 中的 token/code
        // 我们只需要等待会话建立
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('[Auth Callback] Session:', session);
        console.log('[Auth Callback] Error:', error);
        
        if (error) {
          console.error('[Auth Callback] 获取会话失败:', error);
          setErrorMessage(error.message);
          return;
        }

        if (!session) {
          console.error('[Auth Callback] 没有会话');
          setErrorMessage('登录失败，请重试');
          return;
        }

        console.log('[Auth Callback] 登录成功');
        
        // 跳转到目标页面
        const next = localStorage.getItem('postAuthRedirect') || '/';
        localStorage.removeItem('postAuthRedirect');
        
        console.log('[Auth Callback] 跳转到:', next);
        router.replace(next);
      } catch (err) {
        console.error('[Auth Callback] 异常:', err);
        setErrorMessage('登录过程出错，请重试');
      }
    };

    // 延迟一下，确保 URL 参数已经被处理
    const timer = setTimeout(handleCallback, 100);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-cyan-50/30 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 max-w-md w-full p-6">
        <h1 className="text-xl font-semibold text-gray-900">正在登录...</h1>
        <p className="text-sm text-gray-600 mt-2">请稍候</p>
        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}

