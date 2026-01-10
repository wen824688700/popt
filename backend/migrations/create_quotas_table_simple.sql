-- 创建配额表（简化版，适合快速部署）
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

-- 创建索引（提升查询性能）
CREATE INDEX IF NOT EXISTS idx_user_quotas_user_date ON user_quotas(user_id, quota_date);
CREATE INDEX IF NOT EXISTS idx_user_quotas_date ON user_quotas(quota_date);

-- 添加注释
COMMENT ON TABLE user_quotas IS '用户每日配额记录';
COMMENT ON COLUMN user_quotas.user_id IS '用户ID';
COMMENT ON COLUMN user_quotas.quota_date IS '配额日期';
COMMENT ON COLUMN user_quotas.used_count IS '已使用次数';
COMMENT ON COLUMN user_quotas.account_type IS '账户类型（free/pro）';
