import { NextRequest, NextResponse } from 'next/server';
import { sessionRole } from '@/lib/auth';
import { SEED_LABELS } from '@/lib/labels';
import { deleteUploadedLabel, listUploadedLabels, uploadLabelEntry } from '@/lib/label-library-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_EXTENSIONS = new Set(['ai', 'pdf', 'png', 'jpg', 'jpeg', 'svg']);
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_FILES = 8;

export async function GET() {
  const role = await sessionRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (role === 'tasting') return NextResponse.json({ error: 'Labels are available to Admin and Sales access.' }, { status: 403 });

  try {
    const uploaded = await listUploadedLabels();
    return NextResponse.json({ labels: [...uploaded, ...SEED_LABELS], canUpload: role === 'admin' });
  } catch (error) {
    console.error('Unable to list label library', error);
    // Keep the bundled library usable even if Blob is not configured yet.
    return NextResponse.json({ labels: SEED_LABELS, canUpload: role === 'admin', storageConfigured: false });
  }
}

export async function POST(request: NextRequest) {
  const role = await sessionRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (role !== 'admin') return NextResponse.json({ error: 'Only Admin access can upload label files.' }, { status: 403 });

  const form = await request.formData();
  const name = String(form.get('name') || '').trim();
  const vintage = String(form.get('vintage') || '').trim();
  const files = form.getAll('files').filter((value): value is File => value instanceof File && value.size > 0);

  if (!name) return NextResponse.json({ error: 'Enter a label name.' }, { status: 400 });
  if (!files.length) return NextResponse.json({ error: 'Choose at least one label file.' }, { status: 400 });
  if (files.length > MAX_FILES) return NextResponse.json({ error: `Upload up to ${MAX_FILES} files for one label entry.` }, { status: 400 });
  for (const file of files) {
    const ext = file.name.toLowerCase().split('.').pop() || '';
    if (!ALLOWED_EXTENSIONS.has(ext)) return NextResponse.json({ error: `${file.name} is not a supported label file. Use AI, PDF, PNG, JPG or SVG.` }, { status: 415 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: `${file.name} is larger than 25 MB.` }, { status: 413 });
  }

  try {
    const label = await uploadLabelEntry(name, vintage, files);
    return NextResponse.json({ ok: true, label });
  } catch (error) {
    console.error('Unable to upload label', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to upload label files.' }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest) {
  const role = await sessionRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (role !== 'admin') return NextResponse.json({ error: 'Only Admin access can delete uploaded label files.' }, { status: 403 });
  const id = request.nextUrl.searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'Missing label id.' }, { status: 400 });
  try {
    await deleteUploadedLabel(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Unable to delete label', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to delete label.' }, { status: 502 });
  }
}
