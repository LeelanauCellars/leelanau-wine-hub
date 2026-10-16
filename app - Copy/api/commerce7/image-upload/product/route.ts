import { NextRequest, NextResponse } from 'next/server';
import { sessionRole } from '@/lib/auth';
import { commerce7Config, fetchCommerce7Products } from '@/lib/commerce7-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type C7Variant = {
  id?: string | null;
  title?: string | null;
  sku?: string | null;
  upcCode?: string | null;
};

type C7Product = {
  id: string;
  title?: string | null;
  type?: string | null;
  image?: string | null;
  images?: { src?: string | null; sortOrder?: number | null }[] | null;
  adminStatus?: string | null;
  webStatus?: string | null;
  variants?: C7Variant[] | null;
};

const digits = (value = '') => value.replace(/\D/g, '');
const skuKey = (value = '') => value.trim().toLowerCase();

export async function GET(request: NextRequest) {
  const role = await sessionRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (role !== 'admin' && role !== 'tasting') return NextResponse.json({ error: 'Image Upload to Commerce7 is available to Admin and Tasting Room access.' }, { status: 403 });
  if (!commerce7Config().configured) return NextResponse.json({ error: 'Commerce7 is not configured.' }, { status: 503 });

  const query = String(request.nextUrl.searchParams.get('q') || '').trim();
  if (!query) return NextResponse.json({ error: 'Enter a SKU or UPC.' }, { status: 400 });

  try {
    const { products } = await fetchCommerce7Products<C7Product>({ adminStatus: null, limit: 50, maxPages: 100 });
    const wantedSku = skuKey(query);
    const wantedUpc = digits(query);
    const matches: Array<{
      productId: string;
      productTitle: string;
      productType: string;
      productImage?: string;
      adminStatus?: string;
      webStatus?: string;
      variantId?: string;
      variantTitle?: string;
      sku?: string;
      upc?: string;
    }> = [];

    for (const product of products) {
      const variants = product.variants?.length ? product.variants : [{}];
      for (const variant of variants) {
        const sku = String(variant.sku || '').trim();
        const upc = String(variant.upcCode || '').trim();
        const skuMatch = Boolean(sku && wantedSku && skuKey(sku) === wantedSku);
        const upcMatch = Boolean(upc && wantedUpc && digits(upc) === wantedUpc);
        if (!skuMatch && !upcMatch) continue;
        const orderedImages = (product.images || [])
          .filter((image) => Boolean(image.src))
          .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
        matches.push({
          productId: product.id,
          productTitle: String(product.title || 'Untitled Product'),
          productType: String(product.type || 'Product'),
          productImage: orderedImages[0]?.src || product.image || undefined,
          adminStatus: product.adminStatus || undefined,
          webStatus: product.webStatus || undefined,
          variantId: variant.id || undefined,
          variantTitle: variant.title || undefined,
          sku: sku || undefined,
          upc: upc || undefined,
        });
      }
    }

    return NextResponse.json({ query, matches, count: matches.length });
  } catch (error) {
    console.error('Commerce7 image product lookup failed', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to search Commerce7 products.' }, { status: 502 });
  }
}
