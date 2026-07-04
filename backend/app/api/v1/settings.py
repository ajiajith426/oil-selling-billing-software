from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import os
import uuid
from app.database.session import get_db
from app.models.settings import CompanySettings
from app.schemas.settings import SettingsUpdate, SettingsResponse
from app.core.dependencies import get_current_user, get_current_admin
from app.core.config import settings as app_settings
from app.models.user import User

router = APIRouter(prefix="/settings", tags=["Settings"])


def _get_or_create_settings(db: Session) -> CompanySettings:
    s = db.query(CompanySettings).first()
    if not s:
        s = CompanySettings()
        db.add(s)
        db.commit()
        db.refresh(s)
    return s


@router.get("", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return _get_or_create_settings(db)


@router.put("", response_model=SettingsResponse)
def update_settings(data: SettingsUpdate, db: Session = Depends(get_db),
                    _: User = Depends(get_current_admin)):
    s = _get_or_create_settings(db)
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return s


@router.post("/upload-logo")
async def upload_logo(file: UploadFile = File(...),
                      db: Session = Depends(get_db),
                      _: User = Depends(get_current_admin)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")
    upload_dir = os.path.join(app_settings.UPLOAD_DIR, "logos")
    os.makedirs(upload_dir, exist_ok=True)
    ext = file.filename.split(".")[-1]
    filename = f"logo_{uuid.uuid4()}.{ext}"
    filepath = os.path.join(upload_dir, filename)
    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)
    logo_url = f"/uploads/logos/{filename}"
    s = _get_or_create_settings(db)
    s.logo_url = logo_url
    db.commit()
    return {"logo_url": logo_url}
