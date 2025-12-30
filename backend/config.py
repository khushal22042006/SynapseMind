# backend/config.py - Configuration management
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Gemini API
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    
    # Application
    APP_NAME = "SynapseMind Backend"
    APP_VERSION = "1.0.0"
    
    # CORS
    ALLOWED_ORIGINS = ["*"]  # Update for production
    
    # Rate limiting (to be implemented)
    RATE_LIMIT_REQUESTS = 100
    RATE_LIMIT_PERIOD = 3600  # 1 hour
    
    @classmethod
    def validate_config(cls):
        """Validate critical configuration"""
        if not cls.GEMINI_API_KEY:
            print("⚠️  WARNING: GEMINI_API_KEY not set in environment")
            print("   Get your key from: https://makersuite.google.com/app/apikey")
        return True