from sqlalchemy.orm import Session, joinedload
from decimal import Decimal
from datetime import datetime
from typing import Optional
from fastapi import HTTPException
from app.models.purchase import Purchase, PurchaseItem, PurchaseStatus
from app.models.product import Product
from app.models.stock import StockMovement, MovementType
from app.models.settings import CompanySettings
from app.schemas.purchase import PurchaseCreate, PurchaseResponse


def _next_purchase_number(db: Session) -> str:
    settings = db.query(CompanySettings).first()
    prefix = settings.purchase_prefix if settings else "PUR"
    last = db.query(Purchase).order_by(Purchase.id.desc()).first()
    next_id = (last.id + 1) if last else 1
    return f"{prefix}-{next_id:06d}"


class PurchaseService:
    def __init__(self, db: Session):
        self.db = db

    def _enrich(self, purchase: Purchase) -> PurchaseResponse:
        resp = PurchaseResponse.model_validate(purchase)
        if purchase.supplier:
            resp.supplier_name = purchase.supplier.name
        for item_resp, item in zip(resp.items, purchase.items):
            if item.product:
                item_resp.product_name = item.product.name
        return resp

    def create(self, data: PurchaseCreate, user_id: int) -> PurchaseResponse:
        subtotal = Decimal("0")
        tax_amount = Decimal("0")
        items_data = []

        for item in data.items:
            product = self.db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
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
        due_amount = max(Decimal("0"), grand_total - data.paid_amount)

        purchase = Purchase(
            invoice_number=_next_purchase_number(self.db),
            supplier_id=data.supplier_id,
            purchase_date=data.purchase_date or datetime.utcnow(),
            subtotal=subtotal,
            discount_amount=data.discount_amount,
            tax_amount=tax_amount,
            grand_total=grand_total,
            paid_amount=data.paid_amount,
            due_amount=due_amount,
            notes=data.notes,
            created_by=user_id,
        )
        self.db.add(purchase)
        self.db.flush()

        for item_d in items_data:
            product = item_d.pop("product")
            pi = PurchaseItem(purchase_id=purchase.id, **item_d)
            self.db.add(pi)
            stock_before = product.current_stock
            product.current_stock += item_d["quantity"]
            sm = StockMovement(
                product_id=product.id,
                movement_type=MovementType.purchase,
                quantity=item_d["quantity"],
                stock_before=stock_before,
                stock_after=product.current_stock,
                reference_id=purchase.id,
                reference_type="purchase",
                created_by=user_id,
            )
            self.db.add(sm)

        self.db.commit()
        self.db.refresh(purchase)
        return self.get_by_id(purchase.id)

    def get_by_id(self, purchase_id: int) -> PurchaseResponse:
        purchase = self.db.query(Purchase).options(
            joinedload(Purchase.supplier),
            joinedload(Purchase.items).joinedload(PurchaseItem.product),
        ).filter(Purchase.id == purchase_id).first()
        if not purchase:
            raise HTTPException(status_code=404, detail="Purchase not found")
        return self._enrich(purchase)

    def get_all(self, skip: int = 0, limit: int = 50,
                supplier_id: Optional[int] = None,
                from_date: Optional[datetime] = None,
                to_date: Optional[datetime] = None):
        q = self.db.query(Purchase).options(
            joinedload(Purchase.supplier),
            joinedload(Purchase.items).joinedload(PurchaseItem.product),
        )
        if supplier_id:
            q = q.filter(Purchase.supplier_id == supplier_id)
        if from_date:
            q = q.filter(Purchase.purchase_date >= from_date)
        if to_date:
            q = q.filter(Purchase.purchase_date <= to_date)
        q = q.order_by(Purchase.id.desc())
        total = q.count()
        items = q.offset(skip).limit(limit).all()
        return total, [self._enrich(p) for p in items]
