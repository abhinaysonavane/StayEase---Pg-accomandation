import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger(__name__)

def _create_db_engine(url: str):
    kwargs = {"pool_pre_ping": True}
    if url.startswith("sqlite"):
        kwargs["connect_args"] = {"check_same_thread": False}
    else:
        kwargs["pool_size"] = 10
        kwargs["max_overflow"] = 20
    return create_engine(url, **kwargs)

DATABASE_URL = settings.DATABASE_URL
engine = None
active_url = DATABASE_URL
is_fallback = False

try:
    _test_engine = _create_db_engine(DATABASE_URL)
    with _test_engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    engine = _test_engine
    logger.info(f"Database connected successfully via {engine.dialect.name}")
except Exception as e:
    if not DATABASE_URL.startswith("sqlite"):
        active_url = "sqlite:///./stayease.db"
        logger.warning(
            f"Primary database connection to MySQL failed ({e}). "
            f"Activating SQLite local database ({active_url}) for uninterrupted development."
        )
        engine = _create_db_engine(active_url)
        is_fallback = True
    else:
        raise e

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Generator:
    """Yields a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_database_connection() -> dict:
    """Verifies active connectivity to MySQL or configured database."""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            row = result.scalar()
            if row == 1:
                return {
                    "connected": True,
                    "database_type": engine.dialect.name,
                    "url": str(engine.url).split("@")[-1] if "@" in str(engine.url) else str(engine.url),
                    "fallback_mode": is_fallback,
                    "error": None
                }
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return {
            "connected": False,
            "database_type": engine.dialect.name if engine else "unknown",
            "url": str(engine.url).split("@")[-1] if engine and "@" in str(engine.url) else str(active_url),
            "fallback_mode": is_fallback,
            "error": str(e)
        }

