import type { WineRecord } from './types';

export type StaffWineReference = {
  name: string;
  description: string;
  rsStyle: string;
  abv: string;
  composition: string;
  appellation: string;
  vintage: string;
  casesProduced: string;
  aging: string;
};

export const STAFF_WINE_REFERENCE: StaffWineReference[] = [
  {
    "name": "Baco Noir",
    "description": "Fun Fact: Baco Noir was one of the first grapes ever planted by Leelanau Cellars. \n\nPronounced acidity and notes of cherry, cedar",
    "rsStyle": "Medium",
    "abv": "11",
    "composition": "Baco Noir",
    "appellation": "Leelanau Peninsula",
    "vintage": "2021",
    "casesProduced": "709",
    "aging": "Barrel"
  },
  {
    "name": "Baco Noir The End",
    "description": "Final grapes from Pleasant Hill Baco vines, first planted in 1976 (one of oldest in region)\n\nStrong earthy and cherry flavors",
    "rsStyle": "Low",
    "abv": "13",
    "composition": "Baco Noir",
    "appellation": "Leelanau Peninsula",
    "vintage": "2022",
    "casesProduced": "174",
    "aging": "Barrel"
  },
  {
    "name": "Brüt",
    "description": "Blend of four grapes, led by Chardonnay and Pinot Gris\n\nSubtle pear flavors with dry effervescence",
    "rsStyle": "Medium",
    "abv": "12",
    "composition": "45% Chardonnay, 45% Pinot Gris, 5% Sauvignon Blanc, 5% Vignoles",
    "appellation": "Leelanau Peninsula",
    "vintage": "2024",
    "casesProduced": "143",
    "aging": "Steel"
  },
  {
    "name": "Brüt Sur Lie",
    "description": "Aged on lees for richness and depth\n\nFruit forward with a rounded palate",
    "rsStyle": "Low",
    "abv": "12.5",
    "composition": "55.02% Chardonnay, 40.7% Pinot Gris, 4.27% Sauvignon Blanc",
    "appellation": "Leelanau Peninsula",
    "vintage": "2024",
    "casesProduced": "141",
    "aging": "Steel"
  },
  {
    "name": "Chardonnay",
    "description": "Ripe peach aroma\n\nFull-bodied with honeydew, melon, and starfruit flavors",
    "rsStyle": "Medium",
    "abv": "12.5",
    "composition": "Chardonnay",
    "appellation": "Leelanau Peninsula",
    "vintage": "2023",
    "casesProduced": "215",
    "aging": "Steel"
  },
  {
    "name": "Cherry Cordial",
    "description": "Ripe cherry flavors wrapped in velvety chocolate\n\nSmooth finish",
    "rsStyle": "High",
    "abv": "12",
    "composition": "Baco Noir",
    "appellation": "Leelanau Peninsula",
    "vintage": "NV",
    "casesProduced": "221",
    "aging": "Steel"
  },
  {
    "name": "Cherry Dessert Wine",
    "description": "Port-style wine fortified with brandy\n\nBold cherry flavors, perfect to end a meal",
    "rsStyle": "High",
    "abv": "19",
    "composition": "",
    "appellation": "American",
    "vintage": "NV",
    "casesProduced": "226",
    "aging": "Stainless Steel"
  },
  {
    "name": "Chocolate Cherry Dessert",
    "description": "Fortified port-style wine\n\nCherry flavors with a chocolate finish",
    "rsStyle": "High",
    "abv": "18",
    "composition": "Baco Noir",
    "appellation": "Leelanau Peninsula",
    "vintage": "NV",
    "casesProduced": "222",
    "aging": "Steel"
  },
  {
    "name": "Cuvee Blanc",
    "description": "Blend of 3 grapes, led by Riesling\n\nNotes of citrus, tropical fruit",
    "rsStyle": "Medium",
    "abv": "11.5",
    "composition": "60% Riesling, 20% Chardonnay, 20% Vignoles",
    "appellation": "Leelanau Peninsula",
    "vintage": "2024",
    "casesProduced": "105",
    "aging": "Steel"
  },
  {
    "name": "Dry Riesling",
    "description": "Crisp, dry white with citrus and green apple notes\n\nClean and refreshing",
    "rsStyle": "Medium",
    "abv": "12",
    "composition": "Riesling",
    "appellation": "Leelanau Peninsula",
    "vintage": "2022",
    "casesProduced": "357",
    "aging": "Steel"
  },
  {
    "name": "Gewürz Bubbly",
    "description": "A first of its kind for our winery\n\nSkin contact adds hue, soft tannins, and earthy notes\n\nFloral Gewürztraminer character",
    "rsStyle": "Low",
    "abv": "12",
    "composition": "Gewürztraminer",
    "appellation": "Leelanau Peninsula",
    "vintage": "2024",
    "casesProduced": "77",
    "aging": "Steel"
  },
  {
    "name": "Gewürztraminer",
    "description": "Floral and green apple notes with a hint of ginger",
    "rsStyle": "Medium",
    "abv": "13.5",
    "composition": "Gewürztraminer",
    "appellation": "Leelanau Peninsula",
    "vintage": "2024",
    "casesProduced": "99",
    "aging": "Steel"
  },
  {
    "name": "Late Harvest Gewürztraminer",
    "description": "Rich sweetness from extended ripening\n\nIntense apricot and honey flavors",
    "rsStyle": "High",
    "abv": "13",
    "composition": "Gewürztraminer",
    "appellation": "Leelanau Peninsula",
    "vintage": "2024",
    "casesProduced": "54",
    "aging": "Steel"
  },
  {
    "name": "Late Harvest Riesling",
    "description": "Apricot, lemon, and tropical fruit notes\n\nSweet yet balanced by bright acidity",
    "rsStyle": "High",
    "abv": "10",
    "composition": "Riesling",
    "appellation": "Leelanau Peninsula",
    "vintage": "2022",
    "casesProduced": "1058",
    "aging": "Steel"
  },
  {
    "name": "Limited Batch Cabernet Sauvignon",
    "description": "Dark cherry, ripe blackberry, cedar\n\nFirst ever Cab Sauv vintage in winery's history. Usually part of Meritage blend.",
    "rsStyle": "Low",
    "abv": "14",
    "composition": "Cabernet Sauvignon",
    "appellation": "Leelanau Peninsula",
    "vintage": "2024",
    "casesProduced": "48",
    "aging": "Oak"
  },
  {
    "name": "Limited Batch Pinot Grigio",
    "description": "Crisp with citrus flavors\n\nHighlights the 2023 growing season",
    "rsStyle": "Low",
    "abv": "13",
    "composition": "Pinot Gris",
    "appellation": "Leelanau Peninsula",
    "vintage": "2023",
    "casesProduced": "251",
    "aging": "Steel"
  },
  {
    "name": "Limited Batch Riesling",
    "description": "Bright, energetic lemon notes\n\nWarm-weather growing season shaped the flavor and smoothness of a classic Riesling",
    "rsStyle": "Medium",
    "abv": "11",
    "composition": "Riesling",
    "appellation": "Leelanau Peninsula",
    "vintage": "2024",
    "casesProduced": "103",
    "aging": "Steel"
  },
  {
    "name": "Limited Batch Rosé",
    "description": "Made with 100% Foch\n\nLight, fruity, crisp",
    "rsStyle": "Medium",
    "abv": "10.5",
    "composition": "100% Foch",
    "appellation": "Michigan",
    "vintage": "2023",
    "casesProduced": "115",
    "aging": "Steel"
  },
  {
    "name": "Limited Release Meritage",
    "description": "Blend of Bordeaux varietals from Omena vineyard\n\nRich and structured",
    "rsStyle": "Low",
    "abv": "13",
    "composition": "Merlot 73.7%, Cab Franc 12.4%, Cab Sauv 13.9%",
    "appellation": "Leelanau Peninsula",
    "vintage": "2022",
    "casesProduced": "213",
    "aging": "Barrel"
  },
  {
    "name": "Limited Release Merlot",
    "description": "Black cherry and light oak\n\nMedium-bodied with a polished finish",
    "rsStyle": "Low",
    "abv": "13",
    "composition": "Merlot",
    "appellation": "Leelanau Peninsula",
    "vintage": "2023",
    "casesProduced": "128",
    "aging": "Barrel"
  },
  {
    "name": "Merlot",
    "description": "Black cherry and light oak\n\nMedium-bodied with a polished finish",
    "rsStyle": "Low",
    "abv": "12",
    "composition": "",
    "appellation": "",
    "vintage": "",
    "casesProduced": "",
    "aging": ""
  },
  {
    "name": "Meritage",
    "description": "Dark fruit like black cherry and blackberry\n\nOak-aged, with structure and cedar-like dryness",
    "rsStyle": "Low",
    "abv": "13",
    "composition": "Merlot 54%, Cab Franc 27%, Cab Sauv 18.1%",
    "appellation": "Leelanau Peninsula",
    "vintage": "2022",
    "casesProduced": "446",
    "aging": "Barrel"
  },
  {
    "name": "Merlot",
    "description": "Black cherry and light oak\n\nMedium-bodied with a polished finish",
    "rsStyle": "Low",
    "abv": "13",
    "composition": "Merlot",
    "appellation": "Leelanau Peninsula",
    "vintage": "2023",
    "casesProduced": "109",
    "aging": "Barrel"
  },
  {
    "name": "Nouveau",
    "description": "100% Baco Noir, bottled within a month of harvest\n\nLight and fruity with a smooth finish",
    "rsStyle": "Medium",
    "abv": "12",
    "composition": "100% Baco Noir",
    "appellation": "Leelanau Peninsula",
    "vintage": "2024",
    "casesProduced": "195",
    "aging": "Steel"
  },
  {
    "name": "Pinot Grigio",
    "description": "Aromas of fresh fruit with honey and lemon\n\nSubtle dryness on the finish",
    "rsStyle": "Low",
    "abv": "12.7",
    "composition": "Pinot Gris",
    "appellation": "Leelanau Peninsula",
    "vintage": "2022",
    "casesProduced": "1153",
    "aging": "Steel"
  },
  {
    "name": "Pinot Noir",
    "description": "Cherry and earthy notes\n\nSilky and approachable texture",
    "rsStyle": "Low",
    "abv": "12",
    "composition": "Pinot Noir",
    "appellation": "Leelanau Peninsula",
    "vintage": "2023",
    "casesProduced": "207",
    "aging": "Barrel"
  },
  {
    "name": "Pleasant Hill Pinot Grigio",
    "description": "Grapes from Pleasant Hill vineyard\n\nVibrant, fresh flavors",
    "rsStyle": "Low",
    "abv": "12.5",
    "composition": "Pinot Gris",
    "appellation": "Leelanau Peninsula",
    "vintage": "2023",
    "casesProduced": "523",
    "aging": "Steel"
  },
  {
    "name": "Raspberry Dessert Wine",
    "description": "Port-style, fortified with brandy\n\nForceful raspberry flavors\n\nA pleasant meal finisher",
    "rsStyle": "High",
    "abv": "19",
    "composition": "",
    "appellation": "American",
    "vintage": "NV",
    "casesProduced": "312",
    "aging": "Stainless Steel"
  },
  {
    "name": "Renaissance",
    "description": "Chardonnay, Vignoles, and Riesling blend\n\nFruity sweetness, honey, and crisp finish",
    "rsStyle": "Medium",
    "abv": "11",
    "composition": "55% Chardonnay, 25% Vignoles, 20% Riesling",
    "appellation": "Leelanau Peninsula",
    "vintage": "2024",
    "casesProduced": "213",
    "aging": "Steel"
  },
  {
    "name": "Rosé",
    "description": "Made from Foch and Grüner Veltliner\n\nFruity and crisp",
    "rsStyle": "Medium",
    "abv": "10.5",
    "composition": "90% Foch, 10% Grüner Veltliner",
    "appellation": "Michigan",
    "vintage": "2023",
    "casesProduced": "415",
    "aging": "Steel"
  },
  {
    "name": "Rosé Bubbly",
    "description": "Sweet Rose Bubbly\n\nLH Pinot Grigio, Riesling, Baco provide  cherry flavors, hint of pears/citrus",
    "rsStyle": "High",
    "abv": "12",
    "composition": "76% Pinot Gris, 12% Riesling, 12% Baco Noir",
    "appellation": "Leelanau Peninsula",
    "vintage": "2024",
    "casesProduced": "148",
    "aging": "Steel"
  },
  {
    "name": "Sauvignon Blanc",
    "description": "Tropical tree fruits and dry grapefruit\n\nSmall batch",
    "rsStyle": "Low",
    "abv": "13.5",
    "composition": "Sauvignon Blanc",
    "appellation": "Leelanau Peninsula",
    "vintage": "2025",
    "casesProduced": "38",
    "aging": "Steel"
  },
  {
    "name": "Semi-Dry Bubbly",
    "description": "Semi-dry with caramelized green apple\n\nOrange Muscat finish, snappy fizz",
    "rsStyle": "High",
    "abv": "11",
    "composition": "100% Riesling",
    "appellation": "Leelanau Peninsula",
    "vintage": "2023",
    "casesProduced": "96",
    "aging": "Steel"
  },
  {
    "name": "Semi-Dry Riesling",
    "description": "Apricot aroma with green apple and pear notes\n\nFinishes with balanced, refreshing acidity",
    "rsStyle": "Medium",
    "abv": "11",
    "composition": "Riesling",
    "appellation": "Leelanau Peninsula",
    "vintage": "2022",
    "casesProduced": "742",
    "aging": "Steel"
  },
  {
    "name": "Sweet Baco Noir",
    "description": "Aged in steel instead of oak\n\nFruit-forward with cherry and cranberry flavors",
    "rsStyle": "Low",
    "abv": "12",
    "composition": "Baco Noir",
    "appellation": "Leelanau Peninsula",
    "vintage": "2022",
    "casesProduced": "211",
    "aging": "Steel"
  },
  {
    "name": "Sleeping Bear Red",
    "description": "Dry red blend inspired by the beauty of Sleeping Bear Dunes\n\nRich, layered, smooth finish",
    "rsStyle": "Low",
    "abv": "12.5",
    "composition": "45% Merlot, 40% Baco Noir, 9% Teroldego, 3% Petit Sirah, 3% Zinfandel",
    "appellation": "American",
    "vintage": "NV",
    "casesProduced": "215",
    "aging": "Barrel"
  },
  {
    "name": "Sweet Pinot Grigio",
    "description": "Slightly later harvest\n\nRipe fruit and floral undertones",
    "rsStyle": "Medium",
    "abv": "12",
    "composition": "Pinot Grigio",
    "appellation": "Leelanau Peninsula",
    "vintage": "2024",
    "casesProduced": "268",
    "aging": "Steel"
  },
  {
    "name": "Vignoles",
    "description": "Semi-sweet with tropical fruit aromas and honeysuckle\n\nBright acidity",
    "rsStyle": "Medium",
    "abv": "10.5",
    "composition": "Vignoles",
    "appellation": "Leelanau Peninsula",
    "vintage": "2022",
    "casesProduced": "424",
    "aging": "Steel"
  },
  {
    "name": "Vintage Port",
    "description": "Subtle dried red fruit and fig flavors\n\nAromas of nuts, praline, and mocha",
    "rsStyle": "High",
    "abv": "18.5",
    "composition": "",
    "appellation": "Leelanau Peninsula",
    "vintage": "2020",
    "casesProduced": "343",
    "aging": "Oak"
  },
  {
    "name": "Vignoles Limited Batch",
    "description": "Smooth with tropical fruit flavors\n\nHighlights a standout growing season",
    "rsStyle": "High",
    "abv": "10.5",
    "composition": "Vignoles",
    "appellation": "Leelanau Peninsula",
    "vintage": "2023",
    "casesProduced": "101",
    "aging": "Steel"
  }
] as StaffWineReference[];

