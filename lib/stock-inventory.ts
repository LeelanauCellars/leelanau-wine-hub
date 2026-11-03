/**
 * Warehouse stock-status import. Product codes are never normalized or deduplicated
 * by anything other than their exact displayed code. All quantities are STKQTY
 * as printed in the PDF (no bottle/case conversion).
 */
export type StockLine = {
  productCode: string;
  lotNumber: string;
  destinationDocument: string;
  destinationRelease: string;
  receiptDate: string;
  stockQty: number | null;
  page: number;
  reason?: 'No lot number' | 'DEST DOC populated' | 'Invalid STKQTY' | 'Shipper item';
};

export type StockTotal = { productCode: string; stockQty: number; rows: number };
export type WineCostCenter = '102' | '104';
export type InventoryMode = 'wine' | 'merch';
export type StockOptions = { mode?: InventoryMode; excludeShippers?: boolean };
export function isShipperCode(code: string) {
  return /^SHIPPER(?:\b|[A-Z0-9 _-])/i.test(code.trim());
}


export type StockAnalysis = {
  fileName: string;
  /** Null if the report header does not identify exactly one supported cost center. */
  costCenter: WineCostCenter | null;
  /** Distinct cost centers detected in the PDF; used to prevent misrouting. */
  reportCostCenters: string[];
  mode: InventoryMode;
  excludeShippers: boolean;
  generatedAt: string;
  pageCount: number;
  includedRows: StockLine[];
  excludedRows: StockLine[];
  totals: StockTotal[];
  includedQuantity: number;
  warnings: string[];
};

export type PdfWord = { text: string; x: number; y: number };
export type PdfStockPage = { page: number; words: PdfWord[] };

type Field = 'productCode' | 'lotNumber' | 'destinationDocument' | 'destinationRelease' | 'receiptDate' | 'stockQty';
type Column = { field: Field; x: number };

