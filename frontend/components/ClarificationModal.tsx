'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export interface Framework {
  id: string;
  name: string;
  description: string;
}

export interface ClarificationAnswers {
  frameworkId: string;
  goalClarity: string;
  targetAudience: string;
  contextCompleteness: string;
  formatRequirements: string;
  constraints: string;
}

interface ClarificationModalProps {
  frameworks: Framework[];
  isOpen: boolean;
  onSubmit: (answers: ClarificationAnswers) => Promise<void>;
  onCancel: () => void;
}

export default function ClarificationModal({
  frameworks,
  isOpen,
  onSubmit,
  onCancel,
}: ClarificationModalProps) {
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [answers, setAnswers] = useState<Omit<ClarificationAnswers, 'frameworkId'>>({
    goalClarity: '',
    targetAudience: '',
    contextCompleteness: '',
    formatRequirements: '',
    constraints: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select framework if only one candidate
  useEffect(() => {
    if (frameworks.length === 1) {
      setSelectedFramework(frameworks[0].id);
    }
  }, [frameworks]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (frameworks.length === 1) {
        setSelectedFramework(frameworks[0].id);
      } else {
        setSelectedFramework('');
      }
      setAnswers({
        goalClarity: '',
        targetAudience: '',
        contextCompleteness: '',
        formatRequirements: '',
        constraints: '',
      });
      setIsSubmitting(false);
    }
  }, [isOpen, frameworks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFramework) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        frameworkId: selectedFramework,
        ...answers,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerChange = (field: keyof typeof answers, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl animate-in zoom-in-95 duration-200 m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            优化提示词
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {/* Framework Selection (if multiple candidates) */}
          {frameworks.length > 1 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                选择框架 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {frameworks.map((framework) => (
                  <label
                    key={framework.id}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedFramework === framework.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="framework"
                      value={framework.id}
                      checked={selectedFramework === framework.id}
                      onChange={(e) => setSelectedFramework(e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {framework.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {framework.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Framework Display (if single candidate) */}
          {frameworks.length === 1 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-medium text-gray-900">
                推荐框架：{frameworks[0].name}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {frameworks[0].description}
              </div>
            </div>
          )}

          {/* Clarification Questions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              请回答以下问题以获得更精准的优化结果
            </h3>

            {/* Goal Clarity */}
            <div className="space-y-2">
              <label htmlFor="goalClarity" className="block text-sm font-medium text-gray-700">
                目标清晰度 <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500">
                期望的结果是什么？
              </p>
              <textarea
                id="goalClarity"
                required
                value={answers.goalClarity}
                onChange={(e) => handleAnswerChange('goalClarity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="例如：生成一篇关于人工智能的科普文章"
              />
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">
                目标受众 <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500">
                谁会接收 AI 的回复？
              </p>
              <textarea
                id="targetAudience"
                required
                value={answers.targetAudience}
                onChange={(e) => handleAnswerChange('targetAudience', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="例如：对 AI 感兴趣的普通读者"
              />
            </div>

            {/* Context Completeness */}
            <div className="space-y-2">
              <label htmlFor="contextCompleteness" className="block text-sm font-medium text-gray-700">
                上下文完整性
              </label>
              <p className="text-sm text-gray-500">
                是否提供了足够的背景信息？
              </p>
              <textarea
                id="contextCompleteness"
                value={answers.contextCompleteness}
                onChange={(e) => handleAnswerChange('contextCompleteness', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="例如：文章需要包含 AI 的历史、现状和未来展望"
              />
            </div>

            {/* Format Requirements */}
            <div className="space-y-2">
              <label htmlFor="formatRequirements" className="block text-sm font-medium text-gray-700">
                格式要求
              </label>
              <p className="text-sm text-gray-500">
                是否有特定的输出格式需求？
              </p>
              <textarea
                id="formatRequirements"
                value={answers.formatRequirements}
                onChange={(e) => handleAnswerChange('formatRequirements', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="例如：Markdown 格式，包含标题、段落和列表"
              />
            </div>

            {/* Constraints */}
            <div className="space-y-2">
              <label htmlFor="constraints" className="block text-sm font-medium text-gray-700">
                约束条件
              </label>
              <p className="text-sm text-gray-500">
                是否有任何限制或约束？
              </p>
              <textarea
                id="constraints"
                value={answers.constraints}
                onChange={(e) => handleAnswerChange('constraints', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="例如：字数限制在 1000 字以内"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFramework}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? '生成中...' : '生成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
