-- 修复反馈功能：将 user_id 从 UUID 改为 TEXT 类型
-- 这样可以支持任意格式的用户 ID（包括开发模式的 "dev-user-001"）

-- 1. 删除现有的 RLS 策略（因为它们依赖于 auth.uid()）
DROP POLICY IF EXISTS "user_votes_select_policy" ON user_votes;
DROP POLICY IF EXISTS "user_votes_insert_policy" ON user_votes;
DROP POLICY IF EXISTS "user_votes_delete_policy" ON user_votes;
DROP POLICY IF EXISTS "user_feedback_select_policy" ON user_feedback;
DROP POLICY IF EXISTS "user_feedback_insert_policy" ON user_feedback;

-- 2. 删除外键约束（如果存在）
-- 注意：这会删除所有现有的投票和反馈数据
DROP TABLE IF EXISTS user_votes CASCADE;
DROP TABLE IF EXISTS user_feedback CASCADE;

-- 3. 重新创建 user_votes 表（user_id 为 TEXT 类型）
CREATE TABLE user_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  option_id UUID NOT NULL REFERENCES feature_options(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, option_id)
);

-- 4. 重新创建 user_feedback 表（user_id 为 TEXT 类型）
CREATE TABLE user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 重新创建索引
CREATE INDEX idx_user_votes_user_id ON user_votes(user_id);
CREATE INDEX idx_user_votes_option_id ON user_votes(option_id);
CREATE INDEX idx_user_feedback_user_id ON user_feedback(user_id);

-- 6. 启用 RLS
ALTER TABLE user_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- 7. 创建新的 RLS 策略（允许所有操作，安全性由后端 API 保证）
CREATE POLICY "user_votes_select_policy" ON user_votes
  FOR SELECT USING (true);

CREATE POLICY "user_votes_insert_policy" ON user_votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "user_votes_delete_policy" ON user_votes
  FOR DELETE USING (true);

CREATE POLICY "user_feedback_select_policy" ON user_feedback
  FOR SELECT USING (true);

CREATE POLICY "user_feedback_insert_policy" ON user_feedback
  FOR INSERT WITH CHECK (true);

-- 8. 重新创建视图
DROP VIEW IF EXISTS feature_options_with_votes;
CREATE VIEW feature_options_with_votes AS
SELECT 
  fo.id,
  fo.name,
  fo.description,
  fo.display_order,
  fo.is_active,
  fo.created_at,
  COUNT(uv.id) as vote_count
FROM feature_options fo
LEFT JOIN user_votes uv ON fo.id = uv.option_id
GROUP BY fo.id, fo.name, fo.description, fo.display_order, fo.is_active, fo.created_at
ORDER BY fo.display_order;

-- 完成！
-- 现在 user_id 可以是任意字符串格式，包括 "dev-user-001" 或 Supabase UUID

