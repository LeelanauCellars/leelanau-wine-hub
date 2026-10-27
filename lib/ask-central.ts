import type { Award } from '@/lib/types';

export type AskPortalRole = 'admin' | 'tasting' | 'sales' | 'distribution';

export type AskWine = {
  id: string;
  name: string;
  vintage?: string;
  brand?: string;
  category?: string;
  collection?: string;
  collections?: string[];
  status?: string;
  varietal?: string;
  appellation?: string;
  region?: string;
  price?: number;
  upc?: string;
  volumeMl?: number;
  abv?: string;
  rs?: string;
  ta?: string;
  ph?: string;
  casePack?: string;
  casesProduced?: string;
  sweetness?: string;
  tastingNotes?: string;
  shortDescription?: string;
  staffPitch?: string;
  pairings?: string;
  highlights?: string[];
  awards?: Award[];
  onTastingMenu?: boolean;
  permalinkSlug?: string;
};

export type AskDistributionWine = {
  id: string;
  name: string;
  family?: string;
  discontinued?: boolean;
  upcFull?: string | null;
  gtin?: string | null;
  meijerPid?: string | null;
  targetDpci?: string | null;
  pricing?: Record<string, number | null | undefined>;
  specs?: {
    size?: string | null;
    glassType?: string | null;
    rs?: string | number | null;
    abv?: string | number | null;
    ph?: string | number | null;
    ta?: string | number | null;
    composition?: string | null;
  };
  marketingCopy?: string | null;
  imperial?: Record<string, string | number | null>;
};

export type AskCentralSource = {
  id: string;
  type: 'wine' | 'catalog' | 'distribution' | 'quick-facts' | 'tasting-menu' | 'case-sales' | 'merch';
  title: string;
  path: string;
  summary: string;
};

const STOP_WORDS = new Set([
  'a','an','and','are','as','at','be','by','can','central','could','do','does','for','from','give','have','how','i','in','info','information','is','it','me','of','on','or','our','product','products','show','tell','that','the','their','there','these','this','to','us','what','when','where','which','who','wine','wines','with','would','you',
]);

export function askSlug(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function askWineSlug(wine: AskWine) {
  const initial = wine.permalinkSlug || wine.id || wine.name;
  return askSlug(initial)
    .replace(/(^|-)(?:19|20)\d{2}(?=-|$)/g, '$1')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function askDistributionSlug(item: AskDistributionWine) {
  return askSlug(`${item.name}${item.specs?.size ? ` ${item.specs.size}` : ''}`);
}

function normalize(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(value = '') {
  return Array.from(new Set(normalize(value).split(' ').filter((token) => token.length > 1 && !STOP_WORDS.has(token))));
}

function numericTokens(value = '') {
  return value.match(/\d{5,}/g) || [];
}

function scoreText(question: string, title: string, body: string) {
  const q = normalize(question);
  const titleN = normalize(title);
  const bodyN = normalize(body);
  let score = 0;
  if (titleN && q.includes(titleN)) score += 40;
  if (q && titleN.includes(q) && q.length > 3) score += 25;
  const titleTokens = titleN.split(' ').filter(Boolean);
  for (const token of tokens(question)) {
    if (titleTokens.includes(token)) score += 8;
    else if (titleN.includes(token)) score += 5;
    else {
      const fuzzyTitle = Math.max(0, ...titleTokens.map((candidate) => fuzzyTokenScore(token, candidate)));
      if (fuzzyTitle >= 0.72) score += 6;
    }
    if (bodyN.includes(token)) score += 1;
  }
  for (const digits of numericTokens(question)) {
    if (`${title} ${body}`.replace(/\D/g, '').includes(digits)) score += 30;
  }
  return score;
}


function levenshtein(a: string, b: string) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const held = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + cost);
      previous = held;
    }
  }
  return row[b.length];
}

function fuzzyTokenScore(queryToken: string, candidateToken: string) {
  if (queryToken === candidateToken) return 1;
  if (queryToken.length < 4 || candidateToken.length < 4) return 0;
  const maxDistance = Math.max(queryToken.length, candidateToken.length) >= 8 ? 2 : 1;
  const distance = levenshtein(queryToken, candidateToken);
  return distance <= maxDistance ? 1 - (distance / Math.max(queryToken.length, candidateToken.length)) : 0;
}

const CATALOG_FILLER = new Set(['wine','wines','collection','collections','brand','brands','category','categories','type','types','products','product']);

function catalogKey(value = '') {
  return normalize(value).split(' ').filter((token) => token.length > 1 && !CATALOG_FILLER.has(token)).join(' ');
}

