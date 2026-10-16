import { list, put } from '@vercel/blob';
import { extractPdfText } from '@/lib/pdf-text';

export type BlobListItem = {
  url: string;
  downloadUrl: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  etag?: string;
};

function toItem(blob: {
  url: string;
  downloadUrl: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
  etag?: string;
}): BlobListItem {
  return {
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    pathname: blob.pathname,
    size: blob.size,
    uploadedAt: blob.uploadedAt instanceof Date ? blob.uploadedAt.toISOString() : String(blob.uploadedAt),
    etag: blob.etag,
  };
}

function menuBasePath(pathname: string) {
  return pathname.replace(/\.pdf$/i, '');
}

function menuTextPath(pathname: string) {
  return `${menuBasePath(pathname)}.txt`;
}

function menuSelectionPrefix(pathname: string) {
  return `${menuBasePath(pathname)}-selection-`;
}

async function exactBlob(pathname: string) {
  const result = await list({ prefix: pathname, limit: 25 });
  const match = result.blobs.find((blob) => blob.pathname === pathname);
  return match ? toItem(match) : null;
}

/**
 * Read tasting-room menu PDFs through Vercel's supported Blob SDK.
 * The SDK uses the Blob store connection attached to the Vercel project,
 * including Vercel's current OIDC-based authentication flow.
 */
export async function listMenuBlobs() {
  const result = await list({
    prefix: 'tasting-room/menu-',
    limit: 100,
  });

  return result.blobs
    .filter((blob) => /\.pdf$/i.test(blob.pathname))
    .map(toItem)
    .sort((a, b) => Date.parse(b.uploadedAt) - Date.parse(a.uploadedAt));
}

export async function loadMenuText(menu: BlobListItem) {
  const textPath = menuTextPath(menu.pathname);
  const textBlob = await exactBlob(textPath);
  if (textBlob) {
    const response = await fetch(textBlob.url, { cache: 'no-store' });
    if (response.ok) {
      const text = (await response.text()).trim();
      if (text) return { text, source: 'blob-text' as const };
    }
  }

  const pdfResponse = await fetch(menu.url, { cache: 'no-store' });
  if (!pdfResponse.ok) throw new Error('The current menu PDF could not be read for notes matching.');
  const text = await extractPdfText(await pdfResponse.arrayBuffer());
  if (!text) throw new Error('No readable text was found in the current menu PDF.');

  try {
    await put(textPath, text, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'text/plain; charset=utf-8',
      cacheControlMaxAge: 60,
    });
  } catch (error) {
    // A concurrent request may have created the companion text file first.
    console.warn('Unable to cache extracted tasting-menu text in Blob', error);
  }

  return { text, source: 'pdf-extracted' as const };
}

export async function loadMenuSelection(menu: BlobListItem) {
  const result = await list({ prefix: menuSelectionPrefix(menu.pathname), limit: 100 });
  const latest = [...result.blobs].sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())[0];
  if (!latest) return null;

  const response = await fetch(latest.url, { cache: 'no-store' });
  if (!response.ok) return null;
  try {
    const payload = await response.json() as { selectedSlugs?: unknown };
    if (!Array.isArray(payload.selectedSlugs)) return null;
    return payload.selectedSlugs.filter((value): value is string => typeof value === 'string' && Boolean(value.trim()));
  } catch {
    return null;
  }
}

export async function saveMenuSelection(menu: BlobListItem, selectedSlugs: string[]) {
  const pathname = `${menuSelectionPrefix(menu.pathname)}${Date.now()}.json`;
  const payload = JSON.stringify({ selectedSlugs, savedAt: new Date().toISOString() }, null, 2);
  return put(pathname, payload, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json; charset=utf-8',
    cacheControlMaxAge: 60,
  });
}

export async function uploadMenuPdf(file: File) {
  const timestamp = Date.now();
  const pathname = `tasting-room/menu-${timestamp}.pdf`;
  const bytes = await file.arrayBuffer();
  const menuText = await extractPdfText(bytes);
  if (!menuText) throw new Error('The PDF uploaded, but Central could not find readable menu text. Please export the tasting menu as a text-based PDF and try again.');

  const blob = await put(pathname, file, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/pdf',
    cacheControlMaxAge: 60,
  });

  await put(`tasting-room/menu-${timestamp}.txt`, menuText, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'text/plain; charset=utf-8',
    cacheControlMaxAge: 60,
  });

  return {
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    pathname: blob.pathname,
    size: bytes.byteLength,
    uploadedAt: new Date().toISOString(),
    etag: blob.etag,
    menuText,
  } satisfies BlobListItem & { menuText: string };
}
