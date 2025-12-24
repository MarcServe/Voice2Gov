from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings
import logging

logger = logging.getLogger(__name__)

# Create database engine with error handling
engine = None
try:
    db_url = settings.database_url
    if not db_url or db_url == "postgresql://postgres:postgres@localhost:5432/voice2gov":
        logger.warning("Using default database URL - make sure DATABASE_URL is set in environment variables")
    
    logger.info(f"Connecting to database: {db_url[:30] if len(db_url) > 30 else db_url}...")
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_size=5,  # Reduced for Railway free tier
        max_overflow=10,
        connect_args={"connect_timeout": 10}
    )
    logger.info("Database engine created successfully")
except Exception as e:
    logger.error(f"Failed to create database engine: {e}")
    logger.error("The app will start but database operations will fail")
    # Don't raise - allow app to start for health checks

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()


def get_db():
    """Dependency to get database session"""
    if engine is None:
        raise Exception("Database not initialized. Check DATABASE_URL environment variable.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


