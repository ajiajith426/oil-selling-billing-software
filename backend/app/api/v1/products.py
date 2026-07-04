from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
import io
import os
import uuid
from app.database.session import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services.product_service import ProductService
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.models.user import User

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=dict)
def list_products(
    skip: int = 0, limit: int = 50,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    total, items = ProductService(db).get_all(skip, limit, search, category_id, is_active)
    return {"total": total, "items": items}


@router.post("", response_model=ProductResponse, status_code=201)
def create_product(data: ProductCreate, db: Session = Depends(get_db),
                   _: User = Depends(get_current_user)):
    return ProductService(db).create(data)


@router.get("/low-stock")
def low_stock(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return ProductService(db).get_low_stock()


@router.get("/barcode/{barcode}", response_model=ProductResponse)
def get_by_barcode(barcode: str, db: Session = Depends(get_db),
                   _: User = Depends(get_current_user)):
    return ProductService(db).get_by_barcode(barcode)


@router.get("/export/csv")
def export_csv(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    content = ProductService(db).export_csv()
    return StreamingResponse(
        io.StringIO(content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=products.csv"},
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db),
                _: User = Depends(get_current_user)):
    return ProductService(db).get_by_id(product_id)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, data: ProductUpdate,
                   db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return ProductService(db).update(product_id, data)


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db),
                   _: User = Depends(get_current_user)):
    ProductService(db).delete(product_id)


@router.post("/{product_id}/upload-image")
async def upload_image(product_id: int, file: UploadFile = File(...),
                       db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")
    upload_dir = os.path.join(settings.UPLOAD_DIR, "products")
    os.makedirs(upload_dir, exist_ok=True)
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(upload_dir, filename)
    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)
    image_url = f"/uploads/products/{filename}"
    ProductService(db).update(product_id, type("Obj", (), {"model_dump": lambda self, **k: {"image_url": image_url}})())
    return {"image_url": image_url}
