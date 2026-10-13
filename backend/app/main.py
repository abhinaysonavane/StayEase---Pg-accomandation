import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from app.core.config import settings
from app.database.connection import SessionLocal
from app.database.init_db import create_tables, seed_initial_data
from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.properties import router as properties_router
from app.routers.rooms import router as rooms_router
from app.routers.beds import router as beds_router
from app.routers.admin import router as admin_router
from app.routers.join_requests import router as join_requests_router
from app.routers.payments import router as payments_router
from app.routers.complaints import router as complaints_router
from app.routers.notifications import router as notifications_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("stayease")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info("Initializing StayEase backend...")
    try:
        create_tables()
        db = SessionLocal()
        try:
            seed_initial_data(db)
        finally:
            db.close()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.warning(f"Database auto-migration skipped on startup: {e}")
    yield
    logger.info("Shutting down StayEase backend.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="REST API service for the StayEase PG Accommodation & Co-living Platform.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root-level health check endpoint /health as required
app.include_router(health_router)
# Versioned API routes /api/...
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(properties_router, prefix=settings.API_V1_STR)
app.include_router(rooms_router, prefix=settings.API_V1_STR)
app.include_router(beds_router, prefix=settings.API_V1_STR)
app.include_router(join_requests_router, prefix=settings.API_V1_STR)
app.include_router(payments_router, prefix=settings.API_V1_STR)
app.include_router(complaints_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.SERVER_HOST, port=settings.SERVER_PORT, reload=True)
