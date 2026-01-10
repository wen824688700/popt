"""
Quota Manager Service for managing user quotas
支持失败退回和重试机制
使用 Supabase REST API 持久化配额数据
"""
import logging
import os
from datetime import UTC, datetime, timedelta

from pydantic import BaseModel
from app.config import get_settings

logger = logging.getLogger(__name__)


class QuotaStatus(BaseModel):
    """配额状态模型"""
    user_id: str
    used: int
    total: int
    reset_time: datetime  # UTC
    can_generate: bool


class QuotaTransaction:
    """配额事务，支持回滚"""
    def __init__(self, user_id: str, quota_key: str, manager: 'QuotaManager'):
        self.user_id = user_id
        self.quota_key = quota_key
        self.manager = manager
        self.consumed = False
        self.can_rollback = True

    async def commit(self):
        """提交事务（生成成功）"""
        self.consumed = True
        self.can_rollback = False
        logger.info(f"Quota transaction committed for user {self.user_id}")

    async def rollback(self):
        """回滚事务（生成失败，退回配额）"""
        if self.can_rollback and self.consumed:
            self.manager.quotas[self.quota_key] = max(
                0,
                self.manager.quotas.get(self.quota_key, 0) - 1
            )
            logger.info(f"Quota transaction rolled back for user {self.user_id}")
            self.can_rollback = False