export const VINTAGE_VITICULTURE_NOTES: Record<string, string> = {
  "2019": "Harsh winterkill and a cold, wet growing season led to very low yields and low heat accumulation.",
  "2020": "Average heat but a very wet season, with slightly below-average yields and some late-September frost.",
  "2021": "A long, warm and mostly dry season with low yields, excellent sugar development and slightly elevated acidity.",
  "2022": "Average heat with high yields and good sugar development; slightly elevated acidity adds structure and body.",
  "2023": "High-quality yields and a warm finish to the season produced prominent fruit, good texture and pronounced acidity.",
  "2024": "A warm, dry season with an August–October drought produced high sugars, lower acidity and more intense flavors.",
  "2025": "An overall average season with low yields, high sugar content and acidity that remained balanced rather than excessive."
};

export const SPECIAL_VITICULTURE_NOTES: Record<string, string> = {
  "2024 Sauvignon Blanc": "Pre-bloom leaf pulling was used to encourage tropical passionfruit and guava character; the vineyard was hand-picked."
};

export const GENERAL_VITICULTURE_PRACTICES = {
  "redVinifera": "Red vinifera are cropped low to maximize berry ripeness, generally targeting one cluster per shoot when crop levels allow.",
  "vinifera": "Vinifera fruit zones are opened after fruit set to increase sunlight and airflow around the berries.",
  "hybrid": "Hybrid fruit zones are opened and shoots are combed downward to expose berries to heat and help reduce acidity."
} as const;


