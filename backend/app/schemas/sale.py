from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal
from datetime import datetime
from app.models.sale import PaymentMethod, SaleStatus


class SaleItemCreate(BaseModel):
    product_id: int
    quantity: Decimal
    unit_price: Decimal
    gst_percent: Decimal = Decimal("0")
    discount_percent: Decimal = Decimal("0")


class SaleItemResponse(BaseModel):
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


class SaleCreate(BaseModel):
    customer_id: Optional[int] = None
    discount_amount: Decimal = Decimal("0")
    paid_amount: Decimal = Decimal("0")
    payment_method: PaymentMethod = PaymentMethod.cash
    cash_amount: Decimal = Decimal("0")
    card_amount: Decimal = Decimal("0")
    upi_amount: Decimal = Decimal("0")
    notes: Optional[str] = None
    items: List[SaleItemCreate]


class SaleResponse(BaseModel):
    id: int
    invoice_number: str
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    sale_date: datetime
    subtotal: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    grand_total: Decimal
    paid_amount: Decimal
    change_amount: Decimal
    payment_method: PaymentMethod
    cash_amount: Decimal
    card_amount: Decimal
    upi_amount: Decimal
    status: SaleStatus
    notes: Optional[str] = None
    items: List[SaleItemResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True
