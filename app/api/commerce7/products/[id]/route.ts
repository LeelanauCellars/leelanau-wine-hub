import { NextRequest, NextResponse } from 'next/server';
import type { WineRecord } from '@/lib/types';

type ProductResponse = { product?: { metaData?: Record<string, unknown> | null } };

function credentials() {
  const appId = process.env.COMMERCE7_APP_ID;
  const secret = process.env.COMMERCE7_APP_SECRET;
  const tenant = process.env.COMMERCE7_TENANT_ID;
  if (!appId || !secret || !tenant) return null;
  return { tenant, auth: `Basic ${Buffer.from(`${appId}:${secret}`).toString('base64')}` };
}

const metadataPatch = (wine: WineRecord) => ({
  tech_abv: wine.abv || '',
  tech_rs: wine.rs || '',
  tech_ta: wine.ta || '',
  tech_ph: wine.ph || '',
  tech_case_pack: wine.casePack || '',
  tech_cases_produced: wine.casesProduced || '',
  tech_sweetness: wine.sweetness || '',
  tech_tasting_notes: wine.tastingNotes || '',
  tech_short_description: wine.shortDescription || '',
  tech_staff_pitch: wine.staffPitch || '',
  tech_pairings: wine.pairings || '',
  tech_highlights: (wine.highlights || []).join('\n'),
  production_notes: wine.productionNotes || '',
  vineyard_notes: wine.vineyardNotes || '',
  tech_awards_json: JSON.stringify(wine.awards || []),
  tech_on_tasting_menu: wine.onTastingMenu ? 'true' : 'false',
});

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const creds = credentials();
  if (!creds) return NextResponse.json({ error: 'Commerce7 is not configured' }, { status: 503 });

  const { id } = await context.params;
  const wine = await request.json() as WineRecord;
  const headers = {
    Authorization: creds.auth,
    tenant: creds.tenant,
    'Content-Type': 'application/json',
  };

  try {
    const existingResponse = await fetch(`https://api.commerce7.com/v1/product/${encodeURIComponent(id)}`, {
      headers,
      cache: 'no-store',
    });
    if (!existingResponse.ok) throw new Error(`Unable to load product before update (${existingResponse.status})`);
    const existing = await existingResponse.json() as ProductResponse;
    const metaData = { ...(existing.product?.metaData || {}), ...metadataPatch(wine) };

    const updateResponse = await fetch(`https://api.commerce7.com/v1/product/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ metaData }),
      cache: 'no-store',
    });
    if (!updateResponse.ok) {
      const body = await updateResponse.text();
      throw new Error(`Commerce7 update failed (${updateResponse.status}): ${body.slice(0, 250)}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update Commerce7' }, { status: 502 });
  }
}
