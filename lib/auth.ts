import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export type AccessRole = 'admin' | 'sales' | 'tasting';

const COOKIE_NAME = 'lwc_wine_hub_session';
const SESSION_SECONDS = 60 * 60 * 24 * 30;

export function pinAccessEnabled() {
  return process.env.WINE_HUB_PIN_ACCESS?.trim().toLowerCase() === 'true';
}

function authSecret() {
  return process.env.WINE_HUB_AUTH_SECRET?.trim() || '';
}

export function authConfigured() {
  if (!pinAccessEnabled()) return false;
  return Boolean(
    authSecret() &&
    process.env.WINE_HUB_ADMIN_PIN?.trim() &&
    process.env.WINE_HUB_SALES_PIN?.trim() &&
    process.env.WINE_HUB_TASTING_PIN?.trim(),
  );
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function roleForPin(pin: string): AccessRole | null {
  const candidates: Array<[AccessRole, string | undefined]> = [
    ['admin', process.env.WINE_HUB_ADMIN_PIN],
    ['sales', process.env.WINE_HUB_SALES_PIN],
    ['tasting', process.env.WINE_HUB_TASTING_PIN],
  ];
  for (const [role, configuredPin] of candidates) {
    if (configuredPin?.trim() && safeEqual(pin, configuredPin.trim())) return role;
  }
  return null;
}

function sign(payload: string) {
  return createHmac('sha256', authSecret()).update(payload).digest('base64url');
}

export function makeSessionToken(role: AccessRole) {
  const payload = Buffer.from(JSON.stringify({ role, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string | null): AccessRole | null {
  if (!token || !authSecret()) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { role?: AccessRole; exp?: number };
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    if (!['admin', 'sales', 'tasting'].includes(parsed.role || '')) return null;
    return parsed.role as AccessRole;
  } catch {
    return null;
  }
}

export async function sessionRole() {
  // During the build phase PIN access is disabled by default, so the hub opens
  // with full Admin access. Set WINE_HUB_PIN_ACCESS=true later to turn the
  // role-based PIN gate back on without rebuilding the authorization model.
  if (!pinAccessEnabled()) return 'admin' as const;
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export function sessionCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_SECONDS,
  };
}

export function clearedSessionCookie() {
  return {
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };
}
