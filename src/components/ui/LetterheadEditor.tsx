'use client';

import { useRef } from 'react';
import { useApp } from '@/context/AppContext';
import type { LetterheadSettings } from '@/lib/types';
import { cn } from '@/lib/utils';
import { InvoicePreviewHtml, FONT_OPTIONS } from './InvoicePreviewHtml';

const FONTS = FONT_OPTIONS.map(f => ({ label: f.label.split(' (')[0], value: f.value }));

const LAYOUTS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
] as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground block">{label}</label>
      {children}
    </div>
  );
}

function ColorRow({ label, value, k, lh, onChange }: { label: string; value: string; k: keyof LetterheadSettings; lh: LetterheadSettings; onChange: (v: LetterheadSettings) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input type="color" value={value}
          onChange={e => onChange({ ...lh, [k]: e.target.value })}
          className="w-9 h-8 border border-border rounded-lg cursor-pointer p-0.5 bg-background" />
        <span className="text-xs font-mono text-muted-foreground">{value}</span>
      </div>
    </Field>
  );
}

function NumberField({ label, min, max, value, k, lh, onChange }: { label: string; min: number; max: number; value: number; k: keyof LetterheadSettings; lh: LetterheadSettings; onChange: (v: LetterheadSettings) => void }) {
  return (
    <Field label={label}>
      <input type="number" min={min} max={max} value={value}
        onChange={e => onChange({ ...lh, [k]: Number(e.target.value) })}
        className="w-full border border-border rounded-xl px-3 py-1.5 text-sm bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
    </Field>
  );
}

