import type { Award } from './types';

export type WebsiteAward = Award & {
  wineName: string;
  brand: 'Leelanau Cellars' | 'Farm Fresh' | 'Lakeshore Farms' | 'Country Crush' | 'Zilly';
};

type OfficialAwardRow = [WebsiteAward['brand'], string, string];

const normalize = (value: string) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]/g, '');

const awardGraphicUrl = (year: number, result: string) => {
  const normalized = result.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const aliases: Record<string, string> = {
    'best of class': 'best-of-class',
    'best in class': 'best-of-class',
    'double gold': 'double-gold',
    gold: 'gold',
    silver: 'silver',
    bronze: 'bronze',
  };
  const slug = aliases[normalized];
  if (!slug) return undefined;
  const supported: Record<number, string[]> = {
    2023: ['best-of-class', 'gold', 'silver', 'bronze'],
    2024: ['best-of-class', 'double-gold', 'gold', 'silver', 'bronze'],
    2025: ['best-of-class', 'double-gold', 'gold', 'silver', 'bronze'],
    2026: ['best-of-class', 'double-gold', 'gold', 'silver', 'bronze'],
  };
  return supported[year]?.includes(slug) ? `/awards/${year}/${slug}.png` : undefined;
};

// Transcribed from the Leelanau Cellars 2023–2026 San Francisco Chronicle
// Wine Competition reference sheets. Brand is intentionally part of the key:
// names such as Peach Fruit Wine and Mango Moscato exist in multiple families.
const OFFICIAL_BY_YEAR: Record<number, OfficialAwardRow[]> = {
  2026: [
    ['Leelanau Cellars', 'Cherries Galore', 'Double Gold'],
    ['Leelanau Cellars', '2023 Late Harvest Riesling', 'Double Gold'],
    ['Leelanau Cellars', '2023 Late Harvest Pinot Grigio', 'Double Gold'],
    ['Leelanau Cellars', 'Chocolate Cherry Dessert', 'Double Gold'],
    ['Leelanau Cellars', 'Cold Duck', 'Gold'],
    ['Leelanau Cellars', '2024 Blanc de Noir', 'Silver'],
    ['Leelanau Cellars', '2024 Brüt Sur Lie', 'Silver'],
    ['Leelanau Cellars', 'Spring Splendor', 'Silver'],
    ['Leelanau Cellars', 'Summer Sunset', 'Silver'],
    ['Leelanau Cellars', 'Winter White Bubbly', 'Silver'],
    ['Leelanau Cellars', 'Witches Brew', 'Silver'],
    ['Leelanau Cellars', 'Witches Brew Spiced Apple', 'Silver'],
    ['Leelanau Cellars', 'Festivus', 'Bronze'],
    ['Leelanau Cellars', '2023 Pinot Grigio', 'Bronze'],
    ['Leelanau Cellars', 'Winter White', 'Bronze'],
    ['Leelanau Cellars', 'Witches Brew Pumpkin Spice', 'Bronze'],
    ['Farm Fresh', 'Cranberry Moscato', 'Best of Class'],
    ['Farm Fresh', 'Raspberry Bubbly Moscato', 'Double Gold'],
    ['Farm Fresh', 'Cranberry Fruit Wine', 'Silver'],
    ['Zilly', '2023 Zilly Pinot Grigio', 'Gold'],
    ['Zilly', '2023 Zilly Chardonnay', 'Gold'],
    ['Zilly', '2023 Zilly Sauvignon Blanc', 'Bronze'],
    ['Zilly', '2023 Zilly Cabernet Sauvignon', 'Bronze'],
  ],
  2025: [
    ['Leelanau Cellars', '2023 Merlot', 'Silver'],
    ['Leelanau Cellars', '2022 Pinot Grigio', 'Silver'],
    ['Leelanau Cellars', '2023 Pleasant Hill Pinot Grigio', 'Silver'],
    ['Leelanau Cellars', 'Cherry Cordial', 'Bronze'],
    ['Zilly', 'Zilly Cabernet Sauvignon', 'Silver'],
    ['Zilly', 'Zilly Pinot Grigio', 'Silver'],
    ['Zilly', 'Zilly Chardonnay', 'Bronze'],
    ['Zilly', 'Zilly Sauvignon Blanc', 'Bronze'],
  ],
  2024: [
    ['Leelanau Cellars', '2022 Gewürztraminer', 'Double Gold'],
    ['Leelanau Cellars', 'Blueberry Dessert Wine', 'Gold'],
    ['Leelanau Cellars', 'Cherry Dessert Wine', 'Gold'],
    ['Leelanau Cellars', 'Raspberry Dessert Wine', 'Gold'],
    ['Leelanau Cellars', '2022 Semi-Dry Riesling', 'Silver'],
    ['Leelanau Cellars', '2022 Vignoles', 'Silver'],
    ['Leelanau Cellars', '2022 Pinot Noir Rosé', 'Bronze'],
    ['Leelanau Cellars', '2022 Sauvignon Blanc', 'Bronze'],
    ['Lakeshore Farms', 'Peach Sparkling Moscato', 'Best of Class'],
    ['Lakeshore Farms', 'Blackberry Fruit Wine', 'Bronze'],
    ['Lakeshore Farms', 'Cherry Fruit Wine', 'Bronze'],
    ['Country Crush', 'Peach Fruit Wine', 'Bronze'],
  ],
  2023: [
    ['Leelanau Cellars', 'Lakeshore Collection Moscato', 'Gold'],
    ['Leelanau Cellars', 'Lakeshore Collection Riesling', 'Gold'],
    ['Leelanau Cellars', '2021 Late Harvest Riesling', 'Gold'],
    ['Leelanau Cellars', 'Lakeshore Collection Pinot Grigio', 'Silver'],
    ['Leelanau Cellars', '2021 Dry Riesling', 'Silver'],
    ['Leelanau Cellars', 'Sweet Peach Chill', 'Silver'],
    ['Leelanau Cellars', 'Pinot Noir Rosé', 'Bronze'],
    ['Leelanau Cellars', 'Lakeshore Collection Red Blend', 'Bronze'],
    ['Leelanau Cellars', 'Blackberry Chill', 'Bronze'],
    ['Leelanau Cellars', 'Mango Chill', 'Bronze'],
    ['Leelanau Cellars', '2021 Riesling', 'Bronze'],
    ['Lakeshore Farms', 'Raspberry Sparkling Moscato', 'Best of Class'],
    ['Lakeshore Farms', 'Blackberry Sparkling Moscato', 'Gold'],
    ['Lakeshore Farms', 'Raspberry Moscato', 'Gold'],
    ['Lakeshore Farms', 'Mango Sparkling Moscato', 'Silver'],
    ['Lakeshore Farms', 'Peach Moscato', 'Silver'],
    ['Lakeshore Farms', 'Blackberry Moscato', 'Silver'],
    ['Lakeshore Farms', 'Peach Sparkling Moscato', 'Bronze'],
    ['Farm Fresh', 'Mango Moscato', 'Best of Class'],
    ['Farm Fresh', 'Mango Bubbly Moscato', 'Silver'],
    ['Farm Fresh', 'Mango Fruit Wine', 'Bronze'],
  ],
};

