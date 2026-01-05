# Gemini 模型集成 - 部署检查清单

## ✅ 完成的工作

### 后端 (Backend)

- [x] 创建 `BaseLLMService` 抽象基类
- [x] 重构 `DeepSeekService` 继承基类
- [x] 实现 `GeminiService` 服务
- [x] 创建 `LLMFactory` 工厂类
- [x] 更新 `FrameworkMatcher` 支持多模型
- [x] 更新 API 路由支持模型参数
  - [x] `frameworks.py` - 框架匹配
  - [x] `prompts.py` - 提示词生成
- [x] 更新配置文件添加 Gemini API 配置
- [x] 更新所有测试文件
- [x] 创建集成测试

### 前端 (Frontend)

- [x] 更新 `ModelSelector` 组件
  - [x] 添加 Gemini 2.0 选项
  - [x] 添加模型描述
  - [x] 优化样式适配工具栏
- [x] 更新 `input` 页面
  - [x] 集成模型选择器
  - [x] 传递模型参数到 API
- [x] 更新 API 客户端支持模型参数
- [x] 使用 Zustand 管理模型状态
- [x] 修复 ESLint 配置问题
- [x] 验证构建成功

### 文档

- [x] 创建集成总结文档
- [x] 创建快速启动指南
- [x] 创建部署检查清单

## 🚀 部署前检查

### 1. 环境变量配置

#### Railway (Backend)

确保在 Railway 项目中配置以下环境变量：

```bash
# 现有变量
DATABASE_URL=postgresql://...
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_BASE_URL=https://api.deepseek.com
SUPABASE_URL=https://...
SUPABASE_KEY=...
CREEM_API_KEY=...
CREEM_WEBHOOK_SECRET=...
JWT_SECRET=...
ENVIRONMENT=production

# 新增变量
GEMINI_API_KEY=AIzaSyDlHCR08ImBVgfbSTIxS8lryWhyhF82yzI
GEMINI_BASE_URL=https://generativelanguage.googleapis.com
```

#### Vercel (Frontend)

前端无需额外配置，现有环境变量即可：

```bash
NEXT_PUBLIC_API_URL=https://api.384866.xyz
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=https://384866.xyz
```

### 2. 代码检查

#### 后端

```bash
cd backend

# 检查 Python 语法
python -m py_compile app/services/*.py app/api/*.py

# 运行测试
python test_gemini_integration.py

# 检查导入
python -c "from app.main import app; print('✓ 导入成功')"
```

#### 前端

```bash
cd frontend

# TypeScript 类型检查
npm run type-check

# 构建检查
npm run build

# ESLint 检查
npm run lint
```

### 3. 功能测试

#### 本地测试

1. **启动后端**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **启动前端**
   ```bash
   cd frontend
   npm run dev
   ```

3. **测试流程**
   - [ ] 访问 http://localhost:3000
   - [ ] 进入输入页面
   - [ ] 选择 DeepSeek 模型，测试生成
   - [ ] 选择 Gemini 模型，测试生成
   - [ ] 验证模型选择状态持久化
   - [ ] 检查错误处理

#### API 测试

```bash
# 测试 DeepSeek
curl -X POST "http://localhost:8000/api/v1/frameworks/match" \
  -H "Content-Type: application/json" \
  -d '{"input": "测试输入", "user_type": "free", "model": "deepseek"}'

# 测试 Gemini
curl -X POST "http://localhost:8000/api/v1/frameworks/match" \
  -H "Content-Type: application/json" \
  -d '{"input": "测试输入", "user_type": "free", "model": "gemini"}'
```

### 4. 部署步骤

#### Railway (Backend)

1. **提交代码到 Git**
   ```bash
   git add .
   git commit -m "feat: 集成 Gemini 2.0 模型支持"
   git push origin main
   ```

2. **Railway 自动部署**
   - Railway 会自动检测到代码变更
   - 等待构建和部署完成
   - 检查部署日志确保无错误

3. **配置环境变量**
   - 在 Railway 控制台添加 `GEMINI_API_KEY`
   - 在 Railway 控制台添加 `GEMINI_BASE_URL`
   - 重启服务使环境变量生效

4. **验证部署**
   ```bash
   curl https://api.384866.xyz/api/v1/frameworks/match \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"input": "测试", "user_type": "free", "model": "gemini"}'
   ```

#### Vercel (Frontend)

1. **提交代码到 Git**
   ```bash
   git add .
   git commit -m "feat: 前端支持 Gemini 模型选择"
   git push origin main
   ```

2. **Vercel 自动部署**
   - Vercel 会自动检测到代码变更
   - 等待构建和部署完成
   - 检查部署日志确保无错误

3. **验证部署**
   - 访问 https://384866.xyz
   - 测试模型选择功能
   - 验证 API 调用正常

### 5. 监控和日志

#### 检查项

- [ ] Railway 部署日志无错误
- [ ] Vercel 部署日志无错误
- [ ] API 响应时间正常
- [ ] 错误率在可接受范围
- [ ] Gemini API 调用成功率

#### 监控命令

```bash
# 查看 Railway 日志
railway logs

# 测试生产环境 API
curl https://api.384866.xyz/docs
```

## 🔍 验证清单

### 功能验证

- [ ] DeepSeek 模型正常工作
- [ ] Gemini 模型正常工作
- [ ] 模型切换流畅
- [ ] 模型选择状态持久化
- [ ] 错误提示友好
- [ ] 网络错误处理正确

### 性能验证

- [ ] 页面加载速度正常
- [ ] API 响应时间 < 3秒
- [ ] 模型切换无延迟
- [ ] 无内存泄漏

### 兼容性验证

- [ ] Chrome 浏览器正常
- [ ] Firefox 浏览器正常
- [ ] Safari 浏览器正常
- [ ] 移动端显示正常

## 📝 回滚计划

如果部署后发现问题，可以快速回滚：

### 后端回滚

```bash
# 回滚到上一个版本
git revert HEAD
git push origin main

# 或者在 Railway 控制台选择之前的部署版本
```

### 前端回滚

```bash
# 回滚到上一个版本
git revert HEAD
git push origin main

# 或者在 Vercel 控制台选择之前的部署版本
```

## 🎉 部署完成后

### 通知用户

- [ ] 更新产品文档
- [ ] 发布更新公告
- [ ] 更新帮助文档

### 后续优化

- [ ] 收集用户反馈
- [ ] 监控模型使用情况
- [ ] 优化模型选择体验
- [ ] 添加模型性能对比

## 📞 支持

如遇到问题，请查看：

- [Gemini 集成总结](./GEMINI_INTEGRATION_SUMMARY.md)
- [快速启动指南](./GEMINI_QUICK_START.md)
- [项目 README](./README.md)

---

**部署日期**: _待填写_  
**部署人员**: _待填写_  
**版本号**: v1.1.0 (Gemini 集成)
