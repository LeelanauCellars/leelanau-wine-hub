import { randomUUID } from 'node:crypto';

type BlobAuth = { token: string; storeId: string };
export type BlobListItem = { url: string; downloadUrl: string; pathname: string; size: number; uploadedAt: string; etag?: string };

function normalizeStoreId(value: string) {
  return value.startsWith('store_') ? value.slice('store_'.length) : value;
}

function blobAuth(): BlobAuth | null {
  const rw = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (rw) {
    const storeId = rw.split('_')[3] || '';
    if (storeId) return { token: rw, storeId: normalizeStoreId(storeId) };
  }
  const oidc = process.env.VERCEL_OIDC_TOKEN?.trim();
  const storeId = process.env.BLOB_STORE_ID?.trim();
  if (oidc && storeId) return { token: oidc, storeId: normalizeStoreId(storeId) };
  return null;
}

export function blobConfigured() {
  return Boolean(blobAuth());
}

function headers(auth: BlobAuth, extra?: Record<string, string>) {
  return {
    Authorization: `Bearer ${auth.token}`,
    'x-vercel-blob-store-id': auth.storeId,
    'x-api-version': '12',
    'x-api-blob-request-id': `${auth.storeId}:${Date.now()}:${randomUUID()}`,
    'x-api-blob-request-attempt': '0',
    ...extra,
  };
}

export async function listMenuBlobs() {
  const auth = blobAuth();
  if (!auth) return [] as BlobListItem[];
  const url = new URL('https://vercel.com/api/blob');
  url.searchParams.set('prefix', 'tasting-room/menu-');
  url.searchParams.set('limit', '100');
  const response = await fetch(url, { headers: headers(auth), cache: 'no-store' });
  if (!response.ok) throw new Error(`Unable to read menu storage (${response.status}).`);
  const data = await response.json() as { blobs?: BlobListItem[] };
  return (data.blobs || []).sort((a, b) => Date.parse(b.uploadedAt) - Date.parse(a.uploadedAt));
}

export async function uploadMenuPdf(bytes: ArrayBuffer) {
  const auth = blobAuth();
  if (!auth) throw new Error('Vercel Blob is not connected to this project.');
  const pathname = `tasting-room/menu-${Date.now()}.pdf`;
  const url = new URL('https://vercel.com/api/blob/');
  url.searchParams.set('pathname', pathname);
  const response = await fetch(url, {
    method: 'PUT',
    headers: headers(auth, {
      'x-vercel-blob-access': 'public',
      'x-content-type': 'application/pdf',
      'x-add-random-suffix': '0',
      'x-cache-control-max-age': '60',
    }),
    body: bytes,
    cache: 'no-store',
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Menu upload failed (${response.status}): ${body.slice(0, 180)}`);
  }
  return response.json() as Promise<BlobListItem>;
}