function norm(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(leelanau cellars|farm fresh|country crush|lakeshore farms|zilly)\b/g, ' ')
    .replace(/\b20\d{2}\b/g, ' ')
    .replace(/\blimited batch\b/g, ' limited batch ')
    .replace(/\blimited release\b/g, ' limited release ')
    .replace(/\breserve\b/g, ' limited release ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\bthe end\b/, 'the end');
}

function wineVintage(wine: WineRecord) {
  const direct = String(wine.vintage || '').match(/\b(20\d{2}|19\d{2})\b/);
  if (direct) return direct[1];
  const inName = wine.name.match(/\b(20\d{2}|19\d{2})\b/);
  return inName?.[1] || '';
}

function refVintage(ref: StaffWineReference) {
  return String(ref.vintage || '').match(/\b(20\d{2}|19\d{2})\b/)?.[1] || '';
}

export function staffReferenceForWine(wine: WineRecord) {
  const target = norm(wine.name);
  const vintage = wineVintage(wine);
  const matches = STAFF_WINE_REFERENCE.filter((ref) => norm(ref.name) === target);
  if (!matches.length) {
    // Handle a few naming variants used between the tasting-room sheet and Commerce7.
    const aliases: Record<string, string[]> = {
      'baco noir the end': ['baco noir the end'],
      'rose bubbly': ['rose bubbly'],
      'cuvee blanc': ['cuvee blanc'],
    };
    const candidates = aliases[target] || [];
    const aliasMatches = STAFF_WINE_REFERENCE.filter((ref) => candidates.includes(norm(ref.name)));
    if (!aliasMatches.length) return undefined;
    if (vintage) return aliasMatches.find((ref) => refVintage(ref) === vintage) || aliasMatches[0];
    return aliasMatches[0];
  }
  if (vintage) {
    const exactVintage = matches.find((ref) => refVintage(ref) === vintage);
    if (exactVintage) return exactVintage;
    const nonVintage = matches.find((ref) => !refVintage(ref));
    if (nonVintage) return nonVintage;
    // The wine exists in the sheet, but not for this vintage. Fall back to Commerce7 rather than
    // presenting a vintage-specific tasting-room description from the wrong year.
    return undefined;
  }
  // Prefer the more complete duplicate if a sheet contains more than one row for the same wine.
  return [...matches].sort((a, b) => {
    const score = (ref: StaffWineReference) =>
      [ref.description, ref.rsStyle, ref.abv, ref.composition, ref.appellation, ref.vintage, ref.casesProduced, ref.aging].filter(Boolean).length;
    return score(b) - score(a);
  })[0];
}

