'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, RefreshCw, LogOut, Activity } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/sync', label: 'Sync & Logs', icon: RefreshCw },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 border-r border-slate-800 bg-slate-950 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-800">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Activity size={14} className="text-white" />
        </div>
        <span className="text-sm font-semibold text-slate-100">ObserveBoard</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
