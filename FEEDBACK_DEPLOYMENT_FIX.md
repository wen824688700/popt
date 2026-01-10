# 反馈功能票数不更新问题修复指南

## 问题描述

生产环境中，功能投票的票数显示固定值（42票、38票等），不会随用户投票而更新。

## 问题原因

反馈功能使用了 Supabase 数据库存储投票数据，但在以下情况会回退到**模拟数据模式**（票数写死）：

1. **`DEV_MODE=true`** - 开发模式启用
2. **Supabase 配置缺失** - `SUPABASE_URL` 或 `SUPABASE_KEY` 未设置
3. **Supabase 连接失败** - API Key 无效或网络问题

## 解决方案

### 步骤 1: 检查 Vercel 环境变量

登录 Vercel Dashboard → 项目 → Settings → Environment Variables

确认以下配置：

```bash
# ❌ 错误配置
DEV_MODE=true  # 不应该在生产环境设置为 true

# ✅ 正确配置
DEV_MODE=false  # 或者完全不设置这个变量
ENVIRONMENT=production
```

### 步骤 2: 验证 Supabase 配置

确认以下环境变量已正确设置：

```bash
SUPABASE_URL=https://rfjymddhjocvnpsxkuiw.supabase.co
SUPABASE_KEY=你的-service-role-key  # ⚠️ 必须是 service_role key
```

**获取正确的 Service Role Key**：

1. 登录 Supabase Dashboard
2. 选择项目
3. 进入 Settings → API
4. 复制 **service_role** key（不是 anon key）
5. 更新 Vercel 环境变量

### 步骤 3: 验证数据库表

确认 Supabase 中已创建反馈相关的表：

```sql
-- 检查表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('feature_options', 'user_votes', 'user_feedback');
```

如果表不存在，执行迁移文件：

```bash
# 在 Supabase SQL Editor 中执行
backend/migrations/create_feedback_tables.sql
```

### 步骤 4: 重新部署

修改环境变量后，触发重新部署：

```bash
git commit --allow-empty -m "chore: 触发重新部署"
git push origin main
```

或在 Vercel Dashboard 中点击 "Redeploy"。

### 步骤 5: 验证修复

部署完成后，检查以下内容：

1. **查看 Vercel 部署日志**：
   - 搜索 "Supabase 客户端初始化成功"
   - 不应该看到 "使用模拟数据" 的警告

2. **测试投票功能**：
   - 访问账户页面
   - 选择功能并提交投票
   - 刷新页面，票数应该增加

3. **检查数据库**：
   ```sql
   -- 查看投票记录
   SELECT * FROM user_votes ORDER BY created_at DESC LIMIT 10;
   
   -- 统计每个选项的票数
   SELECT 
     fo.name,
     COUNT(uv.id) as vote_count
   FROM feature_options fo
   LEFT JOIN user_votes uv ON fo.id = uv.option_id
   GROUP BY fo.id, fo.name
   ORDER BY vote_count DESC;
   ```

## 本地开发配置

本地开发环境可以保持 `DEV_MODE=true`，这样不需要连接 Supabase：

```bash
# backend/.env
DEV_MODE=true  # 本地开发使用模拟数据
ENVIRONMENT=development
```

## 诊断工具

运行测试脚本检查配置：

```bash
cd backend
python test_feedback_connection.py
```

预期输出（生产环境）：

```
✅ Supabase 客户端创建成功
✅ 查询成功，返回 X 条记录
✅ FeedbackService.supabase 已初始化
✅ 获取到 6 个功能选项
```

如果看到以下警告，说明配置有问题：

```
⚠️  警告: DEV_MODE=true，将使用模拟数据
❌ Supabase 客户端创建失败
⚠️  警告: FeedbackService.supabase 为 None
```

## 常见问题

### Q1: 为什么本地开发票数是固定的？

**A**: 本地开发环境 `DEV_MODE=true`，使用模拟数据。这是正常的，不影响生产环境。

### Q2: 修改环境变量后票数还是不变？

**A**: 检查以下内容：
1. 确认环境变量已保存并重新部署
2. 清除浏览器缓存
3. 检查 Vercel 部署日志是否有错误
4. 验证 Supabase API Key 是否正确

### Q3: 如何确认使用的是真实数据还是模拟数据？

**A**: 查看 Vercel 部署日志：
- 真实数据：`Supabase 客户端初始化成功`
- 模拟数据：`使用模拟数据返回功能选项`

### Q4: 投票后票数立即更新吗？

**A**: 是的，投票提交成功后会重新加载选项，票数会立即更新。

## 总结

**核心问题**：生产环境配置了 `DEV_MODE=true` 或 Supabase 配置错误

**解决方案**：
1. ✅ 设置 `DEV_MODE=false`（或不设置）
2. ✅ 配置正确的 `SUPABASE_KEY`（service_role key）
3. ✅ 确认数据库表已创建
4. ✅ 重新部署并验证

修复后，票数会实时更新，不再显示固定值。
