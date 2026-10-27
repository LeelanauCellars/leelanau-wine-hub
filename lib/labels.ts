export type LabelLibraryFile = {
  name: string;
  kind: 'ai' | 'pdf' | 'png' | 'jpg' | 'svg' | 'eps' | 'indd' | 'idml' | 'zip' | 'other';
  url: string;
  downloadUrl?: string;
  size?: number;
};

export type LabelLibraryItem = {
  id: string;
  slug: string;
  name: string;
  vintage?: string;
  source: 'bundled' | 'uploaded';
  uploadedAt?: string;
  preview?: string;
  previewBack?: string;
  editable?: { front?: string; back?: string };
  downloadOnly?: boolean;
  files: LabelLibraryFile[];
};

const base = '/labels/originals';

const peninsulaLabels: LabelLibraryItem[] = [
  ['late-harvest-vignoles','Late Harvest Vignoles','0118-0042-PC-NewGen-Late-Harvest-Vignoles-f-v2-250902.ai','0118-0042-PC-NewGen-Late-Harvest-Vignoles-f-v2-250902.pdf'],
  ['late-harvest-pinot-grigio','Late Harvest Pinot Grigio','0118-0042-PC-NewGen-Late-Harvest-Pinot-Grigio-f-v2-250902.ai','0118-0042-PC-NewGen-Late-Harvest-Pinot-Grigio-f-v2-250902.pdf'],
  ['sweet-baco-noir','Sweet Baco Noir','0118-0042-PC-NewGen-Sweet-Baco-Noir-v1.ai','0118-0042-PC-NewGen-Sweet-Baco-Noir-v1.pdf'],
  ['limited-batch-vignoles','Limited Batch Vignoles','0118-0042-PC-NewGen-Limited-Batch-Vignoles-f-v2-250902.ai','0118-0042-PC-NewGen-Limited-Batch-Vignoles-f-v2-250902.pdf'],
  ['rose-bubbly','Rosé Bubbly','0118-0042-PC-NewGen-Rose-Bubbly-v3.ai','0118-0042-PC-NewGen-Rose-Bubbly-v3.pdf'],
  ['gewurztraminer','Gewürztraminer','0118-0042-PC-NewGen-Gewurztraminer-f-v2-250902.ai','0118-0042-PC-NewGen-Gewurztraminer-f-v2-250902.pdf'],
  ['blanc-de-noir','Blanc De Noir','0118-0042-PC-NewGen-Blanc-De-Noir-v1.ai','0118-0042-PC-NewGen-Blanc-De-Noir-v1.pdf'],
  ['limited-batch-chardonnay','Limited Batch Chardonnay','0118-0042-PC-NewGen-Limited-Batch-Chardonnay-v2.ai','0118-0042-PC-NewGen-Limited-Batch-Chardonnay-v2.pdf'],
  ['cuvee-blanc','Cuvée Blanc','0118-0042-PC-NewGen-Cuvee-Blanc-v2.ai','0118-0042-PC-NewGen-Cuvee-Blanc-v2.pdf'],
  ['late-harvest-gewurztraminer','Late Harvest Gewürztraminer','0118-0042-PC-NewGen-Late-Harvest-Gewurztraminer-f-v2-250902.ai','0118-0042-PC-NewGen-Late-Harvest-Gewurztraminer-f-v2-250902.pdf'],
  ['limited-batch-riesling','Limited Batch Riesling','0118-0042-PC-NewGen-Limited-Batch-Riesling-v2.ai','0118-0042-PC-NewGen-Limited-Batch-Riesling-v2.pdf'],
  ['sweet-pinot-grigio','Sweet Pinot Grigio','0118-0042-PC-NewGen-Sweet-Pinot-Grigio-v1.ai','0118-0042-PC-NewGen-Sweet-Pinot-Grigio-v1.pdf'],
  ['dry-riesling','Dry Riesling','0118-0042-PC-NewGen-Dry-Riesling-f-v2-250902.ai','0118-0042-PC-NewGen-Dry-Riesling-f-v2-250902.pdf'],
  ['brut','Brut','0118-0042-PC-NewGen-Brut-v2.ai','0118-0042-PC-NewGen-Brut-v2.pdf'],
].map(([slug,name,ai,pdf]) => ({
  id: `seed-${slug}`,
  slug,
  name,
  vintage: '2024',
  source: 'bundled' as const,
  preview: `${base}/${slug}/preview-1.png`,
  previewBack: `${base}/${slug}/preview-2.png`,
  editable: { front: `/labels/editable/${slug}/front.json`, back: `/labels/editable/${slug}/back.json` },
  files: [
    { name: ai, kind: 'ai' as const, url: `${base}/${slug}/${ai}` },
    { name: pdf, kind: 'pdf' as const, url: `${base}/${slug}/${pdf}` },
  ],
}));


