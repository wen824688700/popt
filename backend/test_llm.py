"""
测试 LLM 服务和框架匹配功能
"""
import asyncio
import httpx

async def test_framework_matching():
    """测试框架匹配功能"""
    
    # 测试用例
    test_cases = [
        {
            "name": "营销文案",
            "input": "我需要为一个新的健身应用写一段营销文案，要能吸引用户下载使用"
        },
        {
            "name": "数学问题",
            "input": "帮我解决一个复杂的数学问题，需要一步步推理"
        },
        {
            "name": "创意头脑风暴",
            "input": "我想为公司的新产品做头脑风暴，需要生成一些创意想法"
        }
    ]
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        for test_case in test_cases:
            print(f"\n{'='*60}")
            print(f"测试用例: {test_case['name']}")
            print(f"用户输入: {test_case['input']}")
            print(f"{'='*60}")
            
            try:
                # 调用框架匹配 API
                response = await client.post(
                    "http://127.0.0.1:8000/api/v1/frameworks/match",
                    json={
                        "input": test_case['input'],
                        "user_type": "free"
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"\n✅ 匹配成功！")
                    print(f"推荐框架数量: {len(result['frameworks'])}")
                    
                    for idx, framework in enumerate(result['frameworks'], 1):
                        print(f"\n框架 {idx}:")
                        print(f"  ID: {framework['id']}")
                        print(f"  名称: {framework['name']}")
                        print(f"  描述: {framework['description']}")
                        print(f"  匹配分数: {framework['match_score']}")
                        print(f"  推荐理由: {framework['reasoning']}")
                else:
                    print(f"\n❌ 请求失败: {response.status_code}")
                    print(f"错误信息: {response.text}")
                    
            except Exception as e:
                print(f"\n❌ 发生错误: {str(e)}")
            
            # 等待一下避免请求过快
            await asyncio.sleep(2)

if __name__ == "__main__":
    print("开始测试 LLM 服务和框架匹配功能...")
    asyncio.run(test_framework_matching())
    print("\n测试完成！")
