'use client';

interface Version {
  id: string;
  content: string;
  type: 'save' | 'optimize';
  createdAt: string; // UTC ISO 8601
}

interface VersionsTabProps {
  versions: Version[];
  onViewVersion: (version: Version) => void;
  onRollback: (version: Version) => void;
}

export default function VersionsTab({ versions, onViewVersion, onRollback }: VersionsTabProps) {
  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const getTypeLabel = (type: 'save' | 'optimize') => {
    return type === 'save' ? '保存' : '优化';
  };

  // Sort versions by timestamp descending (newest first)
  const sortedVersions = [...versions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Keep only the most recent 10 versions
  const displayVersions = sortedVersions.slice(0, 10);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">
          版本历史 ({displayVersions.length}/10)
        </h3>
      </div>

      {/* Version List */}
      <div className="flex-1 overflow-auto">
        {displayVersions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            暂无版本记录
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {displayVersions.map((version) => (
              <div
                key={version.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Version Title */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {formatTimestamp(version.createdAt)} · {getTypeLabel(version.type)}
                  </h4>
                  <span className={`px-2 py-1 text-xs rounded ${
                    version.type === 'optimize' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {getTypeLabel(version.type)}
                  </span>
                </div>

                {/* Version Preview */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {version.content.substring(0, 100)}...
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewVersion(version)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    查看
                  </button>
                  <button
                    onClick={() => onRollback(version)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    回滚到此版本
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
