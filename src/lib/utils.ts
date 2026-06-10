import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, 'MMM d, yyyy') : dateStr;
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, 'MMM d') : dateStr;
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, 'MMM d, yyyy HH:mm') : dateStr;
  } catch {
    return dateStr;
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() || '')
    .join('');
}

export function scoreColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'text-slate-400';
  if (score >= 4) return 'text-emerald-400';
  if (score === 3) return 'text-amber-400';
  return 'text-red-400';
}

export function scoreBg(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'bg-slate-800 text-slate-400';
  if (score >= 4) return 'bg-emerald-950 text-emerald-400 border border-emerald-800';
  if (score === 3) return 'bg-amber-950 text-amber-400 border border-amber-800';
  return 'bg-red-950 text-red-400 border border-red-800';
}

export function scoreLabel(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'N/A';
  if (score >= 5) return 'Excellent';
  if (score === 4) return 'Good';
  if (score === 3) return 'Average';
  if (score === 2) return 'Needs Work';
  return 'At Risk';
}

export const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];
