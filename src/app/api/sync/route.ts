import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { runSync } from '@/lib/sync';
import { getCurrentSyncStatus } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const current = getCurrentSyncStatus();
  if (current) {
    return NextResponse.json({ error: 'Sync already in progress' }, { status: 409 });
  }

  const result = await runSync('manual', session.user.email);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    added: result.added,
    updated: result.updated,
    skipped: result.skipped,
    total: result.total,
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const current = getCurrentSyncStatus();
  return NextResponse.json({ running: !!current, current });
}
