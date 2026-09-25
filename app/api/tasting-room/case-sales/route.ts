import { NextRequest, NextResponse } from 'next/server';
import { sessionRole } from '@/lib/auth';
import { caseSalesGoalMetrics, parseCaseSalesCsv, type CaseSalesSummary } from '@/lib/case-sales';
import { caseSalesStorageConfigured, loadLatestCaseSalesSummary, saveCaseSalesSummary } from '@/lib/case-sales-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function responsePayload(summary: CaseSalesSummary | null, storageConfigured: boolean) {
  return {
    summary,
    metrics: summary ? caseSalesGoalMetrics(summary) : null,
    storageConfigured,
  };
}

export async function GET() {
  const role = await sessionRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (role !== 'admin' && role !== 'tasting') return NextResponse.json({ error: 'Tasting Room or Admin access is required.' }, { status: 403 });

  const storageConfigured = await caseSalesStorageConfigured();
  if (!storageConfigured) return NextResponse.json(responsePayload(null, false));
  try {
    const summary = await loadLatestCaseSalesSummary();
    return NextResponse.json(responsePayload(summary, true));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load case-sales tracking.' }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const role = await sessionRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (role !== 'admin' && role !== 'tasting') return NextResponse.json({ error: 'Tasting Room or Admin access is required.' }, { status: 403 });

  const storageConfigured = await caseSalesStorageConfigured();
  if (!storageConfigured) return NextResponse.json({ error: 'Vercel Blob is not connected to Central.' }, { status: 409 });

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a Commerce7 CSV report to upload.' }, { status: 400 });
  if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
    return NextResponse.json({ error: 'The case-sales report must be a CSV file.' }, { status: 415 });
  }
  if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: 'Case-sales CSV files must be 25 MB or smaller.' }, { status: 413 });

  try {
    const previous = await loadLatestCaseSalesSummary().catch(() => null);
    const summary = parseCaseSalesCsv(await file.text(), file.name, previous);
    await saveCaseSalesSummary(summary);
    return NextResponse.json(responsePayload(summary, true));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to process this case-sales report.' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const role = await sessionRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (role !== 'admin') return NextResponse.json({ error: 'Only Admin access can change the case-sales goal.' }, { status: 403 });

  const storageConfigured = await caseSalesStorageConfigured();
  if (!storageConfigured) return NextResponse.json({ error: 'Vercel Blob is not connected to Central.' }, { status: 409 });

  try {
    const current = await loadLatestCaseSalesSummary();
    if (!current) return NextResponse.json({ error: 'Upload a case-sales CSV before setting the goal.' }, { status: 409 });
    const body = await request.json() as { goalCases?: unknown; goalEndDate?: unknown };
    const goalCases = Number(body.goalCases);
    const goalEndDate = typeof body.goalEndDate === 'string' ? body.goalEndDate.trim() : '';
    if (!Number.isFinite(goalCases) || goalCases <= 0 || !Number.isInteger(goalCases)) {
      return NextResponse.json({ error: 'Goal cases must be a whole number greater than zero.' }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(goalEndDate)) {
      return NextResponse.json({ error: 'Choose a valid goal end date.' }, { status: 400 });
    }

    const summary: CaseSalesSummary = {
      ...current,
      goalCases,
      goalEndDate,
    };
    await saveCaseSalesSummary(summary);
    return NextResponse.json(responsePayload(summary, true));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save the case-sales goal.' }, { status: 502 });
  }
}
