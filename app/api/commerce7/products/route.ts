import { NextResponse } from 'next/server';
import type { WineRecord } from '@/lib/types';
import { loadCurrentWebsiteAwards, matchWebsiteAwards } from '@/lib/website-awards';
import { sessionRole } from '@/lib/auth';

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
  images?: { id?: string | null; src?: string | null; sortOrder?: number | null }[] | null;
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

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: ' ', amp: '&', apos: "'", quot: '"', lt: '<', gt: '>',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“',
  ndash: '–', mdash: '—', hellip: '…', middot: '·', bull: '•',
  uuml: 'ü', Uuml: 'Ü', ouml: 'ö', Ouml: 'Ö', auml: 'ä', Auml: 'Ä',
  eacute: 'é', Eacute: 'É', agrave: 'à', Agrave: 'À',
  reg: '®', trade: '™', copy: '©', deg: '°', times: '×',
};

const decodeHtmlEntities = (value = '') => value.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]+);/gi, (match, entity: string) => {
  if (entity[0] === '#') {
    const isHex = entity[1]?.toLowerCase() === 'x';
    const parsed = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
    if (Number.isFinite(parsed)) {
      try { return String.fromCodePoint(parsed); } catch { return match; }
    }
    return match;
  }
  return NAMED_ENTITIES[entity] ?? NAMED_ENTITIES[entity.toLowerCase()] ?? match;
});

const cleanInline = (value = '') => decodeHtmlEntities(value)
  .replace(/<[^>]+>/g, ' ')
  .replace(/\u00a0/g, ' ')
  .replace(/[ \t]{2,}/g, ' ')
  .trim();

const stripHtml = (html = '') => decodeHtmlEntities(html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<br\s*\/?\s*>/gi, '\n')
  .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
  .replace(/<[^>]+>/g, ' '))
  .replace(/\u00a0/g, ' ')
  .replace(/\s+\n/g, '\n')
  .replace(/\n\s+/g, '\n')
  .replace(/[ \t]{2,}/g, ' ')
  .trim();

const htmlToLines = (html = '') => decodeHtmlEntities(html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<br\s*\/?\s*>/gi, '\n')
  .replace(/<\/(p|li|div|h[1-6]|ul|ol)>/gi, '\n')
  .replace(/<[^>]+>/g, ' '))
  .split('\n')
  .map((line) => line.replace(/\u00a0/g, ' ').replace(/[ \t]{2,}/g, ' ').trim())
  .filter(Boolean);

const htmlToParagraphs = (html = '') => {
  const paragraphs = Array.from(html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi))
    .map((match) => cleanInline(match[1]))
    .filter(Boolean);
  if (paragraphs.length) return paragraphs;
  return htmlToLines(html).filter((line) => line.length > 25);
};

