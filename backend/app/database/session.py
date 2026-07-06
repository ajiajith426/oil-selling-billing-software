from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# For Neon (serverless Postgres) use NullPool to avoid connection reuse issues.
# For local Postgres, regular pool is fine.
_is_neon = "neon.tech" in settings.DATABASE_URL

if _is_neon:
    from sqlalchemy.pool import NullPool
    engine = create_engine(
        settings.DATABASE_URL,
        poolclass=NullPool,
        connect_args={"sslmode": "require"},
    )
else:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
