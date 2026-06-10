import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getEmployee } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const emp = getEmployee(params.id);
  if (!emp) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(emp);
}
