from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from typing import Optional
from datetime import date, timedelta
import os
import uuid

from app.database.session import get_db
from app.models.vehicle import Vehicle, VehicleAssignment, VehicleMaintenanceLog, VehicleStatus
from app.models.staff import Staff
from app.schemas.vehicle import (
    VehicleCreate, VehicleUpdate, VehicleResponse,
    VehicleAssignmentCreate, VehicleAssignmentRelease, VehicleAssignmentResponse,
    MaintenanceLogCreate, MaintenanceLogResponse,
)
from app.core.dependencies import get_current_user, get_current_admin
from app.core.config import settings
from app.models.user import User

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


# ── Helpers ───────────────────────────────────────────────────────────────

def _enrich_vehicle(v: Vehicle, db: Session) -> VehicleResponse:
    resp = VehicleResponse.model_validate(v)
    # Attach current driver name
    assignment = (
        db.query(VehicleAssignment)
        .filter(VehicleAssignment.vehicle_id == v.id, VehicleAssignment.is_current == True)
        .first()
    )
    if assignment and assignment.staff:
        resp.current_driver_name = assignment.staff.name
    return resp


def _enrich_assignment(a: VehicleAssignment) -> VehicleAssignmentResponse:
    resp = VehicleAssignmentResponse.model_validate(a)
    if a.staff:
        resp.staff_name = a.staff.name
    if a.vehicle:
        resp.vehicle_registration = a.vehicle.registration_number
    return resp


# ── Vehicle CRUD ──────────────────────────────────────────────────────────