class QuotaManager:
    """管理用户配额"""

    def __init__(self):
        settings = get_settings()
        self.settings = settings
        self.FREE_QUOTA = 10  # 免费用户每天10次
        self.PRO_QUOTA = 100
        self.MAX_RETRIES = 1  # 允许的最大重试次数
        self._http_client = None

        # 检查是否为开发/测试环境
        self.dev_mode = settings.dev_mode
        self.skip_quota_check = self.dev_mode

        if self.skip_quota_check:
            logger.info("Quota check disabled for dev mode")
            # 开发模式使用内存存储
            self.quotas: dict[str, int] = {}
            self.retry_counts: dict[str, int] = {}
        else:
            logger.info("QuotaManager initialized in production mode (Supabase)")
    
    def _get_client(self):
        """延迟初始化 HTTP 客户端（使用 Supabase REST API）"""
        if self._http_client is None and not self.dev_mode:
            try:
                import httpx
                
                supabase_url = self.settings.supabase_url
                supabase_key = self.settings.supabase_key
                
                if supabase_url and supabase_key:
                    self._http_client = httpx.AsyncClient(
                        base_url=f"{supabase_url}/rest/v1",
                        headers={
                            "apikey": supabase_key,
                            "Authorization": f"Bearer {supabase_key}",
                            "Content-Type": "application/json",
                            "Prefer": "return=representation"
                        },
                        timeout=30.0
                    )
                    logger.info("✅ Supabase REST API client initialized (QuotaManager)")
                else:
                    logger.warning("Supabase credentials not found, falling back to dev mode")
                    self.dev_mode = True
                    self.skip_quota_check = True
                    self.quotas = {}
                    self.retry_counts = {}
            except Exception as e:
                logger.error(f"Failed to initialize HTTP client: {e}")
                logger.warning("Falling back to dev mode")
                self.dev_mode = True
                self.skip_quota_check = True
                self.quotas = {}
                self.retry_counts = {}
        
        return self._http_client

    def _get_user_date(self, user_timezone_offset: int = 0) -> str:
        """
        获取用户时区的日期（YYYY-MM-DD 格式）

        Args:
            user_timezone_offset: 用户时区偏移量（分钟），例如 +480 表示 UTC+8
        """
        now = datetime.now(UTC)
        user_time = now + timedelta(minutes=user_timezone_offset)
        return user_time.strftime("%Y-%m-%d")

    def _get_next_reset_time(self, user_timezone_offset: int = 0) -> datetime:
        """
        获取下次重置时间（用户时区的 00:00）

        Args:
            user_timezone_offset: 用户时区偏移量（分钟），例如 +480 表示 UTC+8
        """
        now = datetime.now(UTC)
        user_time = now + timedelta(minutes=user_timezone_offset)
        tomorrow = user_time + timedelta(days=1)
        # 计算用户时区明天 00:00 的 UTC 时间
        reset_time_user = datetime(
            tomorrow.year,
            tomorrow.month,
            tomorrow.day,
            0, 0, 0
        )
        # 转换回 UTC
        reset_time_utc = reset_time_user - timedelta(minutes=user_timezone_offset)
        return reset_time_utc.replace(tzinfo=UTC)

    def _get_user_quota_key(self, user_id: str, user_timezone_offset: int = 0) -> str:
        """
        生成用户配额键

        Args:
            user_id: 用户 ID
            user_timezone_offset: 用户时区偏移量（分钟）
        """
        date = self._get_user_date(user_timezone_offset)
        return f"{user_id}:{date}"

    def _get_retry_key(self, user_id: str, request_id: str) -> str:
        """生成重试计数键"""
        return f"retry:{user_id}:{request_id}"

    async def check_quota(
        self,
        user_id: str,
        account_type: str = "free",
        user_timezone_offset: int = 0
    ) -> QuotaStatus:
        """
        检查用户当日配额

        Args:
            user_id: 用户 ID
            account_type: 账户类型（free/pro）
            user_timezone_offset: 用户时区偏移量（分钟），例如 +480 表示 UTC+8

        Returns:
            QuotaStatus 包含剩余配额和重置时间
        """
        try:
            # 获取配额限制
            total = self.PRO_QUOTA if account_type == "pro" else self.FREE_QUOTA

            # 开发/测试环境跳过配额检查
            if self.skip_quota_check:
                status = QuotaStatus(
                    user_id=user_id,
                    used=0,
                    total=total,
                    reset_time=self._get_next_reset_time(user_timezone_offset),
                    can_generate=True
                )
                return status

            # 生产模式：从 Supabase 查询
            client = self._get_client()
            if not client:
                # 回退到允许生成
                logger.warning("HTTP client not available, allowing generation")
                return QuotaStatus(
                    user_id=user_id,
                    used=0,
                    total=total,
                    reset_time=self._get_next_reset_time(user_timezone_offset),
                    can_generate=True
                )
            
            # 获取今天的日期
            quota_date = self._get_user_date(user_timezone_offset)
            
            # 查询今天的配额记录
            response = await client.get(
                "/user_quotas",
                params={
                    "user_id": f"eq.{user_id}",
                    "quota_date": f"eq.{quota_date}"
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Failed to check quota: {response.status_code}")
                # 出错时允许生成
                return QuotaStatus(
                    user_id=user_id,
                    used=0,
                    total=total,
                    reset_time=self._get_next_reset_time(user_timezone_offset),
                    can_generate=True
                )
            
            data_list = response.json()
            used = data_list[0]['used_count'] if data_list else 0
            
            # 计算是否可以生成
            can_generate = used < total

            # 获取重置时间
            reset_time = self._get_next_reset_time(user_timezone_offset)

            status = QuotaStatus(
                user_id=user_id,
                used=used,
                total=total,
                reset_time=reset_time,
                can_generate=can_generate
            )

            logger.info(
                "✅ Checked quota for user %s: %s/%s (can_generate: %s)",
                user_id,
                used,
                total,
                can_generate,
            )
            return status

        except Exception as e:
            logger.error(f"Error checking quota for user {user_id}: {e}")
            # 出错时允许生成，避免阻塞用户
            return QuotaStatus(
                user_id=user_id,
                used=0,
                total=total,
                reset_time=self._get_next_reset_time(user_timezone_offset),
                can_generate=True
            )

    async def start_generation(
        self,
        user_id: str,
        account_type: str = "free",
        request_id: str | None = None,
        user_timezone_offset: int = 0
    ) -> QuotaTransaction | None:
        """
        开始生成任务，预扣配额

        Args:
            user_id: 用户 ID
            account_type: 账户类型（free/pro）
            request_id: 请求 ID（用于重试判断）
            user_timezone_offset: 用户时区偏移量（分钟）

        Returns:
            QuotaTransaction 对象，用于后续提交或回滚
            如果配额不足或重试次数超限，返回 None
        """
        try:
            # 检查是否为重试请求
            if request_id:
                retry_key = self._get_retry_key(user_id, request_id)
                retry_count = self.retry_counts.get(retry_key, 0)

                if retry_count >= self.MAX_RETRIES:
                    logger.warning(f"User {user_id} exceeded max retries for request {request_id}")
                    return None

                # 记录重试
                self.retry_counts[retry_key] = retry_count + 1
                logger.info(
                    "Retry %s/%s for user %s, request %s",
                    retry_count + 1,
                    self.MAX_RETRIES,
                    user_id,
                    request_id,
                )

            # 开发/测试环境直接返回事务
            if self.skip_quota_check:
                quota_key = self._get_user_quota_key(user_id, user_timezone_offset)
                transaction = QuotaTransaction(user_id, quota_key, self)
                transaction.consumed = True
                return transaction

            # 先检查配额
            status = await self.check_quota(user_id, account_type, user_timezone_offset)

            if not status.can_generate:
                logger.warning(f"User {user_id} quota exceeded: {status.used}/{status.total}")
                return None

            # 预扣配额
            quota_key = self._get_user_quota_key(user_id, user_timezone_offset)
            self.quotas[quota_key] = self.quotas.get(quota_key, 0) + 1

            # 创建事务
            transaction = QuotaTransaction(user_id, quota_key, self)
            transaction.consumed = True

            logger.info(
                "Started generation for user %s: %s/%s",
                user_id,
                self.quotas[quota_key],
                status.total,
            )
            return transaction

        except Exception as e:
            logger.error(f"Error starting generation for user {user_id}: {e}")
            raise

    async def consume_quota(
        self,
        user_id: str,
        account_type: str = "free",
        user_timezone_offset: int = 0
    ) -> bool:
        """
        消耗一次配额

        Args:
            user_id: 用户 ID
            account_type: 账户类型（free/pro）
            user_timezone_offset: 用户时区偏移量（分钟）

        Returns:
            是否成功消耗（配额不足返回 False）
        """
        try:
            # 开发/测试环境跳过配额检查
            if self.skip_quota_check:
                logger.info(f"Quota check skipped for user {user_id} (dev mode)")
                return True

            # 生产模式：使用 Supabase
            client = self._get_client()
            if not client:
                logger.warning("HTTP client not available, allowing generation")
                return True
            
            # 先检查配额
            status = await self.check_quota(user_id, account_type, user_timezone_offset)
            if not status.can_generate:
                logger.warning(f"User {user_id} quota exceeded: {status.used}/{status.total}")
                return False
            
            # 获取今天的日期
            quota_date = self._get_user_date(user_timezone_offset)
            
            # 尝试更新现有记录（使用 UPSERT）
            # PostgreSQL 的 ON CONFLICT 语法通过 Supabase 的 upsert 参数实现
            response = await client.post(
                "/user_quotas",
                json={
                    "user_id": user_id,
                    "quota_date": quota_date,
                    "used_count": status.used + 1,
                    "account_type": account_type
                },
                params={
                    "on_conflict": "user_id,quota_date"
                }
            )
            
            # 如果记录已存在，使用 PATCH 更新
            if response.status_code == 409 or response.status_code == 400:
                # 记录已存在，使用 PATCH 更新
                response = await client.patch(
                    "/user_quotas",
                    json={
                        "used_count": status.used + 1,
                        "updated_at": datetime.now(UTC).isoformat()
                    },
                    params={
                        "user_id": f"eq.{user_id}",
                        "quota_date": f"eq.{quota_date}"
                    }
                )
            
            if response.status_code not in [200, 201, 204]:
                logger.error(f"Failed to consume quota: {response.status_code} - {response.text}")
                # 出错时允许生成，避免阻塞用户
                return True
            
            logger.info(f"✅ Consumed quota for user {user_id}: {status.used + 1}/{status.total}")
            return True

        except Exception as e:
            logger.error(f"Error consuming quota for user {user_id}: {e}")
            # 出错时允许生成，避免阻塞用户
            return True

    async def reset_daily_quotas(self):
        """
        重置所有用户的每日配额（定时任务调用）

        这个方法应该在每日 UTC 00:00 被定时任务调用
        """
        try:
            # 获取昨天的日期
            yesterday = (datetime.now(UTC) - timedelta(days=1)).strftime("%Y-%m-%d")

            # 删除昨天的配额记录
            keys_to_delete = [key for key in self.quotas.keys() if yesterday in key]
            for key in keys_to_delete:
                del self.quotas[key]

            # 清理过期的重试记录（超过 1 小时）
            retry_keys_to_delete = []
            for key in list(self.retry_counts.keys()):
                # 简单策略：每日重置时清理所有重试记录
                retry_keys_to_delete.append(key)

            for key in retry_keys_to_delete:
                del self.retry_counts[key]

            logger.info(
                f"Reset daily quotas: removed {len(keys_to_delete)} quota records "
                f"and {len(retry_keys_to_delete)} retry records"
            )

        except Exception as e:
            logger.error(f"Error resetting daily quotas: {e}")
            raise

    def get_quota_info(
        self,
        user_id: str,
        account_type: str = "free",
        user_timezone_offset: int = 0,
    ) -> dict:
        """
        获取用户配额信息（同步方法，用于快速查询）

        Args:
            user_id: 用户 ID
            account_type: 账户类型（free/pro）
            user_timezone_offset: 用户时区偏移量（分钟）

        Returns:
            包含配额信息的字典
        """
        quota_key = self._get_user_quota_key(user_id, user_timezone_offset)
        total = self.PRO_QUOTA if account_type == "pro" else self.FREE_QUOTA
        used = self.quotas.get(quota_key, 0)
        reset_time = self._get_next_reset_time(user_timezone_offset)

        return {
            "used": used,
            "total": total,
            "reset_time": reset_time.isoformat(),
            "can_generate": used < total
        }
