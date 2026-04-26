'use client';

import Link from 'next/link';
import { TrendingUp, Users, Package, FileText, ArrowUpRight, AlertCircle, Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { fmt, statusColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { invoices, customers, products } = useApp();

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((a, i) => a + i.total, 0);
  const pendingAmount = invoices.filter(i => i.status !== 'paid' && i.status !== 'draft').reduce((a, i) => a + i.total, 0);
  const pendingCount = invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').length;
  const lowStockItems = products.filter(p => p.stock <= p.minStock);
  const recentInvoices = [...invoices].reverse().slice(0, 5);

  const stats = [
    { label: 'Total Revenue', value: fmt(totalRevenue), sub: 'From paid invoices', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Customers', value: customers.length.toString(), sub: 'Registered accounts', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Amount', value: fmt(pendingAmount), sub: `${pendingCount} invoices`, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Low Stock', value: lowStockItems.length.toString(), sub: lowStockItems.length > 0 ? 'Need restocking' : 'All stocked up', icon: Package, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Welcome back — here's what's happening today.</p>
        </div>
        <Link href="/invoices/new" className="hidden sm:flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors">
          <Plus className="w-4 h-4" /> New Invoice
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', s.bg)}>
                <s.icon className={cn('w-4 h-4', s.color)} />
              </div>
            </div>
            <p className="text-2xl font-headline font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-headline font-semibold text-foreground">Recent Invoices</h2>
            <Link href="/invoices" className="text-xs text-accent hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentInvoices.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">No invoices yet.</p>
            )}
            {recentInvoices.map(inv => (
              <div key={inv.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-accent truncate">{inv.number}</p>
                  <p className="text-xs text-muted-foreground truncate">{inv.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{fmt(inv.total)}</p>
                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', statusColor(inv.status))}>
                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <h2 className="font-headline font-semibold text-foreground">Stock Alerts</h2>
          </div>
          <div className="divide-y divide-border">
            {lowStockItems.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">All products well stocked ✓</p>
            )}
            {lowStockItems.map(p => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-foreground truncate max-w-[140px]">{p.name}</p>
                  <p className="text-xs text-muted-foreground">Min: {p.minStock} units</p>
                </div>
                <span className="text-sm font-bold text-destructive">{p.stock} left</span>
              </div>
            ))}
          </div>
          {lowStockItems.length > 0 && (
            <div className="px-5 py-3 border-t border-border">
              <Link href="/stock" className="text-xs text-accent hover:underline">Manage stock →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
