from sqlalchemy.orm import Session, joinedload
from decimal import Decimal
from datetime import datetime
from typing import Optional
from fastapi import HTTPException
from app.models.sale import Sale, SaleItem, SaleStatus
from app.models.product import Product
from app.models.stock import StockMovement, MovementType
from app.models.settings import CompanySettings
from app.schemas.sale import SaleCreate, SaleResponse
import re


def _next_invoice_number(db: Session) -> str:
    settings = db.query(CompanySettings).first()
    prefix = settings.invoice_prefix if settings else "INV"
    last = db.query(Sale).order_by(Sale.id.desc()).first()
    next_id = (last.id + 1) if last else 1
    return f"{prefix}-{next_id:06d}"


class SaleService:
    def __init__(self, db: Session):
        self.db = db

    def _enrich(self, sale: Sale) -> SaleResponse:
        resp = SaleResponse.model_validate(sale)
        if sale.customer:
            resp.customer_name = sale.customer.name
        for item_resp, item in zip(resp.items, sale.items):
            if item.product:
                item_resp.product_name = item.product.name
        return resp

    def create(self, data: SaleCreate, user_id: int) -> SaleResponse:
        # Calculate totals
        subtotal = Decimal("0")
        tax_amount = Decimal("0")
        items_data = []

        for item in data.items:
            product = self.db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
            if product.current_stock < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for {product.name}. Available: {product.current_stock}",
                )
            base = item.unit_price * item.quantity
            disc_amt = (base * item.discount_percent / 100).quantize(Decimal("0.01"))
            taxable = base - disc_amt
            gst_amt = (taxable * item.gst_percent / 100).quantize(Decimal("0.01"))
            total = taxable + gst_amt
            subtotal += taxable
            tax_amount += gst_amt
            items_data.append({
                "product": product,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "gst_percent": item.gst_percent,
                "gst_amount": gst_amt,
                "discount_percent": item.discount_percent,
                "discount_amount": disc_amt,
                "total_amount": total,
                "product_id": item.product_id,
            })

        grand_total = subtotal + tax_amount - data.discount_amount
        change_amount = max(Decimal("0"), data.paid_amount - grand_total)

        sale = Sale(
            invoice_number=_next_invoice_number(self.db),
            customer_id=data.customer_id,
            subtotal=subtotal,
            discount_amount=data.discount_amount,
            tax_amount=tax_amount,
            grand_total=grand_total,
            paid_amount=data.paid_amount,
            change_amount=change_amount,
            payment_method=data.payment_method,
            cash_amount=data.cash_amount,
            card_amount=data.card_amount,
            upi_amount=data.upi_amount,
            notes=data.notes,
            created_by=user_id,
        )
        self.db.add(sale)
        self.db.flush()

        for item_d in items_data:
            product = item_d.pop("product")
            si = SaleItem(sale_id=sale.id, **item_d)
            self.db.add(si)
            # Update stock
            stock_before = product.current_stock
            product.current_stock -= item_d["quantity"]
            sm = StockMovement(
                product_id=product.id,
                movement_type=MovementType.sale,
                quantity=item_d["quantity"],
                stock_before=stock_before,
                stock_after=product.current_stock,
                reference_id=sale.id,
                reference_type="sale",
                created_by=user_id,
            )
            self.db.add(sm)

        self.db.commit()
        self.db.refresh(sale)
        return self.get_by_id(sale.id)

    def get_by_id(self, sale_id: int) -> SaleResponse:
        sale = self.db.query(Sale).options(
            joinedload(Sale.customer),
            joinedload(Sale.items).joinedload(SaleItem.product),
        ).filter(Sale.id == sale_id).first()
        if not sale:
            raise HTTPException(status_code=404, detail="Sale not found")
        return self._enrich(sale)

    def get_all(self, skip: int = 0, limit: int = 50,
                customer_id: Optional[int] = None,
                from_date: Optional[datetime] = None,
                to_date: Optional[datetime] = None):
        q = self.db.query(Sale).options(
            joinedload(Sale.customer),
            joinedload(Sale.items).joinedload(SaleItem.product),
        )
        if customer_id:
            q = q.filter(Sale.customer_id == customer_id)
        if from_date:
            q = q.filter(Sale.sale_date >= from_date)
        if to_date:
            q = q.filter(Sale.sale_date <= to_date)
        q = q.order_by(Sale.id.desc())
        total = q.count()
        items = q.offset(skip).limit(limit).all()
        return total, [self._enrich(s) for s in items]

    def cancel(self, sale_id: int, user_id: int) -> SaleResponse:
        sale = self.db.query(Sale).options(
            joinedload(Sale.items).joinedload(SaleItem.product)
        ).filter(Sale.id == sale_id).first()
        if not sale:
            raise HTTPException(status_code=404, detail="Sale not found")
        if sale.status == SaleStatus.cancelled:
            raise HTTPException(status_code=400, detail="Sale already cancelled")
        sale.status = SaleStatus.cancelled
        # Restore stock
        for item in sale.items:
            product = item.product
            stock_before = product.current_stock
            product.current_stock += item.quantity
            sm = StockMovement(
                product_id=product.id,
                movement_type=MovementType.return_in,
                quantity=item.quantity,
                stock_before=stock_before,
                stock_after=product.current_stock,
                reference_id=sale.id,
                reference_type="sale_cancel",
                created_by=user_id,
            )
            self.db.add(sm)
        self.db.commit()
        return self.get_by_id(sale_id)
