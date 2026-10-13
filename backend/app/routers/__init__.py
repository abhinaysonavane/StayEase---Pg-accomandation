from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.properties import router as properties_router
from app.routers.rooms import router as rooms_router
from app.routers.beds import router as beds_router
from app.routers.admin import router as admin_router
from app.routers.join_requests import router as join_requests_router

__all__ = [
    "health_router",
    "auth_router",
    "properties_router",
    "rooms_router",
    "beds_router",
    "admin_router",
    "join_requests_router"
]

