'use client';

import { useState, useRef, useEffect } from 'react';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const AVAILABLE_MODELS = [
  { 
    id: 'deepseek', 
    name: 'DeepSeek', 
    description: '国内顶级中文大模型，推理能力强' 
  },
  { 
    id: 'gemini', 
    name: 'Gemini 3 Pro', 
    description: 'Google 最新旗舰模型，创意与推理兼备' 
  }
];

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full z-50" ref={dropdownRef}>
      <button
        id="model-selector"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full px-3 py-2 text-left bg-[#2d3748] border border-[#4a5568] rounded-lg hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-gray-200 font-medium text-sm">
              {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || '选择模型'}
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
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
          className="absolute z-[9999] w-full mt-2 bg-[#2d3748] border-2 border-purple-500 rounded-lg shadow-2xl overflow-hidden"
          style={{ position: 'absolute', top: '100%', left: 0, right: 0 }}
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
              className={`w-full px-4 py-3 text-left hover:bg-[#3d4a5c] transition-colors focus:outline-none focus:bg-[#3d4a5c] ${
                selectedModel === model.id ? 'bg-[#3d4a5c] border-l-4 border-purple-500' : ''
              }`}
            >
              <div className="font-medium text-gray-200 text-sm">{model.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{model.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
