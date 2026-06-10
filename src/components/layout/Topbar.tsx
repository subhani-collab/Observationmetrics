'use client';

import { useSession } from 'next-auth/react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { getInitials } from '@/lib/utils';

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { data: session } = useSession();
  const name = session?.user?.name || session?.user?.email || '';

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-slate-800 bg-slate-950 shrink-0">
      <div>
        <h1 className="text-base font-semibold text-slate-100">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {name && (
          <div
            className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-bold text-white"
            title={name}
          >
            {getInitials(name)}
          </div>
        )}
      </div>
    </header>
  );
}
