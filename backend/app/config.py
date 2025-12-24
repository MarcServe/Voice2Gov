from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App settings
    app_name: str = "Voice2Gov API"
    debug: bool = True
    
    # Database - reads from DATABASE_URL environment variable
    database_url: str = "postgresql://postgres:postgres@localhost:5432/voice2gov"
    
    # JWT Authentication
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Email (Resend)
    resend_api_key: str = ""
    from_email: str = "noreply@voice2gov.ng"
    
    # Twitter/X API
    twitter_api_key: str = ""
    twitter_api_secret: str = ""
    twitter_access_token: str = ""
    twitter_access_token_secret: str = ""
    twitter_bearer_token: str = ""
    
    # SMS (Twilio - optional)
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""
    
    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    
    # Grok/X
    grok_api_key: str = ""
    
    # Supabase (for direct database access)
    supabase_url: str = ""
    supabase_key: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()

