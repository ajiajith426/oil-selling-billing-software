from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import date, datetime
from app.models.vehicle import VehicleType, VehicleStatus, FuelType


# ── Vehicle ───────────────────────────────────────────────────────────────

class VehicleBase(BaseModel):
    registration_number: str
    vehicle_type: VehicleType = VehicleType.truck
    make: Optional[str] = None
    model: Optional[str] = None
    year_of_manufacture: Optional[int] = None
    color: Optional[str] = None
    vin_number: Optional[str] = None

    fuel_type: FuelType = FuelType.diesel
    fuel_capacity: Optional[Decimal] = None
    load_capacity: Optional[Decimal] = None
    odometer_reading: Decimal = Decimal("0")

    insurance_number: Optional[str] = None
    insurance_expiry: Optional[date] = None
    rc_expiry: Optional[date] = None
    fitness_expiry: Optional[date] = None
    permit_expiry: Optional[date] = None
    pollution_expiry: Optional[date] = None

    last_service_date: Optional[date] = None
    next_service_date: Optional[date] = None
    next_service_km: Optional[Decimal] = None

    status: VehicleStatus = VehicleStatus.active
    is_owned: bool = True
    purchase_date: Optional[date] = None
    purchase_price: Optional[Decimal] = None

    gps_device_id: Optional[str] = None
    notes: Optional[str] = None


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    registration_number: Optional[str] = None
    vehicle_type: Optional[VehicleType] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year_of_manufacture: Optional[int] = None
    color: Optional[str] = None
    vin_number: Optional[str] = None
    fuel_type: Optional[FuelType] = None
    fuel_capacity: Optional[Decimal] = None
    load_capacity: Optional[Decimal] = None
    odometer_reading: Optional[Decimal] = None
    insurance_number: Optional[str] = None
    insurance_expiry: Optional[date] = None
    rc_expiry: Optional[date] = None
    fitness_expiry: Optional[date] = None
    permit_expiry: Optional[date] = None
    pollution_expiry: Optional[date] = None
    last_service_date: Optional[date] = None
    next_service_date: Optional[date] = None
    next_service_km: Optional[Decimal] = None
    status: Optional[VehicleStatus] = None
    is_owned: Optional[bool] = None
    purchase_date: Optional[date] = None
    purchase_price: Optional[Decimal] = None
    gps_device_id: Optional[str] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None


class VehicleResponse(VehicleBase):
    id: int
    photo_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    # computed helpers
    current_driver_name: Optional[str] = None

    class Config:
        from_attributes = True


# ── Vehicle Assignment ────────────────────────────────────────────────────

class VehicleAssignmentCreate(BaseModel):
    vehicle_id: int
    staff_id: int
    assigned_date: date
    notes: Optional[str] = None


class VehicleAssignmentRelease(BaseModel):
    released_date: date
    notes: Optional[str] = None


class VehicleAssignmentResponse(BaseModel):
    id: int
    vehicle_id: int
    staff_id: int
    assigned_date: date
    released_date: Optional[date] = None
    is_current: bool
    notes: Optional[str] = None
    created_at: datetime
    # enriched
    staff_name: Optional[str] = None
    vehicle_registration: Optional[str] = None

    class Config:
        from_attributes = True


# ── Maintenance Log ───────────────────────────────────────────────────────

class MaintenanceLogCreate(BaseModel):
    vehicle_id: int
    service_date: date
    service_type: str
    description: Optional[str] = None
    odometer_at_service: Optional[Decimal] = None
    cost: Decimal = Decimal("0")
    vendor_name: Optional[str] = None
    next_service_date: Optional[date] = None
    next_service_km: Optional[Decimal] = None


class MaintenanceLogResponse(BaseModel):
    id: int
    vehicle_id: int
    service_date: date
    service_type: str
    description: Optional[str] = None
    odometer_at_service: Optional[Decimal] = None
    cost: Decimal
    vendor_name: Optional[str] = None
    next_service_date: Optional[date] = None
    next_service_km: Optional[Decimal] = None
    created_at: datetime

    class Config:
        from_attributes = True
