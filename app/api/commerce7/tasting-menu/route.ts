import { NextRequest, NextResponse } from 'next/server';

function credentials() {
  const appId = process.env.COMMERCE7_APP_ID;
  const secret = process.env.COMMERCE7_APP_SECRET;
  const tenant = process.env.COMMERCE7_TENANT_ID;
  if (!appId || !secret || !tenant) return null;
  return { tenant, auth: `Basic ${Buffer.from(`${appId}:${secret}`).toString('base64')}` };
}

export async function POST(request: NextRequest) {
  const creds = credentials();
  if (!creds) return NextResponse.json({ error: 'Commerce7 is not configured' }, { status: 503 });
  const body = await request.json() as { changes?: Array<{ commerce7Id: string; onTastingMenu: boolean }> };
  const changes = body.changes || [];
  const headers = { Authorization: creds.auth, tenant: creds.tenant, 'Content-Type': 'application/json' };

  try {
    for (const change of changes) {
      const url = `https://api.commerce7.com/v1/product/${encodeURIComponent(change.commerce7Id)}`;
      const currentResponse = await fetch(url, { headers, cache: 'no-store' });
      if (!currentResponse.ok) throw new Error(`Unable to load product ${change.commerce7Id}`);
      const current = await currentResponse.json() as { product?: { metaData?: Record<string, unknown> | null } };
      const metaData = { ...(current.product?.metaData || {}), tech_on_tasting_menu: change.onTastingMenu ? 'true' : 'false' };
      const updateResponse = await fetch(url, { method: 'PUT', headers, body: JSON.stringify({ metaData }), cache: 'no-store' });
      if (!updateResponse.ok) throw new Error(`Unable to update tasting-menu flag for ${change.commerce7Id}`);
    }
    return NextResponse.json({ ok: true, updated: changes.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save tasting menu' }, { status: 502 });
  }
}
