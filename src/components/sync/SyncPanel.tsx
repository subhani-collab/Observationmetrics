'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';
import type { SyncLog } from '@/types';

interface Props {
  lastSync: SyncLog | null;
  currentStatus: SyncLog | null;
  intervalMinutes: number;
}

export function SyncPanel({ lastSync, currentStatus, intervalMinutes }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const triggerSync = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      setResult({
        success: true,
        message: `Done — ${data.added} added, ${data.updated} updated, ${data.skipped} unchanged`,
      });
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : 'Sync failed' });
    } finally {
      setLoading(false);
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const isSyncing = currentStatus?.status === 'running';

  return (
    <Card>
      <CardContent className="pt-5 space-y-5">
        {/* Status row */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Sync Status</p>
            <div className="flex items-center gap-2">
              {isSyncing ? (
                <>
                  <RefreshCw size={14} className="text-amber-400 animate-spin" />
                  <span className="text-sm font-medium text-amber-400">Syncing…</span>
                </>
              ) : lastSync?.status === 'success' ? (
                <>
                  <CheckCircle size={14} className="text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">Healthy</span>
                </>
              ) : lastSync?.status === 'error' ? (
                <>
                  <XCircle size={14} className="text-red-400" />
                  <span className="text-sm font-medium text-red-400">Last sync failed</span>
                </>
              ) : (
                <>
                  <Clock size={14} className="text-slate-500" />
                  <span className="text-sm text-slate-500">Never synced</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Last Successful Sync</p>
            <p className="text-sm text-slate-300">{formatDateTime(lastSync?.completed_at)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Auto-sync Interval</p>
            <p className="text-sm text-slate-300">Every {intervalMinutes} minute{intervalMinutes !== 1 ? 's' : ''}</p>
          </div>

          <Button
            onClick={triggerSync}
            loading={loading || isSyncing}
            disabled={loading || isSyncing}
            size="sm"
          >
            <RefreshCw size={13} />
            {loading || isSyncing ? 'Syncing…' : 'Sync Now'}
          </Button>
        </div>

        {/* Last sync details */}
        {lastSync && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total', value: lastSync.records_total },
              { label: 'Added', value: lastSync.records_added },
              { label: 'Updated', value: lastSync.records_updated },
              { label: 'Unchanged', value: lastSync.records_skipped },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-slate-200">{value}</p>
                <p className="text-xs text-slate-600 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Result message */}
        {result && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${result.success ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-red-950 text-red-400 border border-red-900'}`}>
            {result.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {result.message}
          </div>
        )}

        {/* Error display */}
        {lastSync?.status === 'error' && lastSync.error_message && (
          <div className="bg-red-950/50 border border-red-900 rounded-lg p-3 text-xs text-red-400 font-mono">
            {lastSync.error_message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
