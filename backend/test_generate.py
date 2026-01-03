"""
测试提示词生成功能
"""
import asyncio
import httpx

async def test_generate():
    """测试完整的提示词生成流程"""
    
    # 1. 先匹配框架
    print("=" * 60)
    print("步骤 1: 匹配框架")
    print("=" * 60)
    
    match_response = await httpx.AsyncClient().post(
        "http://127.0.0.1:8000/api/v1/frameworks/match",
        json={
            "input": "帮我解决一个数学问题：计算斐波那契数列的第10项",
            "user_type": "free"
        },
        timeout=60.0
    )
    
    print(f"状态码: {match_response.status_code}")
    match_data = match_response.json()
    print(f"推荐框架: {[f['name'] for f in match_data['frameworks']]}")
    
    # 选择第一个框架
    selected_framework = match_data['frameworks'][0]['id']
    print(f"\n选择框架: {selected_framework}")
    
    # 2. 生成提示词
    print("\n" + "=" * 60)
    print("步骤 2: 生成优化后的提示词")
    print("=" * 60)
    
    generate_response = await httpx.AsyncClient().post(
        "http://127.0.0.1:8000/api/v1/prompts/generate",
        json={
            "input": "帮我解决一个数学问题：计算斐波那契数列的第10项",
            "framework_id": selected_framework,
            "clarification_answers": {
                "goalClarity": "计算斐波那契数列的第10项，并解释计算过程",
                "targetAudience": "对数学感兴趣的学生",
                "contextCompleteness": "斐波那契数列是一个经典的数学序列",
                "formatRequirements": "使用清晰的步骤说明",
                "constraints": "需要展示详细的计算步骤"
            },
            "user_id": "test_user",
            "account_type": "free"
        },
        timeout=60.0
    )
    
    print(f"状态码: {generate_response.status_code}")
    
    if generate_response.status_code == 200:
        generate_data = generate_response.json()
        print(f"\n使用框架: {generate_data['framework_used']}")
        print(f"版本 ID: {generate_data['version_id']}")
        print("\n" + "=" * 60)
        print("生成的优化提示词:")
        print("=" * 60)
        print(generate_data['output'])
    else:
        print(f"错误: {generate_response.text}")

if __name__ == "__main__":
    asyncio.run(test_generate())
