import Link from 'next/link';
import { ChevronRight, ExternalLink } from 'lucide-react';
import type { Employee, PaginatedResult } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatDate, getInitials, scoreBg, scoreLabel } from '@/lib/utils';
import { Pagination } from './Pagination';

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-slate-600 text-xs">—</span>;
  const v = score >= 4 ? 'success' : score === 3 ? 'warning' : 'danger';
  return (
    <Badge variant={v}>
      {score}/5 · {scoreLabel(score)}
    </Badge>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-700 to-purple-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
      {getInitials(name)}
    </div>
  );
}

export function EmployeeTable({ result }: { result: PaginatedResult<Employee> }) {
  if (result.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-sm font-medium">No employees found</p>
        <p className="text-xs mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {['Employee', 'Manager', 'Start Date', 'Attendance', 'Engagement', 'Comm.', 'Performance', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {result.data.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={emp.name} />
                    <div>
                      <p className="font-medium text-slate-200 leading-snug">{emp.name}</p>
                      {emp.title && <p className="text-xs text-slate-500">{emp.title}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{emp.reporting_manager || '—'}</td>
                <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{formatDate(emp.onboarding_start_date)}</td>
                <td className="px-4 py-3 text-slate-300 text-xs">{emp.attendance || '—'}</td>
                <td className="px-4 py-3 text-slate-300 text-xs">{emp.engagement || '—'}</td>
                <td className="px-4 py-3">
                  {emp.communication_skills !== null ? (
                    <span className="text-xs text-slate-300">{emp.communication_skills}/5</span>
                  ) : <span className="text-slate-600 text-xs">—</span>}
                </td>
                <td className="px-4 py-3">
                  <ScoreBadge score={emp.overall_performance_score} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/employee/${emp.id}`}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View <ChevronRight size={12} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-slate-800">
        {result.data.map(emp => (
          <Link key={emp.id} href={`/dashboard/employee/${emp.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors">
            <Avatar name={emp.name} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-200 text-sm truncate">{emp.name}</p>
              <p className="text-xs text-slate-500 truncate">{emp.title || emp.reporting_manager || '—'}</p>
            </div>
            {emp.overall_performance_score !== null && (
              <Badge variant={emp.overall_performance_score >= 4 ? 'success' : emp.overall_performance_score === 3 ? 'warning' : 'danger'}>
                {emp.overall_performance_score}/5
              </Badge>
            )}
            <ChevronRight size={14} className="text-slate-600 shrink-0" />
          </Link>
        ))}
      </div>

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        pageSize={result.pageSize}
      />
    </div>
  );
}
