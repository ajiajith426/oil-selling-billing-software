from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Numeric, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.session import Base


class MovementType(str, enum.Enum):
    stock_in = "stock_in"
    stock_out = "stock_out"
    adjustment = "adjustment"
    purchase = "purchase"
    sale = "sale"
    return_in = "return_in"
    return_out = "return_out"


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    movement_type = Column(Enum(MovementType), nullable=False)
    quantity = Column(Numeric(12, 2), nullable=False)
    stock_before = Column(Numeric(12, 2), nullable=False)
    stock_after = Column(Numeric(12, 2), nullable=False)
    reference_id = Column(Integer, nullable=True)   # purchase_id or sale_id
    reference_type = Column(String(50), nullable=True)  # 'purchase' | 'sale'
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="stock_movements")
