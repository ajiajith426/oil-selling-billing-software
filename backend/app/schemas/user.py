from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole = UserRole.staff


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ── Super Admin bootstrap ─────────────────────────────────────────────────

class SuperAdminCreateRequest(BaseModel):
    """
    One-time super admin creation payload.
    Requires the SUPER_ADMIN_SECRET_KEY from server config — no JWT needed.
    """
    secret_key: str          # must match SUPER_ADMIN_SECRET_KEY in .env
    name: str
    email: EmailStr
    password: str
