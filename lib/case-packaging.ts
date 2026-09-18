import type { WineRecord } from './types';

const normalize = (value = '') => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const contains = (haystack: string, needle: string) => haystack.includes(normalize(needle));

export type CasePackagingMatch = {
  src: string;
  label: string;
};

/**
 * Approved 12-bottle case artwork supplied by Leelanau Cellars.
 * Rules are deliberately ordered from most-specific to most-general so a
 * sparkling/bubbly package wins before the base wine/brand package.
 */
export function casePackagingForWine(wine?: WineRecord): CasePackagingMatch | undefined {
  if (!wine) return undefined;

  const name = normalize(wine.name);
  const brand = normalize(wine.brand);
  const collection = normalize(wine.collection || '');
  const category = normalize(wine.category || '');
  const all = `${name} ${brand} ${collection} ${category}`;

  // Canned products do not use the 12-bottle case artwork. This specifically
  // prevents items such as Winter White Bubbly Can from inheriting the
  // Winter White Bubbly bottle case just because the wine name matches.
  if (/\bcan(?:s|ned)?\b|\b12\s*oz\b|\b355\s*ml\b/.test(all)) return undefined;

  // Product-specific packages.
  if (contains(name, 'summer sunset') && /bubbly|sparkling/.test(name)) {
    return { src: '/cases/summer-sunset-bubbly-case.png', label: 'Summer Sunset Bubbly case' };
  }
  if (contains(name, 'winter white') && /bubbly|sparkling/.test(name)) {
    return { src: '/cases/winter-white-bubbly-case.png', label: 'Winter White Bubbly case' };
  }
  if (contains(name, 'great lakes red') && /bubbly|sparkling/.test(name)) {
    return { src: '/cases/great-lakes-red-bubbly-case.png', label: 'Great Lakes Red Bubbly case' };
  }
  if (contains(name, 'great lakes red')) {
    return { src: '/cases/great-lakes-red-case.png', label: 'Great Lakes Red case' };
  }
  if (contains(name, 'winter white')) {
    return { src: '/cases/winter-white-case.png', label: 'Winter White case' };
  }
  if (contains(name, 'festivus')) {
    return { src: '/cases/festivus-case.png', label: 'Festivus case' };
  }
  if (contains(all, 'witches brew')) {
    return { src: '/cases/witches-brew-case.png', label: 'Witches Brew case' };
  }

  // Farm Fresh has separate still/fruit and bubbly Moscato cases.
  if (brand === 'farm fresh' || contains(name, 'farm fresh')) {
    if (/bubbly|sparkling/.test(name) && contains(name, 'moscato')) {
      return { src: '/cases/farm-fresh-bubbly-moscato-case.png', label: 'Farm Fresh Bubbly Moscato case' };
    }
    return { src: '/cases/farm-fresh-fruit-moscato-case.png', label: 'Farm Fresh fruit wine & Moscato case' };
  }

  // Country Crush uses one shared case across the collection.
  if (brand === 'country crush' || contains(name, 'country crush')) {
    return { src: '/cases/country-crush-case.png', label: 'Country Crush case' };
  }

  // Lakeshore Farms has separate sparkling Moscato and still fruit/Moscato cases.
  if (brand === 'lakeshore farms' || contains(name, 'lakeshore farms')) {
    if (/bubbly|sparkling/.test(name) && contains(name, 'moscato')) {
      return { src: '/cases/lakeshore-farms-sparkling-moscato-case.png', label: 'Lakeshore Farms Sparkling Moscato case' };
    }
    return { src: '/cases/lakeshore-farms-fruit-moscato-case.png', label: 'Lakeshore Farms fruit wine & Moscato case' };
  }

  if (brand === 'zilly' || contains(name, 'zilly')) {
    return { src: '/cases/zilly-case.png', label: 'Zilly case' };
  }

  // Collection/general packages.
  if (contains(all, 'lakeshore collection')) {
    return { src: '/cases/lakeshore-collection-case.png', label: 'Lakeshore Collection case' };
  }
  if (contains(all, 'chill')) {
    return { src: '/cases/chill-wine-case.png', label: 'Chill Wine case' };
  }

  // One shared case for these core/seasonal products.
  if (['autumn harvest', 'spring splendor', 'summer sunset', 'red sangria', 'white sangria'].some((product) => contains(name, product))) {
    return { src: '/cases/seasonal-sangria-case.png', label: 'Leelanau seasonal / sangria case' };
  }

  return undefined;
}
