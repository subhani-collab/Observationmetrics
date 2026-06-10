'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { MONTHS } from '@/lib/utils';

interface Props {
  managers: string[];
  years: string[];
}

export function FilterBar({ managers, years }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const current = {
    search: searchParams.get('search') || '',
    manager: searchParams.get('manager') || '',
    month: searchParams.get('month') || '',
    year: searchParams.get('year') || '',
    sortBy: searchParams.get('sortBy') || 'onboarding_start_date',
    sortDir: searchParams.get('sortDir') || 'desc',
  };

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }, [searchParams, pathname, router]);

  const hasFilters = current.search || current.manager || current.month || current.year;

  const clearAll = () => {
    startTransition(() => router.push(pathname));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="flex-1 min-w-[220px]">
          <Input
            icon={<Search size={14} />}
            placeholder="Search by name or title…"
            defaultValue={current.search}
            onChange={e => update('search', e.target.value)}
            className="h-9"
          />
        </div>

        {/* Manager filter */}
        <div className="w-44">
          <Select value={current.manager} onChange={e => update('manager', e.target.value)} className="h-9">
            <option value="">All Managers</option>
            {managers.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
        </div>

        {/* Month */}
        <div className="w-36">
          <Select value={current.month} onChange={e => update('month', e.target.value)} className="h-9">
            <option value="">All Months</option>
            {MONTHS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </Select>
        </div>

        {/* Year */}
        <div className="w-28">
          <Select value={current.year} onChange={e => update('year', e.target.value)} className="h-9">
            <option value="">All Years</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={13} className="text-slate-500" />
          <Select value={current.sortBy} onChange={e => update('sortBy', e.target.value)} className="h-9 w-44">
            <option value="onboarding_start_date">Date</option>
            <option value="overall_performance_score">Performance</option>
            <option value="name">Name</option>
            <option value="attendance">Attendance</option>
          </Select>
          <Select value={current.sortDir} onChange={e => update('sortDir', e.target.value)} className="h-9 w-24">
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </Select>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-slate-500 hover:text-slate-300 gap-1">
            <X size={12} /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
