'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Printer, Download, Palette, ChevronLeft, ChevronRight, Upload, RotateCcw } from 'lucide-react';
import type { Invoice, Customer, LetterheadSettings } from '@/lib/types';
import { defaultLetterhead } from '@/lib/types';
import { InvoicePreviewHtml, FONT_OPTIONS } from './InvoicePreviewHtml';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

type Props = {
  invoice: Invoice;
  customer: Customer | undefined;
  letterhead: LetterheadSettings;
  onClose: () => void;
};

const COLORS = [
  '#6c63ff','#3b82f6','#10b981','#f59e0b','#ef4444',
  '#8b5cf6','#ec4899','#0ea5e9','#14b8a6','#1a1f36',
  '#374151','#6b7280','#b45309','#065f46','#1e3a8a',
];

function ColorPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => onChange(c)}
              title={c}
              className={cn(
                'w-5 h-5 rounded-md border-2 transition-transform hover:scale-110',
                value === c ? 'border-foreground scale-110' : 'border-transparent',
              )}
              style={{ background: c }}
            />
          ))}
        </div>
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border border-border bg-transparent"
          title="Custom color"
        />
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent';
const selectCls = 'w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent';

export function InvoicePrintModal({ invoice, customer, letterhead: initialLh, onClose }: Props) {
  const { saveLetterhead } = useApp();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);
  const [lh, setLh] = useState<LetterheadSettings>(initialLh);
  const [activeTab, setActiveTab] = useState<'header' | 'fonts' | 'table' | 'logo'>('header');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = useCallback(<K extends keyof LetterheadSettings>(key: K, value: LetterheadSettings[K]) => {
    setLh(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set('logoSrc', ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.print();
  };

  const downloadPdf = async () => {
    if (!iframeRef.current?.contentDocument) return;
    setIsGenerating(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = iframeRef.current.contentDocument.documentElement;
      await html2pdf().set({
        margin: [0, 0, 0, 0],
        filename: `${invoice.number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(element).save();
    } catch (err) { console.error(err); }
    finally { setIsGenerating(false); }
  };

  const handleSaveDesign = async () => {
    setSaving(true);
    try { await saveLetterhead(lh); } catch {}
    finally { setSaving(false); }
  };

  const handleReset = () => setLh(defaultLetterhead);

  const html = InvoicePreviewHtml(invoice, customer, lh);

  const tabs = [
    { id: 'logo', label: 'Logo' },
    { id: 'header', label: 'Header' },
    { id: 'fonts', label: 'Fonts' },
    { id: 'table', label: 'Table' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-card w-full max-w-7xl max-h-[95vh] rounded-2xl border border-border shadow-2xl flex flex-col">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-headline font-semibold text-base">{invoice.number}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{invoice.customerName} · {invoice.date}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDesignOpen(!designOpen)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all border',
                designOpen
                  ? 'bg-accent text-white border-accent'
                  : 'border-border text-foreground hover:bg-muted',
              )}
            >
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Design</span>
              {designOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-primary text-white px-3.5 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={downloadPdf}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-accent text-white px-3.5 py-2 rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{isGenerating ? 'Generating…' : 'PDF'}</span>
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">

          {/* Design panel */}
          {designOpen && (
            <div className="w-72 border-r border-border flex flex-col flex-shrink-0 bg-muted/30">
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold">PDF Designer</span>
                <div className="flex gap-1.5">
                  <button onClick={handleReset} title="Reset to default" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleSaveDesign}
                    disabled={saving}
                    className="px-3 py-1 bg-accent text-white rounded-lg text-xs font-medium hover:bg-indigo-500 transition-colors disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={cn(
                      'flex-1 py-2 text-xs font-medium transition-colors',
                      activeTab === t.id
                        ? 'text-accent border-b-2 border-accent bg-accent/5'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Panel content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">

                {/* ── LOGO TAB ── */}
                {activeTab === 'logo' && (
                  <>
                    <Row label="Upload Logo">
                      <label className="flex flex-col items-center gap-2 border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-accent hover:bg-accent/5 transition-all">
                        {lh.logoSrc ? (
                          <img src={lh.logoSrc} alt="Logo" className="max-h-16 object-contain rounded" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Click to upload logo</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      </label>
                      {lh.logoSrc && (
                        <button onClick={() => set('logoSrc', '')} className="w-full mt-2 text-xs text-destructive hover:underline">Remove logo</button>
                      )}
                    </Row>
                    <Row label={`Logo Size: ${lh.logoSize}px`}>
                      <input type="range" min={30} max={120} value={lh.logoSize} onChange={e => set('logoSize', Number(e.target.value))} className="w-full" />
                    </Row>
                    <Row label="Logo Shape">
                      <select value={lh.logoShape} onChange={e => set('logoShape', e.target.value)} className={selectCls}>
                        <option value="0px">Square</option>
                        <option value="6px">Slightly Rounded</option>
                        <option value="12px">Rounded</option>
                        <option value="50%">Circle</option>
                      </select>
                    </Row>
                    <Row label="Layout">
                      <div className="flex gap-1.5">
                        {(['left', 'center', 'right'] as const).map(l => (
                          <button
                            key={l}
                            onClick={() => set('layout', l)}
                            className={cn(
                              'flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border',
                              lh.layout === l ? 'bg-accent text-white border-accent' : 'border-border hover:bg-muted',
                            )}
                          >{l}</button>
                        ))}
                      </div>
                    </Row>
                  </>
                )}

                {/* ── HEADER TAB ── */}
                {activeTab === 'header' && (
                  <>
                    <Row label="Company Name">
                      <input value={lh.companyName} onChange={e => set('companyName', e.target.value)} className={inputCls} />
                    </Row>
                    <Row label="Subheading">
                      <input value={lh.subheading} onChange={e => set('subheading', e.target.value)} className={inputCls} />
                    </Row>
                    <ColorPicker label="Accent Bar Color" value={lh.barColor} onChange={v => set('barColor', v)} />
                    <Row label="Bar Position">
                      <select value={lh.barPos} onChange={e => set('barPos', e.target.value as 'top' | 'bottom' | 'none')} className={selectCls}>
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="none">None</option>
                      </select>
                    </Row>
                    <Row label={`Bar Height: ${lh.barHeight}px`}>
                      <input type="range" min={0} max={12} value={lh.barHeight} onChange={e => set('barHeight', Number(e.target.value))} className="w-full" />
                    </Row>
                    <ColorPicker label="Divider Color" value={lh.lineColor} onChange={v => set('lineColor', v)} />
                    <Row label="Divider Style">
                      <select value={lh.lineStyle} onChange={e => set('lineStyle', e.target.value as LetterheadSettings['lineStyle'])} className={selectCls}>
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                        <option value="dotted">Dotted</option>
                        <option value="double">Double</option>
                      </select>
                    </Row>
                    <ColorPicker label="Bill-To Background" value={lh.billToBg} onChange={v => set('billToBg', v)} />
                    <ColorPicker label="Bill-To Accent" value={lh.billToAccent} onChange={v => set('billToAccent', v)} />
                    <ColorPicker label="Invoice Title Color" value={lh.invTitleColor} onChange={v => set('invTitleColor', v)} />
                    <Row label={`Invoice Title Size: ${lh.invTitleSize}px`}>
                      <input type="range" min={18} max={48} value={lh.invTitleSize} onChange={e => set('invTitleSize', Number(e.target.value))} className="w-full" />
                    </Row>
                    <Row label="Footer Text">
                      <input value={lh.footerText} onChange={e => set('footerText', e.target.value)} className={inputCls} />
                    </Row>
                    <ColorPicker label="Footer Color" value={lh.footerColor} onChange={v => set('footerColor', v)} />
                  </>
                )}

                {/* ── FONTS TAB ── */}
                {activeTab === 'fonts' && (
                  <>
                    <Row label="Font Family">
                      <select value={lh.font} onChange={e => set('font', e.target.value)} className={selectCls}>
                        {FONT_OPTIONS.map(f => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                    </Row>
                    <ColorPicker label="Company Name Color" value={lh.nameColor} onChange={v => set('nameColor', v)} />
                    <Row label={`Company Name Size: ${lh.nameSize}px`}>
                      <input type="range" min={14} max={36} value={lh.nameSize} onChange={e => set('nameSize', Number(e.target.value))} className="w-full" />
                    </Row>
                    <Row label="Name Style">
                      <div className="flex gap-1.5">
                        {(['normal', 'bold', 'italic'] as const).map(s => (
                          <button
                            key={s}
                            onClick={() => set('nameStyle', s)}
                            className={cn(
                              'flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border',
                              lh.nameStyle === s ? 'bg-accent text-white border-accent' : 'border-border hover:bg-muted',
                            )}
                          >{s}</button>
                        ))}
                      </div>
                    </Row>
                    <ColorPicker label="Subheading Color" value={lh.subColor} onChange={v => set('subColor', v)} />
                    <Row label={`Subheading Size: ${lh.subSize}px`}>
                      <input type="range" min={8} max={20} value={lh.subSize} onChange={e => set('subSize', Number(e.target.value))} className="w-full" />
                    </Row>
                  </>
                )}

                {/* ── TABLE TAB ── */}
                {activeTab === 'table' && (
                  <>
                    <ColorPicker label="Table Header Background" value={lh.tableHd} onChange={v => set('tableHd', v)} />
                    <ColorPicker label="Alternate Row Color" value={lh.tableAlt} onChange={v => set('tableAlt', v)} />
                    <ColorPicker label="Total Box Background" value={lh.totalBg} onChange={v => set('totalBg', v)} />
                    <ColorPicker label="Total Text Color" value={lh.totalColor} onChange={v => set('totalColor', v)} />
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-3">Preview Table</p>
                      <div className="rounded-xl overflow-hidden border border-border text-xs">
                        <div style={{ background: lh.tableHd }} className="px-3 py-2 text-white font-semibold flex justify-between">
                          <span>Description</span><span>Total</span>
                        </div>
                        <div className="px-3 py-2 flex justify-between bg-white">
                          <span>Item 1</span><span>₹1,200</span>
                        </div>
                        <div style={{ background: lh.tableAlt }} className="px-3 py-2 flex justify-between">
                          <span>Item 2</span><span>₹850</span>
                        </div>
                        <div style={{ background: lh.totalBg, color: lh.totalColor }} className="px-3 py-2 flex justify-between font-bold mt-1">
                          <span>Total</span><span>₹2,050</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="flex-1 overflow-auto bg-slate-100 p-4">
            <iframe
              ref={iframeRef}
              srcDoc={html}
              className="w-full bg-white rounded-xl shadow-lg"
              style={{ minHeight: '700px', border: 'none' }}
              title={`Invoice ${invoice.number}`}
            />
          </div>
        </div>

        {/* Bottom hint */}
        <div className="px-5 py-2.5 border-t border-border bg-muted/20 flex-shrink-0">
          <p className="text-xs text-muted-foreground">
            💡 Use <strong>Design</strong> panel to customize fonts, colors &amp; logo in real-time. Click <strong>Save</strong> to persist your letterhead.
          </p>
        </div>
      </div>
    </div>
  );
}
