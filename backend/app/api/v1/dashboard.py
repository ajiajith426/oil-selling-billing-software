from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.dashboard_service import DashboardService
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return DashboardService(db).get_stats()


@router.get("/recent-bills")
def recent_bills(limit: int = Query(10, ge=1, le=50),
                 db: Session = Depends(get_db),
                 _: User = Depends(get_current_user)):
    return DashboardService(db).get_recent_bills(limit)


@router.get("/top-products")
def top_products(limit: int = Query(10, ge=1, le=50),
                 db: Session = Depends(get_db),
                 _: User = Depends(get_current_user)):
    return DashboardService(db).get_top_selling_products(limit)


@router.get("/sales-graph")
def sales_graph(days: int = Query(30, ge=7, le=365),
                db: Session = Depends(get_db),
                _: User = Depends(get_current_user)):
    return DashboardService(db).get_sales_graph(days)


@router.get("/monthly-revenue")
def monthly_revenue(year: int = None,
                    db: Session = Depends(get_db),
                    _: User = Depends(get_current_user)):
    return DashboardService(db).get_monthly_revenue(year)