export function vintageViticultureForWine(wine: WineRecord, ref?: StaffWineReference) {
  const vintage = wineVintage(wine) || refVintage(ref || ({} as StaffWineReference));
  if (!vintage) return '';
  const specialKey = `${vintage} ${wine.name}`;
  const special = Object.entries(SPECIAL_VITICULTURE_NOTES).find(([key]) => norm(key) === norm(specialKey));
  return special?.[1] || VINTAGE_VITICULTURE_NOTES[vintage] || '';
}

export function viticulturePracticeForWine(wine: WineRecord, ref?: StaffWineReference) {
  const haystack = `${wine.varietal || ''} ${ref?.composition || ''} ${wine.name}`.toLowerCase();
  if (/\b(cabernet sauvignon|cabernet franc|pinot noir|merlot)\b/.test(haystack)) {
    return GENERAL_VITICULTURE_PRACTICES.redVinifera;
  }
  if (/\b(baco noir|vignoles|foch|frontenac|marquette|la crescent|traminette|cayuga|valvin)\b/.test(haystack)) {
    return GENERAL_VITICULTURE_PRACTICES.hybrid;
  }
  if (ref?.appellation?.toLowerCase().includes('leelanau peninsula')) {
    return GENERAL_VITICULTURE_PRACTICES.vinifera;
  }
  return '';
}

export function staffFlavorProfile(wine: WineRecord, ref?: StaffWineReference) {
  if (ref?.description) return ref.description;
  return wine.tastingNotes || wine.shortDescription || wine.staffPitch || '';
}

export function staffStyleLabel(wine: WineRecord, ref?: StaffWineReference) {
  if (ref?.rsStyle) return `RS: ${ref.rsStyle}`;
  return wine.sweetness || wine.rs || wine.category || 'Wine';
}
