'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, FileText, Pencil, Trash2, Printer, Eye } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { fmt, statusColor, cn } from '@/lib/utils';
import type { Invoice, InvoiceStatus } from '@/lib/types';
import { InvoicePrintModal } from '@/components/ui/InvoicePrintModal';

export default function InvoicesPage() {
  const { invoices, customers, deleteInvoice, letterhead } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | InvoiceStatus>('all');
  const [printInv, setPrintInv] = useState<Invoice | null>(null);

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchSearch = !q || inv.number.toLowerCase().includes(q) || inv.customerName.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || inv.status === filter;
    return matchSearch && matchFilter;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Delete this invoice? This cannot be undone.')) {
      try { await deleteInvoice(id); } catch { alert('Delete failed. Check backend connection.'); }
    }
  };

  return (
    <div className="animate-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold">Invoices</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{invoices.length} total invoices</p>
        </div>
        <Link href="/invoices/new" className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors">
          <Plus className="w-4 h-4" /> Create Invoice
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by number or customer…"
            className="w-full pl-9 pr-4 py-2 border border-border rounded-xl text-sm bg-card outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as any)}
          className="border border-border rounded-xl px-3 py-2 text-sm bg-card outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="overdue">Overdue</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Invoice #</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Due</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 w-28"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />No invoices found
                </td></tr>
              )}
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-accent">{inv.number}</td>
                  <td className="px-4 py-3 text-foreground">{inv.customerName}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{inv.date}</td>
                  <td className={cn('px-4 py-3 hidden lg:table-cell', inv.status === 'overdue' ? 'text-destructive font-medium' : 'text-muted-foreground')}>{inv.dueDate}</td>
                  <td className="px-4 py-3 text-right font-semibold">{fmt(inv.total)}</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full border', statusColor(inv.status))}>
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link href={`/invoices/new?edit=${inv.id}`} title="Edit">
                        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      </Link>
                      <button onClick={() => setPrintInv(inv)} title="Print/PDF" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Printer className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(inv.id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {printInv && (
        <InvoicePrintModal
          invoice={printInv}
          customer={customers.find(c => c.id === printInv.customerId)}
          letterhead={letterhead}
          onClose={() => setPrintInv(null)}
        />
      )}
    </div>
  );
}
