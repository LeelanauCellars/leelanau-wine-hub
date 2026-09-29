export type LabelLibraryFile = {
  name: string;
  kind: 'ai' | 'pdf' | 'png' | 'jpg' | 'svg' | 'other';
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
  files: LabelLibraryFile[];
};

const base = '/labels/originals';

export const SEED_LABELS: LabelLibraryItem[] = [
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
  files: [
    { name: ai, kind: 'ai' as const, url: `${base}/${slug}/${ai}` },
    { name: pdf, kind: 'pdf' as const, url: `${base}/${slug}/${pdf}` },
  ],
}));

export function labelFileKind(filename: string): LabelLibraryFile['kind'] {
  const ext = filename.toLowerCase().split('.').pop() || '';
  if (ext === 'ai') return 'ai';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'png') return 'png';
  if (ext === 'jpg' || ext === 'jpeg') return 'jpg';
  if (ext === 'svg') return 'svg';
  return 'other';
}
