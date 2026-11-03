import { NextRequest, NextResponse } from 'next/server';
import { sessionRole } from '@/lib/auth';
import { parseStockStatusPages } from '@/lib/stock-inventory';
import { readStockPdfPages } from '@/lib/stock-inventory-pdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const role = await sessionRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  if (role !== 'admin' && role !== 'tasting') return NextResponse.json({ error: 'Tasting Room or Admin access is required.' }, { status: 403 });

  try {
    const file = (await request.formData()).get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a stock-status PDF to upload.' }, { status: 400 });
    if (!file.name.toLowerCase().endsWith('.pdf') || (file.type && file.type !== 'application/pdf')) {
      return NextResponse.json({ error: 'Please upload a PDF file.' }, { status: 415 });
    }
    // Vercel's normal function request body limit is 4.5 MB.
    if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: 'For now, PDFs must be smaller than 4 MB. Contact Admin if your report is larger.' }, { status: 413 });
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (new TextDecoder().decode(bytes.subarray(0, 5)) !== '%PDF-') return NextResponse.json({ error: 'The selected file is not a valid PDF.' }, { status: 415 });

    const pages = await readStockPdfPages(bytes);
    const result = parseStockStatusPages(pages, file.name);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to read stock report.' }, { status: 422 });
  }
}
