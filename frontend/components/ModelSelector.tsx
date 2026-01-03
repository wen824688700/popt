'use client';

import { useState, useRef, useEffect } from 'react';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const AVAILABLE_MODELS = [
  { id: 'deepseek', name: 'DeepSeek', description: '高性能 AI 模型' }
];

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label htmlFor="model-selector" className="block text-sm font-medium text-gray-700 mb-2">
        选择模型
      </label>
      <button
        id="model-selector"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-gray-900">
            {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || '选择模型'}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div 
          role="listbox"
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          {AVAILABLE_MODELS.map((model) => (
            <button
              key={model.id}
              type="button"
              role="option"
              aria-selected={selectedModel === model.id}
              onClick={() => {
                onModelChange(model.id);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg focus:outline-none focus:bg-gray-50 ${
                selectedModel === model.id ? 'bg-primary-50' : ''
              }`}
            >
              <div className="font-medium text-gray-900">{model.name}</div>
              <div className="text-sm text-gray-500">{model.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
