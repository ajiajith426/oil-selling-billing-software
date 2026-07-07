from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.schemas.user import UserCreate, LoginRequest, TokenResponse, UserResponse, SuperAdminCreateRequest
from app.core.config import settings


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def login(self, data: LoginRequest) -> TokenResponse:
        user = self.db.query(User).filter(User.email == data.email).first()
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

        token_data = {"sub": str(user.id), "role": user.role}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(user),
        )

    def refresh_token(self, refresh_token: str) -> dict:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        user_id = payload.get("sub")
        user = self.db.query(User).filter(User.id == int(user_id)).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        token_data = {"sub": str(user.id), "role": user.role}
        return {
            "access_token": create_access_token(token_data),
            "token_type": "bearer",
        }

    def register(self, data: UserCreate) -> User:
        existing = self.db.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        user = User(
            name=data.name,
            email=data.email,
            hashed_password=get_password_hash(data.password),
            role=data.role,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def create_super_admin(self, data: SuperAdminCreateRequest) -> TokenResponse:
        """
        Bootstrap a super_admin account.

        Rules:
        - secret_key must match SUPER_ADMIN_SECRET_KEY from server config.
        - Only one super_admin is allowed to exist at a time.
        - The endpoint is open (no JWT) — the secret key IS the auth.
        """
        # 1. Validate bootstrap secret
        if data.secret_key != settings.SUPER_ADMIN_SECRET_KEY:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid secret key",
            )

        # 2. Prevent duplicate super admins
        existing_super = self.db.query(User).filter(
            User.role == UserRole.super_admin
        ).first()
        if existing_super:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A super admin already exists. "
                       "Use the standard login endpoint to authenticate.",
            )

        # 3. Prevent email clash
        if self.db.query(User).filter(User.email == data.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered",
            )

        # 4. Create the super admin
        user = User(
            name=data.name,
            email=data.email,
            hashed_password=get_password_hash(data.password),
            role=UserRole.super_admin,
            is_active=True,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        # 5. Return tokens so the caller is immediately authenticated
        token_data = {"sub": str(user.id), "role": user.role}
        return TokenResponse(
            access_token=create_access_token(token_data),
            refresh_token=create_refresh_token(token_data),
            user=UserResponse.model_validate(user),
        )
