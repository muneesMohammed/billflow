import type { Invoice, Customer, LetterheadSettings } from '@/lib/types';

// Google Fonts map — these are embedded via @import in the HTML
export const FONT_OPTIONS = [
  { label: 'Inter (Modern)', value: 'Inter, sans-serif', gfamily: 'Inter:wght@400;600;700' },
  { label: 'Playfair Display (Elegant)', value: '"Playfair Display", serif', gfamily: 'Playfair+Display:wght@400;600;700' },
  { label: 'Roboto (Clean)', value: 'Roboto, sans-serif', gfamily: 'Roboto:wght@400;500;700' },
  { label: 'Montserrat (Bold)', value: 'Montserrat, sans-serif', gfamily: 'Montserrat:wght@400;600;700' },
  { label: 'Lato (Friendly)', value: 'Lato, sans-serif', gfamily: 'Lato:wght@400;700' },
  { label: 'Merriweather (Classic)', value: 'Merriweather, serif', gfamily: 'Merriweather:wght@400;700' },
  { label: 'Poppins (Geometric)', value: 'Poppins, sans-serif', gfamily: 'Poppins:wght@400;600;700' },
  { label: 'Georgia (Traditional)', value: 'Georgia, serif', gfamily: '' },
  { label: 'Oswald (Condensed)', value: 'Oswald, sans-serif', gfamily: 'Oswald:wght@400;600;700' },
  { label: 'Nunito (Rounded)', value: 'Nunito, sans-serif', gfamily: 'Nunito:wght@400;600;700' },
];

export function getFontImport(fontValue: string): string {
  const opt = FONT_OPTIONS.find(f => f.value === fontValue);
  if (!opt || !opt.gfamily) return '';
  return `@import url('https://fonts.googleapis.com/css2?family=${opt.gfamily}&display=swap');`;
}

