#!/usr/bin/env python3
"""测试依赖是否正确安装和导入"""

import sys

def test_imports():
    """测试关键依赖的导入"""
    errors = []
    
    # 测试 FastAPI
    try:
        import fastapi
        print(f"✓ FastAPI {fastapi.__version__}")
    except Exception as e:
        errors.append(f"✗ FastAPI: {e}")
    
    # 测试 Supabase（应该使用 supabase_auth 而不是 gotrue）
    try:
        import supabase
        print(f"✓ Supabase {supabase.__version__}")
    except Exception as e:
        errors.append(f"✗ Supabase: {e}")
    
    # 测试 supabase_auth（新的认证包）
    try:
        import supabase_auth
        print(f"✓ Supabase Auth {supabase_auth.__version__}")
    except Exception as e:
        errors.append(f"✗ Supabase Auth: {e}")
    
    # 确保 gotrue 不再被使用
    try:
        import gotrue
        errors.append("✗ gotrue 仍然被导入（应该使用 supabase_auth）")
    except ImportError:
        print("✓ gotrue 已被正确移除")
    
    # 测试 httpx
    try:
        import httpx
        print(f"✓ httpx {httpx.__version__}")
    except Exception as e:
        errors.append(f"✗ httpx: {e}")
    
    # 测试 Pydantic
    try:
        import pydantic
        print(f"✓ Pydantic {pydantic.__version__}")
    except Exception as e:
        errors.append(f"✗ Pydantic: {e}")
    
    # 测试 uvicorn
    try:
        import uvicorn
        print(f"✓ Uvicorn {uvicorn.__version__}")
    except Exception as e:
        errors.append(f"✗ Uvicorn: {e}")
    
    return errors

def test_supabase_client():
    """测试 Supabase 客户端创建"""
    try:
        from supabase import create_client
        print("\n✓ Supabase create_client 可以导入")
        return []
    except Exception as e:
        return [f"✗ Supabase create_client: {e}"]

if __name__ == "__main__":
    print("=" * 50)
    print("测试依赖导入")
    print("=" * 50)
    
    errors = test_imports()
    errors.extend(test_supabase_client())
    
    print("\n" + "=" * 50)
    if errors:
        print("❌ 发现错误:")
        for error in errors:
            print(f"  {error}")
        sys.exit(1)
    else:
        print("✅ 所有依赖测试通过！")
        sys.exit(0)
