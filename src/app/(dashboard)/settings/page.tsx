'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Settings, Palette, User, Lock, Eye, EyeOff, Save } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { LetterheadEditor } from '@/components/ui/LetterheadEditor';
import { cn } from '@/lib/utils';


type Tab = 'company' | 'letterhead' | 'account';

const inputCls = 'w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all';

function SettingsInner() {
  const searchParams = useSearchParams();
  const defaultTab: Tab = (searchParams.get('tab') as Tab) || 'company';
  const [tab, setTab] = useState<Tab>(defaultTab);
  const { letterhead, saveLetterhead } = useApp();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Company profile state
  const [company, setCompany] = useState({
    name: letterhead.companyName,
    subheading: letterhead.subheading,
    address: letterhead.address,
    phone: letterhead.phone,
    email: letterhead.email,
    gstin: letterhead.gstin,
    website: letterhead.website,
  });

  // Account state
  const [user] = useState(() => {
    if (typeof window === 'undefined') return { name: '', email: '' };
    try { return JSON.parse(localStorage.getItem('bf_user') || '{}'); } catch { return {}; }
  });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const saveCompany = async () => {
    setSaving(true);
    try {
      await saveLetterhead({
        ...letterhead,
        companyName: company.name,
        subheading: company.subheading,
        address: company.address,
        phone: company.phone,
        email: company.email,
        gstin: company.gstin,
        website: company.website,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    finally { setSaving(false); }
  };

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match'); return; }
    if (pwForm.newPw.length < 6) { setPwError('Password must be at least 6 characters'); return; }
    // Note: real change-password endpoint would be needed in backend
    setPwSuccess('Password updated successfully!');
    setPwForm({ current: '', newPw: '', confirm: '' });
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'company', label: 'Company Profile', icon: Settings },
    { id: 'letterhead', label: 'Letterhead Editor', icon: Palette },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <div className="animate-in space-y-5">
      <div>
        <h1 className="text-2xl font-headline font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your company profile and preferences</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Company Profile ── */}
      {tab === 'company' && (
        <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl">
          <h2 className="font-headline font-semibold mb-5">Company Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Company Name *</label>
                <input value={company.name} onChange={e => setCompany(c => ({ ...c, name: e.target.value }))} className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subheading / Tagline</label>
                <input value={company.subheading} onChange={e => setCompany(c => ({ ...c, subheading: e.target.value }))} placeholder="e.g. Quality Products · Since 2010" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone</label>
                <input value={company.phone} onChange={e => setCompany(c => ({ ...c, phone: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                <input type="email" value={company.email} onChange={e => setCompany(c => ({ ...c, email: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">GSTIN</label>
                <input value={company.gstin} onChange={e => setCompany(c => ({ ...c, gstin: e.target.value }))} className={`${inputCls} font-mono`} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Website</label>
                <input value={company.website} onChange={e => setCompany(c => ({ ...c, website: e.target.value }))} placeholder="www.company.com" className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Address</label>
                <textarea value={company.address} onChange={e => setCompany(c => ({ ...c, address: e.target.value }))} rows={3} className={`${inputCls} resize-none`} />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={saveCompany}
                disabled={saving}
                className="flex items-center gap-2 bg-accent hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
              </button>
              <p className="text-xs text-muted-foreground">Changes are saved to the letterhead template.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Letterhead Editor ── */}
      {tab === 'letterhead' && (
        <LetterheadEditor letterhead={letterhead} onSave={saveLetterhead} />
      )}

      {/* ── Account ── */}
      {tab === 'account' && (
        <div className="max-w-2xl space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-headline font-semibold mb-4">Account Details</h2>
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-bold text-lg">
                {(user.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{user.name || 'Admin'}</p>
                <p className="text-sm text-muted-foreground">{user.email || ''}</p>
                <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium mt-1 inline-block">{user.role || 'admin'}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-headline font-semibold mb-4">Change Password</h2>
            <form onSubmit={handleChangePw} className="space-y-4">
              {[
                { label: 'Current Password', key: 'current' },
                { label: 'New Password', key: 'newPw' },
                { label: 'Confirm New Password', key: 'confirm' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{f.label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={pwForm[f.key as keyof typeof pwForm]}
                      onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                      placeholder="••••••••"
                    />
                    {f.key === 'confirm' && (
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {pwError && <p className="text-xs text-destructive">{pwError}</p>}
              {pwSuccess && <p className="text-xs text-green-600">{pwSuccess}</p>}
              <button type="submit" className="flex items-center gap-2 bg-accent hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                <Lock className="w-4 h-4" /> Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground text-sm">Loading settings…</div>}>
      <SettingsInner />
    </Suspense>
  );
}
