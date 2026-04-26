from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="admin")
    created_at = Column(DateTime, default=datetime.utcnow)


class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, default="")
    phone = Column(String, default="")
    address = Column(Text, default="")
    gstin = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    invoices = relationship("Invoice", back_populates="customer", cascade="all, delete")


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sku = Column(String, default="")
    category = Column(String, default="")
    price = Column(Float, default=0.0)
    stock = Column(Integer, default=0)
    min_stock = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String, primary_key=True, index=True)
    number = Column(String, unique=True, index=True, nullable=False)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    customer_name = Column(String, nullable=False)
    date = Column(String, nullable=False)
    due_date = Column(String, nullable=False)
    subtotal = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    has_gst = Column(Boolean, default=True)
    status = Column(String, default="unpaid")
    remarks = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(String, primary_key=True, index=True)
    invoice_id = Column(String, ForeignKey("invoices.id"), nullable=False)
    name = Column(String, nullable=False)
    qty = Column(Integer, default=1)
    price = Column(Float, default=0.0)
    total = Column(Float, default=0.0)

    invoice = relationship("Invoice", back_populates="items")


class LetterheadSetting(Base):
    __tablename__ = "letterhead_settings"

    id = Column(String, primary_key=True, default="default")
    settings = Column(JSON, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
