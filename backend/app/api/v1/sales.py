from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.database.session import get_db
from app.schemas.sale import SaleCreate, SaleResponse
from app.services.sale_service import SaleService
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/sales", tags=["Sales"])


@router.get("", response_model=dict)
def list_sales(
    skip: int = 0, limit: int = 50,
    customer_id: Optional[int] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    total, items = SaleService(db).get_all(skip, limit, customer_id, from_date, to_date)
    return {"total": total, "items": items}


@router.post("", response_model=SaleResponse, status_code=201)
def create_sale(data: SaleCreate, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    return SaleService(db).create(data, current_user.id)


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(sale_id: int, db: Session = Depends(get_db),
             _: User = Depends(get_current_user)):
    return SaleService(db).get_by_id(sale_id)


@router.post("/{sale_id}/cancel", response_model=SaleResponse)
def cancel_sale(sale_id: int, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    return SaleService(db).cancel(sale_id, current_user.id)
