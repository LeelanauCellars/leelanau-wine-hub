import { list, put } from '@vercel/blob';

export type BlobListItem = {
  url: string;
  downloadUrl: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  etag?: string;
};

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

  return [...result.blobs]
    .map((blob) => ({
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt:
        blob.uploadedAt instanceof Date
          ? blob.uploadedAt.toISOString()
          : String(blob.uploadedAt),
      etag: blob.etag,
    }))
    .sort((a, b) => Date.parse(b.uploadedAt) - Date.parse(a.uploadedAt));
}

export async function uploadMenuPdf(file: File) {
  const pathname = `tasting-room/menu-${Date.now()}.pdf`;
  const blob = await put(pathname, file, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/pdf',
    cacheControlMaxAge: 60,
  });

  return {
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    pathname: blob.pathname,
    size: 0,
    uploadedAt: new Date().toISOString(),
    etag: blob.etag,
  } satisfies BlobListItem;
}
