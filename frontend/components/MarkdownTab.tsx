'use client';

import { useState } from 'react';

interface MarkdownTabProps {
  content: string;
  onModify: (content: string) => void;
  onSave: (content: string) => void;
}

export default function MarkdownTab({ content, onModify, onSave }: MarkdownTabProps) {
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleModify = () => {
    onModify(content);
  };

  const handleSave = () => {
    onSave(content);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#1a2332]">
      {/* Header with Actions */}
      <div className="px-6 py-4 border-b border-[#3d4a5c] flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">输出区域</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#242d3d] text-gray-300 rounded-lg border border-[#3d4a5c] hover:bg-[#2d3748] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            复制
          </button>
          <button
            onClick={handleModify}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            修改
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            保存
          </button>
        </div>
      </div>

      {/* Markdown Content - 深色主题 */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-[#242d3d] rounded-lg border border-[#3d4a5c] overflow-hidden">
          {/* 模拟终端头部 */}
          <div className="px-4 py-3 bg-[#1a2332] border-b border-[#3d4a5c] flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs text-gray-400 ml-2">输出预览</span>
          </div>
          
          {/* Markdown 内容 */}
          <div className="p-6">
            {content ? (
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300">
                {content}
              </pre>
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500 text-center">
                  优化后的提示词将显示在这里...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {showCopiedToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-fade-in z-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">复制成功</span>
        </div>
      )}

      {showSavedToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-fade-in z-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">保存成功</span>
        </div>
      )}
    </div>
  );
}
