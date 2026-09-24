import type { WineRecord } from '@/lib/types';

export const WINE_COLLECTIONS = [
  'Country Crush',
  'Farm Fresh',
  'Lakeshore Farms',
  'Lakeshore Collection',
  'Estate',
  'Leelanau Cellars',
  'Zilly',
  'Witches Brew',
  'Seasonal Series',
] as const;

export type WineCollectionName = typeof WINE_COLLECTIONS[number];

export const COLLECTION_ART: Partial<Record<WineCollectionName, string>> = {
  'Country Crush': '/cases/country-crush-case.png',
  'Farm Fresh': '/cases/farm-fresh-fruit-moscato-case.png',
  'Lakeshore Farms': '/cases/lakeshore-farms-fruit-moscato-case.png',
  'Lakeshore Collection': '/cases/lakeshore-collection-case.png',
  'Leelanau Cellars': '/lwc-logo.png',
  'Zilly': '/cases/zilly-case.png',
  'Witches Brew': '/cases/witches-brew-case.png',
  'Seasonal Series': '/cases/seasonal-sangria-case.png',
};

const COLLECTION_ALIASES: { pattern: RegExp; collection: WineCollectionName }[] = [
  { pattern: /country\s*crush/i, collection: 'Country Crush' },
  { pattern: /farm\s*fresh/i, collection: 'Farm Fresh' },
  { pattern: /lakeshore\s*farms/i, collection: 'Lakeshore Farms' },
  { pattern: /lakeshore\s*collection/i, collection: 'Lakeshore Collection' },
  { pattern: /witch(?:es)?\s*brew/i, collection: 'Witches Brew' },
  { pattern: /zilly/i, collection: 'Zilly' },
  { pattern: /seasonal(?:\s*series)?/i, collection: 'Seasonal Series' },
  { pattern: /estate(?:\s*\/\s*reserve)?|reserve/i, collection: 'Estate' },
  { pattern: /leelanau\s*(?:wine\s*)?cellars|leelanau\s*cellars|^lwc$/i, collection: 'Leelanau Cellars' },
];

export function canonicalWineCollection(value?: string | null): WineCollectionName | undefined {
  const text = String(value || '').trim();
  if (!text) return undefined;
  return COLLECTION_ALIASES.find((entry) => entry.pattern.test(text))?.collection;
}

export function collectionForWine(wine: WineRecord): WineCollectionName {
  return canonicalWineCollection(wine.vendor)
    || canonicalWineCollection(wine.collection)
    || canonicalWineCollection(wine.brand)
    || canonicalWineCollection(wine.name)
    || 'Leelanau Cellars';
}

export function distributionFamilyFallback(family?: string | null): WineCollectionName {
  const canonical = canonicalWineCollection(family);
  if (canonical) return canonical;

  const value = String(family || '').toLowerCase();
  if (/seasonal|winter\s*white/.test(value)) return 'Seasonal Series';
  if (/estate|reserve/.test(value)) return 'Estate';
  return 'Leelanau Cellars';
}
