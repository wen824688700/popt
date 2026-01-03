'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-cyan-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Prompt Optimizer
              </span>
            </Link>
            <div className="ml-10 flex items-center space-x-2">
              <Link
                href="/"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/')
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                首页
              </Link>
              <Link
                href="/workspace"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/workspace')
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                工作台
              </Link>
              <Link
                href="/account"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/account')
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                账户
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
