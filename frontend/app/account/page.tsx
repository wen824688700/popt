/**
 * 账户页面
 * 显示用户信息、配额使用情况
 */
'use client';

<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { apiClient } from '@/lib/api/client';
import LoginButton from '@/components/LoginButton';

interface QuotaInfo {
  used: number;
  total: number;
  resetTime: string;
  canGenerate: boolean;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(false);

  // 获取配额信息
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchQuota();
    }
  }, [isAuthenticated, user]);

  const fetchQuota = async () => {
    if (!user) return;
    
    setQuotaLoading(true);
    try {
      const response = await apiClient.getQuota(user.id, user.accountType || 'free');
      setQuota({
        used: response.used,
        total: response.total,
        resetTime: response.reset_time,
        canGenerate: response.can_generate,
      });
    } catch (error) {
      console.error('Failed to fetch quota:', error);
    } finally {
      setQuotaLoading(false);
    }
  };

  const formatResetTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
=======
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { getSiteUrl } from '@/lib/supabase/siteUrl';
import { useAuthStore } from '@/lib/stores/authStore';

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const [isWorking, setIsWorking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const nextPath = useMemo(() => searchParams.get('next') || '/input', [searchParams]);

  const handleGoogleLogin = async () => {
    setIsWorking(true);
    setErrorMessage(null);
    try {
      localStorage.setItem('postAuthRedirect', nextPath);
      const redirectTo = `${getSiteUrl()}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Login failed');
      setIsWorking(false);
    }
  };

  const handleLogout = async () => {
    setIsWorking(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/');
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Logout failed');
    } finally {
      setIsWorking(false);
    }
>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-cyan-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-cyan-50/30">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Prompt Optimizer
              </span>
            </div>

<<<<<<< HEAD
            {/* 右侧按钮 */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium">首页</span>
              </button>
              <LoginButton />
            </div>
=======
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="font-medium">首页</span>
            </button>
>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
          </div>
        </div>
      </nav>

      <div className="py-10">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">账号</h1>

<<<<<<< HEAD
          {!isAuthenticated ? (
            /* 未登录状态 */
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h2>
              <p className="text-gray-600 mb-8">登录后即可查看账户信息和配额使用情况</p>
              <LoginButton />
            </div>
          ) : (
            /* 已登录状态 */
            <div className="space-y-6">
              {/* User Info Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">用户信息</h2>
                <div className="flex items-center gap-4">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="User avatar"
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-2xl text-white font-bold">
                        {user?.name?.[0] || user?.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700">
                      免费用户
                    </span>
                  </div>
                </div>
              </div>

              {/* Quota Info Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">配额信息</h2>
                {quotaLoading ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">加载中...</p>
                  </div>
                ) : quota ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">今日使用量</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {quota.used} / {quota.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${(quota.used / quota.total) * 100}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      配额将在 {formatResetTime(quota.resetTime)} 重置
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600">无法加载配额信息</p>
                )}
              </div>

              {/* Free Account Benefits Card */}
              <div className="bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg shadow p-6 text-white">
                <h2 className="text-xl font-semibold mb-2">免费账户权益</h2>
                <p className="mb-4 text-white/90">
                  享受以下功能，完全免费
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    每日 10 次优化配额
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    智能框架匹配（57 个专业框架）
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    迭代优化与版本管理
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Markdown 格式输出
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    模型支持（DeepSeek）
                  </li>
                </ul>
              </div>
            </div>
          )}
=======
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 p-6">
            {user ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={user.avatar || '/logo.jpg'}
                    alt="User avatar"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <div className="text-sm text-gray-500">Signed in as</div>
                    <div className="text-lg font-semibold text-gray-900 truncate">{user.email}</div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={isWorking}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:opacity-60"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div>
                <div className="text-gray-900 font-semibold text-lg">登录 / 注册</div>
                <p className="text-gray-600 text-sm mt-1">
                  使用 Google 登录后才能保存版本、同步配额并防止滥用。
                </p>
                <button
                  onClick={handleGoogleLogin}
                  disabled={isWorking}
                  className="mt-5 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 disabled:opacity-60"
                >
                  Continue with Google
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
                {errorMessage}
              </div>
            )}

            <div className="mt-6 text-xs text-gray-500">
              Redirect URL: <span className="font-mono">{`${getSiteUrl()}/auth/callback`}</span>
            </div>
          </div>
>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
        </div>
      </div>
    </div>
  );
}

