import type { DistributionWine } from './distribution-wines';
import type { WineImageAsset, WineRecord } from './types';

export const DISTRIBUTION_EDITS_KEY = 'lwc-distribution-edits-v1';

const normalize = (value = '') => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
const stripVintage = (value = '') => value.replace(/\b20\d{2}\b/g, ' ').replace(/\s+/g, ' ').trim();

const REMOVED_WINE_KEYS = new Set([
  'bacoreserve',
  'meritage',
  'reserve',
  'bacotheend',
  'sweetbaco',
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

const CANONICAL_NAME_MAP: Record<string, string> = {
  estatelateharvestriesling: 'lateharvestriesling',
  estatepinotgrigio: 'pinotgrigio',
  pinotgrigio2022: 'pinotgrigio',
  witchesbrewspicedred: 'witchesbrew',
  witchesbrewspicedapple: 'witchesbrewspicedapple',
  lakeshorefarmsblackberrysparklingmoscato: 'farmfreshblackberrybubblymoscato',
  lakeshorefarmspeachsparklingmoscato: 'farmfreshpeachbubblymoscato',
  lakeshorefarmsraspberrysparklingmoscato: 'farmfreshraspberrybubblymoscato',
  blackberrysparklingmoscato: 'farmfreshblackberrybubblymoscato',
  peachsparklingmoscato: 'farmfreshpeachbubblymoscato',
  raspberrysparklingmoscato: 'farmfreshraspberrybubblymoscato',
  sparklingsparklingpeachmoscato: 'farmfreshpeachbubblymoscato',
};

function canonicalKey(value = '') {
  const base = normalize(stripVintage(value));
  return CANONICAL_NAME_MAP[base] || base;
}

export function isRemovedWineName(name = '') {
  return REMOVED_WINE_KEYS.has(canonicalKey(name));
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

function asAssets(front: string, back?: string): WineImageAsset[] {
  const images: WineImageAsset[] = [{ id: `${front}-front`, src: front, sortOrder: 0, role: 'front' }];
  if (back) images.push({ id: `${front}-back`, src: back, sortOrder: 1, role: 'back' });
  return images;
}

const IMAGE_OVERRIDES: Record<string, { bottleImage: string; imageAssets: WineImageAsset[] }> = {
  farmfreshblackberrymoscato: {
    bottleImage: '/bottles/farm-fresh-blackberry-moscato-front.png',
    imageAssets: asAssets('/bottles/farm-fresh-blackberry-moscato-front.png', '/bottles/farm-fresh-blackberry-moscato-back.png'),
  },
  farmfreshraspberrymoscato: {
    bottleImage: '/bottles/farm-fresh-raspberry-moscato-front.png',
    imageAssets: asAssets('/bottles/farm-fresh-raspberry-moscato-front.png', '/bottles/farm-fresh-raspberry-moscato-back.png'),
  },
  farmfreshcranberrymoscato: {
    bottleImage: '/bottles/farm-fresh-cranberry-moscato-front.png',
    imageAssets: asAssets('/bottles/farm-fresh-cranberry-moscato-front.png', '/bottles/farm-fresh-cranberry-moscato-back.png'),
  },
  farmfreshpeachmoscato: {
    bottleImage: '/bottles/farm-fresh-peach-moscato-front.png',
    imageAssets: asAssets('/bottles/farm-fresh-peach-moscato-front.png'),
  },
  greatlakesred: {
    bottleImage: '/bottles/great-lakes-red-front.png',
    imageAssets: asAssets('/bottles/great-lakes-red-front.png', '/bottles/great-lakes-red-back.png'),
  },
  winterwhite: {
    bottleImage: '/bottles/winter-white-front.png',
    imageAssets: asAssets('/bottles/winter-white-front.png'),
  },
  witchesbrew: {
    bottleImage: '/bottles/witches-brew-front.png',
    imageAssets: asAssets('/bottles/witches-brew-front.png', '/bottles/witches-brew-back.png'),
  },
};

export function applyWineHubOverrides(wines: WineRecord[]) {
  return wines
    .filter((wine) => !isRemovedWineName(wine.name))
    .map((wine) => {
      const key = canonicalKey(wine.name);
      const override = IMAGE_OVERRIDES[key];
      if (!override) return wine;
      return {
        ...wine,
        bottleImage: override.bottleImage,
        imageAssets: override.imageAssets,
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
  lakeshorefarmspeachsparklingmoscato: 'Farm Fresh Peach Bubbly Moscato',
  lakeshorefarmsraspberrysparklingmoscato: 'Farm Fresh Raspberry Bubbly Moscato',
  blackberrysparklingmoscato: 'Farm Fresh Blackberry Bubbly Moscato',
  peachsparklingmoscato: 'Farm Fresh Peach Bubbly Moscato',
  raspberrysparklingmoscato: 'Farm Fresh Raspberry Bubbly Moscato',
};

function maybeRenameDistribution(name: string, matched?: WineRecord) {
  const renamed = DISTRIBUTION_RENAMES[canonicalKey(name)];
  if (renamed) return renamed;
  if (matched?.name) return matched.name;
  return name;
}

export function buildDistributionCatalog(
  wines: WineRecord[],
  base: DistributionWine[],
  overrides: Record<string, Partial<DistributionWine>> = {},
) {
  return base
    .filter((item) => !item.discontinued)
    .filter((item) => !isRemovedWineName(item.name))
    .map((item) => {
      const matched = matchWineByName(item.name, wines);
      const next: DistributionWine = {
        ...item,
        name: maybeRenameDistribution(item.name, matched),
        assets: [],
        specs: {
          ...item.specs,
          size: fillMissingText(item.specs.size, matched?.volumeMl ? `${matched.volumeMl} mL` : undefined),
          rs: fillMissingNumber(item.specs.rs, matched?.rs),
          abv: fillMissingNumber(item.specs.abv, matched?.abv),
          ph: fillMissingNumber(item.specs.ph, matched?.ph),
          ta: fillMissingNumber(item.specs.ta, matched?.ta),
          composition: fillMissingText(item.specs.composition, matched?.varietal),
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
