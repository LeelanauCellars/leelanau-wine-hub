import { NextResponse } from 'next/server';
import type { WineRecord } from '@/lib/types';
import { loadCurrentWebsiteAwards, matchWebsiteAwards } from '@/lib/website-awards';

type C7Variant = {
  upcCode?: string | null;
  volumeInML?: number | null;
  price?: number | null;
  title?: string | null;
  alcoholPercentage?: number | null;
};

type C7Product = {
  id: string;
  title: string;
  image?: string | null;
  teaser?: string | null;
  content?: string | null;
  type?: string | null;
  webStatus?: string | null;
  adminStatus?: string | null;
  slug?: string | null;
  updatedAt?: string | null;
  metaData?: Record<string, unknown> | null;
  wine?: {
    type?: string | null;
    varietal?: string | null;
    region?: string | null;
    appellation?: string | null;
    vintage?: number | null;
  } | null;
  variants?: C7Variant[] | null;
  collections?: { title?: string | null }[] | null;
};

const stripHtml = (html = '') => html
  .replace(/<br\s*\/?\s*>/gi, '\n')
  .replace(/<\/p>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#39;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/\s+\n/g, '\n')
  .replace(/\n\s+/g, '\n')
  .replace(/[ \t]{2,}/g, ' ')
  .trim();

const metaValue = (meta: Record<string, unknown> | null | undefined, aliases: string[]) => {
  if (!meta) return '';
  const normalized = new Map(Object.entries(meta).map(([key, value]) => [key.toLowerCase().replace(/[^a-z0-9]/g, ''), value]));
  for (const alias of aliases) {
    const value = normalized.get(alias.toLowerCase().replace(/[^a-z0-9]/g, ''));
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }
  return '';
};

const booleanMeta = (meta: Record<string, unknown> | null | undefined, aliases: string[]) => {
  const value = metaValue(meta, aliases).toLowerCase();
  if (!value) return undefined;
  return ['true', 'yes', '1', 'on'].includes(value);
};

const awardsMeta = (meta: Record<string, unknown> | null | undefined) => {
  const value = metaValue(meta, ['tech_awards_json', 'awards_json']);
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const htmlToLines = (html = '') => html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<br\s*\/?\s*>/gi, '\n')
  .replace(/<\/(p|li|div|h[1-6])>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&quot;/g, '"')
  .split('\n')
  .map((line) => line.replace(/[ \t]{2,}/g, ' ').trim())
  .filter(Boolean);

const inferBrand = (product: C7Product, meta: Record<string, unknown> | null | undefined) => {
  const explicit = metaValue(meta, ['brand', 'tech_brand']);
  if (explicit) return explicit;
  const haystack = [product.title, ...(product.collections || []).map((collection) => collection.title || '')].join(' ').toLowerCase();
  if (haystack.includes('farm fresh')) return 'Farm Fresh';
  if (haystack.includes('country crush')) return 'Country Crush';
  if (haystack.includes('zilly')) return 'Zilly';
  if (haystack.includes('lakeshore farms')) return 'Lakeshore Farms';
  return 'Leelanau Cellars';
};

const formatAbv = (value?: number | null) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return '';
  const numeric = Number(value);
  return `${Number.isInteger(numeric) ? numeric.toFixed(0) : numeric.toFixed(1).replace(/\.0$/, '')}%`;
};