function phraseMatchScore(question: string, candidate: string) {
  const q = normalize(question);
  const candidateN = normalize(candidate);
  const key = catalogKey(candidate);
  if (!key) return 0;
  if (q.includes(candidateN) || q.includes(key)) return 100;
  const qTokens = q.split(' ').filter(Boolean);
  const cTokens = key.split(' ').filter(Boolean);
  let total = 0;
  for (const cToken of cTokens) {
    let best = 0;
    for (const qToken of qTokens) best = Math.max(best, fuzzyTokenScore(qToken, cToken));
    if (best < 0.72) return 0;
    total += best;
  }
  return Math.round((total / cTokens.length) * 85);
}

export type CatalogFacetMatch = {
  kind: 'collection' | 'brand' | 'category' | 'varietal';
  label: string;
  score: number;
  corrected: boolean;
};

export function matchCatalogFacet(question: string, wines: AskWine[]): CatalogFacetMatch | null {
  const expandedQuestion = question.replace(/\bbubbl(?:y|ies)\b/gi, ' sparkling ');
  const groups: Array<{ kind: CatalogFacetMatch['kind']; values: string[] }> = [
    { kind: 'collection', values: wines.flatMap((wine) => wine.collections?.length ? wine.collections : (wine.collection ? [wine.collection] : [])) },
    { kind: 'brand', values: wines.map((wine) => wine.brand || '') },
    { kind: 'category', values: wines.map((wine) => wine.category || '') },
    { kind: 'varietal', values: wines.map((wine) => wine.varietal || '') },
  ];
  const seen = new Set<string>();
  const candidates: CatalogFacetMatch[] = [];
  for (const group of groups) {
    for (const value of group.values) {
      const label = value.trim();
      if (!label) continue;
      const id = `${group.kind}:${normalize(label)}`;
      if (seen.has(id)) continue;
      seen.add(id);
      const score = phraseMatchScore(expandedQuestion, label);
      if (score >= 70) {
        const exact = normalize(question).includes(normalize(label)) || normalize(question).includes(catalogKey(label));
        candidates.push({ kind: group.kind, label, score, corrected: !exact });
      }
    }
  }
  return candidates.sort((a, b) => b.score - a.score || (a.kind === 'collection' ? -1 : b.kind === 'collection' ? 1 : 0) || a.label.localeCompare(b.label))[0] || null;
}

export function wineMatchesCatalogFacet(wine: AskWine, facet: CatalogFacetMatch) {
  const target = normalize(facet.label);
  if (facet.kind === 'collection') return (wine.collections?.length ? wine.collections : (wine.collection ? [wine.collection] : [])).some((value) => normalize(value) === target);
  if (facet.kind === 'brand') return normalize(wine.brand || '') === target;
  if (facet.kind === 'category') return normalize(wine.category || '') === target;
  return normalize(wine.varietal || '') === target;
}

