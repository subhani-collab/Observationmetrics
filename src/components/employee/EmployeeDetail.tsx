import Link from 'next/link';
import { ArrowLeft, ExternalLink, Calendar, User, Briefcase, type LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { Employee } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatDate, formatDateTime, scoreBg, scoreLabel, getInitials } from '@/lib/utils';
import { PerformanceChart } from './PerformanceChart';

function RatingBar({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-semibold text-slate-300">{value ?? '—'}/5</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${value && value >= 4 ? 'bg-emerald-500' : value === 3 ? 'bg-amber-500' : value ? 'bg-red-500' : 'bg-slate-700'}`}
          style={{ width: value ? `${(value / 5) * 100}%` : '0%' }}
        />
      </div>
    </div>
  );
}

function MetaItem({ icon: Icon, label, value }: { icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>; label: string; value: string | null }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 p-1.5 rounded-md bg-slate-800">
        <Icon size={12} className="text-slate-500" />
      </div>
      <div>
        <p className="text-[10px] text-slate-600 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-300 mt-0.5">{value || '—'}</p>
      </div>
    </div>
  );
}

export function EmployeeDetail({ emp }: { emp: Employee }) {
  const overallScore = emp.overall_performance_score;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-700 to-purple-700 flex items-center justify-center text-lg font-bold text-white shrink-0">
          {getInitials(emp.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-slate-100">{emp.name}</h2>
          {emp.title && <p className="text-sm text-slate-400 mt-0.5">{emp.title}</p>}
          {emp.reporting_manager && (
            <p className="text-xs text-slate-600 mt-1">Reporting to: {emp.reporting_manager}</p>
          )}
        </div>
        {overallScore !== null && (
          <div className="text-center">
            <div className={`text-3xl font-bold ${overallScore >= 4 ? 'text-emerald-400' : overallScore === 3 ? 'text-amber-400' : 'text-red-400'}`}>
              {overallScore}<span className="text-lg text-slate-600">/5</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{scoreLabel(overallScore)}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: meta + text metrics */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <MetaItem icon={User} label="Full Name" value={emp.name} />
              <MetaItem icon={Briefcase} label="Title" value={emp.title} />
              <MetaItem icon={User} label="Manager" value={emp.reporting_manager} />
              <MetaItem icon={Calendar} label="Onboarding Start" value={formatDate(emp.onboarding_start_date)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Observational Metrics</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Attendance</span>
                <span className="text-slate-300">{emp.attendance || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Engagement</span>
                <span className="text-slate-300">{emp.engagement || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Learning & Comprehension</span>
                <span className="text-slate-300">{emp.learning_comprehension || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Quiz Result</span>
                <span className="text-slate-300">{emp.quiz_result || '—'}</span>
              </div>
            </CardContent>
          </Card>

          {emp.video_link && (
            <Card>
              <CardHeader><CardTitle>Recording</CardTitle></CardHeader>
              <CardContent>
                <a
                  href={emp.video_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <ExternalLink size={13} /> Watch Video
                </a>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Middle + Right: chart + ratings + notes */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>Performance Ratings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <RatingBar label="Product & Role Understanding" value={emp.product_role_understanding} />
              <RatingBar label="Communication Skills" value={emp.communication_skills} />
              <RatingBar label="Overall Performance Score" value={emp.overall_performance_score} />
            </CardContent>
          </Card>

          <PerformanceChart emp={emp} />

          {emp.final_notes && (
            <Card>
              <CardHeader><CardTitle>Final Notes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{emp.final_notes}</p>
              </CardContent>
            </Card>
          )}

          <p className="text-xs text-slate-700">
            Last synced: {formatDateTime(emp.synced_at)} · Record created: {formatDateTime(emp.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