function SelectField({ label, value, k, lh, onChange, options }: { label: string; value: string; k: keyof LetterheadSettings; lh: LetterheadSettings; onChange: (v: LetterheadSettings) => void; options: { label: string; value: string }[] }) {
  return (
    <Field label={label}>
      <select value={value} onChange={e => onChange({ ...lh, [k]: e.target.value })}
        className="w-full border border-border rounded-xl px-3 py-1.5 text-sm bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border pb-5 mb-5 last:border-0 last:mb-0 last:pb-0">
      <p className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground mb-3">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

type LetterheadEditorProps = {
  letterhead?: LetterheadSettings;
  onSave?: (l: LetterheadSettings) => Promise<void>;
};

export function LetterheadEditor({ letterhead: propLh, onSave }: LetterheadEditorProps = {}) {
  const { letterhead: ctxLh, saveLetterhead } = useApp();
  const lh = propLh ?? ctxLh;
  const set = (v: LetterheadSettings) => (onSave ? onSave(v) : saveLetterhead(v));
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set({ ...lh, logoSrc: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handlePrint = () => {
    const demoInvoice = {
      id: 'demo', number: 'INV-2025-001', customerId: 'c1', customerName: 'The Scent Boutique',
      date: new Date().toISOString().split('T')[0], dueDate: new Date().toISOString().split('T')[0],
      items: [
        { id: 'i1', name: 'Midnight Rose EDP', qty: 20, price: 1200, total: 24000 },
        { id: 'i2', name: 'Sandalwood Essence', qty: 5, price: 2400, total: 12000 },
      ],
      subtotal: 36000, tax: 6480, total: 42480, hasGst: true, status: 'paid' as const,
      remarks: 'Thank you for your business.',
    };
    const demoCustomer = {
      id: 'c1', name: 'The Scent Boutique', email: 'orders@scentboutique.com',
      phone: '+91 98765 43210', address: 'M.G. Road, Bangalore, KA', gstin: '29AAAAA0000A1Z5',
    };
    const html = InvoicePreviewHtml(demoInvoice, demoCustomer, lh);
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  return (
    <div className="flex gap-5 flex-col xl:flex-row">
      {/* Controls panel */}
      <div className="xl:w-72 flex-shrink-0 bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <p className="text-sm font-semibold">Letterhead Settings</p>
          <p className="text-xs text-muted-foreground mt-0.5">Changes apply to all invoices</p>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-240px)]">

          <Section title="Logo">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                {lh.logoSrc
                  ? <img src={lh.logoSrc} alt="logo" className="w-full h-full object-cover" />
                  : <span className="text-2xl">🏢</span>
                }
              </div>
              <div className="flex-1 space-y-2">
                <button onClick={() => logoInputRef.current?.click()}
                  className="w-full text-xs border border-border rounded-xl px-3 py-1.5 hover:bg-muted transition-colors">
                  Upload Logo
                </button>
                {lh.logoSrc && (
                  <button onClick={() => set({ ...lh, logoSrc: '' })}
                    className="w-full text-xs border border-border rounded-xl px-3 py-1.5 hover:bg-muted transition-colors text-muted-foreground">
                    Remove
                  </button>
                )}
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Logo Size (px)" min={30} max={120} value={lh.logoSize} k="logoSize" lh={lh} onChange={set} />
              <SelectField label="Shape" value={lh.logoShape} k="logoShape" lh={lh} onChange={set} options={[
                { label: 'Rounded', value: '8px' },
                { label: 'Circle', value: '50%' },
                { label: 'Square', value: '0px' },
              ]} />
            </div>
          </Section>

          <Section title="Layout">
            <div className="grid grid-cols-3 gap-2">
              {LAYOUTS.map(l => (
                <button key={l.value} onClick={() => set({ ...lh, layout: l.value })}
                  className={cn('py-2 text-xs border rounded-xl transition-colors', lh.layout === l.value ? 'border-accent bg-accent/10 text-accent font-medium' : 'border-border hover:bg-muted')}>
                  {l.label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Company Name Font">
            <div className="grid grid-cols-2 gap-1.5">
              {FONTS.map(f => (
                <button key={f.value} onClick={() => set({ ...lh, font: f.value })}
                  style={{ fontFamily: f.value }}
                  className={cn('py-2 text-xs border rounded-xl transition-colors', lh.font === f.value ? 'border-accent bg-accent/10 text-accent font-medium' : 'border-border hover:bg-muted')}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Name Size (px)" min={14} max={40} value={lh.nameSize} k="nameSize" lh={lh} onChange={set} />
              <ColorRow label="Name Color" value={lh.nameColor} k="nameColor" lh={lh} onChange={set} />
              <SelectField label="Name Style" value={lh.nameStyle} k="nameStyle" lh={lh} onChange={set} options={[
                { label: 'Normal', value: 'normal' },
                { label: 'Bold', value: 'bold' },
                { label: 'Italic', value: 'italic' },
              ]} />
              <NumberField label="Subheading Size" min={8} max={18} value={lh.subSize} k="subSize" lh={lh} onChange={set} />
            </div>
            <ColorRow label="Subheading Color" value={lh.subColor} k="subColor" lh={lh} onChange={set} />
          </Section>

          <Section title="Header Bar">
            <div className="grid grid-cols-2 gap-3">
              <ColorRow label="Bar Color" value={lh.barColor} k="barColor" lh={lh} onChange={set} />
              <NumberField label="Bar Height (px)" min={0} max={12} value={lh.barHeight} k="barHeight" lh={lh} onChange={set} />
              <SelectField label="Position" value={lh.barPos} k="barPos" lh={lh} onChange={set} options={[
                { label: 'Top', value: 'top' },
                { label: 'Bottom', value: 'bottom' },
                { label: 'None', value: 'none' },
              ]} />
            </div>
          </Section>

          <Section title="Divider Line">
            <div className="grid grid-cols-2 gap-3">
              <ColorRow label="Line Color" value={lh.lineColor} k="lineColor" lh={lh} onChange={set} />
              <NumberField label="Width (px)" min={0} max={6} value={lh.lineWidth} k="lineWidth" lh={lh} onChange={set} />
              <SelectField label="Style" value={lh.lineStyle} k="lineStyle" lh={lh} onChange={set} options={[
                { label: 'Solid', value: 'solid' },
                { label: 'Dashed', value: 'dashed' },
                { label: 'Dotted', value: 'dotted' },
                { label: 'Double', value: 'double' },
              ]} />
            </div>
          </Section>

          <Section title="Invoice Title">
            <div className="grid grid-cols-2 gap-3">
              <ColorRow label="Title Color" value={lh.invTitleColor} k="invTitleColor" lh={lh} onChange={set} />
              <NumberField label="Title Size (px)" min={16} max={44} value={lh.invTitleSize} k="invTitleSize" lh={lh} onChange={set} />
              <ColorRow label="Bill-To Background" value={lh.billToBg} k="billToBg" lh={lh} onChange={set} />
              <ColorRow label="Bill-To Accent" value={lh.billToAccent} k="billToAccent" lh={lh} onChange={set} />
            </div>
          </Section>

          <Section title="Table Style">
            <div className="grid grid-cols-2 gap-3">
              <ColorRow label="Header Background" value={lh.tableHd} k="tableHd" lh={lh} onChange={set} />
              <ColorRow label="Alt Row Color" value={lh.tableAlt} k="tableAlt" lh={lh} onChange={set} />
              <ColorRow label="Total Bar Background" value={lh.totalBg} k="totalBg" lh={lh} onChange={set} />
              <ColorRow label="Total Text Color" value={lh.totalColor} k="totalColor" lh={lh} onChange={set} />
            </div>
          </Section>

          <Section title="Footer">
            <Field label="Footer Text">
              <input value={lh.footerText} onChange={e => set({ ...lh, footerText: e.target.value })}
                className="w-full border border-border rounded-xl px-3 py-1.5 text-sm bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <ColorRow label="Footer Color" value={lh.footerColor} k="footerColor" lh={lh} onChange={set} />
              <NumberField label="Footer Size (px)" min={8} max={14} value={lh.footerSize} k="footerSize" lh={lh} onChange={set} />
            </div>
          </Section>
        </div>
      </div>

      {/* Live Preview */}
      <div className="flex-1 min-w-0">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <p className="text-sm font-semibold">Live Preview</p>
              <p className="text-xs text-muted-foreground">Updates instantly as you edit</p>
            </div>
            <button onClick={handlePrint}
              className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors">
              🖨 Print Sample
            </button>
          </div>
          <div className="p-4 bg-slate-100 overflow-auto">
            <LetterheadPreview lh={lh} />
          </div>
        </div>
      </div>
    </div>
  );
}

function LetterheadPreview({ lh }: { lh: LetterheadSettings }) {
  const items = [
    { name: 'Midnight Rose EDP', qty: 20, price: 1200, total: 24000 },
    { name: 'Sandalwood Essence', qty: 5, price: 2400, total: 12000 },
  ];
  const sub = 36000, tax = 6480, total = 42480;
  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

  const logoEl = lh.logoSrc
    ? <img src={lh.logoSrc} alt="logo" style={{ width: lh.logoSize, height: lh.logoSize, objectFit: 'cover', borderRadius: lh.logoShape, flexShrink: 0 }} />
    : <div style={{ width: lh.logoSize, height: lh.logoSize, background: lh.barColor, borderRadius: lh.logoShape, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: Math.round(lh.logoSize * 0.42), flexShrink: 0 }}>B</div>;

  const textBlock = (
    <div>
      <div style={{ fontFamily: lh.font, fontSize: lh.nameSize, fontWeight: lh.nameStyle === 'bold' ? 700 : 400, fontStyle: lh.nameStyle === 'italic' ? 'italic' : 'normal', color: lh.nameColor, lineHeight: 1.2 }}>{lh.companyName}</div>
      {lh.subheading && <div style={{ fontSize: lh.subSize, color: lh.subColor, marginTop: 3 }}>{lh.subheading}</div>}
      <div style={{ fontSize: 10, color: '#666', lineHeight: 1.7, marginTop: 6 }}>
        {lh.address}{lh.address && <br />}
        {[lh.phone, lh.email].filter(Boolean).join(' · ')}
        {lh.gstin && <><br />GSTIN: {lh.gstin}</>}
        {lh.website && <><br />{lh.website}</>}
      </div>
    </div>
  );

  const bar = lh.barHeight > 0 && lh.barPos !== 'none'
    ? <div style={{ height: lh.barHeight, background: lh.barColor, margin: '0 -32px' }} />
    : null;

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: '32px', color: '#1a1f36', fontFamily: 'Arial, sans-serif', fontSize: 12, lineHeight: 1.5, maxWidth: 700, margin: '0 auto', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      {lh.barPos === 'top' && bar}
      <div style={{ padding: lh.barPos === 'top' ? '16px 0 0' : '0' }}>
        {lh.layout === 'center' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>{logoEl}</div>
            {textBlock}
          </div>
        )}
        {lh.layout === 'left' && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>{logoEl}{textBlock}</div>
        )}
        {lh.layout === 'right' && (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>{textBlock}{logoEl}</div>
        )}
      </div>
      {lh.barPos === 'bottom' && bar}

      {lh.lineWidth > 0
        ? <div style={{ borderTop: `${lh.lineWidth}px ${lh.lineStyle} ${lh.lineColor}`, margin: '14px 0 18px' }} />
        : <div style={{ margin: '18px 0' }} />
      }

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div style={{ background: lh.billToBg, borderRadius: 8, padding: '10px 14px', minWidth: 180 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: lh.billToAccent, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 3 }}>Bill To</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>The Scent Boutique</div>
          <div style={{ fontSize: 10, color: '#555', lineHeight: 1.6, marginTop: 2 }}>M.G. Road, Bangalore, KA<br />orders@scentboutique.com</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: lh.font, fontSize: lh.invTitleSize, fontWeight: 700, color: lh.invTitleColor }}>INVOICE</div>
          <div style={{ fontSize: 11, color: '#555', marginTop: 4, lineHeight: 1.8 }}>INV-2025-001<br />Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 11 }}>
        <thead>
          <tr style={{ background: lh.tableHd }}>
            {['#', 'Description', 'Qty', 'Unit Price', 'Total'].map((h, i) => (
              <th key={h} style={{ padding: '8px 10px', textAlign: i > 1 ? 'right' : 'left', color: '#fff', fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={it.name} style={{ background: i % 2 === 1 ? lh.tableAlt : '#fff' }}>
              <td style={{ padding: '7px 10px' }}>{i + 1}</td>
              <td style={{ padding: '7px 10px' }}>{it.name}</td>
              <td style={{ padding: '7px 10px', textAlign: 'right' }}>{it.qty}</td>
              <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(it.price)}</td>
              <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600 }}>{fmt(it.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ minWidth: 200 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#555', fontSize: 11 }}><span>Subtotal</span><span>{fmt(sub)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#555', fontSize: 11 }}><span>GST 18%</span><span>{fmt(tax)}</span></div>
          <div style={{ background: lh.totalBg, borderRadius: 6, padding: '8px 12px', marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: lh.totalColor }}><span>Total</span><span>{fmt(total)}</span></div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: lh.footerSize, color: lh.footerColor, borderTop: '0.5px solid #eee', paddingTop: 14 }}>
        {lh.footerText} · {lh.companyName}{lh.website && ` · ${lh.website}`}
      </div>
    </div>
  );
}
