"""
Framework Matcher Service for matching user input to appropriate frameworks
"""
import os
from typing import List
from pydantic import BaseModel
import logging

from .llm_service import LLMService

logger = logging.getLogger(__name__)


class FrameworkCandidate(BaseModel):
    """框架候选模型"""
    id: str
    name: str
    description: str
    match_score: float = 1.0
    reasoning: str = ""


class UserType:
    """用户类型枚举"""
    FREE = "free"
    PRO = "pro"


class FrameworkMatcher:
    """根据用户输入匹配最合适的 Prompt 框架"""
    
    def __init__(self, llm_service: LLMService):
        self.llm_service = llm_service
        self.frameworks_summary = self._load_frameworks_summary()
    
    def _load_frameworks_summary(self) -> str:
        """加载 Frameworks_Summary.md 表格"""
        try:
            # 获取项目根目录
            current_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
            
            # 构建文件路径
            summary_path = os.path.join(
                project_root,
                "skills-main",
                "skills",
                "prompt-optimizer",
                "references",
                "Frameworks_Summary.md"
            )
            
            with open(summary_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            logger.info(f"Loaded frameworks summary from {summary_path}")
            return content
            
        except FileNotFoundError:
            logger.error(f"Frameworks_Summary.md not found at {summary_path}")
            # 返回一个简化的框架列表作为后备
            return """
# AI 提示词框架摘要

| 序号 | 框架名称 | 应用场景 |
|:---:|----------|----------|
| 1 | RACEF Framework | 头脑风暴和创意生成、数据分析和市场研究 |
| 2 | CRISPE Framework | 营销活动策划、员工培训计划设计 |
| 3 | BAB Framework | 订阅服务推广、健身应用营销 |
| 48 | Chain of Thought Framework | 数学问题求解、市场分析、科学现象解释 |
"""
        except Exception as e:
            logger.error(f"Error loading frameworks summary: {e}")
            raise
    
    async def match_frameworks(
        self, 
        user_input: str, 
        user_type: str = UserType.FREE
    ) -> List[FrameworkCandidate]:
        """
        匹配 1-3 个最合适的框架
        
        Args:
            user_input: 用户输入的原始提示词或需求
            user_type: 用户类型（Free/Pro）
        
        Returns:
            1-3 个框架候选，按匹配度排序
        """
        try:
            # 调用 LLM 分析意图
            framework_ids = await self.llm_service.analyze_intent(
                user_input=user_input,
                frameworks_context=self.frameworks_summary
            )
            
            # 构建框架候选列表
            candidates = []
            for idx, framework_id in enumerate(framework_ids):
                candidate = FrameworkCandidate(
                    id=framework_id,
                    name=framework_id,
                    description=f"适用于用户需求的 {framework_id} 框架",
                    match_score=1.0 - (idx * 0.1),  # 第一个得分最高
                    reasoning=f"基于用户输入分析，{framework_id} 最适合此场景"
                )
                candidates.append(candidate)
            
            logger.info(f"Matched {len(candidates)} frameworks for user input")
            return candidates
            
        except Exception as e:
            logger.error(f"Error matching frameworks: {e}")
            # 返回一个默认框架作为后备
            return [
                FrameworkCandidate(
                    id="RACEF",
                    name="RACEF Framework",
                    description="通用的头脑风暴和创意生成框架",
                    match_score=1.0,
                    reasoning="默认推荐框架"
                )
            ]
