import cron from 'node-cron';
import { runSync } from './sync';

const INTERVAL_MINUTES = parseInt(process.env.SYNC_INTERVAL_MINUTES || '5', 10);

export function startScheduler() {
  const g = global as { __syncSchedulerStarted?: boolean };
  if (g.__syncSchedulerStarted) return;
  g.__syncSchedulerStarted = true;

  const cronExpr = `*/${INTERVAL_MINUTES} * * * *`;

  console.log(`[Scheduler] Starting sync scheduler (every ${INTERVAL_MINUTES} min)`);

  cron.schedule(cronExpr, async () => {
    console.log('[Scheduler] Running scheduled sync...');
    const result = await runSync('scheduler');
    if (result.success) {
      console.log(`[Scheduler] Sync complete — added:${result.added} updated:${result.updated} skipped:${result.skipped}`);
    } else {
      console.error('[Scheduler] Sync failed:', result.error);
    }
  });
}
