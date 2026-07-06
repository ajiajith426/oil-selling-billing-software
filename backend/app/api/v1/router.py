from fastapi import APIRouter
from app.api.v1 import (
    auth, dashboard, categories, products, customers, suppliers,
    purchases, sales, stock, reports, settings, staff, vehicles,
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(dashboard.router)
api_router.include_router(categories.router)
api_router.include_router(products.router)
api_router.include_router(customers.router)
api_router.include_router(suppliers.router)
api_router.include_router(purchases.router)
api_router.include_router(sales.router)
api_router.include_router(stock.router)
api_router.include_router(reports.router)
api_router.include_router(settings.router)
api_router.include_router(staff.router)
api_router.include_router(vehicles.router)
