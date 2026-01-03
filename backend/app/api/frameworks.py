"""
Frameworks API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional

from app.services.llm_service import LLMService
from app.services.framework_matcher import FrameworkMatcher, FrameworkCandidate
from app.config import get_settings

router = APIRouter(prefix="/api/v1/frameworks", tags=["frameworks"])

# 全局服务实例
llm_service = None
framework_matcher = None


def get_llm_service() -> LLMService:
    """获取 LLM 服务实例"""
    global llm_service
    if llm_service is None:
        settings = get_settings()
        llm_service = LLMService(
            api_key=settings.deepseek_api_key,
            base_url=settings.deepseek_base_url
        )
    return llm_service


def get_framework_matcher() -> FrameworkMatcher:
    """获取框架匹配器实例"""
    global framework_matcher
    if framework_matcher is None:
        framework_matcher = FrameworkMatcher(get_llm_service())
    return framework_matcher


class MatchRequest(BaseModel):
    """框架匹配请求"""
    input: str = Field(..., min_length=10, description="用户输入（至少10个字符）")
    attachment: Optional[str] = Field(None, description="附件内容（base64编码）")
    user_type: str = Field("free", description="用户类型（free/pro）")


class MatchResponse(BaseModel):
    """框架匹配响应"""
    frameworks: List[FrameworkCandidate]


@router.post("/match", response_model=MatchResponse)
async def match_frameworks(
    request: MatchRequest,
    matcher: FrameworkMatcher = Depends(get_framework_matcher)
):
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
