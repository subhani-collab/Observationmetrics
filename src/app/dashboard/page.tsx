import { Suspense } from 'react';
import { getEmployees, getDashboardStats, getDistinctYears, getLastSuccessfulSync } from '@/lib/db';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { EmployeeTable } from '@/components/dashboard/EmployeeTable';
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { Topbar } from '@/components/layout/Topbar';
import { formatDateTime } from '@/lib/utils';

interface PageProps {
  searchParams: {
    search?: string;
    manager?: string;
    month?: string;
    year?: string;
    sortBy?: string;
    sortDir?: string;
    page?: string;
  };
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const stats = getDashboardStats();
  const years = getDistinctYears();
  const lastSync = getLastSuccessfulSync();

  const result = getEmployees({
    search: searchParams.search,
    manager: searchParams.manager,
    month: searchParams.month,
    year: searchParams.year,
    sortBy: searchParams.sortBy as never,
    sortDir: (searchParams.sortDir as 'asc' | 'desc') || 'desc',
    page: searchParams.page ? parseInt(searchParams.page, 10) : 1,
    pageSize: 25,
  });

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Dashboard"
        subtitle={lastSync ? `Last synced ${formatDateTime(lastSync.completed_at)}` : 'Never synced — go to Sync & Logs to set up'}
      />

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Employee list */}
        <Card>
          <div className="p-5 border-b border-slate-800">
            <Suspense fallback={null}>
              <FilterBar managers={stats.managers} years={years} />
            </Suspense>
          </div>

          <Suspense fallback={<SkeletonTable rows={8} />}>
            {stats.totalEmployees === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-sm font-medium text-slate-500">No data yet</p>
                <p className="text-xs mt-1">Run a sync from the <strong className="text-slate-400">Sync &amp; Logs</strong> page to import employee data.</p>
              </div>
            ) : (
              <EmployeeTable result={result} />
            )}
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
