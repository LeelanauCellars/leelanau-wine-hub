import { NextRequest, NextResponse } from 'next/server';
import { sessionRole } from '@/lib/auth';
import { aggregateStockLines, isShipperCode, type StockLine } from '@/lib/stock-inventory';
import { expectedWineSheet, fillTemplate, findWineTarget, listTemplateTargets } from '@/lib/inventory-template';
import type { WineCostCenter } from '@/lib/stock-inventory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const role = await sessionRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  if (role !== 'admin' && role !== 'tasting') return NextResponse.json({ error: 'Tasting Room or Admin access is required.' }, { status: 403 });

  try {
    const form = await request.formData();
    const file = form.get('template');
    if (!(file instanceof File) || !/\.xlsx$/i.test(file.name)) return NextResponse.json({ error: 'Choose an Excel .xlsx workbook.' }, { status: 415 });
    if (file.size > 3 * 1024 * 1024) return NextResponse.json({ error: 'For now, Excel templates must be 3 MB or smaller.' }, { status: 413 });
    if (form.get('mode') === 'merch') throw new Error('Merch & Apparel Inventory creates a separate spreadsheet. Workbook filling is available for Wine Inventory only.');
    const sourceCostCenter = String(form.get('costCenter') || '');
    if (sourceCostCenter !== '102' && sourceCostCenter !== '104') {
      throw new Error('Could not identify a single cost center 102 or 104 in the uploaded stock-status report. Workbook filling has been stopped to avoid updating the wrong sheet.');
    }
    const costCenter = sourceCostCenter as WineCostCenter;
    const excludeShippers = form.get('excludeShippers') !== 'false';
    const parsed = JSON.parse(String(form.get('includedRows') || '[]')) as StockLine[];
    if (!Array.isArray(parsed) || !parsed.length || parsed.length > 25000) throw new Error('Upload and calculate a stock-status PDF before filling a workbook.');
    const valid = parsed.filter((row) =>
      row && typeof row.productCode === 'string' && !!row.productCode.trim() && !!row.lotNumber &&
      !row.destinationDocument && (!excludeShippers || !isShipperCode(row.productCode)) &&
      typeof row.stockQty === 'number' && Number.isFinite(row.stockQty) && Math.abs(row.stockQty) < 1e12
    );
    const totals = aggregateStockLines(valid);
    if (!totals.length) throw new Error('No stock data is available to populate the workbook.');
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(await file.arrayBuffer()) as never);
    const candidates = listTemplateTargets(workbook, totals);
    const selected = findWineTarget(candidates, costCenter);
    if (!selected) throw new Error(`This is a ${costCenter} wine report, but the workbook does not have a usable ${expectedWineSheet(costCenter)} worksheet with Product Code and E21 Stock Status columns. No sheets were modified.`);
    if (!selected.matches) throw new Error(`No Product Codes in the report match those in ${selected.sheetName}. Check that you uploaded the correct workbook before proceeding.`);

    if (form.get('action') !== 'fill') {
      return NextResponse.json({ candidates: [selected], defaultSheet: selected.sheetName, productCodesInReport: totals.length, costCenter }, { headers: { 'Cache-Control': 'no-store' } });
    }
    const desiredSheet = String(form.get('sheetName') || '');
    if (desiredSheet !== selected.sheetName) throw new Error(`This ${costCenter} report is restricted to ${selected.sheetName}; another worksheet cannot be selected.`);
    const target = selected;
    const { updated, skippedExisting, skippedFormula, unmatchedProductCodes } = fillTemplate(workbook, totals, target, form.get('overwriteExisting') === 'true');
    if (!updated) throw new Error('No values were filled in the cost-center worksheet. Turn on “Update existing Stock Status values” if those cells already contain numbers.');
    const result = Buffer.from(await workbook.xlsx.writeBuffer());
    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(new Uint8Array(result), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Leelanau-Filled-Inventory-${stamp}.xlsx"`,
        'X-Inventory-Filled': String(updated),
        'X-Inventory-Skipped': String(skippedExisting + skippedFormula),
        'X-Inventory-Unmatched': String(unmatchedProductCodes.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not process Excel template.' }, { status: 422 });
  }
}
