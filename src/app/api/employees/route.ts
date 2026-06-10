import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getEmployees } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const s = req.nextUrl.searchParams;
  const result = getEmployees({
    search: s.get('search') || undefined,
    manager: s.get('manager') || undefined,
    month: s.get('month') || undefined,
    year: s.get('year') || undefined,
    sortBy: (s.get('sortBy') as never) || undefined,
    sortDir: (s.get('sortDir') as 'asc' | 'desc') || 'desc',
    page: s.get('page') ? parseInt(s.get('page')!, 10) : 1,
    pageSize: s.get('pageSize') ? parseInt(s.get('pageSize')!, 10) : 25,
  });

  return NextResponse.json(result);
}