export function catalogCollections(wines: AskWine[]) {
  const counts = new Map<string, { label: string; total: number; available: number }>();
  for (const wine of wines) {
    const labels = Array.from(new Set((wine.collections?.length ? wine.collections : (wine.collection ? [wine.collection] : [])).filter(Boolean)));
    for (const label of labels) {
      const key = normalize(label);
      const current = counts.get(key) || { label, total: 0, available: 0 };
      current.total += 1;
      if (wine.status === 'Available') current.available += 1;
      counts.set(key, current);
    }
  }
  return Array.from(counts.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export function catalogQuestion(question: string) {
  return /\b(how many|number of|count|list|show|which|what|all|do we have|have we got|do we carry|are there|available|collections?)\b/i.test(question);
}

function priceRange(question: string) {
  const q = question.toLowerCase();
  const between = q.match(/between\s*\$?(\d+(?:\.\d+)?)\s*(?:and|to|-)\s*\$?(\d+(?:\.\d+)?)/i);
  if (between) return { min: Number(between[1]), max: Number(between[2]) };
  const under = q.match(/(?:under|below|less than|cheaper than|up to)\s*\$?(\d+(?:\.\d+)?)/i);
  if (under) return { max: Number(under[1]) };
  const over = q.match(/(?:over|above|more than|at least)\s*\$?(\d+(?:\.\d+)?)/i);
  if (over) return { min: Number(over[1]) };
  return null;
}

function wineBody(wine: AskWine) {
  return [
    wine.vintage, wine.brand, wine.collection, ...(wine.collections || []), wine.category, wine.status, wine.varietal, wine.appellation, wine.region,
    wine.price === undefined ? '' : `$${wine.price}`,
    wine.upc, wine.volumeMl, wine.abv, wine.rs, wine.ta, wine.ph, wine.casePack, wine.casesProduced, wine.sweetness,
    wine.tastingNotes, wine.shortDescription, wine.staffPitch, wine.pairings,
    ...(wine.highlights || []),
    ...(wine.awards || []).flatMap((award) => [String(award.year), award.competition, award.result]),
  ].filter(Boolean).join(' | ');
}

function distributionBody(item: AskDistributionWine) {
  return [
    item.family, item.discontinued ? 'discontinued' : 'current', item.upcFull, item.gtin, item.meijerPid, item.targetDpci,
    item.specs?.size, item.specs?.glassType, item.specs?.rs, item.specs?.abv, item.specs?.ph, item.specs?.ta, item.specs?.composition,
    item.marketingCopy,
    ...Object.entries(item.pricing || {}).flatMap(([key, value]) => value === null || value === undefined ? [] : [`${key} ${value}`]),
    ...Object.entries(item.imperial || {}).flatMap(([key, value]) => value === null || value === undefined ? [] : [`${key} ${value}`]),
  ].filter(Boolean).join(' | ');
}

function compactWine(wine: AskWine) {
  return JSON.stringify({
    name: wine.name,
    vintage: wine.vintage,
    brand: wine.brand,
    category: wine.category,
    collection: wine.collection,
    collections: wine.collections,
    status: wine.status,
    varietal: wine.varietal,
    appellation: wine.appellation,
    price: wine.price,
    upc: wine.upc,
    volumeMl: wine.volumeMl,
    abv: wine.abv,
    rs: wine.rs,
    ta: wine.ta,
    ph: wine.ph,
    casePack: wine.casePack,
    casesProduced: wine.casesProduced,
    sweetness: wine.sweetness,
    tastingNotes: wine.tastingNotes,
    shortDescription: wine.shortDescription,
    staffPitch: wine.staffPitch,
    pairings: wine.pairings,
    highlights: wine.highlights,
    awards: wine.awards,
  });
}

function compactDistribution(item: AskDistributionWine) {
  return JSON.stringify({
    name: item.name,
    family: item.family,
    discontinued: item.discontinued,
    upc: item.upcFull,
    gtin: item.gtin,
    meijerPid: item.meijerPid,
    targetDpci: item.targetDpci,
    pricing: item.pricing,
    specs: item.specs,
    imperial: item.imperial,
    marketingCopy: item.marketingCopy,
  });
}

export function retrieveWineSources(question: string, wines: AskWine[], limit = 14) {
  const range = priceRange(question);
  const q = normalize(question);
  const awardQuery = /\baward|gold|silver|bronze|class\b/.test(q);
  const candidates = wines.map((wine) => {
    let score = scoreText(question, `${wine.name} ${wine.vintage || ''}`, wineBody(wine));
    if (range && wine.price !== undefined && (range.min === undefined || wine.price >= range.min) && (range.max === undefined || wine.price <= range.max)) score += 45;
    if (awardQuery && (wine.awards || []).length) score += 8;
    if (/\bcurrent|available\b/.test(q) && wine.status === 'Available') score += 3;
    if (/\btasting menu|tasting room|on the menu\b/.test(q) && wine.onTastingMenu) score += 4;
    return { wine, score };
  }).filter(({ wine, score }) => score >= 2 && (!range || wine.price === undefined || ((range.min === undefined || wine.price >= range.min) && (range.max === undefined || wine.price <= range.max))));

  if (range) {
    for (const wine of wines) {
      if (wine.price === undefined) continue;
      if ((range.min === undefined || wine.price >= range.min) && (range.max === undefined || wine.price <= range.max) && !candidates.some((candidate) => candidate.wine.id === wine.id)) {
        candidates.push({ wine, score: 45 });
      }
    }
  }

  return candidates
    .sort((a, b) => b.score - a.score || a.wine.name.localeCompare(b.wine.name))
    .slice(0, limit)
    .map(({ wine }, index) => ({
      id: `S${index + 1}`,
      type: 'wine' as const,
      title: `${wine.name}${wine.vintage && wine.vintage !== 'NV' ? ` ${wine.vintage}` : ''}`,
      path: `/wine-library/${askWineSlug(wine)}`,
      summary: compactWine(wine),
    }));
}

export function retrieveDistributionSources(question: string, items: AskDistributionWine[], startIndex = 1, limit = 12) {
  return items
    .map((item) => ({ item, score: scoreText(question, `${item.name} ${item.specs?.size || ''}`, distributionBody(item)) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .slice(0, limit)
    .map(({ item }, index) => ({
      id: `S${startIndex + index}`,
      type: 'distribution' as const,
      title: `${item.name}${item.specs?.size ? ` · ${item.specs.size}` : ''}`,
      path: `/distribution-wines/${askDistributionSlug(item)}`,
      summary: compactDistribution(item),
    }));
}

export function questionNeedsQuickFacts(question: string) {
  return /\b(found|founded|history|story|owner|family|acre|vineyard|site|grape|variet|growing|region|climate|soil|harvest|vintage|omema|omena|pleasant hill|m204|hilltop)\b/i.test(question);
}

export function questionNeedsCaseSales(question: string) {
  return /\b(case|cases|goal|sales|sold|pace|remaining|per day|tracker)\b/i.test(question);
}

export function questionNeedsTastingMenu(question: string) {
  return /\b(tasting menu|tasting room|current menu|on the menu|currently pouring|pouring|currently selling|selling in the tasting room|current offerings?|offering in the tasting room)\b/i.test(question);
}
