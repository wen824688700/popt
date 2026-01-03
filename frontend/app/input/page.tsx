'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ClarificationModal, { Framework, ClarificationAnswers } from '@/components/ClarificationModal';
import Toast from '@/components/Toast';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { validateInputLength, validateFileType, validateFileSize, formatFileSize } from '@/lib/utils';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { apiClient } from '@/lib/api/client';

const AVAILABLE_MODELS = [
  { id: 'deepseek', name: 'DeepSeek', description: '高性能 AI 模型' }
];

export default function InputPage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useLocalStorage('selectedModel', 'deepseek');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 自动调整 textarea 高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      setAttachment(null);
      return;
    }

    if (!validateFileType(file)) {
      showToast('仅支持 .txt, .md, .pdf 格式的文件', 'error');
      setAttachment(null);
      return;
    }

    if (!validateFileSize(file)) {
      showToast('文件大小不能超过 5MB', 'error');
      setAttachment(null);
      return;
    }

    setAttachment(file);
    showToast('文件上传成功', 'success');
  };

  const handleRemoveFile = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOptimize = async () => {
    if (!validateInputLength(input)) {
      showToast('请输入至少 10 个字符', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiClient.matchFrameworks({
        input,
        user_type: 'free',
      });

      if (response.frameworks && response.frameworks.length > 0) {
        setFrameworks(response.frameworks);
        setIsModalOpen(true);
        showToast(`找到 ${response.frameworks.length} 个推荐框架`, 'success');
      } else {
        showToast('未找到合适的框架，请尝试更详细的描述', 'error');
      }
    } catch (error) {
      console.error('Framework matching error:', error);
      showToast(
        error instanceof Error ? error.message : '框架匹配失败，请稍后重试',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalSubmit = async (answers: ClarificationAnswers) => {
    try {
      setIsLoading(true);
      showToast('正在生成优化提示词...', 'info');
      
      const selectedFramework = frameworks.find(f => f.id === answers.frameworkId);
      if (selectedFramework) {
        localStorage.setItem('selectedFramework', JSON.stringify(selectedFramework));
      }
      localStorage.setItem('clarificationAnswers', JSON.stringify({
        goalClarity: answers.goalClarity,
        targetAudience: answers.targetAudience,
        contextCompleteness: answers.contextCompleteness,
        formatRequirements: answers.formatRequirements,
        constraints: answers.constraints,
      }));
      
      const response = await apiClient.generatePrompt({
        input,
        framework_id: answers.frameworkId,
        clarification_answers: {
          goalClarity: answers.goalClarity,
          targetAudience: answers.targetAudience,
          contextCompleteness: answers.contextCompleteness,
          formatRequirements: answers.formatRequirements,
          constraints: answers.constraints,
        },
        user_id: 'test_user',
        account_type: 'free',
      });
      
      setIsModalOpen(false);
      
      localStorage.setItem('currentPrompt', response.output);
      localStorage.setItem('originalInput', input);
      localStorage.setItem('frameworkUsed', response.framework_used);
      localStorage.setItem('versionId', response.version_id);
      
      showToast('提示词生成成功！', 'success');
      
      setTimeout(() => {
        router.push('/workspace');
      }, 800);
    } catch (error) {
      console.error('Prompt generation error:', error);
      showToast(
        error instanceof Error ? error.message : '提示词生成失败，请稍后重试',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (validateInputLength(input) && !isLoading) {
        handleOptimize();
      }
    }
  };

  const charCount = input.trim().length;
  const isValid = validateInputLength(input);

  if (!isClient) {
    return <LoadingSkeleton />;
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Modal */}
      <ClarificationModal
        frameworks={frameworks}
        isOpen={isModalOpen}
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
      />

      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-purple-50 to-cyan-50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* 顶部导航 */}
      <nav className="relative z-10 px-6 py-6">
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

          {/* 右侧按钮组 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">返回</span>
            </button>
            <button
              onClick={() => router.push('/account')}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
            >
              登录 / 注册
            </button>
          </div>
        </div>
      </nav>

      {/* 主内容区 - ChatGPT 风格 */}
      <div className="relative z-10 flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 88px)' }}>
        <div className="w-full max-w-3xl px-4">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              输入一句话需求
            </h2>
            <p className="text-lg text-gray-600">
              简单、自然地描述你想要的 Prompt
            </p>
          </div>

          {/* 输入框容器 */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-purple-200/50 border border-gray-200/50 overflow-hidden">
            {/* 附件显示区域 */}
            {attachment && (
              <div className="px-6 pt-4 pb-2 border-b border-gray-100">
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-xl border border-purple-200">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">{attachment.name}</span>
                  <span className="text-xs text-gray-500">({formatFileSize(attachment.size)})</span>
                  <button
                    onClick={handleRemoveFile}
                    className="ml-1 p-1 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* 输入区域 */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="例如：帮我写一个关于产品营销的提示词..."
                rows={1}
                className="w-full px-6 py-5 text-gray-900 placeholder-gray-400 resize-none focus:outline-none text-base"
                style={{ minHeight: '60px', maxHeight: '300px' }}
              />
            </div>

            {/* 底部工具栏 */}
            <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* 附件按钮 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                  title="上传附件"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                {/* 模型选择器 */}
                <div className="relative">
                  <button
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>{AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}</span>
                    <svg className={`w-4 h-4 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isModelDropdownOpen && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden min-w-[200px]">
                      {AVAILABLE_MODELS.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model.id);
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors ${
                            selectedModel === model.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                          }`}
                        >
                          <div className="font-medium text-gray-900">{model.name}</div>
                          <div className="text-xs text-gray-500">{model.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 字符计数 */}
                <span className={`text-xs ${charCount < 10 ? 'text-gray-400' : 'text-gray-600'}`}>
                  {charCount} / 最少 10
                </span>
              </div>

              {/* 发送按钮 */}
              <button
                onClick={handleOptimize}
                disabled={!isValid || isLoading}
                className="p-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              按 <kbd className="px-2 py-1 bg-white rounded border border-gray-300 text-xs">Enter</kbd> 发送，
              <kbd className="px-2 py-1 bg-white rounded border border-gray-300 text-xs">Shift + Enter</kbd> 换行
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
