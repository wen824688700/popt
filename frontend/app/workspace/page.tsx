'use client';

import { useState, useEffect } from 'react';
import EditorPanel from '@/components/EditorPanel';
import OutputTabs from '@/components/OutputTabs';
import MarkdownTab from '@/components/MarkdownTab';
import VersionsTab from '@/components/VersionsTab';

interface Version {
  id: string;
  content: string;
  type: 'save' | 'optimize';
  createdAt: string;
}

export default function WorkspacePage() {
  const [outputContent, setOutputContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [editorContent, setEditorContent] = useState('');

  // 从 localStorage 加载初始数据
  useEffect(() => {
    const savedPrompt = localStorage.getItem('currentPrompt');
    const originalInput = localStorage.getItem('originalInput');
    
    if (savedPrompt) {
      setOutputContent(savedPrompt);
      // 清除 localStorage 中的数据，避免刷新时重复加载
      localStorage.removeItem('currentPrompt');
    }
    
    if (originalInput) {
      setEditorContent(originalInput);
      localStorage.removeItem('originalInput');
    }
  }, []);

  const handleRegenerate = async (content: string) => {
    setIsLoading(true);
    try {
      // TODO: Call API to regenerate prompt
      console.log('Regenerating with content:', content);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      const newContent = `# 优化后的提示词\n\n基于您的输入：\n${content}\n\n这是重新生成的优化内容...`;
      setOutputContent(newContent);
      
      // Auto-save as new version
      const newVersion: Version = {
        id: Date.now().toString(),
        content: newContent,
        type: 'optimize',
        createdAt: new Date().toISOString(),
      };
      setVersions(prev => [newVersion, ...prev]);
    } catch (error) {
      console.error('Failed to regenerate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModify = (content: string) => {
    setEditorContent(content);
  };

  const handleSave = (content: string) => {
    const newVersion: Version = {
      id: Date.now().toString(),
      content,
      type: 'save',
      createdAt: new Date().toISOString(),
    };
    setVersions(prev => [newVersion, ...prev]);
  };

  const handleViewVersion = (version: Version) => {
    setOutputContent(version.content);
  };

  const handleRollback = (version: Version) => {
    setOutputContent(version.content);
    setEditorContent(version.content);
  };

  const tabs = [
    {
      id: 'markdown',
      label: 'Markdown 原文',
      content: (
        <MarkdownTab
          content={outputContent}
          onModify={handleModify}
          onSave={handleSave}
        />
      ),
    },
    {
      id: 'versions',
      label: '版本记录',
      content: (
        <VersionsTab
          versions={versions}
          onViewVersion={handleViewVersion}
          onRollback={handleRollback}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop: 5:5 split layout, Mobile: stacked layout */}
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Left Editor Panel - 50% on desktop */}
        <div className="w-full lg:w-1/2 border-r border-gray-200 bg-white">
          <EditorPanel
            initialContent={editorContent}
            onRegenerate={handleRegenerate}
            isLoading={isLoading}
          />
        </div>

        {/* Right Output Panel - 50% on desktop */}
        <div className="w-full lg:w-1/2 bg-white">
          <OutputTabs tabs={tabs} defaultTab="markdown" />
        </div>
      </div>
    </div>
  );
}
