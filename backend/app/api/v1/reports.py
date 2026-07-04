from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date
from app.database.session import get_db
from app.services.report_service import ReportService
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/sales")
def sales_report(
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return ReportService(db).sales_report(from_date, to_date)


@router.get("/purchases")
def purchase_report(
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return ReportService(db).purchase_report(from_date, to_date)


@router.get("/stock")
def stock_report(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return ReportService(db).stock_report()


@router.get("/gst")
def gst_report(
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return ReportService(db).gst_report(from_date, to_date)


@router.get("/profit-loss")
def profit_loss(
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return ReportService(db).profit_loss_report(from_date, to_date)