const normalizeHeading = (value = '') => decodeHtmlEntities(value)
  .toLowerCase()
  .replace(/[’‘']/g, '')
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const HIGHLIGHT_HEADINGS = [
  'why youll love it', 'why you will love it', 'why we love it', 'what youll love',
  'highlights', 'the difference', 'the craft', 'what makes it special',
  'why it works', 'what makes this wine special', 'reasons to love it',
];

const STOP_HEADINGS = [
  ...HIGHLIGHT_HEADINGS,
  'tasting notes', 'tasting note', 'aroma', 'palate', 'finish', 'serving tip',
  'serving tips', 'food pairing', 'food pairings', 'pairings', 'wine specs',
  'wine specifications', 'technical notes', 'production notes', 'vineyard notes',
  'details', 'about', 'awards', 'award',
];

const headingMatches = (line: string, options: string[]) => {
  const normalized = normalizeHeading(line);
  return options.some((option) => normalized === option || normalized.startsWith(`${option} `));
};

const extractHighlights = (html: string, firstParagraph: string) => {
  const lines = htmlToLines(html);
  const start = lines.findIndex((line) => headingMatches(line, HIGHLIGHT_HEADINGS));
  if (start >= 0) {
    const result: string[] = [];
    for (let index = start + 1; index < lines.length; index += 1) {
      const line = lines[index];
      if (headingMatches(line, STOP_HEADINGS)) break;
      if (line && line !== firstParagraph) result.push(line);
      if (result.length >= 6) break;
    }
    if (result.length) return result;
  }

  // If the description is not sectioned, use the paragraphs after the opening paragraph.
  const paragraphs = htmlToParagraphs(html).filter((paragraph) => paragraph !== firstParagraph);
  if (paragraphs.length) return paragraphs.slice(0, 4);

  return lines
    .filter((line) => line !== firstParagraph && !headingMatches(line, STOP_HEADINGS))
    .slice(0, 4);
};

const metaValue = (meta: Record<string, unknown> | null | undefined, aliases: string[]) => {
  if (!meta) return '';
  const normalized = new Map(Object.entries(meta).map(([key, value]) => [key.toLowerCase().replace(/[^a-z0-9]/g, ''), value]));
  for (const alias of aliases) {
    const value = normalized.get(alias.toLowerCase().replace(/[^a-z0-9]/g, ''));
    if (value !== undefined && value !== null && String(value).trim()) return decodeHtmlEntities(String(value).trim());
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
  const contentParagraphs = htmlToParagraphs(product.content ?? '');
  const firstParagraph = contentParagraphs[0] || htmlToLines(product.content ?? '')[0] || content;
  const price = typeof variant.price === 'number' ? variant.price / 100 : undefined;
  const vintage = product.wine?.vintage ? String(product.wine.vintage) : 'NV';
  const category = product.wine?.type || product.type || 'Wine';
  const brand = inferBrand(product, meta);
  const orderedImages = (product.images || [])
    .filter((image) => Boolean(image?.src))
    .map((image, index) => ({
      id: image.id || `image-${product.id}-${index}`,
      src: image.src as string,
      sortOrder: typeof image.sortOrder === 'number' ? image.sortOrder : index,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  if (!orderedImages.length && product.image) orderedImages.push({ id: `image-${product.id}-primary`, src: product.image, sortOrder: 0 });
  const imageAssets = orderedImages.map((image, index) => {
    const fileHint = image.src.toLowerCase();
    const isBack = /(?:^|[-_./])(back|rear)(?:[-_./]|$)/.test(fileHint);
    return {
      ...image,
      role: (index === 0 ? 'front' : (isBack || index === 1 ? 'back' : 'additional')) as 'front' | 'back' | 'additional',
    };
  });

  return {
    id: `c7-${product.id}`,
    commerce7Id: product.id,
    source: 'commerce7',
    name: decodeHtmlEntities(product.title),
    vintage,
    brand,
    category,
    collection: product.collections?.[0]?.title ? decodeHtmlEntities(product.collections[0].title || '') : undefined,
    status: product.webStatus === 'Retired' ? 'Retired' : product.webStatus === 'Available' ? 'Available' : 'Not Available',
    varietal: product.wine?.varietal ? decodeHtmlEntities(product.wine.varietal) : undefined,
    appellation: product.wine?.appellation ? decodeHtmlEntities(product.wine.appellation) : undefined,
    region: product.wine?.region ? decodeHtmlEntities(product.wine.region) : undefined,
    bottleImage: imageAssets[0]?.src || product.image || undefined,
    imageAssets,
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
    // Master custom fields win. Otherwise the first real paragraph of the Commerce7 description is the tasting note.
    tastingNotes: metaValue(meta, ['tasting_notes', 'tastingnotes', 'tech_tasting_notes']) || firstParagraph || teaser || content,
    shortDescription: metaValue(meta, ['short_description', 'quick_description', 'tech_short_description']) || firstParagraph || teaser || content.slice(0, 240),
    staffPitch: metaValue(meta, ['staff_pitch', 'customer_pitch', 'tech_staff_pitch']),
    pairings: metaValue(meta, ['pairings', 'food_pairings', 'tech_pairings']),
    highlights: (() => {
      const manual = metaValue(meta, ['highlights', 'sales_highlights', 'tech_highlights'])
        .split(/\n|\|/)
        .map((value) => value.trim())
        .filter(Boolean);
      if (manual.length) return manual;
      return extractHighlights(product.content ?? '', firstParagraph);
    })(),
    commerce7CopyLines: htmlToLines(product.content ?? ''),
    productionNotes: metaValue(meta, ['production_notes', 'winemaker_notes']) || undefined,
    vineyardNotes: metaValue(meta, ['vineyard_notes', 'vintage_notes']) || undefined,
    awards: (() => {
      const saved = awardsMeta(meta);
      const website = matchWebsiteAwards(product.title, vintage, brand, websiteAwards);
      const combined = [...website, ...saved];
      return combined.filter((award, index) => combined.findIndex((candidate) => candidate.year === award.year && candidate.competition === award.competition && candidate.result === award.result) === index);
    })(),
    onTastingMenu: booleanMeta(meta, ['tech_on_tasting_menu', 'on_tasting_menu']),
    updatedAt: product.updatedAt || new Date().toISOString(),
  };
};

export async function GET() {
  if (!await sessionRole()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      // 2023 Leelanau Cellars Pinot Grigio is a retired historical product that
      // should not return to the current Wine Hub just because it has an award.
      .filter((wine) => !(wine.brand === 'Leelanau Cellars' && wine.name.trim().toLowerCase() === 'pinot grigio' && wine.vintage === '2023'))
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
