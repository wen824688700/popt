'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function Home() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGetStarted = () => {
    setIsAnimating(true);
    setTimeout(() => {
      router.push('/input');
    }, 600);
  };

  if (!isClient) {
    return <LoadingSkeleton />;
  }

  return (
    <main className={`min-h-screen relative overflow-hidden transition-opacity duration-600 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
      {/* 动态渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
        {/* 动态光晕效果 */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* 网格背景 */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

      {/* 顶部导航区域 */}
      <div className="relative z-20 px-6 py-6 flex items-center justify-between">
        {/* 左侧 Logo */}
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Prompt Optimizer
          </span>
        </div>

        {/* 右侧登录/注册按钮 */}
        <button
          onClick={() => router.push('/account')}
          className="px-6 py-2.5 bg-white/10 backdrop-blur-sm text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 animate-fade-in"
        >
          登录 / 注册
        </button>
      </div>

      {/* 内容区域 */}
      <div className="relative z-10 min-h-[calc(100vh-88px)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Logo 区域 */}
        <div className="mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 shadow-2xl shadow-purple-500/50 mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* 主标题 */}
        <h1 className="text-5xl sm:text-7xl font-bold text-center mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s', fontFamily: 'Outfit, sans-serif' }}>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300">
            Prompt Optimizer
          </span>
        </h1>

        {/* 副标题 */}
        <p className="text-xl sm:text-2xl text-gray-300 text-center max-w-2xl mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          把"一句话需求"变成专业 Prompt
        </p>

        <p className="text-base sm:text-lg text-gray-400 text-center max-w-xl mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          输入你的想法 → 选择框架 → 自动生成高质量的 Markdown Prompt，并支持迭代优化与版本管理
        </p>

        {/* CTA 按钮 */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={handleGetStarted}
            className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-2">
              开始优化
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
          </button>
        </div>

        {/* 特性卡片 */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">智能框架匹配</h3>
            <p className="text-sm text-gray-400">从 57 个 Prompt 框架中自动匹配最合适的方案</p>
          </div>

          <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400/20 to-purple-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">交互式追问</h3>
            <p className="text-sm text-gray-400">通过标准化问题深入理解你的需求</p>
          </div>

          <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400/20 to-pink-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">迭代优化</h3>
            <p className="text-sm text-gray-400">支持多轮对话优化和完整的版本管理</p>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-16 text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <p className="text-sm text-gray-500">
            Free 用户每日 5 次 · Pro 用户每日 100 次
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </main>
  );
}
