import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "StayEase PG Accommodation Platform"
    API_V1_STR: str = "/api"
    APP_ENV: str = "development"
    
    SERVER_HOST: str = "127.0.0.1"
    SERVER_PORT: int = 8000
    
    # Database URL
    DATABASE_URL: str = "mysql+pymysql://root:@localhost:3306/stayease_db?charset=utf8mb4"
    
    # Security
    SECRET_KEY: str = "stayease-super-secret-jwt-key-replace-in-production-min32bytes"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Frontend URL
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Cookie Configuration
    AUTH_COOKIE_NAME: str = "access_token"
    COOKIE_SECURE: bool = False  # Set to True in production HTTPS
    COOKIE_SAMESITE: str = "lax"
    
    # Google OAuth 2.0 / OpenID Connect
    GOOGLE_CLIENT_ID: Union[str, None] = None
    GOOGLE_CLIENT_SECRET: Union[str, None] = None
    
    # Email / SMTP Configuration
    SMTP_HOST: Union[str, None] = None
    SMTP_PORT: int = 587
    SMTP_USER: Union[str, None] = None
    SMTP_PASSWORD: Union[str, None] = None
    SMTP_FROM_EMAIL: str = "noreply@stayease.com"
    SMTP_FROM_NAME: str = "StayEase Accommodations"
    
    # CORS
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
