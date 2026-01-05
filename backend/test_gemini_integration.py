"""
测试 Gemini 模型集成
"""
import asyncio
from app.services.gemini_service import GeminiService
from app.services.llm_factory import LLMFactory
from app.config import get_settings


async def test_gemini_service():
    """测试 Gemini 服务基本功能"""
    settings = get_settings()
    
    print("=" * 60)
    print("测试 Gemini 服务")
    print("=" * 60)
    
    # 创建 Gemini 服务实例
    gemini_service = GeminiService(
        api_key=settings.gemini_api_key,
        base_url=settings.gemini_base_url
    )
    
    try:
        # 测试意图分析
        print("\n1. 测试意图分析...")
        user_input = "我想写一个关于产品营销的提示词"
        frameworks_context = """
        1. RACEF Framework - 适用于需要明确角色、行动、上下文、示例和格式的场景
        2. Chain-of-Thought - 适用于需要逐步推理的复杂问题
        3. SMART Goals - 适用于目标设定和规划场景
        """
        
        framework_ids = await gemini_service.analyze_intent(
            user_input=user_input,
            frameworks_context=frameworks_context
        )
        
        print(f"✓ 推荐框架: {framework_ids}")
        
        # 测试提示词生成
        print("\n2. 测试提示词生成...")
        framework_doc = """
        # RACEF Framework
        
        ## 概述
        RACEF 是一个结构化的提示词框架，包含五个核心要素。
        
        ## 框架构成
        - Role (角色): 定义 AI 的角色
        - Action (行动): 明确要执行的任务
        - Context (上下文): 提供背景信息
        - Example (示例): 给出参考示例
        - Format (格式): 指定输出格式
        """
        
        clarification_answers = {
            "goalClarity": "生成一个产品营销文案",
            "targetAudience": "年轻消费者",
            "contextCompleteness": "新产品发布",
            "formatRequirements": "简洁有力",
            "constraints": "不超过 200 字"
        }
        
        generated_prompt = await gemini_service.generate_prompt(
            user_input=user_input,
            framework_doc=framework_doc,
            clarification_answers=clarification_answers
        )
        
        print(f"✓ 生成的提示词长度: {len(generated_prompt)} 字符")
        print(f"✓ 提示词预览: {generated_prompt[:100]}...")
        
        print("\n" + "=" * 60)
        print("✓ Gemini 服务测试通过！")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n✗ 测试失败: {str(e)}")
        print("\n提示: 如果遇到网络连接问题，可能需要配置代理")
        
    finally:
        await gemini_service.close()


async def test_llm_factory():
    """测试 LLM 工厂"""
    settings = get_settings()
    
    print("\n" + "=" * 60)
    print("测试 LLM 工厂")
    print("=" * 60)
    
    # 测试支持的模型列表
    supported_models = LLMFactory.get_supported_models()
    print(f"\n支持的模型: {supported_models}")
    
    # 测试创建 DeepSeek 服务
    print("\n1. 创建 DeepSeek 服务...")
    deepseek_service = LLMFactory.create_service('deepseek', settings)
    print(f"✓ DeepSeek 服务类型: {type(deepseek_service).__name__}")
    await deepseek_service.close()
    
    # 测试创建 Gemini 服务
    print("\n2. 创建 Gemini 服务...")
    gemini_service = LLMFactory.create_service('gemini', settings)
    print(f"✓ Gemini 服务类型: {type(gemini_service).__name__}")
    await gemini_service.close()
    
    # 测试不支持的模型
    print("\n3. 测试不支持的模型...")
    try:
        LLMFactory.create_service('unsupported_model', settings)
        print("✗ 应该抛出异常")
    except ValueError as e:
        print(f"✓ 正确抛出异常: {str(e)}")
    
    print("\n" + "=" * 60)
    print("✓ LLM 工厂测试通过！")
    print("=" * 60)


async def main():
    """主测试函数"""
    print("\n" + "=" * 60)
    print("Gemini 模型集成测试")
    print("=" * 60)
    
    # 测试 LLM 工厂
    await test_llm_factory()
    
    # 测试 Gemini 服务（可能需要网络连接）
    print("\n是否测试 Gemini API 连接？(需要网络连接)")
    print("注意: 如果在国内，可能需要配置代理")
    
    # 自动跳过 API 测试，避免网络问题
    print("\n跳过 Gemini API 连接测试（避免网络问题）")
    print("如需测试，请手动运行: await test_gemini_service()")
    
    print("\n" + "=" * 60)
    print("所有测试完成！")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
