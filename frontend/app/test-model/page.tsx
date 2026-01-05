'use client';

import { useState } from 'react';
import ModelSelector from '@/components/ModelSelector';
import { useModelStore } from '@/lib/stores/modelStore';

export default function TestModelPage() {
  const { selectedModel, setSelectedModel } = useModelStore();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">模型选择器测试页面</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">当前选择的模型：</h2>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-lg font-medium">{selectedModel}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">模型选择器：</h2>
          <div className="w-full max-w-md">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">说明：</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>点击模型选择器应该看到两个选项：DeepSeek 和 Gemini 2.0</li>
            <li>选择后，上方会显示当前选择的模型</li>
            <li>刷新页面后，选择会被保存</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
