import type { WineRecord } from './types';

const normalize = (value = '') => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

export type PosDisplayAsset = {
  id: string;
  label: string;
  src: string;
  jpegSrc: string;
  description?: string;
};

const WITCHES_BREW_DISPLAYS: PosDisplayAsset[] = [
  {
    id: 'witches-brew-three-case-display',
    label: 'Witches Brew 3-Case Display',
    src: '/pos-displays/witches-brew-three-case-display.png',
    jpegSrc: '/pos-displays/witches-brew-three-case-display.jpg',
    description: 'Finished floor-display mockup with Witches Brew bottles loaded into the display.',
  },
  {
    id: 'witches-brew-case-card',
    label: 'Witches Brew Case Card',
    src: '/pos-displays/witches-brew-case-card.png',
    jpegSrc: '/pos-displays/witches-brew-case-card.jpg',
    description: 'America’s Favorite Fall Wine case-card artwork with mounting legs.',
  },
];

const CHILL_DISPLAYS: PosDisplayAsset[] = [
  {
    id: 'chill-case-sleeve-display',
    label: 'Chill Case Sleeve Display',
    src: '/pos-displays/chill-case-sleeve-display.png',
    jpegSrc: '/pos-displays/chill-case-sleeve-display.jpg',
    description: 'Chill floor display / case sleeve mockup with assorted Chill bottles.',
  },
];

const WINTER_WHITE_DISPLAYS: PosDisplayAsset[] = [
  {
    id: 'winter-white-holiday-case-card-painted',
    label: 'Winter White Holiday Case Card - Painted Snow',
    src: '/pos-displays/winter-white-holiday-case-card-painted.png',
    jpegSrc: '/pos-displays/winter-white-holiday-case-card-painted.jpg',
    description: 'Blue painted-snow holiday case-card artwork.',
  },
  {
    id: 'winter-white-holiday-case-card-knit',
    label: 'Winter White Holiday Case Card - Knit Pattern',
    src: '/pos-displays/winter-white-holiday-case-card-knit.png',
    jpegSrc: '/pos-displays/winter-white-holiday-case-card-knit.jpg',
    description: 'Blue knit-pattern holiday case-card artwork.',
  },
];

const LAKESHORE_FARMS_DISPLAYS: PosDisplayAsset[] = [
  {
    id: 'lakeshore-farms-holiday-case-card',
    label: 'Lakeshore Farms Holiday Case Card',
    src: '/pos-displays/lakeshore-farms-holiday-case-card.png',
    jpegSrc: '/pos-displays/lakeshore-farms-holiday-case-card.jpg',
    description: 'Lakeshore Farms holiday case-card artwork from the supplied winter case-card file.',
  },
];

/**
 * Approved point-of-sale merchandising assets supplied by Leelanau Cellars.
 * These appear in the wine Asset Library and can be selected directly in the
 * sales Tech Sheet Builder as the optional Display image.
 */
export function posDisplaysForWine(wine?: WineRecord): PosDisplayAsset[] {
  if (!wine) return [];

  const name = normalize(wine.name);
  const brand = normalize(wine.brand);
  const collection = normalize(wine.collection || '');
  const category = normalize(wine.category || '');
  const all = `${name} ${brand} ${collection} ${category}`;

  if (all.includes('witches brew')) return WITCHES_BREW_DISPLAYS;
  if (/\bchills?\b/.test(all)) return CHILL_DISPLAYS;
  if (all.includes('winter white')) return WINTER_WHITE_DISPLAYS;
  if (brand === 'lakeshore farms' || all.includes('lakeshore farms')) return LAKESHORE_FARMS_DISPLAYS;

  return [];
}
