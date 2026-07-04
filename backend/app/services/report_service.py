from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, date
from decimal import Decimal
from app.models.sale import Sale, SaleItem, SaleStatus
from app.models.purchase import Purchase, PurchaseItem
from app.models.product import Product
from app.models.customer import Customer
from app.models.supplier import Supplier
from app.models.stock import StockMovement


class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def sales_report(self, from_date: date, to_date: date) -> dict:
        q = self.db.query(Sale).filter(
            func.date(Sale.sale_date) >= from_date,
            func.date(Sale.sale_date) <= to_date,
            Sale.status == SaleStatus.completed,
        )
        sales = q.all()
        total_sales = sum(float(s.grand_total) for s in sales)
        total_tax = sum(float(s.tax_amount) for s in sales)
        total_discount = sum(float(s.discount_amount) for s in sales)
        total_items = sum(
            float(item.quantity) for s in sales for item in s.items
        )

        # Product wise
        product_wise = (
            self.db.query(
                Product.name,
                func.sum(SaleItem.quantity).label("qty"),
                func.sum(SaleItem.total_amount).label("revenue"),
                func.sum(SaleItem.gst_amount).label("tax"),
            )
            .join(SaleItem, SaleItem.product_id == Product.id)
            .join(Sale, Sale.id == SaleItem.sale_id)
            .filter(
                func.date(Sale.sale_date) >= from_date,
                func.date(Sale.sale_date) <= to_date,
                Sale.status == SaleStatus.completed,
            )
            .group_by(Product.id, Product.name)
            .order_by(func.sum(SaleItem.total_amount).desc())
            .all()
        )

        return {
            "from_date": str(from_date),
            "to_date": str(to_date),
            "total_bills": len(sales),
            "total_sales": total_sales,
            "total_tax": total_tax,
            "total_discount": total_discount,
            "total_items_sold": total_items,
            "product_wise": [
                {"product": r.name, "qty": float(r.qty), "revenue": float(r.revenue), "tax": float(r.tax)}
                for r in product_wise
            ],
        }

    def purchase_report(self, from_date: date, to_date: date) -> dict:
        purchases = self.db.query(Purchase).filter(
            func.date(Purchase.purchase_date) >= from_date,
            func.date(Purchase.purchase_date) <= to_date,
        ).all()
        total = sum(float(p.grand_total) for p in purchases)
        total_tax = sum(float(p.tax_amount) for p in purchases)
        return {
            "from_date": str(from_date),
            "to_date": str(to_date),
            "total_purchases": len(purchases),
            "total_amount": total,
            "total_tax": total_tax,
        }

    def stock_report(self) -> dict:
        products = self.db.query(Product).filter(Product.is_active == True).all()
        in_stock = [p for p in products if p.current_stock > p.minimum_stock]
        low_stock = [p for p in products if 0 < p.current_stock <= p.minimum_stock]
        out_of_stock = [p for p in products if p.current_stock <= 0]
        total_value = sum(float(p.current_stock) * float(p.purchase_price) for p in products)

        return {
            "total_products": len(products),
            "in_stock_count": len(in_stock),
            "low_stock_count": len(low_stock),
            "out_of_stock_count": len(out_of_stock),
            "total_stock_value": total_value,
            "low_stock_items": [
                {"id": p.id, "name": p.name, "current_stock": float(p.current_stock),
                 "minimum_stock": float(p.minimum_stock), "unit": p.unit}
                for p in low_stock
            ],
            "out_of_stock_items": [
                {"id": p.id, "name": p.name, "unit": p.unit}
                for p in out_of_stock
            ],
        }

    def gst_report(self, from_date: date, to_date: date) -> dict:
        gst_collected = self.db.query(func.coalesce(func.sum(Sale.tax_amount), 0)).filter(
            func.date(Sale.sale_date) >= from_date,
            func.date(Sale.sale_date) <= to_date,
            Sale.status == SaleStatus.completed,
        ).scalar()
        gst_paid = self.db.query(func.coalesce(func.sum(Purchase.tax_amount), 0)).filter(
            func.date(Purchase.purchase_date) >= from_date,
            func.date(Purchase.purchase_date) <= to_date,
        ).scalar()
        return {
            "from_date": str(from_date),
            "to_date": str(to_date),
            "gst_collected": float(gst_collected),
            "gst_paid": float(gst_paid),
            "net_gst": float(gst_collected) - float(gst_paid),
        }

    def profit_loss_report(self, from_date: date, to_date: date) -> dict:
        revenue = self.db.query(func.coalesce(func.sum(Sale.grand_total), 0)).filter(
            func.date(Sale.sale_date) >= from_date,
            func.date(Sale.sale_date) <= to_date,
            Sale.status == SaleStatus.completed,
        ).scalar()

        # Cost of goods sold: sum(qty * purchase_price) per sale item
        cogs_result = (
            self.db.query(func.coalesce(func.sum(SaleItem.quantity * Product.purchase_price), 0))
            .join(Product, Product.id == SaleItem.product_id)
            .join(Sale, Sale.id == SaleItem.sale_id)
            .filter(
                func.date(Sale.sale_date) >= from_date,
                func.date(Sale.sale_date) <= to_date,
                Sale.status == SaleStatus.completed,
            )
            .scalar()
        )

        revenue_f = float(revenue)
        cogs_f = float(cogs_result)
        gross_profit = revenue_f - cogs_f
        return {
            "from_date": str(from_date),
            "to_date": str(to_date),
            "revenue": revenue_f,
            "cost_of_goods_sold": cogs_f,
            "gross_profit": gross_profit,
            "gross_margin_percent": round((gross_profit / revenue_f * 100) if revenue_f else 0, 2),
        }