function officialAwards(): WebsiteAward[] {
  return Object.keys(OFFICIAL_BY_YEAR)
    .map(Number)
    .sort((a, b) => b - a)
    .flatMap((year) => OFFICIAL_BY_YEAR[year].map(([brand, wineName, result]) => ({
      id: `official-${year}-${normalize(brand)}-${normalize(wineName)}-${normalize(result)}`,
      wineName,
      brand,
      year,
      competition: 'San Francisco Chronicle Wine Competition',
      result,
      graphicUrl: awardGraphicUrl(year, result),
    })));
}

export async function loadCurrentWebsiteAwards(): Promise<WebsiteAward[]> {
  return officialAwards();
}

const stripBrand = (value: string, brand: string) => {
  const brands = [brand, 'Farm Fresh', 'Country Crush', 'Zilly', 'Lakeshore Farms', 'Leelanau Cellars'];
  let output = value.trim();
  for (const item of brands) {
    if (!item) continue;
    output = output.replace(new RegExp(`^${item.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\s+`, 'i'), '');
  }
  return output.trim();
};

function familyBrand(value: string): WebsiteAward['brand'] {
  const normalized = value.toLowerCase();
  if (normalized.includes('farm fresh')) return 'Farm Fresh';
  if (normalized.includes('lakeshore farms')) return 'Lakeshore Farms';
  if (normalized.includes('country crush')) return 'Country Crush';
  if (normalized.includes('zilly')) return 'Zilly';
  // Estate, Lakeshore Collection, Witches Brew and Seasonal Series all roll up
  // to Leelanau Cellars on the competition reference sheets.
  return 'Leelanau Cellars';
}

export function matchWebsiteAwards(title: string, vintage: string, brand: string, awards: WebsiteAward[]): Award[] {
  const base = stripBrand(title, brand);
  const productFamily = familyBrand(`${brand} ${title}`);
  const productCandidates = new Set([
    normalize(title),
    normalize(base),
    normalize(`${brand} ${title}`),
    normalize(`${brand} ${base}`),
    normalize(`${vintage} ${title}`),
    normalize(`${vintage} ${base}`),
    normalize(`${vintage} ${brand} ${title}`),
    normalize(`${vintage} ${brand} ${base}`),
  ]);

  return awards
    .filter((award) => {
      if (award.brand !== productFamily) return false;
      const awardVintage = award.wineName.match(/^(20\d{2})\s+/)?.[1];
      if (awardVintage && /^20\d{2}$/.test(vintage) && awardVintage !== vintage) return false;

      const awardName = normalize(award.wineName);
      const noYearAwardName = normalize(award.wineName.replace(/^20\d{2}\s+/, ''));
      return productCandidates.has(awardName) || productCandidates.has(noYearAwardName);
    })
    .map(({ wineName: _wineName, brand: _brand, ...award }) => award)
    .filter((award, index, list) => list.findIndex((candidate) => candidate.year === award.year && candidate.competition === award.competition && candidate.result === award.result) === index)
    .sort((a, b) => b.year - a.year || a.result.localeCompare(b.result));
}
