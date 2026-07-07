from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database.session import get_db
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(tags=["Categories"])


@router.get("/categories", response_model=dict)
def list_categories(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = db.query(Category)
    if search:
        q = q.filter(Category.name.ilike(f"%{search}%"))
    if is_active is not None:
        q = q.filter(Category.is_active == is_active)
    total = q.count()
    items = q.order_by(Category.name).offset(skip).limit(limit).all()
    return {"total": total, "items": [CategoryResponse.model_validate(c) for c in items]}


@router.post("/categories", response_model=CategoryResponse, status_code=201)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    if db.query(Category).filter(Category.name == data.name).first():
        raise HTTPException(400, "Category name already exists")
    cat = Category(**data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.get("/categories/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(404, "Category not found")
    return cat


@router.put("/categories/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(404, "Category not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(cat, k, v)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/categories/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(404, "Category not found")
    db.delete(cat)
    db.commit()
