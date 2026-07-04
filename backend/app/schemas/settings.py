from pydantic import BaseModel, EmailStr
from typing import Optional


class SettingsUpdate(BaseModel):
    company_name: Optional[str] = None
    gst_number: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    logo_url: Optional[str] = None
    invoice_prefix: Optional[str] = None
    purchase_prefix: Optional[str] = None
    currency: Optional[str] = None
    currency_symbol: Optional[str] = None
    tax_inclusive: Optional[str] = None
    website: Optional[str] = None


class SettingsResponse(BaseModel):
    id: int
    company_name: str
    gst_number: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    logo_url: Optional[str] = None
    invoice_prefix: str
    purchase_prefix: str
    currency: str
    currency_symbol: str
    tax_inclusive: str
    website: Optional[str] = None

    class Config:
        from_attributes = True