const witchesBrewLabels: LabelLibraryItem[] = [
  {
    id: 'seed-witches-brew-original', slug: 'witches-brew-original', name: 'Witches Brew Original', source: 'bundled', downloadOnly: true,
    preview: `${base}/witches-brew-original/preview-1.png`, previewBack: `${base}/witches-brew-original/preview-2.png`,
    files: [{ name: 'Witches Brew Original - Source Files.zip', kind: 'zip', url: `${base}/witches-brew-original/witches-brew-original-source-files.zip`, downloadUrl: `${base}/witches-brew-original/witches-brew-original-source-files.zip` }],
  },
  {
    id: 'seed-witches-brew-pumpkin-spice', slug: 'witches-brew-pumpkin-spice', name: 'Witches Brew Pumpkin Spice', source: 'bundled', downloadOnly: true,
    preview: `${base}/witches-brew-pumpkin-spice/preview-1.png`, previewBack: `${base}/witches-brew-pumpkin-spice/preview-2.png`,
    files: [{ name: 'Witches Brew Pumpkin Spice - Source Files.zip', kind: 'zip', url: `${base}/witches-brew-pumpkin-spice/witches-brew-pumpkin-spice-source-files.zip`, downloadUrl: `${base}/witches-brew-pumpkin-spice/witches-brew-pumpkin-spice-source-files.zip` }],
  },
  {
    id: 'seed-witches-brew-spiced-apple', slug: 'witches-brew-spiced-apple', name: 'Witches Brew Spiced Apple', source: 'bundled', downloadOnly: true,
    preview: `${base}/witches-brew-spiced-apple/preview-1.png`, previewBack: `${base}/witches-brew-spiced-apple/preview-2.png`,
    files: [{ name: 'Witches Brew Spiced Apple - Source Files.zip', kind: 'zip', url: `${base}/witches-brew-spiced-apple/witches-brew-spiced-apple-source-files.zip`, downloadUrl: `${base}/witches-brew-spiced-apple/witches-brew-spiced-apple-source-files.zip` }],
  },
  {
    id: 'seed-witches-brew-stelvin', slug: 'witches-brew-stelvin', name: 'Witches Brew Stelvin Design', source: 'bundled', downloadOnly: true,
    preview: `${base}/witches-brew-stelvin/preview-1.png`,
    files: [{ name: 'Witches Brew Stelvin Design - Source Files.zip', kind: 'zip', url: `${base}/witches-brew-stelvin/witches-brew-stelvin-source-files.zip`, downloadUrl: `${base}/witches-brew-stelvin/witches-brew-stelvin-source-files.zip` }],
  },
];



