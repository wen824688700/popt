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

    // Validate file type
    if (!validateFileType(file)) {
      setError('仅支持 .txt, .md, .pdf 格式的文件');
      setSelectedFile(null);
      onFileSelect(null);
      return;
    }

    // Validate file size
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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        上传附件（可选）
      </label>
      
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
          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-gray-600 hover:text-primary-600"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>点击上传文件</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            支持 .txt, .md, .pdf 格式，最大 5MB
          </div>
        </button>
      ) : (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <svg className="w-5 h-5 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
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
            className="ml-3 p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
