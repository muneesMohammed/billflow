'use client';

import { useState } from 'react';
import { Plus, Search, Package, Pencil, Trash2, X, AlertTriangle, TrendingUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { fmt, cn } from '@/lib/utils';
import type { Product } from '@/lib/types';

const emptyProduct: Omit<Product, 'id'> = { name: '', sku: '', category: '', price: 0, stock: 0, minStock: 5 };

function ProductModal({ product, onSave, onClose }: { product?: Product; onSave: (p: Product) => Promise<void> | void; onClose: () => void }) {
  const [form, setForm] = useState<Omit<Product, 'id'>>(product ? { ...product } : { ...emptyProduct });
  const set = (k: keyof typeof form, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('Product name is required');
    setSaving(true);
    try {
      await onSave({ id: product?.id || `p_${Date.now()}`, ...form });
      onClose();
    } catch { alert('Failed to save. Check backend connection.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-headline font-semibold">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Product Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">SKU</label>
              <input value={form.sku} onChange={e => set('sku', e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background font-mono outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
              <input value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Unit Price (₹)</label>
              <input type="number" min={0} value={form.price} onChange={e => set('price', Number(e.target.value))}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Current Stock</label>
              <input type="number" min={0} value={form.stock} onChange={e => set('stock', Number(e.target.value))}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Min Stock Alert</label>
              <input type="number" min={0} value={form.minStock} onChange={e => set('minStock', Number(e.target.value))}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-border rounded-xl text-sm hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors disabled:opacity-60">{saving ? 'Saving…' : 'Save Product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdjustModal({ product, onSave, onClose }: { product: Product; onSave: (p: Product) => Promise<void> | void; onClose: () => void }) {
  const [adj, setAdj] = useState(0);
  const newStock = Math.max(0, product.stock + adj);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...product, stock: newStock });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-headline font-semibold">Adjust Stock</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground truncate">{product.name}</p>
          <div className="text-center py-2">
            <p className="text-4xl font-headline font-bold text-accent">{product.stock}</p>
            <p className="text-xs text-muted-foreground mt-1">Current stock</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Adjustment (use − to reduce)</label>
            <input type="number" value={adj} onChange={e => setAdj(Number(e.target.value))}
              className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent text-center text-lg font-semibold" />
          </div>
          <div className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
            <span className="text-sm text-muted-foreground">New stock level</span>
            <span className={cn('text-lg font-bold font-headline', newStock <= product.minStock ? 'text-destructive' : 'text-green-600')}>{newStock}</span>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-border rounded-xl text-sm hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors">Apply</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StockPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ type: 'none' | 'product' | 'adjust'; product?: Product }>({ type: 'none' });

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = products.filter(p => p.stock <= p.minStock);
  const totalValue = products.reduce((a, p) => a + p.stock * p.price, 0);

  return (
    <div className="animate-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold">Stock Management</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{products.length} products · {lowStock.length} low stock alerts</p>
        </div>
        <button onClick={() => setModal({ type: 'product' })} className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Products</p>
          <p className="text-2xl font-headline font-bold">{products.length}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Inventory Value</p>
          <p className="text-2xl font-headline font-bold">{fmt(totalValue)}</p>
        </div>
        <div className={cn('border rounded-2xl p-4 col-span-2 lg:col-span-1', lowStock.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200')}>
          <p className={cn('text-xs mb-1', lowStock.length > 0 ? 'text-red-600' : 'text-green-600')}>Low Stock Alerts</p>
          <p className={cn('text-2xl font-headline font-bold', lowStock.length > 0 ? 'text-red-700' : 'text-green-700')}>{lowStock.length}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU…"
          className="w-full pl-9 pr-4 py-2 border border-border rounded-xl text-sm bg-card outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Price</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Status</th>
                <th className="px-4 py-3 w-28"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />No products found
                </td></tr>
              )}
              {filtered.map(p => {
                const isLow = p.stock <= p.minStock;
                return (
                  <tr key={p.id} className={cn('hover:bg-muted/20 transition-colors', isLow && 'bg-red-50/40')}>
                    <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                    <td className="px-4 py-3 hidden sm:table-cell"><span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{p.sku}</span></td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{p.category}</span></td>
                    <td className="px-4 py-3 text-right">{fmt(p.price)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn('font-semibold', isLow ? 'text-destructive' : 'text-foreground')}>{p.stock}</span>
                      <span className="text-xs text-muted-foreground ml-1">/ {p.minStock} min</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {isLow
                        ? <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full w-fit"><AlertTriangle className="w-3 h-3" />Low Stock</span>
                        : <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">In Stock</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setModal({ type: 'adjust', product: p })} title="Adjust stock" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><TrendingUp className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setModal({ type: 'product', product: p })} title="Edit" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { if (confirm(`Delete ${p.name}?`)) deleteProduct(p.id).catch(() => alert('Delete failed')); }} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal.type === 'product' && (
        <ProductModal
          product={modal.product}
          onSave={async p => { if (modal.product) await updateProduct(p); else await addProduct(p); }}
          onClose={() => setModal({ type: 'none' })}
        />
      )}
      {modal.type === 'adjust' && modal.product && (
        <AdjustModal
          product={modal.product}
          onSave={async p => updateProduct(p)}
          onClose={() => setModal({ type: 'none' })}
        />
      )}
    </div>
  );
}
