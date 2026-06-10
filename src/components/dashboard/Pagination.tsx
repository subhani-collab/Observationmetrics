'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export function Pagination({ page, totalPages, total, pageSize }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const navigate = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
      <p className="text-xs text-slate-500">
        {start}–{end} of {total} employees
      </p>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => navigate(page - 1)}>
          <ChevronLeft size={14} />
        </Button>
        <span className="text-xs text-slate-500 px-2">
          {page} / {totalPages}
        </span>
        <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => navigate(page + 1)}>
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
