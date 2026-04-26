from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=List[schemas.ProductOut])
def list_products(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    items = db.query(models.Product).order_by(models.Product.created_at.desc()).all()
    return [schemas.ProductOut.from_orm(p) for p in items]


@router.post("", response_model=schemas.ProductOut)
def create_product(
    data: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    product = models.Product(
        id=data.id or str(uuid.uuid4()),
        name=data.name,
        sku=data.sku,
        category=data.category,
        price=data.price,
        stock=data.stock,
        min_stock=data.minStock,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return schemas.ProductOut.from_orm(product)


@router.put("/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: str,
    data: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.name = data.name
    product.sku = data.sku
    product.category = data.category
    product.price = data.price
    product.stock = data.stock
    product.min_stock = data.minStock
    db.commit()
    db.refresh(product)
    return schemas.ProductOut.from_orm(product)


@router.delete("/{product_id}")
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"ok": True}
