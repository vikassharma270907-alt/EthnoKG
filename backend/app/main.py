from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from .core.config import settings
from .core.database import engine, Base, SessionLocal, get_db
from .core.seeder import seed_database
from .api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed verified dataset if empty
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="EthnoKG API",
    description="Turning Traditional Knowledge into Traceable Scientific Evidence — EthnoHack 2026",
    version=settings.app_version,
    lifespan=lifespan
)

# Robust CORS Configuration for Render Deployments
# Matches explicit origins, localhost dev servers, and all *.onrender.com subdomains
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"^https://.*\.onrender\.com$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers under /api
app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "project": "EthnoKG",
        "tagline": "Turning Traditional Knowledge into Traceable Scientific Evidence",
        "hackathon": "EthnoHack 2026",
        "version": settings.app_version,
        "environment": settings.environment,
        "docs_url": "/docs",
        "api_status": "operational"
    }

@app.get("/api/health")
@app.get("/healthz")
def healthcheck(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"

    is_healthy = db_status == "connected"
    return {
        "status": "healthy" if is_healthy else "degraded",
        "database": db_status,
        "service": "EthnoKG Backend",
        "environment": settings.environment,
        "version": settings.app_version
    }
