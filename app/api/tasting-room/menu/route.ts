import { NextRequest, NextResponse } from 'next/server';
import { sessionRole } from '@/lib/auth';
import { blobConfigured, listMenuBlobs, uploadMenuPdf } from '@/lib/blob-rest';

const FALLBACK_MENU = '/tasting-room/current-menu.pdf';
const FALLBACK_UPDATED = '2026-09-22T00:00:00.000Z';

async function latestMenu() {
  if (!blobConfigured()) return null;
  try {
    const blobs = await listMenuBlobs();
    return blobs[0] || null;
  } catch (error) {
    console.error('Unable to load current tasting room menu from Blob', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const role = await sessionRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const current = await latestMenu();
  const wantsDownload = request.nextUrl.searchParams.get('download') === '1';
  const wantsInline = request.nextUrl.searchParams.get('inline') === '1';
  if (wantsDownload || wantsInline) {
    const target = current?.url || new URL(FALLBACK_MENU, request.url).toString();
    const fileResponse = await fetch(target, { cache: 'no-store' });
    if (!fileResponse.ok) return NextResponse.json({ error: 'The current menu PDF could not be loaded.' }, { status: 502 });
    const bytes = await fileResponse.arrayBuffer();
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${wantsDownload ? 'attachment' : 'inline'}; filename="Leelanau Cellars Current Tasting Room Menu.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  }

  return NextResponse.json({
    filename: 'Leelanau Cellars Current Tasting Room Menu.pdf',
    updatedAt: current?.uploadedAt || FALLBACK_UPDATED,
    source: current ? 'vercel-blob' : 'bundled',
    storageConfigured: blobConfigured(),
    canReplace: role === 'admin',
    downloadUrl: '/api/tasting-room/menu?download=1',
    viewUrl: '/api/tasting-room/menu?inline=1',
  });
}

export async function POST(request: NextRequest) {
  const role = await sessionRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (role !== 'admin') return NextResponse.json({ error: 'Only Admin access can replace the official menu PDF.' }, { status: 403 });
  if (!blobConfigured()) return NextResponse.json({ error: 'Connect Vercel Blob to this project before replacing the menu PDF.' }, { status: 503 });

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a PDF to upload.' }, { status: 400 });
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) return NextResponse.json({ error: 'The current menu must be a PDF.' }, { status: 415 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'Menu PDFs must be 10 MB or smaller.' }, { status: 413 });

  try {
    const uploaded = await uploadMenuPdf(await file.arrayBuffer());
    return NextResponse.json({ ok: true, uploadedAt: uploaded.uploadedAt || new Date().toISOString() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to upload menu.' }, { status: 502 });
  }
}
