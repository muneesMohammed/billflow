// Central API client — all calls go through here
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('bf_token');
    return raw || null;
  } catch { return null; }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  skipAuth = false,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (!skipAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let msg = `API Error ${res.status}`;
    try { const j = await res.json(); msg = j.detail || msg; } catch {}
    throw new Error(msg);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<{ access_token: string; user: Record<string, string> }>(
      '/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, true,
    ),
  register: (name: string, email: string, password: string) =>
    request<{ access_token: string; user: Record<string, string> }>(
      '/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }, true,
    ),
  me: () => request<{ id: string; name: string; email: string; role: string }>('/auth/me'),
};

// ─── Customers ───────────────────────────────────────────────────────────────
export const customersApi = {
  list: () => request<Customer[]>('/customers'),
  create: (c: Omit<Customer, 'id'> & { id?: string }) =>
    request<Customer>('/customers', { method: 'POST', body: JSON.stringify(c) }),
  update: (id: string, c: Customer) =>
    request<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(c) }),
  delete: (id: string) =>
    request<{ ok: boolean }>(`/customers/${id}`, { method: 'DELETE' }),
};

// ─── Products ────────────────────────────────────────────────────────────────
export const productsApi = {
  list: () => request<Product[]>('/products'),
  create: (p: Omit<Product, 'id'> & { id?: string }) =>
    request<Product>('/products', { method: 'POST', body: JSON.stringify(p) }),
  update: (id: string, p: Product) =>
    request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
  delete: (id: string) =>
    request<{ ok: boolean }>(`/products/${id}`, { method: 'DELETE' }),
};

// ─── Invoices ────────────────────────────────────────────────────────────────
export const invoicesApi = {
  list: (search?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status && status !== 'all') params.set('status', status);
    const qs = params.toString();
    return request<Invoice[]>(`/invoices${qs ? '?' + qs : ''}`);
  },
  create: (inv: Omit<Invoice, 'id'> & { id?: string }) =>
    request<Invoice>('/invoices', { method: 'POST', body: JSON.stringify(inv) }),
  update: (id: string, inv: Invoice) =>
    request<Invoice>(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(inv) }),
  updateStatus: (id: string, status: string) =>
    request<{ ok: boolean }>(`/invoices/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id: string) =>
    request<{ ok: boolean }>(`/invoices/${id}`, { method: 'DELETE' }),
};

// ─── Reports ─────────────────────────────────────────────────────────────────
export const reportsApi = {
  summary: () => request<ReportSummary>('/reports/summary'),
  monthly: () => request<MonthlyRevenue[]>('/reports/monthly'),
};

// ─── Letterhead ──────────────────────────────────────────────────────────────
export const letterheadApi = {
  get: () => request<{ settings: Record<string, unknown> | null }>('/letterhead'),
  update: (settings: Record<string, unknown>) =>
    request<{ ok: boolean }>('/letterhead', { method: 'PUT', body: JSON.stringify({ settings }) }),
};

// ─── Types (local copies for this file) ─────────────────────────────────────
import type { Customer, Product, Invoice } from '@/lib/types';

export type ReportSummary = {
  totalRevenue: number;
  pendingAmount: number;
  pendingCount: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  totalInvoices: number;
};

export type MonthlyRevenue = {
  month: string;
  revenue: number;
  invoiceCount: number;
};
