# BillFlow — Complete Billing App

A fully-functional Next.js billing application with invoice management, customer registry, stock tracking, sales reports, and a live letterhead editor.

## Features

- **Login page** — auth with localStorage (demo: admin@mycompany.com / admin123)
- **Dashboard** — revenue stats, recent invoices, low-stock alerts
- **Invoices** — create, edit, delete invoices with line items, GST toggle, status tracking
- **PDF/Print** — every invoice prints with your custom letterhead via browser print dialog
- **Customers** — full CRUD with GSTIN, contact details, revenue tracking
- **Stock Management** — add/edit/delete products, adjust stock quantities, low-stock alerts
- **Reports** — revenue charts, invoice status breakdown, top customers, stock overview
- **Letterhead Editor** — live-preview editor for logo, fonts, colors, layout, dividers, table styles, footer
- **Settings** — company info syncs to all invoices and letterhead
- **Data persistence** — all data saved to localStorage (no backend required)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:3000
# Login: admin@mycompany.com / admin123
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout + AppProvider
│   ├── page.tsx                # Redirects to /dashboard
│   ├── login/page.tsx          # Login page
│   └── (dashboard)/
│       ├── layout.tsx          # Sidebar + topbar layout
│       ├── dashboard/page.tsx  # Dashboard home
│       ├── invoices/
│       │   ├── page.tsx        # Invoice list
│       │   └── new/page.tsx    # Create / Edit invoice
│       ├── customers/page.tsx  # Customer management
│       ├── stock/page.tsx      # Stock management
│       ├── reports/page.tsx    # Charts & analytics
│       └── settings/page.tsx  # Settings + Letterhead editor
├── components/ui/
│   ├── LetterheadEditor.tsx    # Live letterhead editor + preview
│   ├── InvoicePrintModal.tsx   # Print/PDF modal
│   └── InvoicePreviewHtml.ts  # HTML generator for invoices
├── context/
│   └── AppContext.tsx          # Global state with localStorage
└── lib/
    ├── types.ts                # All TypeScript types + seed data
    └── utils.ts                # Helpers (fmt, statusColor, etc.)
```

## Customizing

- **Company details**: Settings → Company Info
- **Invoice appearance**: Settings → Letterhead Editor
- **Upload logo**: Settings → Letterhead Editor → Logo section
- **Add products**: Stock → Add Product
- **Add customers**: Customers → Add Customer

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Recharts** (reports charts)
- **Lucide React** (icons)
- **localStorage** (data persistence — no backend needed)
