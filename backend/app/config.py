import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = int(os.getenv("PORT", 5000))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    CORS_ORIGIN: str = os.getenv("CORS_ORIGIN", "*")

    # Supabase credentials
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # Storage bucket names
    SUPABASE_BUCKET_DOCUMENTS: str = os.getenv("SUPABASE_BUCKET_DOCUMENTS", "worker-documents")
    SUPABASE_BUCKET_MEDIA: str = os.getenv("SUPABASE_BUCKET_MEDIA", "public-media")

    # JWT Settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "rozgo-super-secret-jwt-key-2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 43200))

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

