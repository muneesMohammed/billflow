'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileText, Users, Package, TrendingUp,
  Settings, PlusCircle, Zap, LogOut, Menu, ChevronRight,
  Palette, Bell, User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Stock', href: '/stock', icon: Package },
  { name: 'Reports', href: '/reports', icon: TrendingUp },
];

const quick = [
  { name: 'New Invoice', href: '/invoices/new', icon: PlusCircle },
  { name: 'Letterhead', href: '/settings?tab=letterhead', icon: Palette },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('bf_token');
    if (!token) { router.replace('/login'); return; }
    try {
      const u = JSON.parse(localStorage.getItem('bf_user') || 'null');
      setUser(u);
    } catch {}
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('bf_token');
    localStorage.removeItem('bf_user');
    router.push('/login');
  };

  const Sidebar = ({ mobile = false }) => (
    <aside className={cn(
      'flex flex-col h-full bg-primary transition-all duration-200',
      !mobile && (collapsed ? 'w-16' : 'w-60'),
      mobile && 'w-64',
    )}>
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-white/10', collapsed && !mobile && 'justify-center px-2')}>
        <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/30">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {(!collapsed || mobile) && (
          <span className="font-headline font-bold text-white text-lg leading-none">BillFlow</span>
        )}
        {!mobile && (
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-white/40 hover:text-white transition-colors">
            <ChevronRight className={cn('w-4 h-4 transition-transform duration-200', collapsed && 'rotate-180')} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {(!collapsed || mobile) && <p className="text-white/40 text-[10px] uppercase tracking-widest px-3 mb-2">Main</p>}
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed && !mobile ? item.name : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                active ? 'bg-white/20 text-white shadow-sm' : 'text-white/60 hover:bg-white/10 hover:text-white',
                collapsed && !mobile && 'justify-center px-2',
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {(!collapsed || mobile) && item.name}
            </Link>
          );
        })}

        {(!collapsed || mobile) && <p className="text-white/40 text-[10px] uppercase tracking-widest px-3 mt-4 mb-2">Quick</p>}
        {quick.map(item => (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            title={collapsed && !mobile ? item.name : undefined}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-all',
              collapsed && !mobile && 'justify-center px-2',
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {(!collapsed || mobile) && item.name}
          </Link>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/10 p-3 space-y-1">
        {(!collapsed || mobile) && user && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 mb-1">
            <div className="w-7 h-7 rounded-full bg-accent/50 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{user.name}</p>
              <p className="text-white/40 text-[10px] truncate">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title="Log out"
          className={cn(
            'flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm text-white/50 hover:bg-white/10 hover:text-white transition-all',
            collapsed && !mobile && 'justify-center w-auto',
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {(!collapsed || mobile) && 'Log out'}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center gap-3 px-4 md:px-6 flex-shrink-0">
          <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <button className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative">
            <Bell className="w-4 h-4" />
          </button>
          <Link href="/invoices/new">
            <button className="bg-accent hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm shadow-accent/20">
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Invoice</span>
            </button>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
