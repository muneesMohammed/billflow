import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { InvoiceStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(n: number): string {
  return '₹' + (n || 0).toLocaleString('en-IN');
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function statusColor(status: InvoiceStatus) {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-800 border-green-200';
    case 'unpaid': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
    case 'draft': return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

export function generateInvoiceNumber(count: number) {
  return `INV-2025-${String(count).padStart(3, '0')}`;
}
