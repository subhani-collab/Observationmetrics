import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          icon && 'pl-9',
          className
        )}
        {...props}
      />
    </div>
  )
);

Input.displayName = 'Input';
