-- 创建配额表
CREATE TABLE IF NOT EXISTS user_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    quota_date DATE NOT NULL,
    used_count INTEGER NOT NULL DEFAULT 0,
    account_type TEXT NOT NULL DEFAULT 'free',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- 唯一约束：每个用户每天只有一条记录
    UNIQUE(user_id, quota_date)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_quotas_user_date ON user_quotas(user_id, quota_date);
CREATE INDEX IF NOT EXISTS idx_user_quotas_date ON user_quotas(quota_date);

-- 添加注释
COMMENT ON TABLE user_quotas IS '用户每日配额记录';
COMMENT ON COLUMN user_quotas.user_id IS '用户ID';
COMMENT ON COLUMN user_quotas.quota_date IS '配额日期（用户时区）';
COMMENT ON COLUMN user_quotas.used_count IS '已使用次数';
COMMENT ON COLUMN user_quotas.account_type IS '账户类型（free/pro）';

-- 启用 RLS（行级安全）
ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看和更新自己的配额
CREATE POLICY "Users can view own quotas"
    ON user_quotas FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own quotas"
    ON user_quotas FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own quotas"
    ON user_quotas FOR UPDATE
    USING (auth.uid()::text = user_id);

-- Service role 可以访问所有数据（用于后端服务）
CREATE POLICY "Service role has full access to quotas"
    ON user_quotas
    USING (auth.role() = 'service_role');
