import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

@app.get("/api/info")
def api_info():
    return {
        "project": "EthnoKG",
        "tagline": "Turning Traditional Knowledge into Traceable Scientific Evidence",
        "hackathon": "EthnoHack 2026",
        "version": settings.app_version,
        "environment": settings.environment,
        "docs_url": "/docs",
        "api_status": "operational"
    }

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    def serve_root():
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return api_info()

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path in ["docs", "openapi.json", "healthz", "redoc", "api"]:
            return {"error": "API route not found"}
        target_file = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(target_file):
            return FileResponse(target_file)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return api_info()
else:
    @app.get("/")
    def root():
        return api_info()
