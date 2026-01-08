"""
LLM Service for interacting with DeepSeek API
"""
import logging
from typing import Any

import httpx

from .base_llm import BaseLLMService

logger = logging.getLogger(__name__)


class DeepSeekService(BaseLLMService):
    """Service for interacting with DeepSeek LLM API"""

    def __init__(self, api_key: str, base_url: str = "https://api.deepseek.com"):
        self.api_key = api_key
        self.base_url = base_url
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(120.0, connect=10.0),  # 增加超时到 120 秒
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
        )
        self.max_retries = 3  # 最大重试次数

    async def _call_api_with_retry(self, payload: dict[str, Any]) -> dict[str, Any]:
        """
        带重试机制的 API 调用

        Args:
            payload: API 请求负载

        Returns:
            API 响应 JSON

        Raises:
            Exception: API 调用失败
        """
        last_error = None

        for attempt in range(self.max_retries):
            try:
                response = await self.client.post(
                    f"{self.base_url}/v1/chat/completions",
                    json=payload
                )
                response.raise_for_status()
                return response.json()

            except (httpx.TimeoutException, httpx.NetworkError, httpx.RemoteProtocolError) as e:
                last_error = e
                logger.warning(
                    f"API 调用失败 (尝试 {attempt + 1}/{self.max_retries}): {type(e).__name__}: {str(e)}"
                )
                if attempt < self.max_retries - 1:
                    # 等待后重试（指数退避）
                    import asyncio
                    await asyncio.sleep(2 ** attempt)
                continue

            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP 状态错误: {e.response.status_code} - {e.response.text}")
                raise Exception(f"LLM API 返回错误: {e.response.status_code}")

            except Exception as e:
                logger.error(f"未预期的错误: {type(e).__name__}: {str(e)}")
                raise Exception(f"LLM API 调用失败: {str(e)}")

        # 所有重试都失败
        raise Exception(f"LLM API 调用失败（已重试 {self.max_retries} 次）: {str(last_error)}")

    async def analyze_intent(
        self,
        user_input: str,
        frameworks_context: str
    ) -> list[str]:
        """
        分析用户意图并返回推荐的框架 ID

        Args:
            user_input: 用户输入的原始提示词或需求
            frameworks_context: 框架映射表上下文（Frameworks_Summary.md）

        Returns:
            1-3 个框架 ID 列表
        """
        try:
            prompt = f"""\
你是一个 Prompt 工程专家。请分析用户的需求，从以下框架列表中选择 1-3 个最合适的框架。

框架列表：
{frameworks_context}

用户需求：
{user_input}

请仅返回 1-3 个最合适的框架 ID（用逗号分隔），不要包含其他内容。
例如：RACEF,Chain-of-Thought"""

            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "你是一个 Prompt 工程专家，"
                            "擅长分析用户需求并推荐合适的框架。"
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.3,
                "max_tokens": 100
            }

            result = await self._call_api_with_retry(payload)

            # 解析返回的框架 ID
            content = result["choices"][0]["message"]["content"].strip()
            framework_ids = [fid.strip() for fid in content.split(",")]

            # 确保返回 1-3 个框架
            framework_ids = framework_ids[:3]

            logger.info(
                "Analyzed intent for input: %s... -> %s",
                user_input[:50],
                framework_ids,
            )
            return framework_ids

        except Exception as e:
            logger.error(f"Error during intent analysis: {e}")
            raise Exception(f"意图分析失败: {str(e)}")

    async def generate_prompt(
        self,
        user_input: str,
        framework_doc: str,
        clarification_answers: dict[str, str],
        attachment_content: str | None = None
    ) -> str:
        """
        生成优化后的提示词

        Args:
            user_input: 用户原始输入
            framework_doc: 完整的框架文档
            clarification_answers: 追问问题的答案
            attachment_content: 附件内容（可选）

        Returns:
            优化后的 Markdown 格式提示词
        """
        try:
            # 构建系统提示
            system_prompt = f"""\
你是一个专业的 Prompt 工程师。请根据以下框架文档和用户提供的信息，生成一个优化后的提示词。

框架文档：
{framework_doc}

请严格按照框架文档中的结构和最佳实践来生成提示词：
1. 仔细阅读框架的"框架构成"部分，了解每个组成部分的作用
2. 参考"最佳实践"中的示例，学习如何应用框架
3. 确保生成的提示词包含框架的所有必要组成部分
4. 使用清晰的 Markdown 格式，包含适当的标题和结构
5. 根据框架特点，生成具体、可执行的提示词

生成的提示词应该：
- 结构清晰，遵循框架的组成部分
- 包含所有必要的上下文信息
- 具体明确，避免模糊表述
- 易于理解和执行
- 符合框架的最佳实践"""

            # 构建用户提示
            user_prompt = f"""用户原始需求：
{user_input}

追问信息：
- 目标清晰度：{clarification_answers.get('goalClarity', '未提供')}
- 目标受众：{clarification_answers.get('targetAudience', '未提供')}
- 上下文完整性：{clarification_answers.get('contextCompleteness', '未提供')}
- 格式要求：{clarification_answers.get('formatRequirements', '未提供')}
- 约束条件：{clarification_answers.get('constraints', '未提供')}"""

            if attachment_content:
                user_prompt += f"\n\n参考附件内容：\n{attachment_content}"

            user_prompt += (
                "\n\n请基于上述框架文档和用户信息，生成一个完整的、优化后的提示词"
                "（使用 Markdown 格式）："
            )

            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 3000
            }

            result = await self._call_api_with_retry(payload)

            generated_prompt = result["choices"][0]["message"]["content"].strip()

            logger.info(f"Generated prompt for input: {user_input[:50]}...")
            return generated_prompt

        except Exception as e:
            logger.error(f"Error during prompt generation: {e}")
            raise Exception(f"提示词生成失败: {str(e)}")

    async def close(self):
        """关闭 HTTP 客户端"""
        await self.client.aclose()
