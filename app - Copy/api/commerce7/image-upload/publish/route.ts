import { NextRequest, NextResponse } from 'next/server';
import { sessionRole } from '@/lib/auth';
import { commerce7Config } from '@/lib/commerce7-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function allowedRole(role: string | null): role is 'admin' | 'tasting' {
  return role === 'admin' || role === 'tasting';
}

export async function POST(request: NextRequest) {
  const role = await sessionRole();
  if (!allowedRole(role)) return NextResponse.json({ error: role ? 'Image Upload to Commerce7 is available to Admin and Tasting Room access.' : 'Unauthorized' }, { status: role ? 403 : 401 });

  const { productId, imageUrl } = await request.json().catch(() => ({})) as { productId?: string; imageUrl?: string };
  if (!productId || !imageUrl) return NextResponse.json({ error: 'Choose a Commerce7 product and process an image first.' }, { status: 400 });
  if (!/^https:\/\//i.test(imageUrl)) return NextResponse.json({ error: 'The processed image must be hosted at a secure public URL.' }, { status: 400 });

  const { appId, secret, tenant, configured } = commerce7Config();
  if (!configured) return NextResponse.json({ error: 'Commerce7 is not configured.' }, { status: 503 });
  const auth = Buffer.from(`${appId}:${secret}`).toString('base64');

  try {
    const response = await fetch(`https://api.commerce7.com/v1/product/${encodeURIComponent(productId)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Basic ${auth}`,
        tenant,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageUrl }),
      cache: 'no-store',
    });
    const raw = await response.text();
    let payload: unknown = null;
    try { payload = raw ? JSON.parse(raw) : null; } catch { payload = raw; }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ error: 'Commerce7 rejected the image update. The Central app needs Product → Full access (not only Read) before it can publish product images.' }, { status: 403 });
      }
      return NextResponse.json({ error: `Commerce7 returned ${response.status}: ${raw.slice(0, 300)}` }, { status: 502 });
    }

    const product = (payload && typeof payload === 'object' && 'product' in payload ? (payload as { product?: { image?: string | null } }).product : payload) as { image?: string | null } | null;
    const confirmed = product?.image === imageUrl;
    return NextResponse.json({
      ok: true,
      confirmed,
      imageUrl,
      message: confirmed
        ? 'Commerce7 confirmed the new primary product image.'
        : 'Commerce7 accepted the update. Refresh the Commerce7 product to confirm the primary image changed.',
    });
  } catch (error) {
    console.error('Commerce7 product image publish failed', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to publish the image to Commerce7.' }, { status: 502 });
  }
}
