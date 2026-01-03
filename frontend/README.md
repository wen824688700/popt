# Prompt Optimizer Frontend

基于 Next.js 14 的前端应用，使用 TypeScript 和 Tailwind CSS 构建。

## 功能特性

### ✅ 已完成（Task 2）

- **响应式首页布局**：支持桌面和移动设备
- **模型选择器**：下拉菜单选择 LLM 模型（当前支持 DeepSeek）
- **附件上传**：支持 .txt, .md, .pdf 文件，最大 5MB
- **输入验证**：最少 10 字符验证，实时字符计数
- **优化按钮**：带加载状态的交互按钮
- **Toast 通知**：优雅的消息提示
- **错误边界**：全局错误处理
- **本地存储**：持久化模型选择
- **可访问性**：键盘导航和 ARIA 标签

## 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── ModelSelector.tsx
│   ├── AttachmentUploader.tsx
│   ├── InputTextarea.tsx
│   ├── OptimizeButton.tsx
│   ├── Toast.tsx
│   ├── LoadingSkeleton.tsx
│   └── ErrorBoundary.tsx
├── lib/                   # 工具函数和 Hooks
│   ├── types.ts          # TypeScript 类型定义
│   ├── utils.ts          # 工具函数
│   └── hooks/
│       └── useLocalStorage.ts
└── public/               # 静态资源
```

## 技术栈

- **Next.js 14**: React 框架（App Router）
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **React 18**: UI 库

## 下一步

- [ ] Task 3: 实现框架选择弹窗
- [ ] Task 4: 实现工作台页面
- [ ] Task 5: 实现账户页面
- [ ] Task 6: 前端状态管理
- [ ] Task 7: 错误处理与 UI 优化

## 环境变量

创建 `.env.local` 文件：

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
