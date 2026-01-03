'use client';

import { useRef, useState } from 'react';
import { validateFileType, validateFileSize, formatFileSize } from '@/lib/utils';

interface AttachmentUploaderProps {
  onFileSelect: (file: File | null) => void;
}

export default function AttachmentUploader({ onFileSelect }: AttachmentUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError('');

    if (!file) {
      setSelectedFile(null);
      onFileSelect(null);
      return;
    }

    if (!validateFileType(file)) {
      setError('仅支持 .txt, .md, .pdf 格式的文件');
      setSelectedFile(null);
      onFileSelect(null);
      return;
    }

    if (!validateFileSize(file)) {
      setError('文件大小不能超过 5MB');
      setSelectedFile(null);
      onFileSelect(null);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!selectedFile ? (
        <button
          type="button"
          onClick={handleButtonClick}
          className="w-full px-5 py-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-purple-400 hover:bg-purple-50/50 transition-all text-gray-600 hover:text-purple-600 group"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-medium">点击上传文件</div>
              <div className="text-xs text-gray-500 group-hover:text-purple-500 transition-colors">
                支持 .txt, .md, .pdf 格式，最大 5MB
              </div>
            </div>
          </div>
        </button>
      ) : (
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-50 to-cyan-50 border-2 border-purple-200 rounded-2xl">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {selectedFile.name}
              </div>
              <div className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="ml-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
