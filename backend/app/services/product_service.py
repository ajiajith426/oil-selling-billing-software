from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional, List
from fastapi import HTTPException, status
from app.models.product import Product
from app.models.category import Category
from app.models.subcategory import SubCategory
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
import csv
import io


class ProductService:
    def __init__(self, db: Session):
        self.db = db

    def _enrich(self, p: Product) -> ProductResponse:
        resp = ProductResponse.model_validate(p)
        if p.category:
            resp.category_name = p.category.name
        if p.subcategory:
            resp.subcategory_name = p.subcategory.name
        return resp

    def get_all(self, skip: int = 0, limit: int = 50, search: Optional[str] = None,
                category_id: Optional[int] = None, is_active: Optional[bool] = None):
        q = self.db.query(Product).options(
            joinedload(Product.category), joinedload(Product.subcategory)
        )
        if search:
            q = q.filter(or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku.ilike(f"%{search}%"),
                Product.barcode.ilike(f"%{search}%"),
            ))
        if category_id:
            q = q.filter(Product.category_id == category_id)
        if is_active is not None:
            q = q.filter(Product.is_active == is_active)
        total = q.count()
        items = q.offset(skip).limit(limit).all()
        return total, [self._enrich(p) for p in items]

    def get_by_id(self, product_id: int) -> ProductResponse:
        p = self.db.query(Product).options(
            joinedload(Product.category), joinedload(Product.subcategory)
        ).filter(Product.id == product_id).first()
        if not p:
            raise HTTPException(status_code=404, detail="Product not found")
        return self._enrich(p)

    def get_by_barcode(self, barcode: str) -> ProductResponse:
        p = self.db.query(Product).options(
            joinedload(Product.category), joinedload(Product.subcategory)
        ).filter(Product.barcode == barcode).first()
        if not p:
            raise HTTPException(status_code=404, detail="Product not found")
        return self._enrich(p)

    def create(self, data: ProductCreate) -> ProductResponse:
        p = Product(**data.model_dump())
        self.db.add(p)
        self.db.commit()
        self.db.refresh(p)
        return self.get_by_id(p.id)

    def update(self, product_id: int, data: ProductUpdate) -> ProductResponse:
        p = self.db.query(Product).filter(Product.id == product_id).first()
        if not p:
            raise HTTPException(status_code=404, detail="Product not found")
        for k, v in data.model_dump(exclude_none=True).items():
            setattr(p, k, v)
        self.db.commit()
        return self.get_by_id(product_id)

    def delete(self, product_id: int):
        p = self.db.query(Product).filter(Product.id == product_id).first()
        if not p:
            raise HTTPException(status_code=404, detail="Product not found")
        self.db.delete(p)
        self.db.commit()

    def get_low_stock(self) -> List[ProductResponse]:
        items = self.db.query(Product).options(
            joinedload(Product.category)
        ).filter(Product.current_stock <= Product.minimum_stock, Product.is_active == True).all()
        return [self._enrich(p) for p in items]

    def export_csv(self) -> str:
        products = self.db.query(Product).all()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Name", "SKU", "Barcode", "Purchase Price", "Selling Price",
                         "GST%", "Unit", "Current Stock", "Min Stock", "Brand", "Status"])
        for p in products:
            writer.writerow([p.id, p.name, p.sku, p.barcode, p.purchase_price, p.selling_price,
                             p.gst_percent, p.unit, p.current_stock, p.minimum_stock, p.brand,
                             "Active" if p.is_active else "Inactive"])
        return output.getvalue()
