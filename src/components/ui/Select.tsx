import { cn } from '@/lib/utils';
import { type SelectHTMLAttributes, forwardRef } from 'react';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-200',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
        'disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
        'appearance-none cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);

Select.displayName = 'Select';
