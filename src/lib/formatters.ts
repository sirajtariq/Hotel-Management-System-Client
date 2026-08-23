import { format, parseISO } from 'date-fns';

/**
 * Format currency to PKR standard (e.g. PKR 45,000)
 */
export function formatPKR(amount: number): string {
  const formatted = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
  }).format(amount || 0);
  return `PKR ${formatted}`;
}

/**
 * Format ISO date string into readable format (e.g., 22 Aug 2026)
 */
export function formatDate(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '-';
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(d, 'dd MMM yyyy');
  } catch {
    return String(dateStr);
  }
}

/**
 * Format ISO datetime string into readable time (e.g., 10:45 AM)
 */
export function formatTime(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '-';
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(d, 'hh:mm a');
  } catch {
    return String(dateStr);
  }
}

/**
 * Room & Booking Status Badge Styling Map according to Strict Design System Rules:
 * Available: bg-emerald-50 text-emerald-700 border border-emerald-200
 * Occupied / Booked: bg-rose-50 text-rose-700 border border-rose-200
 * Cleaning / Maintenance: bg-amber-50 text-amber-700 border border-amber-200
 * Reserved: bg-blue-50 text-blue-700 border border-blue-200
 */
export const STATUS_STYLE_MAP: Record<string, string> = {
  // Room statuses
  available: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  occupied: 'bg-rose-50 text-rose-700 border border-rose-200',
  cleaning: 'bg-amber-50 text-amber-700 border border-amber-200',
  maintenance: 'bg-amber-50 text-amber-700 border border-amber-200',
  reserved: 'bg-blue-50 text-blue-700 border border-blue-200',

  // Booking statuses
  confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
  checked_in: 'bg-rose-50 text-rose-700 border border-rose-200',
  checked_out: 'bg-slate-100 text-slate-700 border border-slate-200',
  cancelled: 'bg-rose-50/50 text-rose-600 border border-rose-100',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',

  // Payment statuses
  paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  partial: 'bg-amber-50 text-amber-700 border border-amber-200',
  unpaid: 'bg-rose-50 text-rose-700 border border-rose-200',
};
