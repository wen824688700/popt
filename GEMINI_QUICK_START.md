# Gemini 模型快速启动指南

## 🚀 快速开始

### 1. 配置 Gemini API 密钥

编辑 `backend/.env` 文件，添加你的 Gemini API 密钥：

```bash
# Google Gemini API
GEMINI_API_KEY=AIzaSyDlHCR08ImBVgfbSTIxS8lryWhyhF82yzI
GEMINI_BASE_URL=https://generativelanguage.googleapis.com
```

### 2. 启动后端服务

```bash
cd backend
uvicorn app.main:app --reload
```

后端将在 http://localhost:8000 启动

### 3. 启动前端服务

```bash
cd frontend
npm run dev
```

前端将在 http://localhost:3000 启动

### 4. 使用 Gemini 模型

1. 打开浏览器访问 http://localhost:3000
2. 点击"开始使用"进入输入页面
3. 在底部工具栏找到模型选择器
4. 点击选择 **Gemini 2.0**
5. 输入你的提示词需求
6. 点击发送，系统将使用 Gemini 模型生成优化提示词

## 📝 模型选择说明

### DeepSeek
- **描述**: 国内顶级中文大模型，推理能力强
- **优势**: 中文理解优秀，逻辑推理强，国内直连
- **适用场景**: 需要强逻辑推理的任务

### Gemini 2.0
- **描述**: Google 最新多模态模型，创意能力出色
- **优势**: 多模态支持，创意生成能力强
- **适用场景**: 需要创意性内容生成的任务
- **注意**: 在国内可能需要配置代理

## 🔧 网络配置（可选）

如果在国内访问 Gemini API 遇到网络问题，可以：

### 方案 1: 使用代理

设置环境变量：

```bash
# Windows
set HTTP_PROXY=http://127.0.0.1:7890
set HTTPS_PROXY=http://127.0.0.1:7890

# Linux/Mac
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
```

### 方案 2: 修改 hosts 文件

添加 Google API 的 IP 地址到 hosts 文件（需要管理员权限）

### 方案 3: 使用 VPN

确保 VPN 支持 API 访问

## 🧪 测试 Gemini 集成

运行集成测试：

```bash
cd backend
python test_gemini_integration.py
```

预期输出：
```
✓ DeepSeek 服务类型: DeepSeekService
✓ Gemini 服务类型: GeminiService
✓ 正确抛出异常: 不支持的模型类型: unsupported_model
✓ LLM 工厂测试通过！
```

## 📊 API 使用示例

### 框架匹配

```bash
curl -X POST "http://localhost:8000/api/v1/frameworks/match" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "我想写一个关于产品营销的提示词",
    "user_type": "free",
    "model": "gemini"
  }'
```

### 提示词生成

```bash
curl -X POST "http://localhost:8000/api/v1/prompts/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "我想写一个关于产品营销的提示词",
    "framework_id": "RACEF",
    "clarification_answers": {
      "goalClarity": "生成营销文案",
      "targetAudience": "年轻消费者",
      "contextCompleteness": "新产品发布",
      "formatRequirements": "简洁有力",
      "constraints": "不超过200字"
    },
    "user_id": "test_user",
    "account_type": "free",
    "model": "gemini"
  }'
```

## 🐛 常见问题

### Q: Gemini API 返回 403 错误
**A**: 检查 API 密钥是否正确，确保密钥有效且未过期

### Q: 连接超时
**A**: 可能是网络问题，尝试配置代理或使用 VPN

### Q: 模型选择器不显示 Gemini
**A**: 清除浏览器缓存，刷新页面

### Q: 后端启动失败
**A**: 检查 `.env` 文件是否正确配置了 `GEMINI_API_KEY`

## 📚 相关文档

- [Gemini API 官方文档](https://ai.google.dev/gemini-api/docs)
- [完整集成说明](./GEMINI_INTEGRATION_SUMMARY.md)
- [项目 README](./README.md)

## 💡 提示

- 首次使用建议先用 DeepSeek 测试，确保基本功能正常
- Gemini 模型在创意性任务上表现更好
- 可以对比两个模型的输出，选择最适合的结果
- 模型选择会自动保存，下次访问时会记住你的选择

## 🎉 开始使用

现在你可以开始使用 Gemini 模型优化你的提示词了！

如有问题，请查看 [GEMINI_INTEGRATION_SUMMARY.md](./GEMINI_INTEGRATION_SUMMARY.md) 获取更多技术细节。
