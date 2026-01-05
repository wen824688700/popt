"""
Frameworks API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional

from app.services.base_llm import BaseLLMService
from app.services.llm_factory import LLMFactory
from app.services.framework_matcher import FrameworkMatcher, FrameworkCandidate
from app.config import get_settings

router = APIRouter(prefix="/api/v1/frameworks", tags=["frameworks"])

# 全局服务实例缓存
_llm_services = {}
_framework_matchers = {}


def get_llm_service(model: str = "deepseek") -> BaseLLMService:
    """
    获取 LLM 服务实例
    
    Args:
        model: 模型类型 ('deepseek' 或 'gemini')
    
    Returns:
        BaseLLMService 实例
    """
    global _llm_services
    if model not in _llm_services:
        settings = get_settings()
        _llm_services[model] = LLMFactory.create_service(model, settings)
    return _llm_services[model]


def get_framework_matcher(model: str = "deepseek") -> FrameworkMatcher:
    """
    获取框架匹配器实例
    
    Args:
        model: 模型类型 ('deepseek' 或 'gemini')
    
    Returns:
        FrameworkMatcher 实例
    """
    global _framework_matchers
    if model not in _framework_matchers:
        _framework_matchers[model] = FrameworkMatcher(get_llm_service(model))
    return _framework_matchers[model]


class MatchRequest(BaseModel):
    """框架匹配请求"""
    input: str = Field(..., min_length=10, description="用户输入（至少10个字符）")
    attachment: Optional[str] = Field(None, description="附件内容（base64编码）")
    user_type: str = Field("free", description="用户类型（free/pro）")
    model: str = Field("deepseek", description="使用的模型（deepseek/gemini）")


class MatchResponse(BaseModel):
    """框架匹配响应"""
    frameworks: List[FrameworkCandidate]


@router.post("/match", response_model=MatchResponse)
async def match_frameworks(request: MatchRequest):
    """
    匹配最合适的框架
    
    根据用户输入，返回 1-3 个推荐的框架候选
    """
    try:
        # 验证输入长度
        if len(request.input) < 10:
            raise HTTPException(
                status_code=400,
                detail="输入至少需要 10 个字符"
            )
        
        # 验证模型类型
        if request.model not in LLMFactory.get_supported_models():
            raise HTTPException(
                status_code=400,
                detail=f"不支持的模型类型: {request.model}"
            )
        
        # 获取对应模型的匹配器
        matcher = get_framework_matcher(request.model)
        
        # 匹配框架
        candidates = await matcher.match_frameworks(
            user_input=request.input,
            user_type=request.user_type
        )
        
        return MatchResponse(frameworks=candidates)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"框架匹配失败: {str(e)}"
        )
