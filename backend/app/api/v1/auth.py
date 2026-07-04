from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.user import LoginRequest, TokenResponse, UserCreate, UserResponse, RefreshTokenRequest
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user, get_current_admin
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return AuthService(db).login(data)


@router.post("/register", response_model=UserResponse)
def register(data: UserCreate, db: Session = Depends(get_db),
             current_user: User = Depends(get_current_admin)):
    """Admin only: create new user accounts."""
    from app.schemas.user import UserResponse
    user = AuthService(db).register(data)
    return UserResponse.model_validate(user)


@router.post("/refresh")
def refresh(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    return AuthService(db).refresh_token(data.refresh_token)


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user
