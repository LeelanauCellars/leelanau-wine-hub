import { NextRequest, NextResponse } from 'next/server';
import { sessionRole } from '@/lib/auth';
import { listMenuBlobs, loadMenuSelection, loadMenuText, saveMenuSelection, uploadMenuPdf } from '@/lib/blob-rest';
import { CURRENT_TASTING_MENU_TEXT } from '@/lib/tasting-room-content';

const FALLBACK_MENU = '/tasting-room/current-menu.pdf';
const FALLBACK_UPDATED = '2026-09-22T00:00:00.000Z';

async function menuStorageState() {
  try {
    const blobs = await listMenuBlobs();
    return { current: blobs[0] || null, storageConfigured: true };
  } catch (error) {
    console.error('Unable to load current tasting room menu from Blob', error);
    return { current: null, storageConfigured: false };
  }
}

export async function GET(request: NextRequest) {
  const role = await sessionRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { current, storageConfigured } = await menuStorageState();
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

  let menuText = CURRENT_TASTING_MENU_TEXT.trim();
  let textSource = current ? 'unavailable' : 'bundled';
  let textError = '';
  let selectedSlugs: string[] | null = null;

  if (current) {
    try {
      const extracted = await loadMenuText(current);
      menuText = extracted.text;
      textSource = extracted.source;
    } catch (error) {
      textError = error instanceof Error ? error.message : 'Unable to read menu text.';
      console.error('Unable to build tasting-menu notes text', error);
    }
    try {
      selectedSlugs = await loadMenuSelection(current);
    } catch (error) {
      console.error('Unable to load tasting-menu selection override', error);
    }
  }

  return NextResponse.json({
    filename: 'Leelanau Cellars Current Tasting Room Menu.pdf',
    updatedAt: current?.uploadedAt || FALLBACK_UPDATED,
    source: current ? 'vercel-blob' : 'bundled',
    storageConfigured,
    canReplace: role === 'admin',
    downloadUrl: '/api/tasting-room/menu?download=1',
    viewUrl: '/api/tasting-room/menu?inline=1',
    menuText,
    textSource,
    textError,
    selectedSlugs,
    selectionSource: selectedSlugs ? 'admin-override' : 'pdf-text',
  });
}

export async function POST(request: NextRequest) {
  const role = await sessionRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (role !== 'admin') return NextResponse.json({ error: 'Only Admin access can replace the official menu PDF.' }, { status: 403 });
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a PDF to upload.' }, { status: 400 });
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) return NextResponse.json({ error: 'The current menu must be a PDF.' }, { status: 415 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'Menu PDFs must be 10 MB or smaller.' }, { status: 413 });

  try {
    const uploaded = await uploadMenuPdf(file);
    return NextResponse.json({ ok: true, uploadedAt: uploaded.uploadedAt || new Date().toISOString(), menuText: uploaded.menuText });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to upload menu.' }, { status: 502 });
  }
}

export async function PUT(request: NextRequest) {
  const role = await sessionRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (role !== 'admin') return NextResponse.json({ error: 'Only Admin access can change the notes list.' }, { status: 403 });

  const body = await request.json() as { selectedSlugs?: unknown };
  if (!Array.isArray(body.selectedSlugs) || !body.selectedSlugs.every((value) => typeof value === 'string')) {
    return NextResponse.json({ error: 'A valid wine selection is required.' }, { status: 400 });
  }

  const { current } = await menuStorageState();
  if (!current) return NextResponse.json({ error: 'Upload the tasting-room menu to Blob before saving notes-list corrections.' }, { status: 409 });

  try {
    const selectedSlugs = body.selectedSlugs.map((value) => value.trim()).filter(Boolean);
    await saveMenuSelection(current, selectedSlugs);
    return NextResponse.json({ ok: true, selectedSlugs });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save the notes list.' }, { status: 502 });
  }
}
