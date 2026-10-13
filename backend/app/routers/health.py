from fastapi import APIRouter
from app.database.connection import check_database_connection
from app.core.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def health_check():
    """Health check endpoint providing API and MySQL status."""
    db_status = check_database_connection()
    is_healthy = db_status["connected"]
    
    return {
        "status": "healthy" if is_healthy else "degraded",
        "service": settings.PROJECT_NAME,
        "environment": settings.APP_ENV,
        "database": db_status
    }
