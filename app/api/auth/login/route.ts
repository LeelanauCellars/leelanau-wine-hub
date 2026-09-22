import { NextRequest, NextResponse } from 'next/server';
import { authConfigured, makeSessionToken, pinAccessEnabled, roleForPin, sessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  if (!pinAccessEnabled()) {
    return NextResponse.json({ error: 'PIN access is currently disabled.', configured: false }, { status: 409 });
  }

  if (!authConfigured()) {
    return NextResponse.json({ error: 'PIN access is not configured yet.', configured: false }, { status: 503 });
  }

  const body = await request.json().catch(() => ({})) as { pin?: string };
  const pin = String(body.pin || '').trim();
  const role = roleForPin(pin);
  if (!role) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return NextResponse.json({ error: 'That PIN is not recognized.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, role, configured: true });
  response.cookies.set(sessionCookie(makeSessionToken(role)));
  return response;
}
