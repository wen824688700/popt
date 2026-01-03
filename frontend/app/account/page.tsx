'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  avatar: string;
  accountType: 'free' | 'pro';
}

interface QuotaInfo {
  used: number;
  total: number;
  resetTime: string; // UTC ISO 8601
}

interface SubscriptionInfo {
  status: 'active' | 'cancelled' | 'expired';
  nextBillingDate: string;
  amount: number;
}

export default function AccountPage() {
  const router = useRouter();
  
  // Mock data for testing
  const [user] = useState<User>({
    id: '1',
    email: 'user@example.com',
    avatar: 'https://via.placeholder.com/100',
    accountType: 'free',
  });

  const [quota] = useState<QuotaInfo>({
    used: 3,
    total: 5,
    resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });

  const [subscription] = useState<SubscriptionInfo | null>(null);

  const handleUpgrade = () => {
    console.log('Upgrade to Pro');
    // TODO: Redirect to Creem payment page
  };

  const handleCancelSubscription = () => {
    console.log('Cancel subscription');
    // TODO: Call API to cancel subscription
  };

  const formatResetTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-cyan-50/30">
      {/* 顶部导航 */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 左侧 Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Prompt Optimizer
              </span>
            </div>

            {/* 右侧按钮 */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">首页</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">账户设置</h1>

          <div className="space-y-6">
          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">用户信息</h2>
            <div className="flex items-center gap-4">
              <img
                src={user.avatar}
                alt="User avatar"
                className="w-16 h-16 rounded-full"
              />
              <div>
                <p className="text-lg font-medium text-gray-900">{user.email}</p>
                <span
                  className={`inline-block px-3 py-1 text-sm rounded-full ${
                    user.accountType === 'pro'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {user.accountType === 'pro' ? 'Pro 用户' : '免费用户'}
                </span>
              </div>
            </div>
          </div>

          {/* Quota Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">配额信息</h2>
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
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(quota.used / quota.total) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                配额将在 {formatResetTime(quota.resetTime)} 重置
              </p>
            </div>
          </div>

          {/* Subscription Info Card */}
          {user.accountType === 'free' ? (
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
              <h2 className="text-xl font-semibold mb-2">升级到 Pro</h2>
              <p className="mb-4">
                每月仅需 $19，即可享受每日 100 次优化配额和深度分析模式
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  每日 100 次优化配额
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  深度分析模式
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  优先支持
                </li>
              </ul>
              <button
                onClick={handleUpgrade}
                className="w-full bg-white text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                立即升级
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">订阅信息</h2>
              {subscription ? (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">订阅状态</span>
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        subscription.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {subscription.status === 'active' ? '活跃' : '已取消'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">下次扣费日期</span>
                    <span className="text-gray-900">{subscription.nextBillingDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">金额</span>
                    <span className="text-gray-900">${subscription.amount}/月</span>
                  </div>
                  {subscription.status === 'active' && (
                    <button
                      onClick={handleCancelSubscription}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      取消订阅
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">暂无订阅信息</p>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
