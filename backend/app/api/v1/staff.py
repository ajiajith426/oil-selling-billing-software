from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
import os
import uuid

from app.database.session import get_db
from app.models.staff import Staff, StaffStatus, StaffDepartment
from app.schemas.staff import StaffCreate, StaffUpdate, StaffResponse
from app.core.dependencies import get_current_user, get_current_admin
from app.core.config import settings
from app.models.user import User

router = APIRouter(prefix="/staff", tags=["Staff"])


def _enrich(s: Staff) -> StaffResponse:
    return StaffResponse.model_validate(s)


# ── List ─────────────────────────────────────────────────────────────────

@router.get("", response_model=dict)
def list_staff(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    department: Optional[StaffDepartment] = None,
    status: Optional[StaffStatus] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = db.query(Staff)

    if search:
        q = q.filter(
            or_(
                Staff.name.ilike(f"%{search}%"),
                Staff.mobile.ilike(f"%{search}%"),
                Staff.employee_code.ilike(f"%{search}%"),
                Staff.email.ilike(f"%{search}%"),
            )
        )
    if department:
        q = q.filter(Staff.department == department)
    if status:
        q = q.filter(Staff.status == status)

    total = q.count()
    items = q.order_by(Staff.name).offset(skip).limit(limit).all()
    return {"total": total, "items": [_enrich(s) for s in items]}


# ── Create ────────────────────────────────────────────────────────────────

@router.post("", response_model=StaffResponse, status_code=201)
def create_staff(
    data: StaffCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    # Auto-generate employee code if not provided
    if not data.employee_code:
        last = db.query(Staff).order_by(Staff.id.desc()).first()
        next_id = (last.id + 1) if last else 1
        data = data.model_copy(update={"employee_code": f"EMP-{next_id:04d}"})

    staff = Staff(**data.model_dump())
    db.add(staff)
    db.commit()
    db.refresh(staff)
    return _enrich(staff)


# ── Get by ID ─────────────────────────────────────────────────────────────

@router.get("/{staff_id}", response_model=StaffResponse)
def get_staff(
    staff_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(404, "Staff member not found")
    return _enrich(staff)


# ── Update ────────────────────────────────────────────────────────────────

@router.put("/{staff_id}", response_model=StaffResponse)
def update_staff(
    staff_id: int,
    data: StaffUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(404, "Staff member not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(staff, k, v)
    db.commit()
    db.refresh(staff)
    return _enrich(staff)


# ── Delete ────────────────────────────────────────────────────────────────

@router.delete("/{staff_id}", status_code=204)
def delete_staff(
    staff_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(404, "Staff member not found")
    db.delete(staff)
    db.commit()


# ── Upload photo ──────────────────────────────────────────────────────────

@router.post("/{staff_id}/upload-photo")
async def upload_photo(
    staff_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(404, "Staff member not found")
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")

    upload_dir = os.path.join(settings.UPLOAD_DIR, "staff")
    os.makedirs(upload_dir, exist_ok=True)
    ext = file.filename.split(".")[-1]
    filename = f"staff_{staff_id}_{uuid.uuid4()}.{ext}"
    filepath = os.path.join(upload_dir, filename)

    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)

    staff.photo_url = f"/uploads/staff/{filename}"
    db.commit()
    return {"photo_url": staff.photo_url}


# ── Department summary ────────────────────────────────────────────────────

@router.get("/meta/summary")
def staff_summary(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    from sqlalchemy import func
    total = db.query(func.count(Staff.id)).scalar()
    active = db.query(func.count(Staff.id)).filter(Staff.status == StaffStatus.active).scalar()
    on_leave = db.query(func.count(Staff.id)).filter(Staff.status == StaffStatus.on_leave).scalar()
    inactive = db.query(func.count(Staff.id)).filter(
        Staff.status.in_([StaffStatus.inactive, StaffStatus.terminated])
    ).scalar()

    dept_counts = (
        db.query(Staff.department, func.count(Staff.id).label("count"))
        .group_by(Staff.department)
        .all()
    )

    return {
        "total": total,
        "active": active,
        "on_leave": on_leave,
        "inactive": inactive,
        "by_department": [{"department": d, "count": c} for d, c in dept_counts],
    }