const toWine = (product: C7Product, websiteAwards: Awaited<ReturnType<typeof loadCurrentWebsiteAwards>>): WineRecord => {
  const variant = product.variants?.[0] ?? {};
  const meta = product.metaData;
  const teaser = stripHtml(product.teaser ?? '');
  const content = stripHtml(product.content ?? '');
  const contentLines = htmlToLines(product.content ?? '');
  const price = typeof variant.price === 'number' ? variant.price / 100 : undefined;
  const vintage = product.wine?.vintage ? String(product.wine.vintage) : 'NV';
  const category = product.wine?.type || product.type || 'Wine';

  return {
    id: `c7-${product.id}`,
    commerce7Id: product.id,
    source: 'commerce7',
    name: product.title,
    vintage,
    brand: inferBrand(product, meta),
    category,
    collection: product.collections?.[0]?.title || undefined,
    status: product.webStatus === 'Retired' ? 'Retired' : product.webStatus === 'Available' ? 'Available' : 'Not Available',
    varietal: product.wine?.varietal || undefined,
    appellation: product.wine?.appellation || undefined,
    region: product.wine?.region || undefined,
    bottleImage: product.image || undefined,
    productUrl: product.slug ? `https://www.lwc.wine/product/${product.slug}/` : undefined,
    price,
    upc: variant.upcCode || undefined,
    volumeMl: variant.volumeInML || undefined,
    abv: formatAbv(variant.alcoholPercentage) || metaValue(meta, ['abv', 'alcohol', 'alcohol_by_volume', 'tech_abv']) || undefined,
    rs: metaValue(meta, ['rs', 'residual_sugar', 'tech_rs']) || undefined,
    ta: metaValue(meta, ['ta', 'total_acidity', 'tech_ta']) || undefined,
    ph: metaValue(meta, ['ph', 'tech_ph']) || undefined,
    casePack: metaValue(meta, ['case_pack', 'case_size', 'casepack', 'tech_case_pack']) || undefined,
    casesProduced: metaValue(meta, ['cases_produced', 'casesproduced', 'tech_cases_produced']) || undefined,
    sweetness: metaValue(meta, ['sweetness', 'sweetness_level', 'style', 'tech_sweetness']) || undefined,
    tastingNotes: metaValue(meta, ['tasting_notes', 'tastingnotes', 'tech_tasting_notes']) || teaser || contentLines[0] || content,
    shortDescription: metaValue(meta, ['short_description', 'quick_description', 'tech_short_description']) || teaser || contentLines[0]?.slice(0, 180) || content.slice(0, 180),
    staffPitch: metaValue(meta, ['staff_pitch', 'customer_pitch', 'tech_staff_pitch']),
    pairings: metaValue(meta, ['pairings', 'food_pairings', 'tech_pairings']),
    highlights: (() => {
      const manual = metaValue(meta, ['highlights', 'sales_highlights', 'tech_highlights'])
        .split(/\n|\|/)
        .map((value) => value.trim())
        .filter(Boolean);
      if (manual.length) return manual;
      if (contentLines.length) return contentLines.slice(0, 5);
      return teaser ? [teaser] : [];
    })(),
    productionNotes: metaValue(meta, ['production_notes', 'winemaker_notes']) || undefined,
    vineyardNotes: metaValue(meta, ['vineyard_notes', 'vintage_notes']) || undefined,
    awards: (() => { const saved = awardsMeta(meta); const website = matchWebsiteAwards(product.title, vintage, inferBrand(product, meta), websiteAwards); const combined = [...website, ...saved]; return combined.filter((award, index) => combined.findIndex((candidate) => candidate.year === award.year && candidate.competition === award.competition && candidate.result === award.result) === index); })(),
    onTastingMenu: booleanMeta(meta, ['tech_on_tasting_menu', 'on_tasting_menu']),
    updatedAt: product.updatedAt || new Date().toISOString(),
  };
};

export async function GET() {
  const appId = process.env.COMMERCE7_APP_ID;
  const secret = process.env.COMMERCE7_APP_SECRET;
  const tenant = process.env.COMMERCE7_TENANT_ID;

  if (!appId || !secret || !tenant) {
    return NextResponse.json(
      { error: 'Commerce7 is not configured', configured: false },
      { status: 503 },
    );
  }

  const auth = Buffer.from(`${appId}:${secret}`).toString('base64');
  const products: C7Product[] = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  try {
    while (products.length < total && page <= 100) {
      const response = await fetch(`https://api.commerce7.com/v1/product?page=${page}&limit=50&adminStatus=Available`, {
        headers: {
          Authorization: `Basic ${auth}`,
          tenant,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(`Commerce7 returned ${response.status}: ${message.slice(0, 250)}`);
      }

      const data = await response.json() as { products?: C7Product[]; total?: number };
      const batch = data.products ?? [];
      products.push(...batch);
      total = data.total ?? products.length;
      if (!batch.length) break;
      page += 1;
    }

    const websiteAwards = await loadCurrentWebsiteAwards();
    const wines = products
      .filter((product) => product.type === 'Wine')
      .map((product) => toWine(product, websiteAwards))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ configured: true, wines, total: wines.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load Commerce7 products', configured: true },
      { status: 502 },
    );
  }
}
