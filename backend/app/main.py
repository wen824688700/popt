from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# 导入路由
from app.api import frameworks, prompts, quota, versions

app = FastAPI(
    title="Prompt Optimizer API",
    description="基于 57 个 Prompt 工程框架的智能提示词优化工具",
    version="0.1.0"
)

# CORS configuration
<<<<<<< HEAD
# 从环境变量读取允许的源，支持多个域名用逗号分隔
import os
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
allowed_origins.extend([
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002"
])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
=======
default_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://384866.xyz",
    "https://www.384866.xyz",
]

env_origins_raw = os.getenv("CORS_ALLOW_ORIGINS", "").strip()
env_origins = [o.strip() for o in env_origins_raw.split(",") if o.strip()] if env_origins_raw else []
allow_origins = env_origins or default_origins

# Useful for Vercel Preview URLs like https://something.vercel.app
_origin_regex_raw = os.getenv("CORS_ALLOW_ORIGIN_REGEX")
if _origin_regex_raw is None:
    allow_origin_regex: str | None = r"https://.*\.vercel\.app"
else:
    _origin_regex_raw = _origin_regex_raw.strip()
    allow_origin_regex = None if _origin_regex_raw in {"", "none", "null"} else _origin_regex_raw

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=allow_origin_regex,
>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(frameworks.router)
app.include_router(prompts.router)
app.include_router(quota.router)
app.include_router(versions.router)

@app.get("/")
async def root():
    return {
        "message": "Prompt Optimizer API",
        "version": "0.1.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
