'use client';

import { useState } from 'react';
import { Plus, Search, Building2, Mail, Phone, MapPin, Pencil, Trash2, X, Users } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import type { Customer } from '@/lib/types';

const empty: Omit<Customer, 'id'> = { name: '', email: '', phone: '', address: '', gstin: '' };

function CustomerModal({ customer, onSave, onClose }: { customer?: Customer; onSave: (c: Customer) => Promise<void> | void; onClose: () => void }) {
  const [form, setForm] = useState<Omit<Customer, 'id'>>(customer ? { name: customer.name, email: customer.email, phone: customer.phone, address: customer.address, gstin: customer.gstin } : { ...empty });
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('Name is required');
    setSaving(true);
    try {
      await onSave({ id: customer?.id || `c_${Date.now()}`, ...form });
      onClose();
    } catch { alert('Failed to save. Check backend connection.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-headline font-semibold">{customer ? 'Edit Customer' : 'Add Customer'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Company Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Address</label>
              <textarea value={form.address} onChange={e => set('address', e.target.value)} rows={2}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">GSTIN</label>
              <input value={form.gstin} onChange={e => set('gstin', e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background font-mono outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-border rounded-xl text-sm hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors disabled:opacity-60">{saving ? 'Saving…' : 'Save Customer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, invoices } = useApp();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; customer?: Customer }>({ open: false });

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold">Customers</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{customers.length} registered customers</p>
        </div>
        <button onClick={() => setModal({ open: true })} className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers…"
          className="w-full pl-9 pr-4 py-2 border border-border rounded-xl text-sm bg-card outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No customers found.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => {
          const custInvoices = invoices.filter(i => i.customerId === c.id);
          const totalSpent = custInvoices.filter(i => i.status === 'paid').reduce((a, i) => a + i.total, 0);
          return (
            <div key={c.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold text-sm">
                  {c.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal({ open: true, customer: c })} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { if (confirm(`Delete ${c.name}?`)) deleteCustomer(c.id).catch(() => alert('Delete failed')); }} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <h3 className="font-headline font-semibold text-foreground mb-1">{c.name}</h3>
              {c.gstin && <span className="text-[10px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded-lg inline-block mb-3">GSTIN: {c.gstin}</span>}
              <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                {c.email && <div className="flex items-center gap-2"><Mail className="w-3 h-3" />{c.email}</div>}
                {c.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" />{c.phone}</div>}
                {c.address && <div className="flex items-start gap-2"><MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />{c.address}</div>}
              </div>
              <div className="flex gap-4 border-t border-border pt-3 text-xs">
                <div><span className="text-muted-foreground">Invoices</span><p className="font-semibold text-foreground mt-0.5">{custInvoices.length}</p></div>
                <div><span className="text-muted-foreground">Revenue</span><p className="font-semibold text-foreground mt-0.5">₹{totalSpent.toLocaleString('en-IN')}</p></div>
              </div>
            </div>
          );
        })}
      </div>

      {modal.open && (
        <CustomerModal
          customer={modal.customer}
          onSave={async c => { if (modal.customer) await updateCustomer(c); else await addCustomer(c); }}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  );
}