@router.get("", response_model=dict)
def list_vehicles(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    status: Optional[VehicleStatus] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = db.query(Vehicle)

    if search:
        q = q.filter(
            or_(
                Vehicle.registration_number.ilike(f"%{search}%"),
                Vehicle.make.ilike(f"%{search}%"),
                Vehicle.model.ilike(f"%{search}%"),
            )
        )
    if vehicle_type:
        q = q.filter(Vehicle.vehicle_type == vehicle_type)
    if status:
        q = q.filter(Vehicle.status == status)

    total = q.count()
    items = q.order_by(Vehicle.registration_number).offset(skip).limit(limit).all()
    return {"total": total, "items": [_enrich_vehicle(v, db) for v in items]}


@router.post("", response_model=VehicleResponse, status_code=201)
def create_vehicle(
    data: VehicleCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    existing = db.query(Vehicle).filter(
        Vehicle.registration_number == data.registration_number
    ).first()
    if existing:
        raise HTTPException(400, f"Vehicle with registration '{data.registration_number}' already exists")

    vehicle = Vehicle(**data.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return _enrich_vehicle(vehicle, db)


@router.get("/meta/summary")
def vehicle_summary(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    today = date.today()
    in_30_days = today + timedelta(days=30)

    total = db.query(func.count(Vehicle.id)).scalar()
    active = db.query(func.count(Vehicle.id)).filter(Vehicle.status == VehicleStatus.active).scalar()
    under_maintenance = db.query(func.count(Vehicle.id)).filter(
        Vehicle.status == VehicleStatus.under_maintenance
    ).scalar()

    # Documents expiring within 30 days
    insurance_expiring = db.query(func.count(Vehicle.id)).filter(
        Vehicle.insurance_expiry <= in_30_days,
        Vehicle.insurance_expiry >= today,
        Vehicle.status == VehicleStatus.active,
    ).scalar()
    rc_expiring = db.query(func.count(Vehicle.id)).filter(
        Vehicle.rc_expiry <= in_30_days,
        Vehicle.rc_expiry >= today,
        Vehicle.status == VehicleStatus.active,
    ).scalar()
    fitness_expiring = db.query(func.count(Vehicle.id)).filter(
        Vehicle.fitness_expiry <= in_30_days,
        Vehicle.fitness_expiry >= today,
        Vehicle.status == VehicleStatus.active,
    ).scalar()
    pollution_expiring = db.query(func.count(Vehicle.id)).filter(
        Vehicle.pollution_expiry <= in_30_days,
        Vehicle.pollution_expiry >= today,
        Vehicle.status == VehicleStatus.active,
    ).scalar()

    return {
        "total": total,
        "active": active,
        "under_maintenance": under_maintenance,
        "documents_expiring_soon": {
            "insurance": insurance_expiring,
            "rc": rc_expiring,
            "fitness": fitness_expiring,
            "pollution": pollution_expiring,
        },
    }


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    return _enrich_vehicle(vehicle, db)


@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    data: VehicleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")

    update_data = data.model_dump(exclude_none=True)
    # Check registration uniqueness if being changed
    if "registration_number" in update_data:
        conflict = db.query(Vehicle).filter(
            Vehicle.registration_number == update_data["registration_number"],
            Vehicle.id != vehicle_id,
        ).first()
        if conflict:
            raise HTTPException(400, "Registration number already used by another vehicle")

    for k, v in update_data.items():
        setattr(vehicle, k, v)
    db.commit()
    db.refresh(vehicle)
    return _enrich_vehicle(vehicle, db)


@router.delete("/{vehicle_id}", status_code=204)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    db.delete(vehicle)
    db.commit()


# ── Photo upload ──────────────────────────────────────────────────────────

@router.post("/{vehicle_id}/upload-photo")
async def upload_vehicle_photo(
    vehicle_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")

    upload_dir = os.path.join(settings.UPLOAD_DIR, "vehicles")
    os.makedirs(upload_dir, exist_ok=True)
    ext = file.filename.split(".")[-1]
    filename = f"vehicle_{vehicle_id}_{uuid.uuid4()}.{ext}"
    filepath = os.path.join(upload_dir, filename)

    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)

    vehicle.photo_url = f"/uploads/vehicles/{filename}"
    db.commit()
    return {"photo_url": vehicle.photo_url}


# ── Assignments ───────────────────────────────────────────────────────────

@router.get("/{vehicle_id}/assignments", response_model=list)
def get_vehicle_assignments(
    vehicle_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    assignments = (
        db.query(VehicleAssignment)
        .options(joinedload(VehicleAssignment.staff), joinedload(VehicleAssignment.vehicle))
        .filter(VehicleAssignment.vehicle_id == vehicle_id)
        .order_by(VehicleAssignment.assigned_date.desc())
        .all()
    )
    return [_enrich_assignment(a) for a in assignments]


@router.post("/assignments", response_model=VehicleAssignmentResponse, status_code=201)
def assign_vehicle(
    data: VehicleAssignmentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    # Validate vehicle and staff exist
    vehicle = db.query(Vehicle).filter(Vehicle.id == data.vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")

    staff = db.query(Staff).filter(Staff.id == data.staff_id).first()
    if not staff:
        raise HTTPException(404, "Staff member not found")

    # Release any existing current assignment for this vehicle
    db.query(VehicleAssignment).filter(
        VehicleAssignment.vehicle_id == data.vehicle_id,
        VehicleAssignment.is_current == True,
    ).update({"is_current": False, "released_date": data.assigned_date})

    assignment = VehicleAssignment(
        vehicle_id=data.vehicle_id,
        staff_id=data.staff_id,
        assigned_date=data.assigned_date,
        notes=data.notes,
        is_current=True,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    # Reload with relationships
    assignment = (
        db.query(VehicleAssignment)
        .options(joinedload(VehicleAssignment.staff), joinedload(VehicleAssignment.vehicle))
        .filter(VehicleAssignment.id == assignment.id)
        .first()
    )
    return _enrich_assignment(assignment)


@router.put("/assignments/{assignment_id}/release", response_model=VehicleAssignmentResponse)
def release_assignment(
    assignment_id: int,
    data: VehicleAssignmentRelease,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    assignment = (
        db.query(VehicleAssignment)
        .options(joinedload(VehicleAssignment.staff), joinedload(VehicleAssignment.vehicle))
        .filter(VehicleAssignment.id == assignment_id)
        .first()
    )
    if not assignment:
        raise HTTPException(404, "Assignment not found")
    if not assignment.is_current:
        raise HTTPException(400, "Assignment is already released")

    assignment.is_current = False
    assignment.released_date = data.released_date
    if data.notes:
        assignment.notes = data.notes
    db.commit()
    db.refresh(assignment)
    return _enrich_assignment(assignment)


# ── Maintenance Logs ──────────────────────────────────────────────────────

@router.get("/{vehicle_id}/maintenance", response_model=list)
def get_maintenance_logs(
    vehicle_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    logs = (
        db.query(VehicleMaintenanceLog)
        .filter(VehicleMaintenanceLog.vehicle_id == vehicle_id)
        .order_by(VehicleMaintenanceLog.service_date.desc())
        .all()
    )
    return [MaintenanceLogResponse.model_validate(log) for log in logs]


@router.post("/{vehicle_id}/maintenance", response_model=MaintenanceLogResponse, status_code=201)
def add_maintenance_log(
    vehicle_id: int,
    data: MaintenanceLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")

    log_data = data.model_dump()
    log_data["vehicle_id"] = vehicle_id
    log_data["created_by"] = current_user.id
    log = VehicleMaintenanceLog(**log_data)
    db.add(log)

    # Update vehicle's service dates from the log
    if data.next_service_date:
        vehicle.next_service_date = data.next_service_date
    if data.next_service_km:
        vehicle.next_service_km = data.next_service_km
    vehicle.last_service_date = data.service_date

    db.commit()
    db.refresh(log)
    return MaintenanceLogResponse.model_validate(log)


@router.delete("/{vehicle_id}/maintenance/{log_id}", status_code=204)
def delete_maintenance_log(
    vehicle_id: int,
    log_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    log = db.query(VehicleMaintenanceLog).filter(
        VehicleMaintenanceLog.id == log_id,
        VehicleMaintenanceLog.vehicle_id == vehicle_id,
    ).first()
    if not log:
        raise HTTPException(404, "Maintenance log not found")
    db.delete(log)
    db.commit()
