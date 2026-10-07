import os
from typing import List, Set
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "NSCT PREP API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Database configuration (Defaults to SQLite for local development, PostgreSQL ready)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./nsct_prep.db")
    
    # JWT and Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "nsct-prep-super-secret-key-change-in-production-2026")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Real Google OAuth 2.0 Credentials
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Supabase (Optional for direct Supabase Auth verification)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    # Owner & Admin Email Allowlist (comma-separated list of verified owner/admin emails)
    ADMIN_EMAILS: str = os.getenv("ADMIN_EMAILS", "mh9456605@gmail.com")

    def get_admin_emails(self) -> Set[str]:
        """
        Parses and normalizes the comma-separated ADMIN_EMAILS allowlist.
        """
        if not self.ADMIN_EMAILS:
            return set()
        return {email.strip().lower() for email in self.ADMIN_EMAILS.split(",") if email.strip()}

    def get_cors_origins(self) -> List[str]:
        """
        Computes dynamic CORS allowed origins based on environment.
        In production: strictly permits frontend URL and configured custom domains.
        In development: permits localhost and local dev environments.
        """
        origins = set()
        
        # Always include configured frontend URL
        if self.FRONTEND_URL:
            origins.add(self.FRONTEND_URL.rstrip("/"))

        # Include custom CORS_ORIGINS from env if provided
        custom_cors = os.getenv("CORS_ORIGINS", "")
        if custom_cors:
            for item in custom_cors.split(","):
                if item.strip():
                    origins.add(item.strip().rstrip("/"))

        if self.ENVIRONMENT != "production":
            origins.add("http://localhost:3000")
            origins.add("http://127.0.0.1:3000")
            origins.add("http://localhost:5173")
            origins.add("http://127.0.0.1:5173")

        return list(origins) if origins else ["*"]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
