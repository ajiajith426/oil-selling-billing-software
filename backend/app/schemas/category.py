from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class SubCategoryBase(BaseModel):
    name: str
    category_id: int
    description: Optional[str] = None
    is_active: bool = True


class SubCategoryCreate(SubCategoryBase):
    pass


class SubCategoryUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class SubCategoryResponse(SubCategoryBase):
    id: int
    created_at: datetime
    category_name: Optional[str] = None

    class Config:
        from_attributes = True
