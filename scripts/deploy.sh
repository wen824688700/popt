#!/bin/bash

# Vercel 部署脚本
# 使用方法: ./deploy.sh

set -e  # 遇到错误立即退出

echo "=================================="
echo "Vercel 部署脚本"
echo "=================================="
echo ""

# 1. 运行部署前检查
echo "📋 步骤 1/4: 运行部署前检查..."
python check_vercel_deployment.py
if [ $? -ne 0 ]; then
    echo "❌ 部署前检查失败，请修复后再试"
    exit 1
fi
echo "✅ 部署前检查通过"
echo ""

# 2. 检查 Git 状态
echo "📋 步骤 2/4: 检查 Git 状态..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  发现未提交的更改"
    git status --short
    echo ""
    read -p "是否提交这些更改？(y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "请输入提交信息: " commit_msg
        git commit -m "$commit_msg"
        echo "✅ 更改已提交"
    else
        echo "❌ 取消部署"
        exit 1
    fi
else
    echo "✅ 没有未提交的更改"
fi
echo ""

# 3. 推送到远程仓库
echo "📋 步骤 3/4: 推送到远程仓库..."
read -p "是否推送到远程仓库？(y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push
    echo "✅ 已推送到远程仓库"
else
    echo "⚠️  跳过推送步骤"
fi
echo ""

# 4. 完成
echo "📋 步骤 4/4: 部署完成"
echo ""
echo "=================================="
echo "✅ 部署流程完成！"
echo "=================================="
echo ""
echo "接下来："
echo "1. 访问 Vercel Dashboard 查看构建状态"
echo "2. 等待构建完成（通常需要 2-5 分钟）"
echo "3. 测试部署的应用"
echo ""
echo "📚 相关文档："
echo "  - 部署指南: DEPLOY_NOW.md"
echo "  - 修复详情: docs/VERCEL_DEPLOYMENT_FIX.md"
echo "  - 变更清单: CHANGES.md"
echo ""
