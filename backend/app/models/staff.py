from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Date, Numeric, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.session import Base


class StaffStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    on_leave = "on_leave"
    terminated = "terminated"


class StaffDepartment(str, enum.Enum):
    sales = "sales"
    operations = "operations"
    delivery = "delivery"
    accounts = "accounts"
    management = "management"
    warehouse = "warehouse"
    other = "other"


class StaffShift(str, enum.Enum):
    morning = "morning"
    afternoon = "afternoon"
    night = "night"
    full_day = "full_day"


class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)

    # Personal info
    name = Column(String(150), nullable=False, index=True)
    employee_code = Column(String(50), unique=True, nullable=True, index=True)
    mobile = Column(String(20), nullable=False, index=True)
    alternate_mobile = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True, index=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(10), nullable=True)           # male / female / other

    # Address
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(20), nullable=True)

    # Employment details
    department = Column(Enum(StaffDepartment), default=StaffDepartment.other)
    designation = Column(String(100), nullable=True)
    shift = Column(Enum(StaffShift), default=StaffShift.full_day)
    date_of_joining = Column(Date, nullable=True)
    date_of_leaving = Column(Date, nullable=True)
    status = Column(Enum(StaffStatus), default=StaffStatus.active)

    # Salary
    salary = Column(Numeric(12, 2), default=0)
    salary_type = Column(String(20), default="monthly")   # monthly / daily / hourly

    # Identity documents
    aadhar_number = Column(String(20), nullable=True)
    pan_number = Column(String(20), nullable=True)
    driving_license = Column(String(50), nullable=True)

    # Bank details
    bank_name = Column(String(100), nullable=True)
    bank_account_number = Column(String(50), nullable=True)
    bank_ifsc = Column(String(20), nullable=True)

    # Login account linkage (optional – staff may also be a system user)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Emergency contact
    emergency_contact_name = Column(String(100), nullable=True)
    emergency_contact_mobile = Column(String(20), nullable=True)

    # Notes / photo
    photo_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    vehicle_assignments = relationship("VehicleAssignment", back_populates="staff")
