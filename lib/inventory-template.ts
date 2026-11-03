import type ExcelJS from 'exceljs';
import type { StockTotal, WineCostCenter } from '@/lib/stock-inventory';

export type TemplateTarget = {
  sheetName: string;
  headerRow: number;
  productCodeColumn: number;
  stockColumn: number;
  matches: number;
  readyToFill: number;
  existingValues: number;
  formulaCells: number;
  notInReport: number;
  preview: Array<{ row: number; productCode: string; stockQty: number; currentValue: string }>;
};

type TemplateWorkbook = ExcelJS.Workbook;

export const WINE_COST_CENTER_SHEETS: Record<WineCostCenter, string> = {
  '102': 'TR - E21',
  '104': 'ECOMM - E21',
};

export function expectedWineSheet(costCenter: WineCostCenter) {
  return WINE_COST_CENTER_SHEETS[costCenter];
}

export function findWineTarget(targets: TemplateTarget[], costCenter: WineCostCenter): TemplateTarget | null {
  const expected = expectedWineSheet(costCenter);
  return targets.find((target) => target.sheetName.trim().toUpperCase() === expected.toUpperCase()) ?? null;
}


const normalize = (value: unknown) => String(value ?? '').trim().toUpperCase().replace(/\s+/g, ' ');
const code = (value: unknown) => normalize(value);
const isFormula = (value: unknown) => typeof value === 'object' && value !== null && 'formula' in value;
const isBlank = (value: unknown) => value === undefined || value === null || value === '';
const codeHeader = (value: unknown) => /^(?:E21\s+)?PRODUCT\s*CODE$/.test(normalize(value));
const statusHeader = (value: unknown) => /^(?:E21\s+)?(?:STOCK\s+STATUS|STK\s*QTY(?:\s+SUM)?|STOCK\s+QTY)$/.test(normalize(value));
const getValue = (item: ExcelJS.Cell) => item.value;

export function listTemplateTargets(workbook: TemplateWorkbook, totals: StockTotal[]): TemplateTarget[] {
  const map = new Map(totals.map((entry) => [code(entry.productCode), entry.stockQty]));
  const targets: TemplateTarget[] = [];
  for (const sheet of workbook.worksheets) {
    for (let headerRow = 1; headerRow <= Math.min(30, sheet.rowCount); headerRow++) {
      const header = sheet.getRow(headerRow);
      let codeColumn = -1;
      let stockColumn = -1;
      header.eachCell({ includeEmpty: false }, (cell, col) => {
        if (codeHeader(cell.value)) codeColumn = col;
        if (statusHeader(cell.value)) stockColumn = col;
      });
      if (codeColumn < 0 || stockColumn < 0 || codeColumn === stockColumn) continue;
      let matches = 0;
      let readyToFill = 0;
      let existingValues = 0;
      let formulaCells = 0;
      let notInReport = 0;
      const preview: TemplateTarget['preview'] = [];
      for (let rowNo = headerRow + 1; rowNo <= sheet.rowCount; rowNo++) {
        const row = sheet.getRow(rowNo);
        const productCode = code(getValue(row.getCell(codeColumn)));
        if (!productCode) continue;
        if (!map.has(productCode)) { notInReport++; continue; }
        matches++;
        const value = getValue(row.getCell(stockColumn));
        if (isFormula(value)) formulaCells++;
        else if (!isBlank(value)) existingValues++;
        else readyToFill++;
        if (preview.length < 8) preview.push({ row: rowNo, productCode, stockQty: map.get(productCode)!, currentValue: isFormula(value) ? 'Formula (protected)' : isBlank(value) ? 'Blank' : String(value).slice(0, 50) });
      }
      if (matches || sheet.name.toLowerCase().includes('e21')) {
        targets.push({ sheetName: sheet.name, headerRow, productCodeColumn: codeColumn, stockColumn, matches, readyToFill, existingValues, formulaCells, notInReport, preview });
      }
    }
  }
  return targets.sort((a,b) => {
    const priority = (t: TemplateTarget) => (/^TR\s*-\s*E21$/i.test(t.sheetName) ? 200 : /E21/i.test(t.sheetName) ? 100 : 0) + t.matches;
    return priority(b)-priority(a);
  });
}

export function fillTemplate(workbook: TemplateWorkbook, totals: StockTotal[], target: TemplateTarget, overwriteExisting: boolean) {
  const sheet = workbook.getWorksheet(target.sheetName);
  if (!sheet) throw new Error('The selected worksheet is missing.');
  const map = new Map(totals.map((entry) => [code(entry.productCode), entry.stockQty]));
  let updated = 0;
  let skippedExisting = 0;
  let skippedFormula = 0;
  const matched = new Set<string>();
  for (let rowNo = target.headerRow + 1; rowNo <= sheet.rowCount; rowNo++) {
    const row = sheet.getRow(rowNo);
    const productCode = code(row.getCell(target.productCodeColumn).value);
    if (!map.has(productCode)) continue;
    matched.add(productCode);
    const cell = row.getCell(target.stockColumn);
    if (isFormula(cell.value)) { skippedFormula++; continue; }
    if (!overwriteExisting && !isBlank(cell.value)) { skippedExisting++; continue; }
    const stockQty = map.get(productCode)!;
    cell.value = stockQty;
    cell.numFmt = Number.isInteger(stockQty) ? '#,##0' : '#,##0.####';
    updated++;
  }
  return { updated, skippedExisting, skippedFormula, unmatchedProductCodes: totals.filter((item) => !matched.has(code(item.productCode))).map((item)=>item.productCode) };
}
