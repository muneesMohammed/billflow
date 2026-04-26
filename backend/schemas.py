from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime


# ─── Auth ───────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


# ─── Customer ────────────────────────────────────────────────────────────────

class CustomerCreate(BaseModel):
    id: Optional[str] = None
    name: str
    email: str = ""
    phone: str = ""
    address: str = ""
    gstin: str = ""

class CustomerOut(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    address: str
    gstin: str

    class Config:
        from_attributes = True


# ─── Product ─────────────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    id: Optional[str] = None
    name: str
    sku: str = ""
    category: str = ""
    price: float = 0.0
    stock: int = 0
    minStock: int = 5

class ProductOut(BaseModel):
    id: str
    name: str
    sku: str
    category: str
    price: float
    stock: int
    minStock: int

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        return cls(
            id=obj.id,
            name=obj.name,
            sku=obj.sku,
            category=obj.category,
            price=obj.price,
            stock=obj.stock,
            minStock=obj.min_stock,
        )


# ─── Invoice ─────────────────────────────────────────────────────────────────

class LineItemCreate(BaseModel):
    id: Optional[str] = None
    name: str
    qty: int
    price: float
    total: float

class LineItemOut(BaseModel):
    id: str
    name: str
    qty: int
    price: float
    total: float

    class Config:
        from_attributes = True

class InvoiceCreate(BaseModel):
    id: Optional[str] = None
    number: str
    customerId: str
    customerName: str
    date: str
    dueDate: str
    items: List[LineItemCreate]
    subtotal: float
    tax: float
    total: float
    hasGst: bool = True
    status: str = "unpaid"
    remarks: str = ""

class InvoiceOut(BaseModel):
    id: str
    number: str
    customerId: str
    customerName: str
    date: str
    dueDate: str
    items: List[LineItemOut]
    subtotal: float
    tax: float
    total: float
    hasGst: bool
    status: str
    remarks: str

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_obj(cls, obj):
        return cls(
            id=obj.id,
            number=obj.number,
            customerId=obj.customer_id,
            customerName=obj.customer_name,
            date=obj.date,
            dueDate=obj.due_date,
            items=[LineItemOut(id=it.id, name=it.name, qty=it.qty, price=it.price, total=it.total) for it in obj.items],
            subtotal=obj.subtotal,
            tax=obj.tax,
            total=obj.total,
            hasGst=obj.has_gst,
            status=obj.status,
            remarks=obj.remarks,
        )


# ─── Reports ─────────────────────────────────────────────────────────────────

class ReportSummary(BaseModel):
    totalRevenue: float
    pendingAmount: float
    pendingCount: int
    totalCustomers: int
    totalProducts: int
    lowStockCount: int
    totalInvoices: int

class MonthlyRevenue(BaseModel):
    month: str
    revenue: float
    invoiceCount: int


# ─── Letterhead ──────────────────────────────────────────────────────────────

class LetterheadUpdate(BaseModel):
    settings: Dict[str, Any]
