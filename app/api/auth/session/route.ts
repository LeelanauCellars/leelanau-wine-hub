import { NextResponse } from 'next/server';
import { authConfigured, pinAccessEnabled, sessionRole } from '@/lib/auth';

export async function GET() {
  return NextResponse.json({ enabled: pinAccessEnabled(), configured: authConfigured(), role: await sessionRole() });
}
