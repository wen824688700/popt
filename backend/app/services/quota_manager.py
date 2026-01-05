"""
Quota Manager Service for managing user quotas
"""
from datetime import datetime, timezone, timedelta
from typing import Optional
from pydantic import BaseModel
import logging
import os

logger = logging.getLogger(__name__)


class QuotaStatus(BaseModel):
    """配额状态模型"""
    user_id: str
    used: int
    total: int
    reset_time: datetime  # UTC
    can_generate: bool


class QuotaManager:
    """管理用户配额"""
    
    def __init__(self):
        # 使用内存存储（生产环境应使用数据库）
        self.quotas = {}
        self.FREE_QUOTA = 5
        self.PRO_QUOTA = 100
        
        # 检查是否为开发/测试环境
        self.environment = os.getenv("ENVIRONMENT", "development").lower()
        self.skip_quota_check = self.environment in ["development", "test", "testing"]
        
        if self.skip_quota_check:
            logger.info(f"Quota check disabled for {self.environment} environment")
    
    def _get_utc_date(self) -> str:
        """获取当前 UTC 日期（YYYY-MM-DD 格式）"""
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    def _get_next_reset_time(self) -> datetime:
        """获取下次重置时间（UTC 00:00）"""
        now = datetime.now(timezone.utc)
        tomorrow = now + timedelta(days=1)
        reset_time = datetime(
            tomorrow.year,
            tomorrow.month,
            tomorrow.day,
            0, 0, 0,
            tzinfo=timezone.utc
        )
        return reset_time
    
    def _get_user_quota_key(self, user_id: str) -> str:
        """生成用户配额键"""
        date = self._get_utc_date()
        return f"{user_id}:{date}"
    
    async def check_quota(
        self,
        user_id: str,
        account_type: str = "free"
    ) -> QuotaStatus:
        """
        检查用户当日配额
        
        Args:
            user_id: 用户 ID
            account_type: 账户类型（free/pro）
        
        Returns:
            QuotaStatus 包含剩余配额和重置时间
        """
        try:
            quota_key = self._get_user_quota_key(user_id)
            
            # 获取配额限制
            total = self.PRO_QUOTA if account_type == "pro" else self.FREE_QUOTA
            
            # 获取已使用配额
            used = self.quotas.get(quota_key, 0)
            
            # 开发/测试环境跳过配额检查
            if self.skip_quota_check:
                can_generate = True
                logger.debug(f"Quota check skipped for {self.environment} environment")
            else:
                # 计算是否可以生成
                can_generate = used < total
            
            # 获取重置时间
            reset_time = self._get_next_reset_time()
            
            status = QuotaStatus(
                user_id=user_id,
                used=used,
                total=total,
                reset_time=reset_time,
                can_generate=can_generate
            )
            
            logger.info(f"Checked quota for user {user_id}: {used}/{total} (can_generate: {can_generate})")
            return status
            
        except Exception as e:
            logger.error(f"Error checking quota for user {user_id}: {e}")
            raise
    
    async def consume_quota(
        self,
        user_id: str,
        account_type: str = "free"
    ) -> bool:
        """
        消耗一次配额
        
        Args:
            user_id: 用户 ID
            account_type: 账户类型（free/pro）
        
        Returns:
            是否成功消耗（配额不足返回 False）
        """
        try:
            # 开发/测试环境直接返回成功
            if self.skip_quota_check:
                logger.debug(f"Quota consumption skipped for {self.environment} environment")
                return True
            
            # 先检查配额
            status = await self.check_quota(user_id, account_type)
            
            if not status.can_generate:
                logger.warning(f"User {user_id} quota exceeded: {status.used}/{status.total}")
                return False
            
            # 消耗配额
            quota_key = self._get_user_quota_key(user_id)
            self.quotas[quota_key] = self.quotas.get(quota_key, 0) + 1
            
            logger.info(f"Consumed quota for user {user_id}: {self.quotas[quota_key]}/{status.total}")
            return True
            
        except Exception as e:
            logger.error(f"Error consuming quota for user {user_id}: {e}")
            raise
    
    async def reset_daily_quotas(self):
        """
        重置所有用户的每日配额（定时任务调用）
        
        这个方法应该在每日 UTC 00:00 被定时任务调用
        """
        try:
            # 获取昨天的日期
            yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
            
            # 删除昨天的配额记录
            keys_to_delete = [key for key in self.quotas.keys() if yesterday in key]
            for key in keys_to_delete:
                del self.quotas[key]
            
            logger.info(f"Reset daily quotas, removed {len(keys_to_delete)} old records")
            
        except Exception as e:
            logger.error(f"Error resetting daily quotas: {e}")
            raise
    
    def get_quota_info(self, user_id: str, account_type: str = "free") -> dict:
        """
        获取用户配额信息（同步方法，用于快速查询）
        
        Args:
            user_id: 用户 ID
            account_type: 账户类型（free/pro）
        
        Returns:
            包含配额信息的字典
        """
        quota_key = self._get_user_quota_key(user_id)
        total = self.PRO_QUOTA if account_type == "pro" else self.FREE_QUOTA
        used = self.quotas.get(quota_key, 0)
        reset_time = self._get_next_reset_time()
        
        return {
            "used": used,
            "total": total,
            "reset_time": reset_time.isoformat(),
            "can_generate": used < total
        }
