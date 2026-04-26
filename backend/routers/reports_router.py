from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth
from collections import defaultdict

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/summary", response_model=schemas.ReportSummary)
def get_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    invoices = db.query(models.Invoice).all()
    products = db.query(models.Product).all()
    customers = db.query(models.Customer).all()

    total_revenue = sum(i.total for i in invoices if i.status == "paid")
    pending_invoices = [i for i in invoices if i.status in ("unpaid", "overdue")]
    pending_amount = sum(i.total for i in pending_invoices)
    low_stock = [p for p in products if p.stock <= p.min_stock]

    return schemas.ReportSummary(
        totalRevenue=total_revenue,
        pendingAmount=pending_amount,
        pendingCount=len(pending_invoices),
        totalCustomers=len(customers),
        totalProducts=len(products),
        lowStockCount=len(low_stock),
        totalInvoices=len(invoices),
    )


@router.get("/monthly", response_model=List[schemas.MonthlyRevenue])
def get_monthly(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    invoices = db.query(models.Invoice).filter(models.Invoice.status == "paid").all()
    monthly: dict = defaultdict(lambda: {"revenue": 0.0, "count": 0})

    for inv in invoices:
        try:
            month = inv.date[:7]  # YYYY-MM
            monthly[month]["revenue"] += inv.total
            monthly[month]["count"] += 1
        except Exception:
            pass

    result = [
        schemas.MonthlyRevenue(
            month=k,
            revenue=v["revenue"],
            invoiceCount=v["count"],
        )
        for k, v in sorted(monthly.items())
    ]
    return result
