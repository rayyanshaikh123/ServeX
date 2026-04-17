from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class MenuCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    price: float = Field(..., ge=0)
    isVeg: bool
    category: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = Field(None, max_length=1000)
    image_url: Optional[str] = None
    spiceLevel: str = Field(..., min_length=2, max_length=30)
    tags: List[str] = Field(default_factory=list)
    stock: int = Field(0, ge=0)
    low_stock_threshold: Optional[int] = Field(None, ge=0)
    time_to_cook: int = Field(0, ge=0)


class MenuUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    price: Optional[float] = Field(None, ge=0)
    isVeg: Optional[bool] = None
    spiceLevel: Optional[str] = Field(None, min_length=2, max_length=30)
    tags: Optional[List[str]] = None
    stock: Optional[int] = Field(None, ge=0)
    low_stock_threshold: Optional[int] = Field(None, ge=0)
    time_to_cook: Optional[int] = Field(None, ge=0)


class MenuResponse(BaseModel):
    id: str
    restaurant_id: str
    name: str
    price: float
    isVeg: bool
    category: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    spiceLevel: str
    tags: List[str]
    stock: int
    low_stock_threshold: int
    embedding_status: Optional[str] = None
    embedding_error: Optional[str] = None
    embedding_updated_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    time_to_cook: int


class MenuListResponse(BaseModel):
    items: List[MenuResponse]
    total: int