const seasonalLabels: LabelLibraryItem[] = [
  {
    id: 'seed-seasonal-autumn-harvest', slug: 'seasonal-autumn-harvest', name: 'Autumn Harvest', source: 'bundled', downloadOnly: true,
    preview: `${base}/seasonal-autumn-harvest/preview-2.png`, previewBack: `${base}/seasonal-autumn-harvest/preview-1.png`,
    files: [{ name: 'Autumn Harvest - Production Files.zip', kind: 'zip', url: `${base}/seasonal-autumn-harvest/seasonal-autumn-harvest-production-files.zip`, downloadUrl: `${base}/seasonal-autumn-harvest/seasonal-autumn-harvest-production-files.zip` }],
  },
  {
    id: 'seed-seasonal-spring-splendor', slug: 'seasonal-spring-splendor', name: 'Spring Splendor', source: 'bundled', downloadOnly: true,
    preview: `${base}/seasonal-spring-splendor/preview-2.png`, previewBack: `${base}/seasonal-spring-splendor/preview-1.png`,
    files: [{ name: 'Spring Splendor - Production Files.zip', kind: 'zip', url: `${base}/seasonal-spring-splendor/seasonal-spring-splendor-production-files.zip`, downloadUrl: `${base}/seasonal-spring-splendor/seasonal-spring-splendor-production-files.zip` }],
  },
  {
    id: 'seed-seasonal-summer-sunset', slug: 'seasonal-summer-sunset', name: 'Summer Sunset', source: 'bundled', downloadOnly: true,
    preview: `${base}/seasonal-summer-sunset/preview-2.png`, previewBack: `${base}/seasonal-summer-sunset/preview-1.png`,
    files: [{ name: 'Summer Sunset - Production Files.zip', kind: 'zip', url: `${base}/seasonal-summer-sunset/seasonal-summer-sunset-production-files.zip`, downloadUrl: `${base}/seasonal-summer-sunset/seasonal-summer-sunset-production-files.zip` }],
  },
  {
    id: 'seed-seasonal-winter-white', slug: 'seasonal-winter-white', name: 'Winter White', source: 'bundled', downloadOnly: true,
    preview: `${base}/seasonal-winter-white/preview-2.png`, previewBack: `${base}/seasonal-winter-white/preview-1.png`,
    files: [{ name: 'Winter White - Production Files.zip', kind: 'zip', url: `${base}/seasonal-winter-white/seasonal-winter-white-production-files.zip`, downloadUrl: `${base}/seasonal-winter-white/seasonal-winter-white-production-files.zip` }],
  },
  {
    id: 'seed-seasonal-winter-white-1l', slug: 'seasonal-winter-white-1l', name: 'Winter White 1L', source: 'bundled', downloadOnly: true,
    preview: `${base}/seasonal-winter-white-1l/preview-2.png`, previewBack: `${base}/seasonal-winter-white-1l/preview-1.png`,
    files: [{ name: 'Winter White 1L - Production Files.zip', kind: 'zip', url: `${base}/seasonal-winter-white-1l/seasonal-winter-white-1l-production-files.zip`, downloadUrl: `${base}/seasonal-winter-white-1l/seasonal-winter-white-1l-production-files.zip` }],
  },
];

const fruitChillLabels: LabelLibraryItem[] = [
  ['fruit-chill-mango', 'Mango Fruit Chill'],
  ['fruit-chill-watermelon', 'Watermelon Fruit Chill'],
  ['fruit-chill-peach', 'Peach Fruit Chill'],
  ['fruit-chill-blackberry', 'Blackberry Fruit Chill'],
].map(([slug, name]) => ({
  id: `seed-${slug}`,
  slug,
  name,
  source: 'bundled' as const,
  downloadOnly: true,
  preview: `${base}/${slug}/preview-1.png`,
  files: [{ name: `${name} - Production PDF.pdf`, kind: 'pdf' as const, url: `${base}/${slug}/${slug}-production.pdf`, downloadUrl: `${base}/${slug}/${slug}-production.pdf` }],
}));

export const SEED_LABELS: LabelLibraryItem[] = [...seasonalLabels, ...witchesBrewLabels, ...fruitChillLabels, ...peninsulaLabels];

export function labelFileKind(filename: string): LabelLibraryFile['kind'] {
  const ext = filename.toLowerCase().split('.').pop() || '';
  if (ext === 'ai') return 'ai';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'png') return 'png';
  if (ext === 'jpg' || ext === 'jpeg') return 'jpg';
  if (ext === 'svg') return 'svg';
  if (ext === 'eps') return 'eps';
  if (ext === 'indd') return 'indd';
  if (ext === 'idml') return 'idml';
  if (ext === 'zip') return 'zip';
  return 'other';
}
