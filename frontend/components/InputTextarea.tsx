'use client';

import { useState } from 'react';
import { validateInputLength } from '@/lib/utils';

interface InputTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function InputTextarea({ value, onChange, placeholder }: InputTextareaProps) {
  const [error, setError] = useState<string>('');
  const charCount = value.trim().length;
  const isValid = validateInputLength(value);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.trim().length > 0 && !validateInputLength(newValue)) {
      setError('请输入至少 10 个字符');
    } else {
      setError('');
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        输入您的提示词或需求描述
      </label>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder || '请输入您想要优化的提示词或需求描述...'}
        rows={6}
        className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
      />
      <div className="flex items-center justify-between mt-2">
        <div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
        <div className={`text-sm ${charCount < 10 ? 'text-gray-400' : 'text-gray-600'}`}>
          {charCount} / 最少 10 字符
        </div>
      </div>
    </div>
  );
}
