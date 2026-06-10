import { fetchSheetData } from './sheets';
import {
  createSyncLog, completeSyncLog, upsertEmployee, addAuditLog,
} from './db';

export interface SyncResult {
  success: boolean;
  added: number;
  updated: number;
  skipped: number;
  total: number;
  error?: string;
}

export async function runSync(triggeredBy: 'scheduler' | 'manual' = 'scheduler', userEmail?: string): Promise<SyncResult> {
  const logId = createSyncLog(triggeredBy);

  if (userEmail) {
    addAuditLog(userEmail, 'sync_started', `Triggered by ${triggeredBy}`);
  }

  try {
    const rows = await fetchSheetData();

    let added = 0;
    let updated = 0;
    let skipped = 0;

    for (const emp of rows) {
      const result = upsertEmployee(emp);
      if (result === 'inserted') added++;
      else if (result === 'updated') updated++;
      else skipped++;
    }

    completeSyncLog(logId, 'success', { total: rows.length, added, updated, skipped });

    if (userEmail) {
      addAuditLog(userEmail, 'sync_completed', `Added:${added} Updated:${updated} Skipped:${skipped}`);
    }

    return { success: true, added, updated, skipped, total: rows.length };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    completeSyncLog(logId, 'error', { total: 0, added: 0, updated: 0, skipped: 0 }, msg);

    if (userEmail) {
      addAuditLog(userEmail, 'sync_error', msg);
    }

    return { success: false, added: 0, updated: 0, skipped: 0, total: 0, error: msg };
  }
}
