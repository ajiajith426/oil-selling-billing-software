from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from app.database.session import get_db
from app.models.category import Category
from app.models.subcategory import SubCategory
from app.schemas.category import (
    CategoryCreate, CategoryUpdate, CategoryResponse,
    SubCategoryCreate, SubCategoryUpdate, SubCategoryResponse,
)
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(tags=["Categories"])


# ── Categories ──────────────────────────────────────────────────────────────

@router.get("/categories", response_model=dict)
def list_categories(
    skip: int = 0, limit: int = 50,
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
def create_category(data: CategoryCreate, db: Session = Depends(get_db),
                    _: User = Depends(get_current_user)):
    if db.query(Category).filter(Category.name == data.name).first():
        raise HTTPException(400, "Category name already exists")
    cat = Category(**data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.get("/categories/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db),
                 _: User = Depends(get_current_user)):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(404, "Category not found")
    return cat


@router.put("/categories/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, data: CategoryUpdate,
                    db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(404, "Category not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(cat, k, v)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/categories/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db),
                    _: User = Depends(get_current_user)):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(404, "Category not found")
    db.delete(cat)
    db.commit()


# ── SubCategories ────────────────────────────────────────────────────────────

@router.get("/subcategories", response_model=dict)
def list_subcategories(
    skip: int = 0, limit: int = 50,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = db.query(SubCategory)
    if search:
        q = q.filter(SubCategory.name.ilike(f"%{search}%"))
    if category_id:
        q = q.filter(SubCategory.category_id == category_id)
    total = q.count()
    items = q.offset(skip).limit(limit).all()
    result = []
    for s in items:
        r = SubCategoryResponse.model_validate(s)
        r.category_name = s.category.name if s.category else None
        result.append(r)
    return {"total": total, "items": result}


@router.post("/subcategories", response_model=SubCategoryResponse, status_code=201)
def create_subcategory(data: SubCategoryCreate, db: Session = Depends(get_db),
                       _: User = Depends(get_current_user)):
    sub = SubCategory(**data.model_dump())
    db.add(sub)
    db.commit()
    db.refresh(sub)
    r = SubCategoryResponse.model_validate(sub)
    if sub.category:
        r.category_name = sub.category.name
    return r


@router.get("/subcategories/{sub_id}", response_model=SubCategoryResponse)
def get_subcategory(sub_id: int, db: Session = Depends(get_db),
                    _: User = Depends(get_current_user)):
    sub = db.query(SubCategory).filter(SubCategory.id == sub_id).first()
    if not sub:
        raise HTTPException(404, "SubCategory not found")
    r = SubCategoryResponse.model_validate(sub)
    if sub.category:
        r.category_name = sub.category.name
    return r


@router.put("/subcategories/{sub_id}", response_model=SubCategoryResponse)
def update_subcategory(sub_id: int, data: SubCategoryUpdate,
                       db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    sub = db.query(SubCategory).filter(SubCategory.id == sub_id).first()
    if not sub:
        raise HTTPException(404, "SubCategory not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(sub, k, v)
    db.commit()
    db.refresh(sub)
    r = SubCategoryResponse.model_validate(sub)
    if sub.category:
        r.category_name = sub.category.name
    return r


@router.delete("/subcategories/{sub_id}", status_code=204)
def delete_subcategory(sub_id: int, db: Session = Depends(get_db),
                       _: User = Depends(get_current_user)):
    sub = db.query(SubCategory).filter(SubCategory.id == sub_id).first()
    if not sub:
        raise HTTPException(404, "SubCategory not found")
    db.delete(sub)
    db.commit()
