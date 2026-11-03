import { NextRequest, NextResponse } from 'next/server';
import { sessionRole } from '@/lib/auth';
import { aggregateStockLines, isShipperCode, type InventoryMode, type StockLine } from '@/lib/stock-inventory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ExportRequest = { fileName?: string; mode?: InventoryMode; excludeShippers?: boolean; includedRows?: StockLine[]; excludedRows?: StockLine[] };

export async function POST(request: NextRequest) {
  const role = await sessionRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (role !== 'admin' && role !== 'tasting') return NextResponse.json({ error: 'Tasting Room or Admin access is required.' }, { status: 403 });

  try {
    const body = await request.json() as ExportRequest;
    if (!Array.isArray(body.includedRows) || body.includedRows.length < 1 || body.includedRows.length > 25000) {
      return NextResponse.json({ error: 'There are no stock rows available to export.' }, { status: 400 });
    }
    const mode = body.mode === 'merch' ? 'merch' : 'wine';
    const excludeShippers = body.excludeShippers !== false;
    const rows = body.includedRows.map((row) => ({
      productCode: typeof row.productCode === 'string' ? row.productCode.trim().slice(0, 150) : '',
      lotNumber: typeof row.lotNumber === 'string' ? row.lotNumber.trim().slice(0, 150) : '',
      destinationDocument: typeof row.destinationDocument === 'string' ? row.destinationDocument.trim() : '',
      destinationRelease: typeof row.destinationRelease === 'string' ? row.destinationRelease.trim() : '',
      receiptDate: typeof row.receiptDate === 'string' ? row.receiptDate.trim() : '',
      stockQty: typeof row.stockQty === 'number' ? row.stockQty : null,
      page: Number(row.page) || 0,
    })).filter((row) => row.productCode && (mode === 'merch' || !!row.lotNumber) && !row.destinationDocument && (!excludeShippers || !isShipperCode(row.productCode)) && row.stockQty !== null && Number.isFinite(row.stockQty));
    if (!rows.length) throw new Error('There are no valid stock rows to export.');

    const totals = aggregateStockLines(rows);
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Leelanau Cellars Central';
    workbook.subject = `Stock quantity by Product Code (${mode} mode; DEST DOC excluded)`;
    workbook.created = new Date();

    const summary = workbook.addWorksheet('Stock by Product', { views: [{ state: 'frozen', ySplit: 3 }] });
    const detail = workbook.addWorksheet('Included Rows', { views: [{ state: 'frozen', ySplit: 1 }] });
    const excluded = workbook.addWorksheet('Excluded Rows', { views: [{ state: 'frozen', ySplit: 1 }] });
    const blue = '17304B';
    const pale = 'EDF3F9';
    const headerStyle = (sheet: typeof summary, rowNo = 1) => {
      const row = sheet.getRow(rowNo);
      row.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${blue}` } };
      row.alignment = { vertical: 'middle' };
      row.height = 24;
    };
    const addBanding = (sheet: typeof summary, from: number) => {
      for (let i = from; i <= sheet.rowCount; i++) {
        if ((i - from) % 2) sheet.getRow(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${pale}` } };
      }
    };

    summary.mergeCells('A1:B1');
    summary.getCell('A1').value = `${mode === 'merch' ? 'MERCH / APPAREL' : 'WINE'} STOCK STATUS · PRODUCT CODE TOTALS`;
    summary.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    summary.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${blue}` } };
    summary.getRow(1).height = 30;
    summary.mergeCells('A2:B2');
    summary.getCell('A2').value = `Source: ${(body.fileName || 'Uploaded stock-status PDF').slice(0, 150)} | ${mode === 'wine' ? 'Lot required' : 'Lot optional'} | DEST DOC excluded${excludeShippers ? ' | Shipper excluded' : ''}`;
    summary.getCell('A2').font = { italic: true, color: { argb: 'FF60758A' }, size: 10 };
    summary.addRow(['Product Code', 'STK QTY Sum']);
    headerStyle(summary, 3);
    summary.columns = [{ width: 43 }, { width: 19 }];

    detail.columns = [
      { header: 'Product Code', key: 'productCode', width: 42 },
      { header: 'Lot Number', key: 'lotNumber', width: 20 },
      { header: 'STK QTY', key: 'stockQty', width: 19 },
      { header: 'Receipt Date', key: 'receiptDate', width: 19 },
      { header: 'PDF Page', key: 'page', width: 13 },
    ];
    headerStyle(detail);
    for (const item of rows) { const row = detail.addRow(item); row.getCell(3).numFmt = Number.isInteger(item.stockQty!) ? '#,##0' : '#,##0.####'; }
    detail.autoFilter = { from: 'A1', to: `E${detail.rowCount}` };
    addBanding(detail, 2);

    for (const [index, item] of totals.entries()) {
      const n = index + 4;
      const row = summary.addRow([item.productCode, null]);
      row.getCell(2).numFmt = Number.isInteger(item.stockQty) ? '#,##0' : '#,##0.####';
      row.getCell(2).value = {
        formula: `SUMIF('Included Rows'!$A$2:$A$${detail.rowCount},A${n},'Included Rows'!$C$2:$C$${detail.rowCount})`,
        result: item.stockQty,
      };
    }
    summary.autoFilter = { from: 'A3', to: `B${summary.rowCount}` };
    addBanding(summary, 4);

    excluded.columns = [
      { header: 'Product Code', key: 'productCode', width: 40 },
      { header: 'Lot Number', key: 'lotNumber', width: 18 },
      { header: 'DEST DOC', key: 'destinationDocument', width: 17 },
      { header: 'STK QTY', key: 'stockQty', width: 15 },
      { header: 'Reason Excluded', key: 'reason', width: 25 },
      { header: 'PDF Page', key: 'page', width: 13 },
    ];
    headerStyle(excluded);
    for (const item of (Array.isArray(body.excludedRows) ? body.excludedRows : []).slice(0, 25000)) {
      const row = excluded.addRow({ productCode: item.productCode, lotNumber: item.lotNumber, destinationDocument: item.destinationDocument, stockQty: item.stockQty, reason: item.reason, page: item.page });
      if (typeof item.stockQty === 'number') row.getCell(4).numFmt = Number.isInteger(item.stockQty) ? '#,##0' : '#,##0.####';
    }
    excluded.autoFilter = { from: 'A1', to: `F${Math.max(2, excluded.rowCount)}` };
    addBanding(excluded, 2);

    const bytes = Buffer.from(await workbook.xlsx.writeBuffer());
    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Leelanau-${mode === 'merch' ? 'Merch-Apparel' : 'Wine'}-Stock-Status-${date}.xlsx"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not export the spreadsheet.' }, { status: 422 });
  }
}
