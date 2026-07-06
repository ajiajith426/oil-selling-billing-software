from pydantic import BaseModel, EmailStr
from typing import Optional
from decimal import Decimal
from datetime import date, datetime
from app.models.staff import StaffStatus, StaffDepartment, StaffShift


# ── Staff ─────────────────────────────────────────────────────────────────

class StaffBase(BaseModel):
    name: str
    employee_code: Optional[str] = None
    mobile: str
    alternate_mobile: Optional[str] = None
    email: Optional[EmailStr] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None

    # Address
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

    # Employment
    department: StaffDepartment = StaffDepartment.other
    designation: Optional[str] = None
    shift: StaffShift = StaffShift.full_day
    date_of_joining: Optional[date] = None
    date_of_leaving: Optional[date] = None
    status: StaffStatus = StaffStatus.active

    # Salary
    salary: Decimal = Decimal("0")
    salary_type: str = "monthly"

    # Identity docs
    aadhar_number: Optional[str] = None
    pan_number: Optional[str] = None
    driving_license: Optional[str] = None

    # Bank
    bank_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc: Optional[str] = None

    # Emergency contact
    emergency_contact_name: Optional[str] = None
    emergency_contact_mobile: Optional[str] = None

    # Misc
    user_id: Optional[int] = None
    notes: Optional[str] = None


class StaffCreate(StaffBase):
    pass


class StaffUpdate(BaseModel):
    name: Optional[str] = None
    employee_code: Optional[str] = None
    mobile: Optional[str] = None
    alternate_mobile: Optional[str] = None
    email: Optional[EmailStr] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    department: Optional[StaffDepartment] = None
    designation: Optional[str] = None
    shift: Optional[StaffShift] = None
    date_of_joining: Optional[date] = None
    date_of_leaving: Optional[date] = None
    status: Optional[StaffStatus] = None
    salary: Optional[Decimal] = None
    salary_type: Optional[str] = None
    aadhar_number: Optional[str] = None
    pan_number: Optional[str] = None
    driving_license: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_mobile: Optional[str] = None
    user_id: Optional[int] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None


class StaffResponse(StaffBase):
    id: int
    photo_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
