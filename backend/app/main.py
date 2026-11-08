import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import text
from sqlalchemy.orm import Session
from .core.config import settings
from .core.database import engine, Base, SessionLocal, get_db
from .core.seeder import seed_database
from .api import api_router

logger = logging.getLogger("ethnokg")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed verified dataset if empty
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
    yield

app = FastAPI(
    title="EthnoKG API",
    description="Turning Traditional Knowledge into Traceable Scientific Evidence — EthnoHack 2026",
    version=settings.app_version,
    lifespan=lifespan
)

# Standard HTTP Security Headers (CWE-1021, CWE-79)
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# Robust CORS Configuration for Render Deployments
# Matches explicit origins, localhost dev servers, and ethnokg*.onrender.com subdomains
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"^https://ethnokg(-[a-z0-9]+)?\.onrender\.com$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers under /api
app.include_router(api_router, prefix="/api")

@app.api_route("/api/health", methods=["GET", "HEAD"])
@app.api_route("/healthz", methods=["GET", "HEAD"])
@app.api_route("/health", methods=["GET", "HEAD"])
def healthcheck(response: Response, db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        logger.error("Database healthcheck probe failed: %s", str(e))
        db_status = "unavailable"

    is_healthy = db_status == "connected"
    if not is_healthy:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

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

    walkthrough_dir = os.path.join(frontend_dist, "walkthrough")
    if os.path.exists(walkthrough_dir):
        app.mount("/walkthrough", StaticFiles(directory=walkthrough_dir), name="walkthrough")

    @app.api_route("/", methods=["GET", "HEAD"])
    def serve_root():
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file, headers={"Cache-Control": "no-cache, no-store, must-revalidate"})
        return api_info()

    frontend_dist_path = Path(frontend_dist).resolve()

    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
    def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path in ["docs", "openapi.json", "healthz", "health", "redoc", "api"]:
            raise HTTPException(status_code=404, detail="API route not found")
        
        # Disallow hidden dotfiles and traversal probing
        path_parts = Path(full_path).parts
        if any(part.startswith(".") for part in path_parts):
            raise HTTPException(status_code=404, detail="Resource not found")

        # Guard against path traversal attacks (CWE-22)
        try:
            target_path = (frontend_dist_path / full_path).resolve()
            target_path.relative_to(frontend_dist_path)
        except (ValueError, RuntimeError):
            raise HTTPException(status_code=403, detail="Access denied")

        if full_path and target_path.is_file():
            return FileResponse(str(target_path))
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file, headers={"Cache-Control": "no-cache, no-store, must-revalidate"})
        return api_info()
else:
    @app.get("/")
    def root():
        return api_info()
