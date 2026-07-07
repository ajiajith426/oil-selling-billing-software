from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime


class ProductBase(BaseModel):
    name: str
    category_id: Optional[int] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    purchase_price: Decimal = Decimal("0")
    selling_price: Decimal = Decimal("0")
    gst_percent: Decimal = Decimal("0")
    unit: str = "Pcs"
    minimum_stock: Decimal = Decimal("0")
    brand: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True


class ProductCreate(ProductBase):
    current_stock: Decimal = Decimal("0")


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    purchase_price: Optional[Decimal] = None
    selling_price: Optional[Decimal] = None
    gst_percent: Optional[Decimal] = None
    unit: Optional[str] = None
    minimum_stock: Optional[Decimal] = None
    brand: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    image_url: Optional[str] = None


class ProductResponse(ProductBase):
    id: int
    current_stock: Decimal
    image_url: Optional[str] = None
    created_at: datetime
    category_name: Optional[str] = None

    class Config:
        from_attributes = True
