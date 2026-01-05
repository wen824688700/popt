'use client';

import { useEffect, useState } from 'react';

interface EditorPanelProps {
  initialContent?: string;
  onRegenerate: (content: string) => void;
  isLoading?: boolean;
}

export default function EditorPanel({
  initialContent = '',
  onRegenerate,
  isLoading = false,
}: EditorPanelProps) {
  const [content, setContent] = useState(initialContent);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (content) {
        localStorage.setItem('workspace_draft', JSON.stringify({
          content,
          lastModified: new Date().toISOString(),
        }));
        setLastSaved(new Date());
      }
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [content]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('workspace_draft');
    if (savedDraft) {
      try {
        const { content: savedContent } = JSON.parse(savedDraft);
        if (savedContent && !initialContent) {
          setContent(savedContent);
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [initialContent]);

  // Update content when initialContent changes
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const handleRegenerate = () => {
    if (content.trim()) {
      onRegenerate(content);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1a2332]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#3d4a5c] flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">编辑区域</h2>
        {lastSaved && (
          <span className="text-xs text-gray-400 bg-[#242d3d] px-3 py-1.5 rounded-full border border-[#3d4a5c]">
            已保存 {lastSaved.toLocaleTimeString('zh-CN')}
          </span>
        )}
      </div>

      {/* Editor - 深色主题样式 */}
      <div className="flex-1 p-6">
        <div className="h-full bg-[#242d3d] rounded-lg border border-[#3d4a5c] overflow-hidden">
          {/* 模拟终端头部 */}
          <div className="px-4 py-3 bg-[#1a2332] border-b border-[#3d4a5c] flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs text-gray-400 ml-2">编辑器</span>
          </div>
          
          {/* 文本区域 */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-[calc(100%-48px)] resize-none p-4 bg-transparent text-gray-200 font-mono text-sm focus:outline-none placeholder-gray-600"
            placeholder="在此编辑您的需求，或在末尾追加修改要求..."
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#3d4a5c]">
        <button
          onClick={handleRegenerate}
          disabled={isLoading || !content.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              生成中...
            </>
          ) : (
            '重新生成'
          )}
        </button>
      </div>
    </div>
  );
}
