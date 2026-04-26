'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, Package, FileText, DollarSign, AlertCircle } from 'lucide-react';
import { reportsApi, type ReportSummary, type MonthlyRevenue } from '@/lib/api';
import { fmt, cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
};

function formatMonth(ym: string) {
  const [y, m] = ym.split('-');
  return `${MONTH_LABELS[m] || m} ${y}`;
}

export default function ReportsPage() {
  const { invoices, customers } = useApp();
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [s, m] = await Promise.all([reportsApi.summary(), reportsApi.monthly()]);
        setSummary(s);
        setMonthly(m);
      } catch {
        // Fallback: compute from local data
        const paid = invoices.filter(i => i.status === 'paid');
        const pending = invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue');
        setSummary({
          totalRevenue: paid.reduce((a, i) => a + i.total, 0),
          pendingAmount: pending.reduce((a, i) => a + i.total, 0),
          pendingCount: pending.length,
          totalCustomers: customers.length,
          totalProducts: 0,
          lowStockCount: 0,
          totalInvoices: invoices.length,
        });
        // Build monthly from local invoices
        const map: Record<string, { revenue: number; count: number }> = {};
        paid.forEach(inv => {
          const m = inv.date.substring(0, 7);
          if (!map[m]) map[m] = { revenue: 0, count: 0 };
          map[m].revenue += inv.total;
          map[m].count += 1;
        });
        setMonthly(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([month, v]) => ({
          month, revenue: v.revenue, invoiceCount: v.count,
        })));
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [invoices, customers]);

  // Revenue by customer
  const revenueByCustomer = customers.map(c => ({
    name: c.name,
    revenue: invoices.filter(i => i.customerId === c.id && i.status === 'paid').reduce((a, i) => a + i.total, 0),
    invoices: invoices.filter(i => i.customerId === c.id).length,
  })).filter(c => c.revenue > 0).sort((a, b) => b.revenue - a.revenue);

  // Invoice status breakdown
  const statuses = ['paid', 'unpaid', 'overdue', 'draft'] as const;
  const statusData = statuses.map(s => ({
    label: s.charAt(0).toUpperCase() + s.slice(1),
    count: invoices.filter(i => i.status === s).length,
    amount: invoices.filter(i => i.status === s).reduce((a, i) => a + i.total, 0),
    color: s === 'paid' ? '#10b981' : s === 'unpaid' ? '#f59e0b' : s === 'overdue' ? '#ef4444' : '#94a3b8',
  }));

  // Bar chart max
  const maxRevenue = Math.max(...monthly.map(m => m.revenue), 1);

  if (loading) {
    return (
      <div className="animate-in flex items-center justify-center h-64">
        <div className="text-center text-muted-foreground">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading reports…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">Reports</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Business performance overview</p>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: fmt(summary.totalRevenue), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Pending Amount', value: fmt(summary.pendingAmount), icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', sub: `${summary.pendingCount} invoices` },
            { label: 'Total Customers', value: summary.totalCustomers.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Invoices', value: summary.totalInvoices.toString(), icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', s.bg)}>
                  <s.icon className={cn('w-4 h-4', s.color)} />
                </div>
              </div>
              <p className="text-2xl font-headline font-bold">{s.value}</p>
              {'sub' in s && <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <h2 className="font-headline font-semibold mb-4">Monthly Revenue</h2>
          {monthly.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              <TrendingUp className="w-8 h-8 mr-2 opacity-30" /> No paid invoices yet
            </div>
          ) : (
            <div className="flex items-end gap-2 h-48 mt-2">
              {monthly.slice(-12).map((m) => {
                const heightPct = (m.revenue / maxRevenue) * 100;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full flex flex-col items-center">
                      <span className="text-[9px] text-muted-foreground mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {fmt(m.revenue)}
                      </span>
                      <div
                        className="w-full bg-accent rounded-t-lg transition-all duration-500 hover:bg-indigo-500 cursor-pointer"
                        style={{ height: `${Math.max(heightPct * 1.5, 6)}px` }}
                        title={`${formatMonth(m.month)}: ${fmt(m.revenue)}`}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground -rotate-45 origin-top-right whitespace-nowrap">
                      {formatMonth(m.month)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Invoice Status */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-headline font-semibold mb-4">Invoice Status</h2>
          <div className="space-y-3">
            {statusData.filter(s => s.count > 0).map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{s.label}</span>
                  <span className="text-muted-foreground">{s.count} · {fmt(s.amount)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${invoices.length ? (s.count / invoices.length) * 100 : 0}%`,
                      background: s.color,
                    }}
                  />
                </div>
              </div>
            ))}
            {statusData.every(s => s.count === 0) && (
              <p className="text-sm text-muted-foreground text-center py-6">No invoices yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Revenue by Customer */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <Users className="w-4 h-4 text-accent" />
          <h2 className="font-headline font-semibold">Revenue by Customer</h2>
        </div>
        {revenueByCustomer.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No paid invoices to analyze
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Customer</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Invoices</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Revenue</th>
                  <th className="px-5 py-3 w-40 text-xs font-medium text-muted-foreground">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {revenueByCustomer.map((c, i) => {
                  const maxRev = revenueByCustomer[0]?.revenue || 1;
                  return (
                    <tr key={c.name} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[10px] font-bold flex-shrink-0">
                            {i + 1}
                          </div>
                          <span className="font-medium truncate">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{c.invoices}</td>
                      <td className="px-5 py-3 text-right font-semibold">{fmt(c.revenue)}</td>
                      <td className="px-5 py-3">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all duration-700"
                            style={{ width: `${(c.revenue / maxRev) * 100}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
