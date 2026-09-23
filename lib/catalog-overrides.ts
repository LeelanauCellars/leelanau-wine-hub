import type { DistributionWine } from './distribution-wines';
import type { WineImageAsset, WineRecord } from './types';

export const DISTRIBUTION_EDITS_KEY = 'lwc-distribution-edits-v1';

const normalize = (value = '') => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
const stripVintage = (value = '') => value.replace(/\b20\d{2}\b/g, ' ').replace(/\s+/g, ' ').trim();

const REMOVED_LIBRARY_WINE_KEYS = new Set([
  'bacoreserve',
  'baconoirreserve',
  'meritage',
  'reserve',
  'bacotheend',
  'baconoirtheend',
  'sweetbaco',
  'sweetbaconoir',
  'cherrycordial',
  'warmcherrycordial',
  'lakeshoremango',
  'lakeshorefarmsmango',
  'lakeshorefarmsblueberrymoscato',
  'lakeshorefarmscranberrymoscato',
  'lakeshorefarmsmangomoscato',
  'lakeshorefarmsblueberrybubblymoscato',
  'mangomoscato',
  'blueberrymoscato',
  'cranberrymoscato',
  'blueberrybubblymoscato',
]);

const REMOVED_DISTRIBUTION_KEYS = new Set([
  ...REMOVED_LIBRARY_WINE_KEYS,
  'summersunsetrose',
  'baconoirreserve',
  'meritagereserve',
  'baconoirtheend',
  'sweetbaconoir',
  'lakeshorefarmsblackberrybubblymoscatocan',
  'lakeshorefarmsblueberrybubblymoscatocan',
  'lakeshorefarmspeachbubblymoscatocan',
  'lakeshorefarmsraspberrybubblymoscatocan',
  'lakeshorefarmscanvarietypack',
]);

const CANONICAL_NAME_MAP: Record<string, string> = {
  estatelateharvestriesling: 'lateharvestriesling',
  estatepinotgrigio: 'pinotgrigio',
  pinotgrigio2022: 'pinotgrigio',
  witchesbrewspicedred: 'witchesbrew',
  witchesbrewspicedapple: 'witchesbrewspicedapple',
  lakeshorefarmsblackberrysparklingmoscato: 'farmfreshblackberrybubblymoscato',
  lakeshorefarmsblueberrysparklingmoscato: 'farmfreshblueberrybubblymoscato',
  lakeshorefarmspeachsparklingmoscato: 'farmfreshpeachbubblymoscato',
  lakeshorefarmsraspberrysparklingmoscato: 'farmfreshraspberrybubblymoscato',
  lakeshorefarmsblackberrybubblymoscato: 'farmfreshblackberrybubblymoscato',
  lakeshorefarmsblueberrybubblymoscato: 'farmfreshblueberrybubblymoscato',
  lakeshorefarmspeachbubblymoscato: 'farmfreshpeachbubblymoscato',
  lakeshorefarmsraspberrybubblymoscato: 'farmfreshraspberrybubblymoscato',
  blackberrysparklingmoscato: 'farmfreshblackberrybubblymoscato',
  blueberrysparklingmoscato: 'farmfreshblueberrybubblymoscato',
  peachsparklingmoscato: 'farmfreshpeachbubblymoscato',
  raspberrysparklingmoscato: 'farmfreshraspberrybubblymoscato',
  sparklingsparklingpeachmoscato: 'farmfreshpeachbubblymoscato',
  chillsblackberry: 'chillblackberry',
  chillsmango: 'chillmango',
  chillssweetpeach: 'chillsweetpeach',
  chillswatermelon: 'chillwatermelon',
  greatlakesredcan: 'greatlakesred375',
  winterwhitecan: 'winterwhite375',
  summersunsetcan: 'summersunset375',
};

function canonicalKey(value = '') {
  const base = normalize(stripVintage(value));
  return CANONICAL_NAME_MAP[base] || base;
}

export function isRemovedWineName(name = '') {
  return REMOVED_LIBRARY_WINE_KEYS.has(canonicalKey(name));
}

function isRemovedDistributionName(name = '') {
  return REMOVED_DISTRIBUTION_KEYS.has(canonicalKey(name));
}

