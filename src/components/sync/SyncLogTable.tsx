import { CheckCircle, XCircle, RefreshCw, Clock } from 'lucide-react';
import type { SyncLog } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

function StatusIcon({ status }: { status: SyncLog['status'] }) {
  if (status === 'success') return <CheckCircle size={13} className="text-emerald-400" />;
  if (status === 'error') return <XCircle size={13} className="text-red-400" />;
  return <RefreshCw size={13} className="text-amber-400 animate-spin" />;
}

function StatusBadge({ status }: { status: SyncLog['status'] }) {
  const map: Record<SyncLog['status'], { variant: 'success' | 'danger' | 'warning'; label: string }> = {
    success: { variant: 'success', label: 'Success' },
    error: { variant: 'danger', label: 'Error' },
    running: { variant: 'warning', label: 'Running' },
  };
  const { variant, label } = map[status];
  return <Badge variant={variant}><StatusIcon status={status} />{label}</Badge>;
}

export function SyncLogTable({ logs }: { logs: SyncLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="py-12 text-center text-slate-600 text-sm">
        <Clock size={28} className="mx-auto mb-2 text-slate-700" />
        No sync history yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            {['Started', 'Completed', 'Status', 'Triggered By', 'Total', 'Added', 'Updated', 'Skipped', 'Error'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {logs.map(log => (
            <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
              <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{formatDateTime(log.started_at)}</td>
              <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{log.completed_at ? formatDateTime(log.completed_at) : '—'}</td>
              <td className="px-4 py-3"><StatusBadge status={log.status} /></td>
              <td className="px-4 py-3">
                <Badge variant={log.triggered_by === 'manual' ? 'info' : 'neutral'}>
                  {log.triggered_by}
                </Badge>
              </td>
              <td className="px-4 py-3 text-slate-300 text-xs text-center">{log.records_total}</td>
              <td className="px-4 py-3 text-emerald-400 text-xs text-center">{log.records_added}</td>
              <td className="px-4 py-3 text-amber-400 text-xs text-center">{log.records_updated}</td>
              <td className="px-4 py-3 text-slate-500 text-xs text-center">{log.records_skipped}</td>
              <td className="px-4 py-3 text-red-400 text-xs max-w-[200px] truncate" title={log.error_message || ''}>
                {log.error_message || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
