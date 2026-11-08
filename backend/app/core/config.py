import json
import os
from pathlib import Path
from typing import List
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "data"

def get_normalized_database_url() -> str:
    raw_url = os.getenv("DATABASE_URL", "")
    if not raw_url:
        return f"sqlite:///{BASE_DIR / 'ethno_kg.db'}"
    # Render PostgreSQL URLs start with postgres://, which SQLAlchemy 2.0+ does not support
    if raw_url.startswith("postgres://"):
        return raw_url.replace("postgres://", "postgresql://", 1)
    return raw_url

def parse_cors_origins() -> List[str]:
    raw = os.getenv("CORS_ORIGINS", "")
    origins = []
    if raw:
        raw = raw.strip()
        if raw.startswith("[") and raw.endswith("]"):
            try:
                origins = json.loads(raw)
            except Exception:
                origins = [item.strip().strip("'\"") for item in raw.strip("[]").split(",") if item.strip()]
        else:
            origins = [item.strip() for item in raw.split(",") if item.strip()]
    
    frontend_url = os.getenv("FRONTEND_URL", "").strip()
    if frontend_url and frontend_url not in origins:
        origins.append(frontend_url)

    # Defaults for local development and standard Render frontend ports
    defaults = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    for d in defaults:
        if d not in origins:
            origins.append(d)
    return origins

class Settings(BaseModel):
    app_name: str = "EthnoKG"
    app_version: str = "1.0.0"
    environment: str = os.getenv("ENVIRONMENT", os.getenv("APP_ENV", "development"))
    api_prefix: str = "/api"
    database_url: str = get_normalized_database_url()
    cors_origins: List[str] = parse_cors_origins()
    secret_key: str = os.getenv("SECRET_KEY", "ethnokg-insecure-dev-secret-change-in-production")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    use_llm_extraction: bool = os.getenv("USE_LLM_EXTRACTION", "false").lower() == "true"
    confidence_threshold: float = float(os.getenv("DEFAULT_CONFIDENCE_THRESHOLD", "0.75"))

settings = Settings()
