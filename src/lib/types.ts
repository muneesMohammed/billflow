// ─── Types ──────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue' | 'draft';

export type LineItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
  total: number;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstin?: string;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
};

export type LetterheadSettings = {
  logoSrc: string;
  logoSize: number;
  logoShape: string;
  companyName: string;
  subheading: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  website: string;
  layout: 'left' | 'center' | 'right';
  barColor: string;
  barHeight: number;
  barPos: 'top' | 'bottom' | 'none';
  font: string;
  nameSize: number;
  nameColor: string;
  nameStyle: 'normal' | 'italic' | 'bold';
  subSize: number;
  subColor: string;
  lineColor: string;
  lineWidth: number;
  lineStyle: 'solid' | 'dashed' | 'dotted' | 'double';
  invTitleColor: string;
  invTitleSize: number;
  billToBg: string;
  billToAccent: string;
  tableHd: string;
  tableAlt: string;
  totalBg: string;
  totalColor: string;
  footerText: string;
  footerColor: string;
  footerSize: number;
};

export type Invoice = {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  date: string;
  dueDate: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  hasGst: boolean;
  status: InvoiceStatus;
  remarks: string;
};

// ─── Default Letterhead ──────────────────────────────────────────────────────

export const defaultLetterhead: LetterheadSettings = {
  logoSrc: '',
  logoSize: 55,
  logoShape: '8px',
  companyName: 'My Company Pvt. Ltd.',
  subheading: 'Quality Products · Since 2010',
  address: '123 Business Park, Mumbai — 400001',
  phone: '+91 98765 43210',
  email: 'billing@mycompany.com',
  gstin: '22AAAAA0000A1Z5',
  website: 'www.mycompany.com',
  layout: 'left',
  barColor: '#6c63ff',
  barHeight: 4,
  barPos: 'top',
  font: 'Georgia, serif',
  nameSize: 22,
  nameColor: '#1a1f36',
  nameStyle: 'normal',
  subSize: 11,
  subColor: '#6c63ff',
  lineColor: '#6c63ff',
  lineWidth: 2,
  lineStyle: 'solid',
  invTitleColor: '#6c63ff',
  invTitleSize: 26,
  billToBg: '#f0f2ff',
  billToAccent: '#6c63ff',
  tableHd: '#1a1f36',
  tableAlt: '#f8f7ff',
  totalBg: '#f0f2ff',
  totalColor: '#1a1f36',
  footerText: 'Thank you for your business!',
  footerColor: '#888888',
  footerSize: 10,
};

// ─── Seed Data ───────────────────────────────────────────────────────────────

export const seedCustomers: Customer[] = [
  { id: 'c1', name: 'The Scent Boutique', email: 'orders@scentboutique.com', phone: '+91 98765 43210', address: 'M.G. Road, Bangalore, KA', gstin: '29AAAAA0000A1Z5' },
  { id: 'c2', name: 'Lux Fragrances', email: 'info@luxfragrances.in', phone: '+91 87654 32109', address: 'Colaba, Mumbai, MH', gstin: '27BBBBB1111B1Z2' },
  { id: 'c3', name: 'Royal Essence', email: 'admin@royalessence.co', phone: '+91 76543 21098', address: 'Connaught Place, Delhi, DL', gstin: '07CCCCC2222C1Z9' },
  { id: 'c4', name: 'Aura Scents', email: 'contact@aurascents.com', phone: '+91 65432 10987', address: 'Salt Lake, Kolkata, WB', gstin: '' },
];

export const seedProducts: Product[] = [
  { id: 'p1', name: 'Midnight Rose EDP', sku: 'PER-001', category: 'Floral', price: 1200, stock: 45, minStock: 10 },
  { id: 'p2', name: 'Citrus Mist Spray', sku: 'PER-002', category: 'Fresh', price: 850, stock: 8, minStock: 15 },
  { id: 'p3', name: 'Sandalwood Essence', sku: 'PER-003', category: 'Woody', price: 2400, stock: 32, minStock: 5 },
  { id: 'p4', name: 'Vanilla Sky Bulk', sku: 'PER-004', category: 'Oriental', price: 4500, stock: 12, minStock: 10 },
  { id: 'p5', name: 'Ocean Breeze Concentrate', sku: 'PER-005', category: 'Marine', price: 3200, stock: 3, minStock: 10 },
];

export const seedInvoices: Invoice[] = [
  {
    id: 'inv1', number: 'INV-2025-001', customerId: 'c1', customerName: 'The Scent Boutique',
    date: '2025-01-20', dueDate: '2025-02-20',
    items: [{ id: 'i1', name: 'Midnight Rose EDP', qty: 20, price: 1200, total: 24000 }, { id: 'i2', name: 'Sandalwood Essence', qty: 5, price: 2400, total: 12000 }],
    subtotal: 36000, tax: 6480, total: 42480, hasGst: true, status: 'paid', remarks: 'Thank you for your business.',
  },
  {
    id: 'inv2', number: 'INV-2025-002', customerId: 'c2', customerName: 'Lux Fragrances',
    date: '2025-01-19', dueDate: '2025-02-18',
    items: [{ id: 'i3', name: 'Citrus Mist Spray', qty: 10, price: 850, total: 8500 }, { id: 'i4', name: 'Vanilla Sky Bulk', qty: 1, price: 4500, total: 4500 }],
    subtotal: 13000, tax: 2340, total: 15340, hasGst: true, status: 'unpaid', remarks: '',
  },
  {
    id: 'inv3', number: 'INV-2025-003', customerId: 'c3', customerName: 'Royal Essence',
    date: '2025-01-18', dueDate: '2025-01-28',
    items: [{ id: 'i5', name: 'Midnight Rose EDP', qty: 15, price: 1200, total: 18000 }],
    subtotal: 18000, tax: 0, total: 18000, hasGst: false, status: 'overdue', remarks: 'Payment due immediately.',
  },
  {
    id: 'inv4', number: 'INV-2025-004', customerId: 'c4', customerName: 'Aura Scents',
    date: '2025-01-15', dueDate: '2025-02-15',
    items: [{ id: 'i6', name: 'Ocean Breeze Concentrate', qty: 2, price: 3200, total: 6400 }],
    subtotal: 6400, tax: 1152, total: 7552, hasGst: true, status: 'paid', remarks: '',
  },
];
