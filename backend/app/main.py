from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from app.core.config import settings
from app.api.v1.router import api_router
from app.database.session import engine, Base
import app.models  # noqa: F401 — must be imported so all ORM classes register with Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup — models are imported above so Base.metadata is fully populated
    Base.metadata.create_all(bind=engine)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Billing & Inventory Management System API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads (directory created in lifespan)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Routers
app.include_router(api_router)


@app.get("/")
def root():
    return {"message": f"{settings.APP_NAME} API is running", "version": settings.APP_VERSION}


@app.get("/health")
def health():
    return {"status": "ok"}