export function InvoicePreviewHtml(
  invoice: Invoice,
  customer: Customer | undefined,
  lh: LetterheadSettings,
): string {
  const fmt = (n: number) => '₹' + (n || 0).toLocaleString('en-IN');
  const fontImport = getFontImport(lh.font);

  // Logo block
  const logoHtml = lh.logoSrc
    ? `<img src="${lh.logoSrc}" style="width:${lh.logoSize}px;height:${lh.logoSize}px;object-fit:cover;border-radius:${lh.logoShape};flex-shrink:0;display:block">`
    : `<div style="width:${lh.logoSize}px;height:${lh.logoSize}px;background:linear-gradient(135deg,${lh.barColor},${lh.barColor}cc);border-radius:${lh.logoShape};display:flex;align-items:center;justify-content:center;color:#fff;font-size:${Math.round(lh.logoSize * 0.45)}px;flex-shrink:0;font-family:${lh.font};font-weight:700">
        ${lh.companyName.charAt(0).toUpperCase()}
      </div>`;

  const nameStyle = `font-family:${lh.font};font-size:${lh.nameSize}px;font-weight:${lh.nameStyle === 'bold' ? 700 : 400};font-style:${lh.nameStyle === 'italic' ? 'italic' : 'normal'};color:${lh.nameColor};line-height:1.2;margin:0`;
  const subStyle  = `font-size:${lh.subSize}px;color:${lh.subColor};margin-top:4px;font-family:${lh.font}`;
  const infoStyle = `font-size:10px;color:#666;line-height:1.8;margin-top:8px;font-family:${lh.font}`;

  const textBlock = `
    <div>
      <div style="${nameStyle}">${lh.companyName}</div>
      ${lh.subheading ? `<div style="${subStyle}">${lh.subheading}</div>` : ''}
      <div style="${infoStyle}">
        ${lh.address ? lh.address + '<br>' : ''}
        ${[lh.phone, lh.email].filter(Boolean).join(' &middot; ')}
        ${lh.gstin ? '<br>GSTIN: ' + lh.gstin : ''}
        ${lh.website ? '<br>' + lh.website : ''}
      </div>
    </div>`;

  const headerLayout = lh.layout === 'center'
    ? `<div style="text-align:center"><div style="display:flex;justify-content:center;margin-bottom:12px">${logoHtml}</div>${textBlock}</div>`
    : lh.layout === 'right'
    ? `<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px">${textBlock}${logoHtml}</div>`
    : `<div style="display:flex;align-items:flex-start;gap:16px">${logoHtml}${textBlock}</div>`;

  const topBar = lh.barPos === 'top' && lh.barHeight > 0
    ? `<div style="height:${lh.barHeight}px;background:${lh.barColor};margin:-40px -40px 0"></div>` : '';
  const btmBar = lh.barPos === 'bottom' && lh.barHeight > 0
    ? `<div style="height:${lh.barHeight}px;background:${lh.barColor};margin:0 -40px -40px"></div>` : '';
  const divider = lh.lineWidth > 0
    ? `<div style="border-top:${lh.lineWidth}px ${lh.lineStyle} ${lh.lineColor};margin:16px 0 20px"></div>`
    : `<div style="margin:20px 0"></div>`;

  const statusColors: Record<string, { bg: string; color: string }> = {
    paid:    { bg: '#dcfce7', color: '#166534' },
    unpaid:  { bg: '#fef9c3', color: '#713f12' },
    overdue: { bg: '#fee2e2', color: '#991b1b' },
    draft:   { bg: '#f1f5f9', color: '#475569' },
  };
  const sc = statusColors[invoice.status] || statusColors.draft;

  const rowsHtml = invoice.items.map((it, i) => `
    <tr style="background:${i % 2 === 1 ? lh.tableAlt : '#ffffff'}">
      <td style="padding:9px 12px;font-family:${lh.font};border-bottom:1px solid #f0f0f0">${i + 1}</td>
      <td style="padding:9px 12px;font-family:${lh.font};border-bottom:1px solid #f0f0f0">${it.name}</td>
      <td style="padding:9px 12px;text-align:center;font-family:${lh.font};border-bottom:1px solid #f0f0f0">${it.qty}</td>
      <td style="padding:9px 12px;text-align:right;font-family:${lh.font};border-bottom:1px solid #f0f0f0">${fmt(it.price)}</td>
      <td style="padding:9px 12px;text-align:right;font-weight:600;font-family:${lh.font};border-bottom:1px solid #f0f0f0">${fmt(it.total)}</td>
    </tr>`).join('');

  const customerBlock = customer ? `
    <div style="font-size:13px;font-weight:700;color:#1a1f36;font-family:${lh.font}">${customer.name}</div>
    <div style="font-size:10px;color:#555;line-height:1.8;margin-top:4px;font-family:${lh.font}">
      ${customer.address ? customer.address + '<br>' : ''}
      ${customer.email ? customer.email + '<br>' : ''}
      ${customer.phone || ''}
      ${customer.gstin ? '<br>GSTIN: ' + customer.gstin : ''}
    </div>` : `<div style="font-size:13px;font-weight:700;font-family:${lh.font}">${invoice.customerName}</div>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${invoice.number}</title>
<style>
  ${fontImport}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:${lh.font},Arial,sans-serif;padding:40px;max-width:820px;margin:auto;color:#1a1f36;font-size:12px;line-height:1.6;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  table{width:100%;border-collapse:collapse}
  @media print{
    body{padding:20px}
    @page{margin:1cm;size:A4}
  }
</style>
</head>
<body>
  ${topBar}
  <div style="padding:${lh.barPos === 'top' && lh.barHeight > 0 ? '20px' : '0'} 0 0">
    ${headerLayout}
  </div>
  ${btmBar}
  ${divider}

  <!-- Invoice meta + Bill To -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;gap:20px">
    <div style="background:${lh.billToBg};border-left:3px solid ${lh.billToAccent};border-radius:0 8px 8px 0;padding:14px 18px;min-width:220px;flex:1">
      <div style="font-size:9px;font-weight:700;color:${lh.billToAccent};text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px;font-family:${lh.font}">Bill To</div>
      ${customerBlock}
    </div>
    <div style="text-align:right;flex-shrink:0">
      <div style="font-family:${lh.font};font-size:${lh.invTitleSize}px;font-weight:800;color:${lh.invTitleColor};letter-spacing:-0.5px">INVOICE</div>
      <div style="font-size:11px;color:#555;margin-top:6px;line-height:2;font-family:${lh.font}">
        <strong style="color:#1a1f36">${invoice.number}</strong><br>
        Date: ${invoice.date}<br>
        Due: ${invoice.dueDate}<br>
        <span style="display:inline-block;padding:3px 12px;border-radius:20px;background:${sc.bg};color:${sc.color};font-size:10px;font-weight:700;text-transform:capitalize;margin-top:2px;font-family:${lh.font}">${invoice.status}</span>
      </div>
    </div>
  </div>

  <!-- Items Table -->
  <table style="margin-bottom:20px;font-size:11px;border-radius:8px;overflow:hidden">
    <thead>
      <tr style="background:${lh.tableHd}">
        <th style="padding:11px 12px;text-align:left;color:#fff;font-weight:700;width:32px;font-family:${lh.font}">#</th>
        <th style="padding:11px 12px;text-align:left;color:#fff;font-weight:700;font-family:${lh.font}">Description</th>
        <th style="padding:11px 12px;text-align:center;color:#fff;font-weight:700;width:55px;font-family:${lh.font}">Qty</th>
        <th style="padding:11px 12px;text-align:right;color:#fff;font-weight:700;width:100px;font-family:${lh.font}">Unit Price</th>
        <th style="padding:11px 12px;text-align:right;color:#fff;font-weight:700;width:100px;font-family:${lh.font}">Total</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>

  <!-- Totals -->
  <div style="display:flex;justify-content:flex-end;margin-bottom:20px">
    <div style="min-width:240px">
      <div style="display:flex;justify-content:space-between;font-size:11px;padding:6px 0;color:#555;border-bottom:1px solid #f0f0f0;font-family:${lh.font}">
        <span>Subtotal</span><span>${fmt(invoice.subtotal)}</span>
      </div>
      ${invoice.hasGst ? `<div style="display:flex;justify-content:space-between;font-size:11px;padding:6px 0;color:#555;border-bottom:1px solid #f0f0f0;font-family:${lh.font}"><span>GST 18%</span><span>${fmt(invoice.tax)}</span></div>` : ''}
      <div style="background:${lh.totalBg};border-radius:8px;padding:12px 14px;margin-top:8px;display:flex;justify-content:space-between;font-size:16px;font-weight:800;color:${lh.totalColor};font-family:${lh.font}">
        <span>Total Amount</span><span>${fmt(invoice.total)}</span>
      </div>
    </div>
  </div>

  ${invoice.remarks ? `
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;font-size:11px;color:#555;margin-bottom:20px;font-family:${lh.font}">
    <strong style="color:#1a1f36;display:block;margin-bottom:4px">Remarks</strong>${invoice.remarks}
  </div>` : ''}

  <!-- Footer -->
  <div style="text-align:center;margin-top:28px;font-size:${lh.footerSize}px;color:${lh.footerColor};border-top:1px solid #e5e7eb;padding-top:16px;font-family:${lh.font}">
    ${lh.footerText} &middot; ${lh.companyName}${lh.website ? ' &middot; ' + lh.website : ''}
  </div>
  ${btmBar ? '' : ''}
</body>
</html>`;
}
