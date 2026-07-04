from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.database.session import get_db
from app.models.stock import StockMovement, MovementType
from app.models.product import Product
from app.schemas.stock import StockAdjustmentCreate, StockMovementResponse
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/stock", tags=["Stock"])


@router.get("/movements", response_model=dict)
def list_movements(
    skip: int = 0, limit: int = 50,
    product_id: Optional[int] = None,
    movement_type: Optional[MovementType] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = db.query(StockMovement).options(joinedload(StockMovement.product))
    if product_id:
        q = q.filter(StockMovement.product_id == product_id)
    if movement_type:
        q = q.filter(StockMovement.movement_type == movement_type)
    q = q.order_by(StockMovement.id.desc())
    total = q.count()
    items = q.offset(skip).limit(limit).all()
    result = []
    for m in items:
        r = StockMovementResponse.model_validate(m)
        if m.product:
            r.product_name = m.product.name
        result.append(r)
    return {"total": total, "items": result}


@router.post("/adjust", response_model=StockMovementResponse, status_code=201)
def adjust_stock(
    data: StockAdjustmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")

    stock_before = product.current_stock
    if data.movement_type in [MovementType.stock_in, MovementType.adjustment]:
        product.current_stock += data.quantity
    elif data.movement_type == MovementType.stock_out:
        if product.current_stock < data.quantity:
            raise HTTPException(400, "Insufficient stock")
        product.current_stock -= data.quantity

    movement = StockMovement(
        product_id=data.product_id,
        movement_type=data.movement_type,
        quantity=data.quantity,
        stock_before=stock_before,
        stock_after=product.current_stock,
        notes=data.notes,
        created_by=current_user.id,
    )
    db.add(movement)
    db.commit()
    db.refresh(movement)
    r = StockMovementResponse.model_validate(movement)
    r.product_name = product.name
    return r
