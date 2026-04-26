from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/invoices", tags=["invoices"])


def serialize_invoice(inv: models.Invoice) -> schemas.InvoiceOut:
    return schemas.InvoiceOut.from_orm_obj(inv)


@router.get("", response_model=List[schemas.InvoiceOut])
def list_invoices(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    query = db.query(models.Invoice).order_by(models.Invoice.created_at.desc())
    if status and status != "all":
        query = query.filter(models.Invoice.status == status)
    invoices = query.all()
    if search:
        q = search.lower()
        invoices = [
            i for i in invoices
            if q in i.number.lower() or q in i.customer_name.lower()
        ]
    return [serialize_invoice(i) for i in invoices]


@router.post("", response_model=schemas.InvoiceOut)
def create_invoice(
    data: schemas.InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    # Check customer exists
    customer = db.query(models.Customer).filter(models.Customer.id == data.customerId).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    invoice = models.Invoice(
        id=data.id or str(uuid.uuid4()),
        number=data.number,
        customer_id=data.customerId,
        customer_name=data.customerName,
        date=data.date,
        due_date=data.dueDate,
        subtotal=data.subtotal,
        tax=data.tax,
        total=data.total,
        has_gst=data.hasGst,
        status=data.status,
        remarks=data.remarks,
    )
    db.add(invoice)
    db.flush()  # get ID without committing

    for item in data.items:
        inv_item = models.InvoiceItem(
            id=item.id or str(uuid.uuid4()),
            invoice_id=invoice.id,
            name=item.name,
            qty=item.qty,
            price=item.price,
            total=item.total,
        )
        db.add(inv_item)

    db.commit()
    db.refresh(invoice)
    return serialize_invoice(invoice)


@router.put("/{invoice_id}", response_model=schemas.InvoiceOut)
def update_invoice(
    invoice_id: str,
    data: schemas.InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice.number = data.number
    invoice.customer_id = data.customerId
    invoice.customer_name = data.customerName
    invoice.date = data.date
    invoice.due_date = data.dueDate
    invoice.subtotal = data.subtotal
    invoice.tax = data.tax
    invoice.total = data.total
    invoice.has_gst = data.hasGst
    invoice.status = data.status
    invoice.remarks = data.remarks

    # Delete old items and re-create
    db.query(models.InvoiceItem).filter(models.InvoiceItem.invoice_id == invoice_id).delete()
    for item in data.items:
        inv_item = models.InvoiceItem(
            id=item.id or str(uuid.uuid4()),
            invoice_id=invoice.id,
            name=item.name,
            qty=item.qty,
            price=item.price,
            total=item.total,
        )
        db.add(inv_item)

    db.commit()
    db.refresh(invoice)
    return serialize_invoice(invoice)


@router.patch("/{invoice_id}/status")
def update_status(
    invoice_id: str,
    body: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    invoice.status = body.get("status", invoice.status)
    db.commit()
    return {"ok": True, "status": invoice.status}


@router.delete("/{invoice_id}")
def delete_invoice(
    invoice_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    db.delete(invoice)
    db.commit()
    return {"ok": True}
