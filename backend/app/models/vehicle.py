from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Date, Numeric, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.session import Base


class VehicleType(str, enum.Enum):
    truck = "truck"
    tanker = "tanker"
    van = "van"
    pickup = "pickup"
    motorcycle = "motorcycle"
    car = "car"
    three_wheeler = "three_wheeler"
    other = "other"


class VehicleStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    under_maintenance = "under_maintenance"
    retired = "retired"


class FuelType(str, enum.Enum):
    petrol = "petrol"
    diesel = "diesel"
    cng = "cng"
    electric = "electric"
    hybrid = "hybrid"


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)

    # Identification
    registration_number = Column(String(50), unique=True, nullable=False, index=True)
    vehicle_type = Column(Enum(VehicleType), default=VehicleType.truck)
    make = Column(String(100), nullable=True)           # manufacturer e.g. Tata, Ashok Leyland
    model = Column(String(100), nullable=True)          # model name
    year_of_manufacture = Column(Integer, nullable=True)
    color = Column(String(50), nullable=True)
    vin_number = Column(String(100), nullable=True)     # chassis / VIN

    # Fuel & capacity
    fuel_type = Column(Enum(FuelType), default=FuelType.diesel)
    fuel_capacity = Column(Numeric(10, 2), nullable=True)       # litres
    load_capacity = Column(Numeric(10, 2), nullable=True)       # kg or litres depending on use
    odometer_reading = Column(Numeric(12, 2), default=0)        # km

    # Documents & compliance
    insurance_number = Column(String(100), nullable=True)
    insurance_expiry = Column(Date, nullable=True)
    rc_expiry = Column(Date, nullable=True)             # Registration Certificate expiry
    fitness_expiry = Column(Date, nullable=True)        # Fitness certificate
    permit_expiry = Column(Date, nullable=True)         # Road permit
    pollution_expiry = Column(Date, nullable=True)      # PUC

    # Maintenance
    last_service_date = Column(Date, nullable=True)
    next_service_date = Column(Date, nullable=True)
    next_service_km = Column(Numeric(12, 2), nullable=True)

    # Status & ownership
    status = Column(Enum(VehicleStatus), default=VehicleStatus.active)
    is_owned = Column(Boolean, default=True)            # True = owned, False = leased/hired
    purchase_date = Column(Date, nullable=True)
    purchase_price = Column(Numeric(14, 2), nullable=True)

    # GPS / tracking
    gps_device_id = Column(String(100), nullable=True)

    # Notes & image
    photo_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    assignments = relationship("VehicleAssignment", back_populates="vehicle",
                               cascade="all, delete-orphan")


class VehicleAssignment(Base):
    """Tracks which staff member is assigned to which vehicle and when."""
    __tablename__ = "vehicle_assignments"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    assigned_date = Column(Date, nullable=False)
    released_date = Column(Date, nullable=True)         # NULL = still assigned
    is_current = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    vehicle = relationship("Vehicle", back_populates="assignments")
    staff = relationship("Staff", back_populates="vehicle_assignments")


class VehicleMaintenanceLog(Base):
    """Service / repair history for a vehicle."""
    __tablename__ = "vehicle_maintenance_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    service_date = Column(Date, nullable=False)
    service_type = Column(String(100), nullable=False)  # e.g. "Oil Change", "Tyre Replacement"
    description = Column(Text, nullable=True)
    odometer_at_service = Column(Numeric(12, 2), nullable=True)
    cost = Column(Numeric(12, 2), default=0)
    vendor_name = Column(String(150), nullable=True)
    next_service_date = Column(Date, nullable=True)
    next_service_km = Column(Numeric(12, 2), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    vehicle = relationship("Vehicle")
