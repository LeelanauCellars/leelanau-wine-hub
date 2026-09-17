import type { Award } from './types';

export type WebsiteAward = Award & { wineName: string };

const AWARDS_URL = 'https://www.lwc.wine/awards/';
const RESULTS = ['Best of Class', 'Best in Class', 'Double Gold', 'Gold', 'Silver', 'Bronze'];

const FALLBACK_2026: Array<[string, string]> = [
  ['Cherries Galore', 'Double Gold'],
  ['2023 Late Harvest Riesling', 'Double Gold'],
  ['2023 Late Harvest Pinot Grigio', 'Double Gold'],
  ['Chocolate Cherry Dessert', 'Double Gold'],
  ['Cold Duck', 'Gold'],
  ['2024 Blanc de Noir', 'Silver'],
  ['2024 Brüt Sur Lie', 'Silver'],
  ['Spring Splendor', 'Silver'],
  ['Summer Sunset', 'Silver'],
  ['Winter White Bubbly', 'Silver'],
  ['Witches Brew', 'Silver'],
  ['Witches Brew Spiced Apple', 'Silver'],
  ['Festivus', 'Bronze'],
  ['2023 Pinot Grigio', 'Bronze'],
  ['Winter White', 'Bronze'],
  ['Witches Brew Pumpkin Spice', 'Bronze'],
  ['Cranberry Moscato', 'Best of Class'],
  ['Raspberry Bubbly Moscato', 'Double Gold'],
  ['Cranberry Fruit Wine', 'Silver'],
  ['2023 Zilly Pinot Grigio', 'Gold'],
  ['2023 Zilly Chardonnay', 'Gold'],
  ['2023 Zilly Sauvignon Blanc', 'Bronze'],
  ['2023 Zilly Cabernet Sauvignon', 'Bronze'],
];

const fallbackAwards = (year: number): WebsiteAward[] => year === 2026 ? FALLBACK_2026.map(([wineName, result]) => ({
  id: `website-2026-${normalize(wineName)}-${normalize(result)}`,
  wineName,
  year: 2026,
  competition: 'San Francisco Chronicle Wine Competition',
  result,
})) : [];

const decode = (value: string) => value
  .replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&quot;/gi, '"')
  .replace(/&uuml;/gi, 'ü')
  .replace(/&ouml;/gi, 'ö')
  .replace(/&eacute;/gi, 'é')
  .replace(/&auml;/gi, 'ä');

const htmlToLines = (html: string) => decode(html)
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<br\s*\/?\s*>/gi, '\n')
  .replace(/<\/(p|li|div|h[1-6]|span)>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .split('\n')
  .map((line) => line.replace(/\s+/g, ' ').trim())
  .filter(Boolean);

const normalize = (value: string) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]/g, '');

export async function loadCurrentWebsiteAwards(): Promise<WebsiteAward[]> {
  const year = new Date().getFullYear();
  try {
    const response = await fetch(AWARDS_URL, { next: { revalidate: 21600 } });
    if (!response.ok) return fallbackAwards(year);
    const html = await response.text();

    // The awards page groups the current competition around image assets named with the current year.
    // Isolating that window prevents a wine from accidentally inheriting an older award farther down the page.
    const marker = new RegExp(`${year}[^"'<>]{0,100}Award-Badges`, 'i');
    const markerMatch = marker.exec(html);
    if (!markerMatch) return fallbackAwards(year);
    const start = Math.max(0, markerMatch.index - 18000);
    let end = html.length;
    for (let previousYear = year - 1; previousYear >= year - 4; previousYear -= 1) {
      const idx = html.search(new RegExp(`${previousYear}[^"'<>]{0,100}Award`, 'i'));
      if (idx > markerMatch.index && idx < end) end = idx;
    }
    const lines = htmlToLines(html.slice(start, end));
    const resultPattern = RESULTS.join('|').replace(/ /g, '\\s+');
    const linePattern = new RegExp(`^(.{2,120}?)\\s*\\|\\s*(${resultPattern})\\s*$`, 'i');
    const seen = new Set<string>();
    const awards: WebsiteAward[] = [];

    for (const line of lines) {
      const match = line.match(linePattern);
      if (!match) continue;
      const wineName = match[1].trim();
      const rawResult = match[2].replace(/\s+/g, ' ').trim();
      const result = RESULTS.find((candidate) => candidate.toLowerCase() === rawResult.toLowerCase()) || rawResult;
      const key = `${normalize(wineName)}-${normalize(result)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      awards.push({
        id: `website-${year}-${normalize(wineName)}-${normalize(result)}`,
        wineName,
        year,
        competition: 'San Francisco Chronicle Wine Competition',
        result,
      });
    }
    return awards.length ? awards : fallbackAwards(year);
  } catch (error) {
    console.warn('Unable to refresh awards from lwc.wine', error);
    return fallbackAwards(year);
  }
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

export function matchWebsiteAwards(title: string, vintage: string, brand: string, awards: WebsiteAward[]): Award[] {
  const base = stripBrand(title, brand);
  const candidates = new Set([
    normalize(title),
    normalize(base),
    normalize(`${vintage} ${title}`),
    normalize(`${vintage} ${base}`),
  ]);

  return awards
    .filter((award) => {
      const awardName = normalize(award.wineName);
      const noYearAwardName = normalize(award.wineName.replace(/^20\d{2}\s+/, ''));
      return candidates.has(awardName) || candidates.has(noYearAwardName);
    })
    .map(({ wineName: _wineName, ...award }) => award);
}
