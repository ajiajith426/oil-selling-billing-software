from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.database.session import Base


class CompanySettings(Base):
    __tablename__ = "company_settings"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(200), default="My Company")
    gst_number = Column(String(50), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(20), nullable=True)
    logo_url = Column(String(500), nullable=True)
    invoice_prefix = Column(String(20), default="INV")
    purchase_prefix = Column(String(20), default="PUR")
    currency = Column(String(10), default="INR")
    currency_symbol = Column(String(5), default="₹")
    tax_inclusive = Column(String(10), default="exclusive")
    website = Column(String(255), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
