from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
from app.models.stock import MovementType


class StockAdjustmentCreate(BaseModel):
    product_id: int
    movement_type: MovementType
    quantity: Decimal
    notes: Optional[str] = None


class StockMovementResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    movement_type: MovementType
    quantity: Decimal
    stock_before: Decimal
    stock_after: Decimal
    reference_id: Optional[int] = None
    reference_type: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
