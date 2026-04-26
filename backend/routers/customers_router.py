from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=List[schemas.CustomerOut])
def list_customers(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return db.query(models.Customer).order_by(models.Customer.created_at.desc()).all()


@router.post("", response_model=schemas.CustomerOut)
def create_customer(
    data: schemas.CustomerCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    customer = models.Customer(
        id=data.id or str(uuid.uuid4()),
        name=data.name,
        email=data.email,
        phone=data.phone,
        address=data.address,
        gstin=data.gstin,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.put("/{customer_id}", response_model=schemas.CustomerOut)
def update_customer(
    customer_id: str,
    data: schemas.CustomerCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    customer.name = data.name
    customer.email = data.email
    customer.phone = data.phone
    customer.address = data.address
    customer.gstin = data.gstin
    db.commit()
    db.refresh(customer)
    return customer


@router.delete("/{customer_id}")
def delete_customer(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(customer)
    db.commit()
    return {"ok": True}
