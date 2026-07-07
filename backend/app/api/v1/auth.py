from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.user import (
    LoginRequest, TokenResponse, UserCreate, UserResponse,
    RefreshTokenRequest, SuperAdminCreateRequest,
)
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user, get_current_admin, get_current_super_admin
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/create-super-admin",
    response_model=TokenResponse,
    status_code=201,
    summary="Bootstrap super admin (one-time setup)",
    description=(
        "Creates the first super_admin account. "
        "Requires the `SUPER_ADMIN_SECRET_KEY` from server config — **no JWT needed**. "
        "Returns tokens so the caller is immediately authenticated. "
        "Returns **409** if a super admin already exists."
    ),
)
def create_super_admin(data: SuperAdminCreateRequest, db: Session = Depends(get_db)):
    return AuthService(db).create_super_admin(data)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return AuthService(db).login(data)


@router.post(
    "/register",
    response_model=UserResponse,
    summary="Create admin or staff user (admin/super_admin only)",
)
def register(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Admin or super_admin only: create new user accounts."""
    user = AuthService(db).register(data)
    return UserResponse.model_validate(user)


@router.post("/refresh")
def refresh(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    return AuthService(db).refresh_token(data.refresh_token)


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get(
    "/users",
    response_model=dict,
    summary="List all users (super_admin only)",
)
def list_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_super_admin),
):
    """Super admin only: view all system users."""
    from sqlalchemy import func
    total = db.query(func.count(User.id)).scalar()
    users = db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return {
        "total": total,
        "items": [UserResponse.model_validate(u) for u in users],
    }


@router.put(
    "/users/{user_id}/toggle-active",
    response_model=UserResponse,
    summary="Enable or disable a user account (super_admin only)",
)
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_super_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(404, "User not found")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)