function parseNumericString(value?: string) {
  if (!value) return null;
  const match = String(value).match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function fillMissingNumber(current: string | number | null | undefined, fallback?: string) {
  if (current === 0 || current === '0' || current === '0.0' || current === '0.00') return parseNumericString(fallback) ?? current;
  if (current === null || current === undefined || current === '') return parseNumericString(fallback);
  return current;
}

function fillMissingText(current: string | null | undefined, fallback?: string | number) {
  if (current === null || current === undefined || current === '') return fallback === undefined || fallback === null ? current : String(fallback);
  return current;
}

function formatDistributionUpcFull(value?: string | null) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 12) return `${digits.slice(0, 1)}-${digits.slice(1, 6)}-${digits.slice(6, 11)}-${digits.slice(11)}`;
  return value || null;
}

function asAssets(...entries: { src: string; role?: 'front' | 'back' | 'additional'; label?: string }[]): WineImageAsset[] {
  return entries.map((entry, index) => ({
    id: `${entry.src}-${entry.role || 'additional'}-${index}`,
    src: entry.src,
    sortOrder: index,
    role: entry.role || 'additional',
    label: entry.label,
  }));
}

const ADDITIONAL_IMAGE_OVERRIDES: Record<string, { fallbackBottleImage?: string; fallbackImageAssets?: WineImageAsset[]; extraImageAssets: WineImageAsset[] }> = {
  farmfreshblackberrymoscato: {
    fallbackBottleImage: '/bottles/farm-fresh-blackberry-moscato-front.png',
    fallbackImageAssets: asAssets(
      { src: '/bottles/farm-fresh-blackberry-moscato-front.png', role: 'front', label: '1.5L front bottle image' },
      { src: '/bottles/farm-fresh-blackberry-moscato-back.png', role: 'back', label: '1.5L back bottle image' },
    ),
    extraImageAssets: asAssets(
      { src: '/bottles/farm-fresh-blackberry-moscato-front.png', label: '1.5L front bottle image' },
      { src: '/bottles/farm-fresh-blackberry-moscato-back.png', label: '1.5L back bottle image' },
    ),
  },
  farmfreshraspberrymoscato: {
    fallbackBottleImage: '/bottles/farm-fresh-raspberry-moscato-front.png',
    fallbackImageAssets: asAssets(
      { src: '/bottles/farm-fresh-raspberry-moscato-front.png', role: 'front', label: '1.5L front bottle image' },
      { src: '/bottles/farm-fresh-raspberry-moscato-back.png', role: 'back', label: '1.5L back bottle image' },
    ),
    extraImageAssets: asAssets(
      { src: '/bottles/farm-fresh-raspberry-moscato-front.png', label: '1.5L front bottle image' },
      { src: '/bottles/farm-fresh-raspberry-moscato-back.png', label: '1.5L back bottle image' },
    ),
  },
  farmfreshcranberrymoscato: {
    fallbackBottleImage: '/bottles/farm-fresh-cranberry-moscato-front.png',
    fallbackImageAssets: asAssets(
      { src: '/bottles/farm-fresh-cranberry-moscato-front.png', role: 'front', label: '1.5L front bottle image' },
      { src: '/bottles/farm-fresh-cranberry-moscato-back.png', role: 'back', label: '1.5L back bottle image' },
    ),
    extraImageAssets: asAssets(
      { src: '/bottles/farm-fresh-cranberry-moscato-front.png', label: '1.5L front bottle image' },
      { src: '/bottles/farm-fresh-cranberry-moscato-back.png', label: '1.5L back bottle image' },
    ),
  },
  farmfreshpeachmoscato: {
    fallbackBottleImage: '/bottles/farm-fresh-peach-moscato-front.png',
    fallbackImageAssets: asAssets(
      { src: '/bottles/farm-fresh-peach-moscato-front.png', role: 'front', label: '1.5L front bottle image' },
    ),
    extraImageAssets: asAssets(
      { src: '/bottles/farm-fresh-peach-moscato-front.png', label: '1.5L front bottle image' },
    ),
  },
  greatlakesred: {
    fallbackBottleImage: '/bottles/great-lakes-red-front.png',
    fallbackImageAssets: asAssets(
      { src: '/bottles/great-lakes-red-front.png', role: 'front', label: '1.5L front bottle image' },
      { src: '/bottles/great-lakes-red-back.png', role: 'back', label: '1.5L back bottle image' },
    ),
    extraImageAssets: asAssets(
      { src: '/bottles/great-lakes-red-front.png', label: '1.5L front bottle image' },
      { src: '/bottles/great-lakes-red-back.png', label: '1.5L back bottle image' },
    ),
  },
  winterwhite: {
    fallbackBottleImage: '/bottles/winter-white-front.png',
    fallbackImageAssets: asAssets(
      { src: '/bottles/winter-white-front.png', role: 'front', label: '1.5L front bottle image' },
    ),
    extraImageAssets: asAssets(
      { src: '/bottles/winter-white-front.png', label: '1.5L front bottle image' },
    ),
  },
  witchesbrew: {
    fallbackBottleImage: '/bottles/witches-brew-front.png',
    fallbackImageAssets: asAssets(
      { src: '/bottles/witches-brew-front.png', role: 'front', label: '1.5L front bottle image' },
      { src: '/bottles/witches-brew-back.png', role: 'back', label: '1.5L back bottle image' },
    ),
    extraImageAssets: asAssets(
      { src: '/bottles/witches-brew-front.png', label: '1.5L front bottle image' },
      { src: '/bottles/witches-brew-back.png', label: '1.5L back bottle image' },
    ),
  },
};

