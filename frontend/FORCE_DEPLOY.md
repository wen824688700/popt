# 强制部署说明

## 问题
网站上只显示 DeepSeek 一个模型，Gemini 2.0 没有显示。

## 原因
前端代码已更新，但 Vercel 可能使用了缓存的旧版本。

## 解决方案

### 方法 1: Git 提交触发部署

```bash
# 1. 提交所有更改
git add .
git commit -m "feat: 添加 Gemini 2.0 模型支持 - 强制部署"
git push origin main

# 2. 等待 Vercel 自动部署（约 1-2 分钟）

# 3. 清除浏览器缓存后访问
# Chrome: Ctrl + Shift + Delete
# 或使用无痕模式: Ctrl + Shift + N
```

### 方法 2: Vercel 控制台手动部署

1. 登录 Vercel 控制台: https://vercel.com
2. 找到 prompt-optimizer 项目
3. 点击 "Deployments" 标签
4. 点击最新的部署
5. 点击 "Redeploy" 按钮
6. 选择 "Redeploy with existing Build Cache cleared"

### 方法 3: 本地验证

```bash
cd frontend

# 清除构建缓存
rm -rf .next
rm -rf node_modules/.cache

# 重新构建
npm run build

# 本地测试
npm run dev

# 访问 http://localhost:3000/input
# 应该能看到两个模型选项
```

## 验证步骤

1. 访问 https://384866.xyz/test-model
2. 应该看到模型选择器测试页面
3. 点击模型选择器
4. 应该看到两个选项：
   - DeepSeek - 国内顶级中文大模型，推理能力强
   - Gemini 2.0 - Google 最新多模态模型，创意能力出色

## 如果还是不行

检查 Vercel 环境变量和构建日志：

```bash
# 查看 Vercel 构建日志
vercel logs

# 检查部署状态
vercel ls
```

## 紧急回滚

如果新版本有问题，可以在 Vercel 控制台回滚到之前的部署版本。
