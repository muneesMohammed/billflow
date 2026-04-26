'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, Printer } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { fmt, today, generateInvoiceNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { LineItem, Invoice, InvoiceStatus } from '@/lib/types';
import { InvoicePrintModal } from '@/components/ui/InvoicePrintModal';

function makeItem(): LineItem {
  return { id: Date.now().toString(), name: '', qty: 1, price: 0, total: 0 };
}

function NewInvoiceInner() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get('edit');
  const { customers, products, invoices, addInvoice, updateInvoice, invoiceCount, letterhead } = useApp();

  const existing = editId ? invoices.find(i => i.id === editId) : null;

  const [customerId, setCustomerId] = useState(existing?.customerId || '');
  const [date, setDate] = useState(existing?.date || today());
  const [dueDate, setDueDate] = useState(existing?.dueDate || today());
  const [status, setStatus] = useState<InvoiceStatus>(existing?.status || 'unpaid');
  const [hasGst, setHasGst] = useState(existing?.hasGst ?? true);
  const [remarks, setRemarks] = useState(existing?.remarks || '');
  const [items, setItems] = useState<LineItem[]>(existing?.items || [makeItem()]);
  const [showPrint, setShowPrint] = useState(false);
  const [saving, setSaving] = useState(false);

  const addItem = () => setItems(prev => [...prev, makeItem()]);
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'name') {
        const p = products.find(p => p.name === value);
        if (p) updated.price = p.price;
      }
      updated.total = (field === 'qty' ? Number(value) : updated.qty) * (field === 'price' ? Number(value) : updated.price);
      return updated;
    }));
  };

  const subtotal = useMemo(() => items.reduce((a, i) => a + i.total, 0), [items]);
  const tax = useMemo(() => hasGst ? Math.round(subtotal * 0.18) : 0, [subtotal, hasGst]);
  const total = subtotal + tax;

  const buildInvoice = (): Invoice => {
    const customer = customers.find(c => c.id === customerId);
    return {
      id: existing?.id || `inv_${Date.now()}`,
      number: existing?.number || generateInvoiceNumber(invoiceCount),
      customerId,
      customerName: customer?.name || '',
      date, dueDate, items, subtotal, tax, total, hasGst, status, remarks,
    };
  };

  const handleSave = async (asDraft = false) => {
    if (!customerId) { alert('Please select a customer'); return; }
    if (items.every(i => !i.name)) { alert('Add at least one item'); return; }
    setSaving(true);
    try {
      const inv = buildInvoice();
      if (asDraft) inv.status = 'draft';
      if (existing) await updateInvoice(inv);
      else await addInvoice(inv);
        router.push('/invoices');
    } catch (err) {
      alert('Failed to save invoice. Please check your backend connection.');
    } finally {
      setSaving(false);
    }
  };

  const previewInvoice = buildInvoice();

  return (
    <div className="animate-in max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/invoices">
          <button className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-headline font-bold">{existing ? `Edit ${existing.number}` : 'New Invoice'}</h1>
          <p className="text-muted-foreground text-sm">{existing ? 'Update invoice details' : 'Create a new invoice'}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Customer & dates */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h2 className="font-headline font-semibold text-sm text-muted-foreground uppercase tracking-wide">Invoice Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Customer *</label>
                <select
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                >
                  <option value="">Select customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as InvoiceStatus)}
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                >
                  <option value="draft">Draft</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Invoice Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h2 className="font-headline font-semibold text-sm text-muted-foreground uppercase tracking-wide">Line Items</h2>
              <button onClick={addItem} className="flex items-center gap-1.5 text-sm text-accent hover:text-indigo-600 font-medium">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Product</th>
                    <th className="text-center px-3 py-2.5 text-xs font-medium text-muted-foreground w-20">Qty</th>
                    <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground w-28">Price</th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-28">Total</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2">
                        <select
                          value={item.name}
                          onChange={e => updateItem(item.id, 'name', e.target.value)}
                          className="w-full border-0 bg-transparent text-sm outline-none focus:ring-0 text-foreground"
                        >
                          <option value="">Select product…</option>
                          {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number" min={1} value={item.qty}
                          onChange={e => updateItem(item.id, 'qty', Number(e.target.value) || 1)}
                          className="w-full text-center border border-border rounded-lg px-2 py-1 text-sm bg-background outline-none focus:ring-1 focus:ring-accent/40"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number" min={0} value={item.price}
                          onChange={e => updateItem(item.id, 'price', Number(e.target.value) || 0)}
                          className="w-full text-right border border-border rounded-lg px-2 py-1 text-sm bg-background outline-none focus:ring-1 focus:ring-accent/40"
                        />
                      </td>
                      <td className="px-4 py-2 text-right font-medium">{fmt(item.total)}</td>
                      <td className="pr-3">
                        <button onClick={() => removeItem(item.id)} disabled={items.length === 1}
                          className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors disabled:opacity-30">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-border bg-muted/20 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setHasGst(!hasGst)}
                  className={cn('relative w-10 h-5 rounded-full transition-colors', hasGst ? 'bg-accent' : 'bg-muted-foreground/30')}
                >
                  <span className={cn('absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform', hasGst && 'translate-x-5')} />
                </button>
                <span className="text-sm text-muted-foreground">Apply GST 18%</span>
              </div>
              <div className="flex justify-end gap-12 text-sm text-muted-foreground">
                <span>Subtotal</span><span>{fmt(subtotal)}</span>
              </div>
              {hasGst && (
                <div className="flex justify-end gap-12 text-sm text-muted-foreground">
                  <span>GST 18%</span><span>{fmt(tax)}</span>
                </div>
              )}
              <div className="flex justify-end gap-12 text-base font-semibold font-headline border-t border-border pt-2 mt-2">
                <span>Total</span><span className="text-accent">{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Remarks / Terms</label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              rows={3}
              placeholder="Add any notes, payment terms, or remarks…"
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h2 className="font-headline font-semibold text-sm text-muted-foreground uppercase tracking-wide">Actions</h2>
            <button
              onClick={() => handleSave(false)}
              className="w-full flex items-center justify-center gap-2 bg-accent text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors disabled:opacity-60"
              disabled={saving}
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : existing ? 'Update Invoice' : 'Save Invoice'}
            </button>
            <button
              onClick={() => handleSave(true)}
              className="w-full flex items-center justify-center gap-2 border border-border py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
            >
              Save as Draft
            </button>
            <button
              onClick={() => setShowPrint(true)}
              className="w-full flex items-center justify-center gap-2 border border-border py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors text-muted-foreground"
            >
              <Printer className="w-4 h-4" /> Preview & Print
            </button>
          </div>

          {customerId && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="font-headline font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Customer</h2>
              {(() => {
                const c = customers.find(c => c.id === customerId);
                if (!c) return null;
                return (
                  <div className="space-y-1.5 text-sm">
                    <p className="font-medium text-foreground">{c.name}</p>
                    {c.gstin && <p className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded w-fit">GSTIN: {c.gstin}</p>}
                    <p className="text-muted-foreground text-xs">{c.email}</p>
                    <p className="text-muted-foreground text-xs">{c.phone}</p>
                    <p className="text-muted-foreground text-xs">{c.address}</p>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Letterhead tip</p>
            <p>Customize your invoice logo, fonts, and colors in <Link href="/settings?tab=letterhead" className="text-accent hover:underline">Settings → Letterhead</Link>.</p>
          </div>
        </div>
      </div>

      {showPrint && (
        <InvoicePrintModal
          invoice={previewInvoice}
          customer={customers.find(c => c.id === customerId)}
          letterhead={letterhead}
          onClose={() => setShowPrint(false)}
        />
      )}
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading…</div>}>
      <NewInvoiceInner />
    </Suspense>
  );
}
