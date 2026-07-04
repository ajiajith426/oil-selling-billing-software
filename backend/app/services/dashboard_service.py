from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, date, timedelta
from decimal import Decimal
from app.models.sale import Sale, SaleItem, SaleStatus
from app.models.purchase import Purchase
from app.models.product import Product
from app.models.category import Category
from app.models.customer import Customer
from app.models.supplier import Supplier


class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_stats(self) -> dict:
        today = date.today()
        month_start = today.replace(day=1)

        # Today sales
        today_sales = self.db.query(func.coalesce(func.sum(Sale.grand_total), 0)).filter(
            func.date(Sale.sale_date) == today,
            Sale.status == SaleStatus.completed,
        ).scalar()

        # Monthly sales
        monthly_sales = self.db.query(func.coalesce(func.sum(Sale.grand_total), 0)).filter(
            func.date(Sale.sale_date) >= month_start,
            Sale.status == SaleStatus.completed,
        ).scalar()

        # Counts
        total_products = self.db.query(func.count(Product.id)).filter(Product.is_active == True).scalar()
        total_categories = self.db.query(func.count(Category.id)).filter(Category.is_active == True).scalar()
        total_customers = self.db.query(func.count(Customer.id)).scalar()
        total_suppliers = self.db.query(func.count(Supplier.id)).scalar()

        # Low stock
        low_stock_count = self.db.query(func.count(Product.id)).filter(
            Product.current_stock <= Product.minimum_stock,
            Product.is_active == True,
        ).scalar()

        return {
            "today_sales": float(today_sales),
            "monthly_sales": float(monthly_sales),
            "total_products": total_products,
            "total_categories": total_categories,
            "total_customers": total_customers,
            "total_suppliers": total_suppliers,
            "low_stock_count": low_stock_count,
        }

    def get_recent_bills(self, limit: int = 10) -> list:
        from sqlalchemy.orm import joinedload
        sales = self.db.query(Sale).options(joinedload(Sale.customer)).order_by(
            Sale.id.desc()
        ).limit(limit).all()
        return [
            {
                "id": s.id,
                "invoice_number": s.invoice_number,
                "customer_name": s.customer.name if s.customer else "Walk-in",
                "grand_total": float(s.grand_total),
                "payment_method": s.payment_method,
                "status": s.status,
                "sale_date": s.sale_date.isoformat(),
            }
            for s in sales
        ]

    def get_top_selling_products(self, limit: int = 10) -> list:
        results = (
            self.db.query(
                Product.id,
                Product.name,
                func.sum(SaleItem.quantity).label("total_qty"),
                func.sum(SaleItem.total_amount).label("total_revenue"),
            )
            .join(SaleItem, SaleItem.product_id == Product.id)
            .join(Sale, Sale.id == SaleItem.sale_id)
            .filter(Sale.status == SaleStatus.completed)
            .group_by(Product.id, Product.name)
            .order_by(func.sum(SaleItem.quantity).desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "product_id": r.id,
                "product_name": r.name,
                "total_qty": float(r.total_qty),
                "total_revenue": float(r.total_revenue),
            }
            for r in results
        ]

    def get_sales_graph(self, days: int = 30) -> list:
        start_date = date.today() - timedelta(days=days)
        results = (
            self.db.query(
                func.date(Sale.sale_date).label("day"),
                func.coalesce(func.sum(Sale.grand_total), 0).label("total"),
            )
            .filter(func.date(Sale.sale_date) >= start_date, Sale.status == SaleStatus.completed)
            .group_by(func.date(Sale.sale_date))
            .order_by(func.date(Sale.sale_date))
            .all()
        )
        return [{"date": str(r.day), "total": float(r.total)} for r in results]

    def get_monthly_revenue(self, year: int = None) -> list:
        if not year:
            year = date.today().year
        results = (
            self.db.query(
                extract("month", Sale.sale_date).label("month"),
                func.coalesce(func.sum(Sale.grand_total), 0).label("revenue"),
                func.coalesce(func.sum(Sale.tax_amount), 0).label("tax"),
            )
            .filter(extract("year", Sale.sale_date) == year, Sale.status == SaleStatus.completed)
            .group_by(extract("month", Sale.sale_date))
            .order_by(extract("month", Sale.sale_date))
            .all()
        )
        return [{"month": int(r.month), "revenue": float(r.revenue), "tax": float(r.tax)} for r in results]
