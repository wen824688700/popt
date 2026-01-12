# Vercel 部署脚本 (PowerShell)
# 使用方法: .\deploy.ps1

$ErrorActionPreference = "Stop"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Vercel 部署脚本" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 1. 运行部署前检查
Write-Host "📋 步骤 1/4: 运行部署前检查..." -ForegroundColor Yellow
$checkResult = python check_vercel_deployment.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 部署前检查失败，请修复后再试" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 部署前检查通过" -ForegroundColor Green
Write-Host ""

# 2. 检查 Git 状态
Write-Host "📋 步骤 2/4: 检查 Git 状态..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  发现未提交的更改" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    $commit = Read-Host "是否提交这些更改？(y/n)"
    if ($commit -eq "y" -or $commit -eq "Y") {
        git add .
        $commitMsg = Read-Host "请输入提交信息"
        git commit -m $commitMsg
        Write-Host "✅ 更改已提交" -ForegroundColor Green
    } else {
        Write-Host "❌ 取消部署" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ 没有未提交的更改" -ForegroundColor Green
}
Write-Host ""

# 3. 推送到远程仓库
Write-Host "📋 步骤 3/4: 推送到远程仓库..." -ForegroundColor Yellow
$push = Read-Host "是否推送到远程仓库？(y/n)"
if ($push -eq "y" -or $push -eq "Y") {
    git push
    Write-Host "✅ 已推送到远程仓库" -ForegroundColor Green
} else {
    Write-Host "⚠️  跳过推送步骤" -ForegroundColor Yellow
}
Write-Host ""

# 4. 完成
Write-Host "📋 步骤 4/4: 部署完成" -ForegroundColor Yellow
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ 部署流程完成！" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "接下来：" -ForegroundColor Cyan
Write-Host "1. 访问 Vercel Dashboard 查看构建状态"
Write-Host "2. 等待构建完成（通常需要 2-5 分钟）"
Write-Host "3. 测试部署的应用"
Write-Host ""
Write-Host "📚 相关文档：" -ForegroundColor Cyan
Write-Host "  - 部署指南: DEPLOY_NOW.md"
Write-Host "  - 修复详情: docs/VERCEL_DEPLOYMENT_FIX.md"
Write-Host "  - 变更清单: CHANGES.md"
Write-Host ""
