#!/bin/bash

echo "========================================="
echo "Gemini 集成验证脚本"
echo "========================================="
echo ""

# 检查 ModelSelector 组件
echo "1. 检查 ModelSelector 组件..."
if grep -q "Gemini 2.0" frontend/components/ModelSelector.tsx; then
    echo "   ✓ ModelSelector 包含 Gemini 2.0"
else
    echo "   ✗ ModelSelector 不包含 Gemini 2.0"
    exit 1
fi

# 检查模型数量
model_count=$(grep -c "id: '" frontend/components/ModelSelector.tsx)
if [ "$model_count" -ge 2 ]; then
    echo "   ✓ 找到 $model_count 个模型"
else
    echo "   ✗ 只找到 $model_count 个模型"
    exit 1
fi

# 检查后端配置
echo ""
echo "2. 检查后端配置..."
if grep -q "GEMINI_API_KEY" backend/.env; then
    echo "   ✓ 后端 .env 包含 GEMINI_API_KEY"
else
    echo "   ✗ 后端 .env 缺少 GEMINI_API_KEY"
fi

if grep -q "gemini_api_key" backend/app/config.py; then
    echo "   ✓ config.py 包含 gemini_api_key"
else
    echo "   ✗ config.py 缺少 gemini_api_key"
    exit 1
fi

# 检查服务文件
echo ""
echo "3. 检查服务文件..."
if [ -f "backend/app/services/gemini_service.py" ]; then
    echo "   ✓ gemini_service.py 存在"
else
    echo "   ✗ gemini_service.py 不存在"
    exit 1
fi

if [ -f "backend/app/services/llm_factory.py" ]; then
    echo "   ✓ llm_factory.py 存在"
else
    echo "   ✗ llm_factory.py 不存在"
    exit 1
fi

# 检查 API 更新
echo ""
echo "4. 检查 API 更新..."
if grep -q "model.*str.*Field" backend/app/api/frameworks.py; then
    echo "   ✓ frameworks.py 支持 model 参数"
else
    echo "   ✗ frameworks.py 不支持 model 参数"
fi

if grep -q "model.*str.*Field" backend/app/api/prompts.py; then
    echo "   ✓ prompts.py 支持 model 参数"
else
    echo "   ✗ prompts.py 不支持 model 参数"
fi

echo ""
echo "========================================="
echo "✓ 所有检查通过！"
echo "========================================="
echo ""
echo "下一步："
echo "1. 提交代码: git add . && git commit -m 'feat: Gemini 集成' && git push"
echo "2. 等待 Vercel 部署完成"
echo "3. 清除浏览器缓存"
echo "4. 访问 https://384866.xyz/test-model 验证"
