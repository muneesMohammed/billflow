'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Customer, Invoice, Product, LetterheadSettings } from '@/lib/types';
import { defaultLetterhead } from '@/lib/types';
import { customersApi, productsApi, invoicesApi, letterheadApi } from '@/lib/api';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

type AppState = {
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];
  letterhead: LetterheadSettings;
  loadState: LoadState;
  setCustomers: (c: Customer[]) => void;
  setProducts: (p: Product[]) => void;
  setInvoices: (i: Invoice[]) => void;
  setLetterhead: (l: LetterheadSettings) => void;
  addCustomer: (c: Customer) => Promise<Customer>;
  updateCustomer: (c: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addProduct: (p: Product) => Promise<Product>;
  updateProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addInvoice: (i: Invoice) => Promise<Invoice>;
  updateInvoice: (i: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  saveLetterhead: (l: LetterheadSettings) => Promise<void>;
  refreshAll: () => Promise<void>;
  // Invoice count for numbering (local)
  invoiceCount: number;
  setInvoiceCount: (n: number) => void;
};

const AppContext = createContext<AppState | null>(null);

// ─── Local storage helpers ────────────────────────────────────────────────────
function lsLoad<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function lsSave(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomersState] = useState<Customer[]>([]);
  const [products, setProductsState] = useState<Product[]>([]);
  const [invoices, setInvoicesState] = useState<Invoice[]>([]);
  const [letterhead, setLetterheadState] = useState<LetterheadSettings>(
    () => lsLoad('bf_letterhead', defaultLetterhead),
  );
  const [invoiceCount, setInvoiceCountState] = useState<number>(
    () => lsLoad('bf_inv_count', 1),
  );
  const [loadState, setLoadState] = useState<LoadState>('idle');

  const isLoggedIn = () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('bf_token');
  };

  const refreshAll = useCallback(async () => {
    if (!isLoggedIn()) return;
    setLoadState('loading');
    try {
      const [c, p, i, lh] = await Promise.all([
        customersApi.list(),
        productsApi.list(),
        invoicesApi.list(),
        letterheadApi.get(),
      ]);
      setCustomersState(c);
      setProductsState(p);
      setInvoicesState(i);
      setInvoiceCountState(i.length + 1);
      if (lh.settings) {
        const merged = { ...defaultLetterhead, ...(lh.settings as Partial<LetterheadSettings>) };
        setLetterheadState(merged);
        lsSave('bf_letterhead', merged);
      }
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  }, []);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  // ─── Setters ──────────────────────────────────────────────────────────────
  const setCustomers = (v: Customer[]) => setCustomersState(v);
  const setProducts = (v: Product[]) => setProductsState(v);
  const setInvoices = (v: Invoice[]) => setInvoicesState(v);
  const setLetterhead = (v: LetterheadSettings) => { setLetterheadState(v); lsSave('bf_letterhead', v); };
  const setInvoiceCount = (n: number) => { setInvoiceCountState(n); lsSave('bf_inv_count', n); };

  // ─── Customers ────────────────────────────────────────────────────────────
  const addCustomer = async (c: Customer) => {
    const created = await customersApi.create(c);
    setCustomersState(prev => [created, ...prev]);
    return created;
  };
  const updateCustomer = async (c: Customer) => {
    const updated = await customersApi.update(c.id, c);
    setCustomersState(prev => prev.map(x => x.id === c.id ? updated : x));
  };
  const deleteCustomer = async (id: string) => {
    await customersApi.delete(id);
    setCustomersState(prev => prev.filter(x => x.id !== id));
  };

  // ─── Products ─────────────────────────────────────────────────────────────
  const addProduct = async (p: Product) => {
    const created = await productsApi.create(p);
    setProductsState(prev => [created, ...prev]);
    return created;
  };
  const updateProduct = async (p: Product) => {
    const updated = await productsApi.update(p.id, p);
    setProductsState(prev => prev.map(x => x.id === p.id ? updated : x));
  };
  const deleteProduct = async (id: string) => {
    await productsApi.delete(id);
    setProductsState(prev => prev.filter(x => x.id !== id));
  };

  // ─── Invoices ─────────────────────────────────────────────────────────────
  const addInvoice = async (i: Invoice) => {
    const created = await invoicesApi.create(i);
    setInvoicesState(prev => [created, ...prev]);
    setInvoiceCount(invoiceCount + 1);
    return created;
  };
  const updateInvoice = async (i: Invoice) => {
    const updated = await invoicesApi.update(i.id, i);
    setInvoicesState(prev => prev.map(x => x.id === i.id ? updated : x));
  };
  const deleteInvoice = async (id: string) => {
    await invoicesApi.delete(id);
    setInvoicesState(prev => prev.filter(x => x.id !== id));
  };

  // ─── Letterhead ───────────────────────────────────────────────────────────
  const saveLetterhead = async (l: LetterheadSettings) => {
    setLetterhead(l);
    if (isLoggedIn()) {
      await letterheadApi.update(l as unknown as Record<string, unknown>);
    }
  };

  return (
    <AppContext.Provider value={{
      customers, products, invoices, letterhead, loadState, invoiceCount,
      setCustomers, setProducts, setInvoices, setLetterhead, setInvoiceCount,
      addCustomer, updateCustomer, deleteCustomer,
      addProduct, updateProduct, deleteProduct,
      addInvoice, updateInvoice, deleteInvoice,
      saveLetterhead, refreshAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
