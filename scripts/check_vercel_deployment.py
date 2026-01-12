#!/usr/bin/env python3
"""Vercel 部署前检查脚本"""

import os
import sys
import json
from pathlib import Path

def check_file_exists(filepath: str, description: str) -> bool:
    """检查文件是否存在"""
    if Path(filepath).exists():
        print(f"✓ {description}: {filepath}")
        return True
    else:
        print(f"✗ {description} 不存在: {filepath}")
        return False

def check_vercel_config():
    """检查 vercel.json 配置"""
    print("\n" + "=" * 50)
    print("检查 Vercel 配置")
    print("=" * 50)
    
    if not check_file_exists("vercel.json", "Vercel 配置文件"):
        return False
    
    try:
        with open("vercel.json", "r", encoding="utf-8") as f:
            config = json.load(f)
        
        # 检查 builds
        if "builds" not in config:
            print("✗ vercel.json 缺少 builds 配置")
            return False
        
        builds = config["builds"]
        has_frontend = any(b.get("src") == "frontend/package.json" for b in builds)
        has_backend = any(b.get("src") == "api/index.py" for b in builds)
        
        if has_frontend:
            print("✓ 前端构建配置正确")
        else:
            print("✗ 缺少前端构建配置")
            return False
        
        if has_backend:
            print("✓ 后端构建配置正确")
        else:
            print("✗ 缺少后端构建配置")
            return False
        
        # 检查 routes
        if "routes" not in config:
            print("✗ vercel.json 缺少 routes 配置")
            return False
        
        routes = config["routes"]
        has_api_route = any("/api/" in r.get("src", "") for r in routes)
        
        if has_api_route:
            print("✓ API 路由配置正确")
        else:
            print("✗ 缺少 API 路由配置")
            return False
        
        return True
    
    except Exception as e:
        print(f"✗ 读取 vercel.json 失败: {e}")
        return False

def check_backend_structure():
    """检查后端结构"""
    print("\n" + "=" * 50)
    print("检查后端结构")
    print("=" * 50)
    
    checks = [
        ("api/index.py", "API 入口文件"),
        ("backend/app/main.py", "FastAPI 主文件"),
        ("backend/requirements.txt", "后端依赖文件"),
    ]
    
    return all(check_file_exists(path, desc) for path, desc in checks)

def check_frontend_structure():
    """检查前端结构"""
    print("\n" + "=" * 50)
    print("检查前端结构")
    print("=" * 50)
    
    checks = [
        ("frontend/package.json", "前端 package.json"),
        ("frontend/next.config.js", "Next.js 配置"),
        ("frontend/app/page.tsx", "前端首页"),
    ]
    
    return all(check_file_exists(path, desc) for path, desc in checks)

def check_requirements():
    """检查 requirements.txt 中的关键依赖"""
    print("\n" + "=" * 50)
    print("检查后端依赖")
    print("=" * 50)
    
    try:
        with open("backend/requirements.txt", "r", encoding="utf-8-sig") as f:
            content = f.read()
        
        # 检查关键依赖
        required_packages = {
            "fastapi": "FastAPI 框架",
            "uvicorn": "ASGI 服务器",
            "supabase": "Supabase 客户端",
            "httpx": "HTTP 客户端",
            "pydantic": "数据验证",
        }
        
        all_ok = True
        for package, description in required_packages.items():
            if package in content.lower():
                print(f"✓ {description} ({package})")
            else:
                print(f"✗ 缺少 {description} ({package})")
                all_ok = False
        
        # 检查是否还有 gotrue（应该被移除）
        if "gotrue" in content.lower() and "supabase-auth" not in content.lower():
            print("✗ 仍然使用 gotrue（应该使用 supabase-auth）")
            all_ok = False
        elif "supabase-auth" in content.lower():
            print("✓ 使用 supabase-auth（正确）")
        
        return all_ok
    
    except Exception as e:
        print(f"✗ 读取 requirements.txt 失败: {e}")
        return False

def check_env_example():
    """检查环境变量示例文件"""
    print("\n" + "=" * 50)
    print("检查环境变量配置")
    print("=" * 50)
    
    checks = [
        ("backend/.env.example", "后端环境变量示例"),
        ("frontend/.env.example", "前端环境变量示例"),
    ]
    
    return all(check_file_exists(path, desc) for path, desc in checks)

def main():
    """主函数"""
    print("=" * 50)
    print("Vercel 部署前检查")
    print("=" * 50)
    
    checks = [
        check_vercel_config,
        check_backend_structure,
        check_frontend_structure,
        check_requirements,
        check_env_example,
    ]
    
    results = [check() for check in checks]
    
    print("\n" + "=" * 50)
    print("检查结果")
    print("=" * 50)
    
    if all(results):
        print("✅ 所有检查通过！可以部署到 Vercel")
        return 0
    else:
        print("❌ 部分检查失败，请修复后再部署")
        return 1

if __name__ == "__main__":
    sys.exit(main())
