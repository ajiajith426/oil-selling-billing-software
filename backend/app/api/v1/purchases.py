from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.database.session import get_db
from app.schemas.purchase import PurchaseCreate, PurchaseResponse
from app.services.purchase_service import PurchaseService
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/purchases", tags=["Purchases"])


@router.get("", response_model=dict)
def list_purchases(
    skip: int = 0, limit: int = 50,
    supplier_id: Optional[int] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    total, items = PurchaseService(db).get_all(skip, limit, supplier_id, from_date, to_date)
    return {"total": total, "items": items}


@router.post("", response_model=PurchaseResponse, status_code=201)
def create_purchase(data: PurchaseCreate, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    return PurchaseService(db).create(data, current_user.id)


@router.get("/{purchase_id}", response_model=PurchaseResponse)
def get_purchase(purchase_id: int, db: Session = Depends(get_db),
                 _: User = Depends(get_current_user)):
    return PurchaseService(db).get_by_id(purchase_id)
