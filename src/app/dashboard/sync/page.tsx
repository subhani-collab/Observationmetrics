import { getSyncLogs, getLastSuccessfulSync, getCurrentSyncStatus } from '@/lib/db';
import { SyncPanel } from '@/components/sync/SyncPanel';
import { SyncLogTable } from '@/components/sync/SyncLogTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Topbar } from '@/components/layout/Topbar';

export const dynamic = 'force-dynamic';

export default function SyncPage() {
  const logs = getSyncLogs(100);
  const lastSync = getLastSuccessfulSync() || null;
  const currentStatus = getCurrentSyncStatus() || null;
  const intervalMinutes = parseInt(process.env.SYNC_INTERVAL_MINUTES || '5', 10);

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Sync & Logs" subtitle="Google Sheets synchronization status and history" />

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Setup guide (shown when no credentials) */}
        {!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && (
          <div className="bg-amber-950/50 border border-amber-900 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-amber-400 mb-2">⚠️ Google Sheets not configured</h3>
            <ol className="text-xs text-amber-300/80 space-y-1 list-decimal list-inside">
              <li>Create a Google Cloud project and enable the Sheets API</li>
              <li>Create a Service Account and download the JSON key</li>
              <li>Share the Google Sheet with the service account email (Viewer)</li>
              <li>Add <code className="bg-amber-950 px-1 rounded">GOOGLE_SERVICE_ACCOUNT_EMAIL</code> and <code className="bg-amber-950 px-1 rounded">GOOGLE_PRIVATE_KEY</code> to your <code className="bg-amber-950 px-1 rounded">.env.local</code></li>
            </ol>
          </div>
        )}

        <SyncPanel
          lastSync={lastSync}
          currentStatus={currentStatus}
          intervalMinutes={intervalMinutes}
        />

        <Card>
          <CardHeader>
            <CardTitle>Sync History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <SyncLogTable logs={logs} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
