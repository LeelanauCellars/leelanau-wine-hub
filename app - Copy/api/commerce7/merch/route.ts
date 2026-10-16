import { NextResponse } from 'next/server';
import { sessionRole } from '@/lib/auth';
import { commerce7Config, fetchCommerce7Products } from '@/lib/commerce7-server';
import type { MerchCategory, MerchProduct, MerchVariant } from '@/lib/merch-types';

type C7Image = { src?: string | null; sortOrder?: number | null };
type C7Variant = {
  id?: string | null;
  title?: string | null;
  name?: string | null;
  sku?: string | null;
  upcCode?: string | null;
  price?: number | null;
  inventory?: unknown;
  inventoryQuantity?: number | null;
  inventoryCount?: number | null;
  availableQuantity?: number | null;
  quantity?: number | null;
};
type C7Product = {
  id: string;
  title?: string | null;
  image?: string | null;
  images?: C7Image[] | null;
  type?: string | null;
  adminStatus?: string | null;
  webStatus?: string | null;
  collections?: { title?: string | null }[] | null;
  variants?: C7Variant[] | null;
  sku?: string | null;
  upcCode?: string | null;
  price?: number | null;
};

const normalized = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function merchCategory(product: C7Product): MerchCategory {
  const haystack = normalized([product.title, product.type, ...(product.collections || []).map((item) => item.title || '')].filter(Boolean).join(' '));
  if (/hoodie|sweatshirt|crewneck|quarter zip|qtr zip|zip hoodie/.test(haystack)) return 'Hoodies';
  if (/shirt|tee|t shirt|tank|crop top|polo|long sleeve|short sleeve|lsm|crew tee/.test(haystack)) return 'Shirts';
  if (/hat|cap|beanie|visor/.test(haystack)) return 'Hats';
  if (/glass|stemless|mug|tumbler|cup|wine glass/.test(haystack)) return 'Glassware';
  if (/tote|bag|towel|sticker|koozie|keychain|magnet|opener|accessor|flight|tray/.test(haystack)) return 'Accessories';
  return 'Other';
}

function isMerchProduct(product: C7Product) {
  const type = normalized(product.type || '');
  const collection = normalized((product.collections || []).map((item) => item.title || '').join(' '));
  const title = normalized(product.title || '');
  const merchandiseSignal = /general merchandise|merchandise|apparel|merch/.test(type) || /merch|apparel|clothing|glassware|gift shop/.test(collection);
  if (!merchandiseSignal) return false;
  if (/shipping|cancel fee|cancellation|free tasting|tasting fee|club fee|service fee/.test(title)) return false;
  return true;
}

function inventoryValue(variant: C7Variant) {
  const direct = [variant.availableQuantity, variant.inventoryQuantity, variant.inventoryCount, variant.quantity];
  for (const value of direct) if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof variant.inventory === 'number' && Number.isFinite(variant.inventory)) return variant.inventory;
  if (variant.inventory && typeof variant.inventory === 'object') {
    const record = variant.inventory as Record<string, unknown>;
    for (const key of ['available', 'availableQuantity', 'quantity', 'onHand', 'inventory']) {
      const value = record[key];
      if (typeof value === 'number' && Number.isFinite(value)) return value;
    }
  }
  return null;
}

function variantName(variant: C7Variant, index: number) {
  const raw = String(variant.title || variant.name || '').trim();
  if (!raw || /default(?: title)?/i.test(raw)) return index === 0 ? 'One Size' : `Variant ${index + 1}`;
  return raw;
}

function productImages(product: C7Product) {
  const ordered = (product.images || [])
    .filter((image) => Boolean(image?.src))
    .map((image, index) => ({ src: image.src as string, sortOrder: typeof image.sortOrder === 'number' ? image.sortOrder : index }))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => image.src);
  if (!ordered.length && product.image) ordered.push(product.image);
  return Array.from(new Set(ordered));
}

function mapProduct(product: C7Product): MerchProduct {
  const images = productImages(product);
  const sourceVariants = product.variants?.length ? product.variants : [{ id: `${product.id}-default`, title: 'One Size', sku: product.sku, upcCode: product.upcCode, price: product.price }];
  const name = String(product.title || 'Untitled Merchandise').trim();
  const variants: MerchVariant[] = sourceVariants.map((variant, index) => ({
    id: String(variant.id || `${product.id}-variant-${index}`),
    productId: product.id,
    productName: name,
    variantName: variantName(variant, index),
    sku: String(variant.sku || '').trim(),
    // Intentionally preserve Commerce7's exact stored value. No check-digit validation or mutation.
    upcCode: String(variant.upcCode || '').trim(),
    price: typeof variant.price === 'number' ? variant.price / 100 : null,
    inventory: inventoryValue(variant),
  }));

  return {
    id: product.id,
    name,
    image: images[0],
    images,
    type: product.type || undefined,
    collection: product.collections?.[0]?.title || undefined,
    category: merchCategory(product),
    variants,
  };
}

export async function GET() {
  if (!await sessionRole()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!commerce7Config().configured) return NextResponse.json({ error: 'Commerce7 is not configured', configured: false }, { status: 503 });

  try {
    const { products, tenant } = await fetchCommerce7Products<C7Product>();
    const detectedTypes = Array.from(new Set(products.map((product) => product.type || '(blank)').filter(Boolean))).sort();
    const merch = products.filter(isMerchProduct).map(mapProduct).filter((product) => product.variants.length).sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({
      configured: true,
      tenant,
      products: merch,
      totalProducts: merch.length,
      totalVariants: merch.reduce((sum, product) => sum + product.variants.length, 0),
      detectedTypes,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load Commerce7 merchandise', configured: true }, { status: 502 });
  }
}
