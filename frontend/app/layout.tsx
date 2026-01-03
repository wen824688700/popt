import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import ToastContainer from '@/components/ToastContainer'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Prompt Optimizer MVP',
  description: '基于 57 个经过验证的 Prompt 工程框架的智能提示词优化工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <ErrorBoundary>
          <Navigation />
          {children}
          <ToastContainer />
        </ErrorBoundary>
      </body>
    </html>
  )
}
