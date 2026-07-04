from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal
from datetime import datetime
from app.models.purchase import PurchaseStatus


class PurchaseItemCreate(BaseModel):
    product_id: int
    quantity: Decimal
    unit_price: Decimal
    gst_percent: Decimal = Decimal("0")
    discount_percent: Decimal = Decimal("0")


class PurchaseItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    quantity: Decimal
    unit_price: Decimal
    gst_percent: Decimal
    gst_amount: Decimal
    discount_percent: Decimal
    discount_amount: Decimal
    total_amount: Decimal

    class Config:
        from_attributes = True


class PurchaseCreate(BaseModel):
    supplier_id: Optional[int] = None
    purchase_date: Optional[datetime] = None
    discount_amount: Decimal = Decimal("0")
    paid_amount: Decimal = Decimal("0")
    notes: Optional[str] = None
    items: List[PurchaseItemCreate]


class PurchaseUpdate(BaseModel):
    supplier_id: Optional[int] = None
    status: Optional[PurchaseStatus] = None
    paid_amount: Optional[Decimal] = None
    notes: Optional[str] = None


class PurchaseResponse(BaseModel):
    id: int
    invoice_number: str
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    purchase_date: datetime
    subtotal: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    grand_total: Decimal
    paid_amount: Decimal
    due_amount: Decimal
    status: PurchaseStatus
    notes: Optional[str] = None
    items: List[PurchaseItemResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True
