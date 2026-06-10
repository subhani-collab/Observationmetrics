import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

const variants = {
  default: 'bg-indigo-950 text-indigo-300 border border-indigo-800',
  success: 'bg-emerald-950 text-emerald-400 border border-emerald-800',
  warning: 'bg-amber-950 text-amber-400 border border-amber-800',
  danger: 'bg-red-950 text-red-400 border border-red-800',
  info: 'bg-sky-950 text-sky-400 border border-sky-800',
  neutral: 'bg-slate-800 text-slate-400 border border-slate-700',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
