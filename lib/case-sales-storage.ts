import { list, put } from '@vercel/blob';
import type { CaseSalesSummary } from '@/lib/case-sales';

const PREFIX = 'tasting-room/case-sales/summary-';

export async function loadLatestCaseSalesSummary() {
  const result = await list({ prefix: PREFIX, limit: 100 });
  const latest = [...result.blobs].sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())[0];
  if (!latest) return null;
  const response = await fetch(latest.url, { cache: 'no-store' });
  if (!response.ok) throw new Error('The latest case-sales summary could not be loaded.');
  return await response.json() as CaseSalesSummary;
}

export async function saveCaseSalesSummary(summary: CaseSalesSummary) {
  const pathname = `${PREFIX}${Date.now()}.json`;
  const payload = JSON.stringify(summary, null, 2);
  await put(pathname, payload, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json; charset=utf-8',
    cacheControlMaxAge: 60,
  });
  return summary;
}

export async function caseSalesStorageConfigured() {
  try {
    await list({ prefix: 'tasting-room/case-sales/', limit: 1 });
    return true;
  } catch {
    return false;
  }
}
