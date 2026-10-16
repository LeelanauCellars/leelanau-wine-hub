import { del, list, put } from '@vercel/blob';
import { labelFileKind, type LabelLibraryItem } from '@/lib/labels';

const PREFIX = 'labels/library/';

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'label';
}

function safeFilename(value: string) {
  const parts = value.split('.');
  const ext = parts.length > 1 ? `.${parts.pop()!.toLowerCase().replace(/[^a-z0-9]+/g, '')}` : '';
  const stem = parts.join('.').replace(/[^a-zA-Z0-9 _()-]+/g, '').trim().replace(/\s+/g, '-').slice(0, 120) || 'file';
  return `${stem}${ext}`;
}

export async function listUploadedLabels(): Promise<LabelLibraryItem[]> {
  const result = await list({ prefix: PREFIX, limit: 1000 });
  const manifests = result.blobs.filter((blob) => /\/manifest\.json$/i.test(blob.pathname));
  const items = await Promise.all(manifests.map(async (blob) => {
    try {
      const response = await fetch(blob.url, { cache: 'no-store' });
      if (!response.ok) return null;
      const item = await response.json() as LabelLibraryItem;
      return item?.id && item?.name && Array.isArray(item.files) ? item : null;
    } catch {
      return null;
    }
  }));
  return items.filter((item): item is LabelLibraryItem => Boolean(item)).sort((a, b) => Date.parse(b.uploadedAt || '') - Date.parse(a.uploadedAt || ''));
}

export async function uploadLabelEntry(name: string, vintage: string, files: File[]): Promise<LabelLibraryItem> {
  const stamp = Date.now();
  const slug = slugify(name);
  const id = `${slug}-${stamp}`;
  const folder = `${PREFIX}${id}`;
  const uploadedFiles: LabelLibraryItem['files'] = [];

  for (const file of files) {
    const pathname = `${folder}/${safeFilename(file.name)}`;
    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.type || undefined,
      cacheControlMaxAge: 60,
    });
    uploadedFiles.push({
      name: file.name,
      kind: labelFileKind(file.name),
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      size: file.size,
    });
  }

  const imageFile = uploadedFiles.find((file) => file.kind === 'png' || file.kind === 'jpg' || file.kind === 'svg');
  const item: LabelLibraryItem = {
    id,
    slug: id,
    name: name.trim().slice(0, 160),
    vintage: vintage.trim().slice(0, 20) || undefined,
    source: 'uploaded',
    uploadedAt: new Date().toISOString(),
    preview: imageFile?.url,
    files: uploadedFiles,
  };

  await put(`${folder}/manifest.json`, JSON.stringify(item, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json; charset=utf-8',
    cacheControlMaxAge: 60,
  });
  return item;
}

export async function deleteUploadedLabel(id: string) {
  const safeId = id.replace(/[^a-z0-9-]+/gi, '');
  if (!safeId || safeId !== id) throw new Error('Invalid label id.');
  const result = await list({ prefix: `${PREFIX}${safeId}/`, limit: 100 });
  if (!result.blobs.length) return;
  await del(result.blobs.map((blob) => blob.url));
}