const REQUIRED_FIELDS: Field[] = ['productCode', 'lotNumber', 'destinationDocument', 'stockQty'];
const HEADER_PATTERN: Record<Field, RegExp> = {
  productCode: /\bPRODUCT\s*CODE\b/i,
  lotNumber: /\bLOT\s*(?:NUMBER|NO\.?|#)\b/i,
  destinationDocument: /\bDEST\s*DOC\b/i,
  destinationRelease: /\bDEST\s*REL\b/i,
  receiptDate: /\bRECEIPT\s*DATE\b/i,
  stockQty: /\bSTK\s*QTY\b|\bSTKQTY\b|\bSTOCK\s*QTY\b/i,
};

/** Detect report cost center from the printed header rather than a filename or
 * a product row. Never guess when multiple centers appear in the same PDF. */
function getReportCostCenters(lines: PdfWord[][]): string[] {
  const found: string[] = [];
  for (const line of lines) {
    const text = line.map((word) => word.text).join(' ').replace(/\s+/g, ' ').trim();
    // Typical report header: COST CENTER : 102 - 102
    const range = text.match(/\bCOST\s*CENTER\s*:\s*(\d{3})\s*-\s*(\d{3})\b/i);
    if (range) { found.push(range[1], range[2]); continue; }
    // Some reports also print CostCenter:102 at the start of the table.
    const one = text.match(/\bCOST\s*CENTER\s*:\s*(\d{3})\b/i);
    if (one) found.push(one[1]);
  }
  return found;
}

function groupIntoLines(words: PdfWord[]) {
  const sorted = words.filter((word) => word.text.trim()).sort((a, b) => a.y - b.y || a.x - b.x);
  const lines: PdfWord[][] = [];
  for (const item of sorted) {
    const prev = lines[lines.length - 1];
    if (prev && Math.abs(prev[0].y - item.y) <= 2.2) prev.push(item);
    else lines.push([item]);
  }
  return lines.map((line) => line.sort((a, b) => a.x - b.x));
}

function headerColumns(line: PdfWord[]): Column[] | null {
  const raw = line.map((item) => item.text).join(' ');
  const found = (Object.keys(HEADER_PATTERN) as Field[]).filter((key) => HEADER_PATTERN[key].test(raw));
  if (!REQUIRED_FIELDS.every((field) => found.includes(field))) return null;

  // The warehouse stock-status report prints one text span per column heading.
  // If a header is split into words, find the first matching span, but never
  // proceed if the positions are ambiguous.
  const positions: Array<{start: number; x: number}> = [];
  let offset = 0;
  for (const word of line) {
    positions.push({ start: offset, x: word.x });
    offset += word.text.length + 1;
  }
  const cols: Column[] = [];
  for (const field of found) {
    const match = raw.match(HEADER_PATTERN[field]);
    if (!match || match.index === undefined) return null;
    const firstWord = [...positions].reverse().find((item) => item.start <= match.index!);
    if (!firstWord) return null;
    cols.push({ field, x: firstWord.x });
  }
  if (new Set(cols.map((col) => col.x.toFixed(1))).size !== cols.length) return null;
  return cols.sort((a, b) => a.x - b.x);
}

function valuesForRow(line: PdfWord[], columns: Column[]) {
  const fields: Record<Field, string> = {
    productCode: '', lotNumber: '', destinationDocument: '', destinationRelease: '', receiptDate: '', stockQty: '',
  };
  for (const word of line) {
    // Anchors are left edges of the report's fixed-width columns. A small
    // allowance for font overshoot is okay; never infer missing cells by shift.
    let index = 0;
    for (let i = 1; i < columns.length; i++) {
      if (word.x >= columns[i].x - 3) index = i;
      else break;
    }
    const key = columns[index].field;
    fields[key] += `${fields[key] ? ' ' : ''}${word.text.trim()}`;
  }
  return fields;
}

function optionalValue(value: string) {
  const normalized = value.trim();
  return /^(?:-|–|—|n\/?a|none|null)$/i.test(normalized) ? '' : normalized;
}

function numericStock(value: string) {
  const cleaned = value.trim().replace(/,/g, '');
  if (!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(cleaned) && !/^\(\d+(?:\.\d+)?\)$/.test(cleaned)) return null;
  const number = cleaned.startsWith('(') ? -Number(cleaned.slice(1, -1)) : Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

function roundQuantity(value: number) { return Math.round((value + Number.EPSILON) * 10000) / 10000; }

export function aggregateStockLines(includedRows: StockLine[]): StockTotal[] {
  const byProduct = new Map<string, StockTotal>();
  for (const line of includedRows) {
    if (line.stockQty === null) continue;
    const code = line.productCode;
    const entry = byProduct.get(code) ?? { productCode: code, stockQty: 0, rows: 0 };
    entry.stockQty = roundQuantity(entry.stockQty + line.stockQty);
    entry.rows += 1;
    byProduct.set(code, entry);
  }
  return [...byProduct.values()].sort((a, b) => a.productCode.localeCompare(b.productCode));
}

export function parseStockStatusPages(pages: PdfStockPage[], fileName: string, options: StockOptions = {}): StockAnalysis {
  const mode: InventoryMode = options.mode === 'merch' ? 'merch' : 'wine';
  const excludeShippers = options.excludeShippers !== false;
  const includedRows: StockLine[] = [];
  const excludedRows: StockLine[] = [];
  const warnings: string[] = [];
  let headerPages = 0;
  let rejectedRows = 0;
  const reportCenters = new Set<string>();

  for (const page of pages) {
    const lines = groupIntoLines(page.words);
    getReportCostCenters(lines).forEach((center) => reportCenters.add(center));
    let columns: Column[] | null = null;
    let dataStarted = false;
    let parsedOnPage = 0;
    for (const line of lines) {
      const detectedHeader = headerColumns(line);
      if (detectedHeader) {
        if (!columns) headerPages += 1;
        columns = detectedHeader;
        dataStarted = true;
        continue;
      }
      if (!dataStarted || !columns) continue;
      const cells = valuesForRow(line, columns);
      const productCode = cells.productCode.trim();
      if (!productCode || /^(?:COST\s*CENTER|LOCATION|STOCKSTATUS|PAGE\s+\d+|TOTALS?|GRAND\s*TOTAL|PRODUCT\s*CODE)/i.test(productCode)) continue;
      // Status text, timestamps, page headings and footnotes are never treated
      // as stock rows. Every actual stock row must have a numeric STKQTY cell.
      const qty = numericStock(cells.stockQty);
      const plausible = (/[A-Z0-9]/i.test(productCode) && (qty !== null || !!cells.lotNumber || !!cells.receiptDate));
      if (!plausible) continue;
      parsedOnPage += 1;
      const record: StockLine = {
        productCode,
        lotNumber: optionalValue(cells.lotNumber),
        destinationDocument: optionalValue(cells.destinationDocument),
        destinationRelease: optionalValue(cells.destinationRelease),
        receiptDate: cells.receiptDate.trim(),
        stockQty: qty,
        page: page.page,
      };
      if (record.destinationDocument) record.reason = 'DEST DOC populated';
      else if (qty === null) record.reason = 'Invalid STKQTY';
      else if (excludeShippers && isShipperCode(record.productCode)) record.reason = 'Shipper item';
      else if (mode === 'wine' && !record.lotNumber) record.reason = 'No lot number';

      if (record.reason) {
        if (record.reason === 'Invalid STKQTY') rejectedRows += 1;
        excludedRows.push(record);
      } else includedRows.push(record);
    }
    if (columns && !parsedOnPage) warnings.push(`Page ${page.page}: no stock rows could be read.`);
  }

  if (!headerPages) throw new Error('The PDF does not have the expected PRODUCT CODE, LOT NUMBER, DEST DOC and STKQTY table headings. Please upload a Stock Status by CC and LOC report.');
  if (!includedRows.length) throw new Error('No eligible stock rows were found. Check the PDF and the selected inventory rules.');
  if (headerPages < pages.length) warnings.push(`Detected stock table headings on ${headerPages} of ${pages.length} pages. Please review for missing pages.`);
  if (rejectedRows) warnings.push(`${rejectedRows} rows had an unreadable STKQTY and were excluded. Please check the audit sheet.`);

  const reportCostCenters = [...reportCenters].sort();
  const costCenter: WineCostCenter | null = reportCostCenters.length === 1 &&
    (reportCostCenters[0] === '102' || reportCostCenters[0] === '104')
    ? (reportCostCenters[0] as WineCostCenter) : null;
  if (!costCenter && mode === 'wine') warnings.push(reportCostCenters.length > 1
    ? `Multiple cost centers detected (${reportCostCenters.join(', ')}). Automatic wine workbook filling is disabled to prevent mixing locations.`
    : `Could not confirm a single 102 or 104 cost center in the PDF. Automatic wine workbook filling is disabled.`);

  const totals = aggregateStockLines(includedRows);
  return {
    fileName,
    costCenter,
    reportCostCenters,
    mode,
    excludeShippers,
    generatedAt: new Date().toISOString(),
    pageCount: pages.length,
    includedRows,
    excludedRows,
    totals,
    includedQuantity: roundQuantity(totals.reduce((sum, row) => sum + row.stockQty, 0)),
    warnings,
  };
}
