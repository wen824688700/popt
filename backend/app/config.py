from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database
    database_url: str | None = None
    
    # DeepSeek API
    deepseek_api_key: str | None = None
    deepseek_base_url: str = "https://api.deepseek.com"
    
<<<<<<< HEAD
    # Google Gemini API (可选)
=======
    # Google Gemini API
>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
    gemini_api_key: str | None = None
    gemini_base_url: str = "https://generativelanguage.googleapis.com"
    
    # Supabase
    supabase_url: str | None = None
    supabase_key: str | None = None
    
    # Creem Payment
    creem_api_key: str | None = None
    creem_webhook_secret: str | None = None
    
    # JWT
    jwt_secret: str | None = None
    jwt_algorithm: str = "HS256"
    jwt_expiration_days: int = 7
    
    # Sentry
    sentry_dsn: str | None = None
    
    # Environment
    environment: str = "development"
    
    class Config:
        env_file = "../.env"  # 读取根目录的 .env
        case_sensitive = False
        extra = "ignore"  # 忽略额外的环境变量（如 NEXT_PUBLIC_* 等前端变量）

@lru_cache()
def get_settings() -> Settings:
    return Settings()
