from fastapi import APIRouter
from .documents import router as documents_router
from .extraction import router as extraction_router
from .plants import router as plants_router
from .compounds import router as compounds_router
from .conditions import router as conditions_router
from .graph import router as graph_router
from .verification import router as verification_router
from .assistant import router as assistant_router
from .dashboard import router as dashboard_router
from .sources import router as sources_router
from .analytics import router as analytics_router

api_router = APIRouter()

api_router.include_router(dashboard_router)
api_router.include_router(documents_router)
api_router.include_router(extraction_router)
api_router.include_router(plants_router)
api_router.include_router(compounds_router)
api_router.include_router(conditions_router)
api_router.include_router(graph_router)
api_router.include_router(verification_router)
api_router.include_router(assistant_router)
api_router.include_router(sources_router)
api_router.include_router(analytics_router)
