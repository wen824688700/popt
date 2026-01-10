'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EditorPanel from '@/components/EditorPanel';
import MarkdownTab from '@/components/MarkdownTab';
import VersionHistory from '@/components/VersionHistory';
import VersionComparison from '@/components/VersionComparison';
import UserAvatar from '@/components/UserAvatar';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/authStore';

interface Version {
  id: string;
  content: string;
  type: 'save' | 'optimize';
  createdAt: string;
  description?: string;
  versionNumber: string; // 版本号，如 "1.0", "1.1", "2.0"
}

type ViewMode = 'editor' | 'comparison';

export default function WorkspacePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [outputContent, setOutputContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [editorContent, setEditorContent] = useState('');
  const [selectedVersionIds, setSelectedVersionIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [currentVersionId, setCurrentVersionId] = useState<string | undefined>();

  // 计算下一个版本号
  const getNextVersionNumber = (type: 'save' | 'optimize'): string => {
    if (versions.length === 0) return '1.0';
    
    const latestVersion = versions[0]; // 最新版本
    const [major, minor] = latestVersion.versionNumber.split('.').map(Number);
    
    if (type === 'optimize') {
      // 优化生成：小版本号递增 (1.0 -> 1.1 -> 1.2)
      return `${major}.${minor + 1}`;
    } else {
      // 手动保存：大版本号递增 (1.x -> 2.0, 2.x -> 3.0)
      return `${major + 1}.0`;
    }
  };

  // 从 localStorage 加载初始数据
  useEffect(() => {
    const savedPrompt = localStorage.getItem('currentPrompt');
    const originalInput = localStorage.getItem('originalInput');
    
    if (savedPrompt) {
      setOutputContent(savedPrompt);
      // 创建初始版本
      const initialVersion: Version = {
        id: Date.now().toString(),
        content: savedPrompt,
        type: 'optimize',
        createdAt: new Date().toISOString(),
        description: '初始生成版本',
        versionNumber: '1.0',
      };
      setVersions([initialVersion]);
      setCurrentVersionId(initialVersion.id);
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
      const savedFramework = localStorage.getItem('selectedFramework');
      const savedAnswers = localStorage.getItem('clarificationAnswers');
      
      if (!savedFramework || !savedAnswers) {
        console.error('Missing framework or clarification answers');
        alert('缺少必要的信息，请返回首页重新开始');
        setIsLoading(false);
        return;
      }

      const framework = JSON.parse(savedFramework);
      const answers = JSON.parse(savedAnswers);

      const data = await apiClient.generatePrompt({
        input: content,
        framework_id: framework.id,
        clarification_answers: answers,
        user_id: 'test_user',
        account_type: 'free',
      });

      const newContent = data.output;
      setOutputContent(newContent);
      
      // 自动保存为新版本
      const newVersion: Version = {
        id: data.version_id || Date.now().toString(),
        content: newContent,
        type: 'optimize',
        createdAt: new Date().toISOString(),
        description: '重新优化生成',
        versionNumber: getNextVersionNumber('optimize'),
      };
      setVersions(prev => [newVersion, ...prev]);
      setCurrentVersionId(newVersion.id);
    } catch (error) {
      console.error('Failed to regenerate:', error);
      alert(`重新生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModify = (content: string) => {
    setEditorContent(content);
    setViewMode('editor');
  };

  const handleSave = (content: string) => {
    const newVersion: Version = {
      id: Date.now().toString(),
      content,
      type: 'save',
      createdAt: new Date().toISOString(),
      description: '手动保存',
      versionNumber: getNextVersionNumber('save'),
    };
    setVersions(prev => [newVersion, ...prev]);
    setCurrentVersionId(newVersion.id);
  };

  const handleSelectVersion = (versionId: string) => {
    if (selectedVersionIds.includes(versionId)) {
      // 取消选择
      const newSelected = selectedVersionIds.filter(id => id !== versionId);
      setSelectedVersionIds(newSelected);
      if (newSelected.length < 2) {
        setViewMode('editor');
      }
    } else {
      // 选择版本
      if (selectedVersionIds.length < 2) {
        const newSelected = [...selectedVersionIds, versionId];
        setSelectedVersionIds(newSelected);
        
        // 如果选择了两个版本，切换到对比模式
        if (newSelected.length === 2) {
          setViewMode('comparison');
        } else {
          // 单个版本，显示在编辑器
          const version = versions.find(v => v.id === versionId);
          if (version) {
            setOutputContent(version.content);
            setCurrentVersionId(version.id);
            setViewMode('editor');
          }
        }
      } else {
        // 已经选择了两个，替换第二个
        const newSelected = [selectedVersionIds[0], versionId];
        setSelectedVersionIds(newSelected);
        setViewMode('comparison');
      }
    }
  };

  const handleRestoreVersion = (version: Version) => {
    setOutputContent(version.content);
    setEditorContent(version.content);
    setCurrentVersionId(version.id);
    setSelectedVersionIds([]);
    setViewMode('editor');
  };

  const handleUpdateVersionNumber = (versionId: string, newVersionNumber: string) => {
    setVersions(prev => prev.map(v => 
      v.id === versionId ? { ...v, versionNumber: newVersionNumber } : v
    ));
  };

  const handleMerge = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setOutputContent(version.content);
      setCurrentVersionId(version.id);
      setSelectedVersionIds([]);
      setViewMode('editor');
    }
  };

  const handleRevert = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setOutputContent(version.content);
      setEditorContent(version.content);
      setCurrentVersionId(version.id);
      setSelectedVersionIds([]);
      setViewMode('editor');
    }
  };

  // 获取对比的两个版本
  const comparisonVersions = selectedVersionIds.length === 2
    ? {
        old: versions.find(v => v.id === selectedVersionIds[0]),
        new: versions.find(v => v.id === selectedVersionIds[1]),
      }
    : null;

  return (
    <div className="min-h-screen bg-[#1a2332]">
      {/* 顶部导航 */}
      <nav className="bg-[#242d3d] border-b border-[#3d4a5c] sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 左侧 Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Prompt Optimizer
              </span>
            </div>

            {/* 右侧按钮组 */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium">首页</span>
              </button>
              
              {/* 根据认证状态显示不同按钮 */}
              {isAuthenticated && user ? (
                <button
                  onClick={() => router.push('/account')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1a2332] hover:bg-[#242d3d] rounded-xl transition-colors border border-[#3d4a5c]"
                  title="账户设置"
                >
                  <UserAvatar user={user} size="sm" />
                  <span className="text-sm text-gray-300 font-medium">{user.name || user.email}</span>
                </button>
              ) : (
                <button
                  onClick={() => router.push('/account')}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
                >
                  登录 / 注册
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 - 三栏布局 */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* 左侧：版本历史 */}
        <div className="w-64 border-r border-[#3d4a5c] bg-[#1a2332]">
          <VersionHistory
            versions={versions}
            currentVersionId={currentVersionId}
            selectedVersionIds={selectedVersionIds}
            onSelectVersion={handleSelectVersion}
            onRestoreVersion={handleRestoreVersion}
            onUpdateVersionNumber={handleUpdateVersionNumber}
          />
        </div>

        {/* 中间：编辑器 */}
        <div className="flex-1 border-r border-[#3d4a5c]">
          <EditorPanel
            initialContent={editorContent}
            onRegenerate={handleRegenerate}
            isLoading={isLoading}
          />
        </div>

        {/* 右侧：输出区或对比区 */}
        <div className="flex-1">
          {viewMode === 'comparison' && comparisonVersions?.old && comparisonVersions?.new ? (
            <VersionComparison
              oldVersion={comparisonVersions.old}
              newVersion={comparisonVersions.new}
              onMerge={handleMerge}
              onRevert={handleRevert}
            />
          ) : (
            <MarkdownTab
              content={outputContent}
              onModify={handleModify}
              onSave={handleSave}
            />
          )}
        </div>
      </div>
    </div>
  );
}
