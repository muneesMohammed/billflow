import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from database import engine
import models

# Auto-create all tables on startup
models.Base.metadata.create_all(bind=engine)

from routers import auth_router, customers_router, products_router, invoices_router, reports_router, letterhead_router

app = FastAPI(
    title="BillFlow API",
    description="Professional billing, invoicing & inventory management API",
    version="1.0.0",
)

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*", # Allow all for initial deployment, can be tightened later
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers
app.include_router(auth_router.router)
app.include_router(customers_router.router)
app.include_router(products_router.router)
app.include_router(invoices_router.router)
app.include_router(reports_router.router)
app.include_router(letterhead_router.router)


@app.get("/")
def root():
    return {"message": "BillFlow API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
