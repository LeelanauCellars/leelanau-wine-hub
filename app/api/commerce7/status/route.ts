import { NextResponse } from 'next/server';
import { sessionRole } from '@/lib/auth';

export async function GET() {
  if (!await sessionRole()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const configured = Boolean(
    process.env.COMMERCE7_APP_ID &&
    process.env.COMMERCE7_APP_SECRET &&
    process.env.COMMERCE7_TENANT_ID,
  );

  return NextResponse.json({
    configured,
    tenant: configured ? process.env.COMMERCE7_TENANT_ID : null,
  });
}
