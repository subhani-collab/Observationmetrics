import { Users, TrendingUp, AlertTriangle, CheckCircle, type LucideProps } from 'lucide-react';
import type { DashboardStats } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

interface Stat {
  label: string;
  value: string;
  sub?: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  color: string;
  bg: string;
}

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards: Stat[] = [
    {
      label: 'Total Employees',
      value: String(stats.totalEmployees),
      sub: 'onboarding records',
      icon: Users,
      color: 'text-indigo-400',
      bg: 'bg-indigo-950/50 border-indigo-900',
    },
    {
      label: 'Avg Performance',
      value: stats.avgPerformance !== null ? `${stats.avgPerformance} / 5` : '—',
      sub: 'overall score',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/50 border-emerald-900',
    },
    {
      label: 'Avg Attendance',
      value: stats.avgAttendance !== null ? `${stats.avgAttendance}%` : '—',
      sub: 'across all employees',
      icon: CheckCircle,
      color: 'text-sky-400',
      bg: 'bg-sky-950/50 border-sky-900',
    },
    {
      label: 'Needs Attention',
      value: String(stats.atRiskCount),
      sub: 'score ≤ 2 / 5',
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-950/50 border-red-900',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, icon: Icon, color, bg }) => (
        <Card key={label} className={`border ${bg}`}>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
                <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
                {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
              </div>
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon size={16} className={color} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