function mergeImageAssets(primary: WineImageAsset[] | undefined, extra: WineImageAsset[]) {
  const merged: WineImageAsset[] = [];
  const seen = new Set<string>();
  const push = (asset: WineImageAsset) => {
    const key = `${asset.src}|${asset.role}|${asset.label || ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push({ ...asset, sortOrder: merged.length });
  };
  (primary || []).forEach(push);
  extra.forEach(push);
  return merged;
}

export function applyWineHubOverrides(wines: WineRecord[]) {
  return wines
    .filter((wine) => !isRemovedWineName(wine.name))
    .map((wine) => {
      const key = canonicalKey(wine.name);
      const override = ADDITIONAL_IMAGE_OVERRIDES[key];
      if (!override) return wine;
      const baseAssets = wine.imageAssets?.length
        ? [...wine.imageAssets].sort((a, b) => a.sortOrder - b.sortOrder)
        : (wine.bottleImage ? [{ id: `${wine.id}-front`, src: wine.bottleImage, sortOrder: 0, role: 'front' as const }] : []);
      const imageAssets = baseAssets.length ? mergeImageAssets(baseAssets, override.extraImageAssets) : (override.fallbackImageAssets || override.extraImageAssets);
      return {
        ...wine,
        bottleImage: baseAssets[0]?.src || wine.bottleImage || override.fallbackBottleImage,
        imageAssets,
      };
    });
}

export function matchWineByName(name: string, wines: WineRecord[]) {
  const key = canonicalKey(name);
  const exact = wines.find((wine) => canonicalKey(wine.name) === key);
  if (exact) return exact;
  return wines.find((wine) => {
    const wineKey = canonicalKey(wine.name);
    return wineKey.includes(key) || key.includes(wineKey);
  });
}

const DISTRIBUTION_RENAMES: Record<string, string> = {
  estatelateharvestriesling: 'Late Harvest Riesling',
  estatepinotgrigio: 'Pinot Grigio 2022',
  lakeshorefarmsblackberrysparklingmoscato: 'Farm Fresh Blackberry Bubbly Moscato',
  lakeshorefarmsblueberrysparklingmoscato: 'Farm Fresh Blueberry Bubbly Moscato',
  lakeshorefarmspeachsparklingmoscato: 'Farm Fresh Peach Bubbly Moscato',
  lakeshorefarmsraspberrysparklingmoscato: 'Farm Fresh Raspberry Bubbly Moscato',
  lakeshorefarmsblackberrybubblymoscato: 'Farm Fresh Blackberry Bubbly Moscato',
  lakeshorefarmsblueberrybubblymoscato: 'Farm Fresh Blueberry Bubbly Moscato',
  lakeshorefarmspeachbubblymoscato: 'Farm Fresh Peach Bubbly Moscato',
  lakeshorefarmsraspberrybubblymoscato: 'Farm Fresh Raspberry Bubbly Moscato',
  blackberrysparklingmoscato: 'Farm Fresh Blackberry Bubbly Moscato',
  blueberrysparklingmoscato: 'Farm Fresh Blueberry Bubbly Moscato',
  peachsparklingmoscato: 'Farm Fresh Peach Bubbly Moscato',
  raspberrysparklingmoscato: 'Farm Fresh Raspberry Bubbly Moscato',
  greatlakesredcan: 'Great Lakes Red 375',
  winterwhitecan: 'Winter White 375',
  summersunsetcan: 'Summer Sunset 375',
  chillsblackberry: 'Chill Blackberry',
  chillsmango: 'Chill Mango',
  chillssweetpeach: 'Chill Sweet Peach',
  chillswatermelon: 'Chill Watermelon',
};

function maybeRenameDistribution(name: string, matched?: WineRecord) {
  const renamed = DISTRIBUTION_RENAMES[canonicalKey(name)];
  if (renamed) return renamed;
  if (matched?.name) return matched.name;
  return name;
}

function normalizedDistributionComposition(item: DistributionWine, matched?: WineRecord) {
  const displayName = maybeRenameDistribution(item.name, matched);
  const key = canonicalKey(displayName || item.name);
  const raw = fillMissingText(item.specs.composition, matched?.varietal);
  const current = (raw ? String(raw) : '').trim();
  const currentLower = current.toLowerCase();
  const varietal = (matched?.varietal || '').trim();
  const varietalLower = varietal.toLowerCase();
  const category = (matched?.category || '').toLowerCase();

  if (key.includes('summersunset')) return 'Rose';
  if (key.includes('winterwhite')) return 'White Blend';
  if (key.includes('greatlakesred')) return 'Red Blend';
  if (key.includes('witchesbrewspicedred')) return 'Red Blend';

  if (currentLower.includes('100% cabernet sauve') || currentLower.includes('100% cabernet sauv')) return 'Cabernet Sauvignon';
  if (currentLower.includes('ruby cabernet')) return 'Red Blend';
  if (currentLower.includes('french colombard') || currentLower.includes('french combard')) {
    return key.includes('summersunset') ? 'Rose' : 'White Blend';
  }

  if (varietal && !/(blend|ruby cabernet|french colombard|french combard)/i.test(varietalLower)) {
    return varietal;
  }

  if (category.includes('white')) return 'White Blend';
  if (category.includes('red')) return 'Red Blend';

  if (/\bred\b/.test(displayName.toLowerCase()) && !/\b(?:cabernet|merlot|pinot noir|baco noir|riesling|pinot grigio|chardonnay|sauvignon blanc|gewurztraminer|moscato)\b/i.test(displayName)) {
    return 'Red Blend';
  }
  if (/\bwhite\b/.test(displayName.toLowerCase())) return 'White Blend';

  return current || null;
}

export function buildDistributionCatalog(
  wines: WineRecord[],
  base: DistributionWine[],
  overrides: Record<string, Partial<DistributionWine>> = {},
) {
  return base
    .filter((item) => !item.discontinued)
    .filter((item) => !isRemovedDistributionName(item.name))
    .map((item) => {
      const matched = matchWineByName(item.name, wines);
      const next: DistributionWine = {
        ...item,
        name: maybeRenameDistribution(item.name, matched),
        upcFull: item.id === 'sweet-red' && matched?.upc ? formatDistributionUpcFull(matched.upc) : item.upcFull,
        assets: [],
        specs: {
          ...item.specs,
          size: fillMissingText(item.specs.size, matched?.volumeMl ? `${matched.volumeMl} mL` : undefined),
          rs: fillMissingNumber(item.specs.rs, matched?.rs),
          abv: fillMissingNumber(item.specs.abv, matched?.abv),
          ph: fillMissingNumber(item.specs.ph, matched?.ph),
          ta: fillMissingNumber(item.specs.ta, matched?.ta),
          composition: normalizedDistributionComposition(item, matched),
        },
        marketingCopy: item.marketingCopy || matched?.shortDescription || matched?.tastingNotes || matched?.staffPitch || null,
      };
      const custom = overrides[item.id];
      if (!custom) return next;
      return {
        ...next,
        ...custom,
        specs: { ...next.specs, ...(custom.specs || {}) },
        pricing: { ...next.pricing, ...(custom.pricing || {}) },
        imperial: { ...next.imperial, ...(custom.imperial || {}) },
        metric: { ...next.metric, ...(custom.metric || {}) },
        assets: [],
      };
    });
}

export function canonicalWineKey(name = '') {
  return canonicalKey(name);
}
