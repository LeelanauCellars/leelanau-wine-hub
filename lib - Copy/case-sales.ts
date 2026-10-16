export type CaseSalesLinkedRefund = {
  orderNumber: string;
  id: string;
  date: string;
  wineBottles: number;
  wineProductSubtotal: number;
};

export type CaseSalesValidationRow = {
  orderNumber: string;
  id: string;
  date: string;
  originalWineBottles: number;
  grossWholeCases: number;
  linkedRefunds: CaseSalesLinkedRefund[];
  refundedWineBottles: number;
  refundedWineProductSubtotal: number;
  remainingWineBottles: number;
  casesRemainingAfterRefunds: number;
};

export type CaseSalesDaily = {
  date: string;
  grossCases: number;
  cases: number;
  caseOrders: number;
};

export type CaseSalesSummary = {
  version: 3;
  importedAt: string;
  sourceFilename: string;
  sourceKind?: 'csv' | 'commerce7-pos';
  sourceDetail?: string | null;
  posOrdersReviewed?: number;
  posProfileIds?: string[];
  asOfDate: string;
  periodStartDate: string;
  goalCases: number | null;
  goalEndDate: string | null;
  /** Net case count after linked refunds/exchanges; this is the number used toward the goal. */
  casesSold: number;
  grossCasesSold: number;
  casesRemainingAfterLinkedRefunds: number;
  caseOrders: number;
  wineTransactionsReviewed: number;
  wineRowsReviewed: number;
  bottleQuantityReviewed: number;
  linkedRefundTransactions: number;
  dailyCases: CaseSalesDaily[];
  validationRows: CaseSalesValidationRow[];
};

export type CaseSalesGoalMetrics = {
  remainingCases: number | null;
  remainingDays: number | null;
  casesPerDayNeeded: number | null;
  averageCasesPerDay: number | null;
  completedSellingDays: number;
  completedCases: number;
  currentDayCountsAsUsed: boolean;
  progressPercent: number | null;
  goalReached: boolean;
};

function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (char === ',' && !quoted) {
      row.push(field);
      field = '';
      continue;
    }
    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      if (row.some((value) => value.length)) rows.push(row);
      row = [];
      field = '';
      continue;
    }
    field += char;
  }

  if (field.length || row.length) {
    row.push(field);
    if (row.some((value) => value.length)) rows.push(row);
  }
  return rows;
}

function normalizedHeader(value = '') {
  return value.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
}

function headerIndex(headers: string[], names: string[], fallback = -1) {
  const normalized = headers.map(normalizedHeader);
  for (const name of names) {
    const index = normalized.indexOf(normalizedHeader(name));
    if (index >= 0) return index;
  }
  return fallback;
}

function numeric(value = '') {
  const cleaned = value.trim().replace(/[$,%]/g, '').replace(/,/g, '');
  if (!cleaned) return 0;
  const result = Number(cleaned);
  return Number.isFinite(result) ? result : 0;
}

function roundQuantity(value: number) {
  return Math.round(value * 1000) / 1000;
}

function money(value: number) {
  return Math.round(value * 100) / 100;
}

function dateOnly(value = '') {
  const trimmed = value.trim();
  const iso = trimmed.match(/\b((?:19|20)\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return '';
}

function compareDate(a: string, b: string) {
  return a.localeCompare(b);
}

type WineTransaction = {
  id: string;
  orderNumber: string;
  refundFromOrderNumber: string;
  date: string;
  wineBottles: number;
  wineProductSubtotal: number;
};

export function parseCaseSalesCsv(text: string, sourceFilename: string, previous?: CaseSalesSummary | null): CaseSalesSummary {
  const rows = parseCsvRows(text);
  if (rows.length < 2) throw new Error('The CSV does not contain any order rows.');

  const headers = rows[0];
  const idIndex = headerIndex(headers, ['Id'], 0);
  const submittedIndex = headerIndex(headers, ['Order Submitted Date'], 1);
  const orderIndex = headerIndex(headers, ['Order Number'], 4);
  const refundFromIndex = headerIndex(headers, ['Refund/Exchange From Order Number'], 7);
  const typeIndex = headerIndex(headers, ['Type'], 84);
  const quantityIndex = headerIndex(headers, ['Quantity'], 87);
  const bottleIndex = headerIndex(headers, ['Bottle Quantity'], 88);
  const productSubtotalIndex = headerIndex(headers, ['Product SubTotal'], 95);

  const required = [
    ['Id', idIndex],
    ['Order Number', orderIndex],
    ['Type', typeIndex],
    ['Quantity', quantityIndex],
    ['Bottle Quantity', bottleIndex],
    ['Refund/Exchange From Order Number', refundFromIndex],
  ] as const;
  const missing = required.filter(([, index]) => index < 0 || !headers[index]).map(([name]) => name);
  if (missing.length) throw new Error(`Central could not find the required Commerce7 column${missing.length === 1 ? '' : 's'}: ${missing.join(', ')}.`);

  const transactions = new Map<string, WineTransaction>();
  let periodStartDate = '';
  let asOfDate = '';
  let wineRowsReviewed = 0;
  let bottleQuantityReviewed = 0;

  for (const row of rows.slice(1)) {
    if ((row[typeIndex] || '').trim().toLowerCase() !== 'wine') continue;
    const id = (row[idIndex] || '').trim();
    if (!id) continue;

    wineRowsReviewed += 1;
    const bottleRaw = (row[bottleIndex] || '').trim();
    const wineBottles = bottleRaw ? numeric(bottleRaw) : numeric(row[quantityIndex] || '');
    bottleQuantityReviewed += wineBottles;
    const date = dateOnly(row[submittedIndex] || '');

    const current = transactions.get(id) || {
      id,
      orderNumber: (row[orderIndex] || '').trim(),
      refundFromOrderNumber: (row[refundFromIndex] || '').trim(),
      date,
      wineBottles: 0,
      wineProductSubtotal: 0,
    };

    current.wineBottles += wineBottles;
    current.wineProductSubtotal += numeric(row[productSubtotalIndex] || '');
    if (!current.orderNumber) current.orderNumber = (row[orderIndex] || '').trim();
    if (!current.refundFromOrderNumber) current.refundFromOrderNumber = (row[refundFromIndex] || '').trim();
    if (date && (!current.date || compareDate(date, current.date) > 0)) current.date = date;
    transactions.set(id, current);

    if (date) {
      if (!periodStartDate || compareDate(date, periodStartDate) < 0) periodStartDate = date;
      if (!asOfDate || compareDate(date, asOfDate) > 0) asOfDate = date;
    }
  }

  if (!transactions.size) throw new Error('No Wine transactions were found in this report.');

  // Only original positive purchase transactions can qualify as a case transaction.
  // Refund/exchange transactions are never counted as new case transactions, even when they contain positive rows.
  const qualifyingOriginals = Array.from(transactions.values())
    .filter((transaction) => !transaction.refundFromOrderNumber && transaction.wineBottles >= 12)
    .map((transaction) => ({
      ...transaction,
      grossWholeCases: Math.floor(transaction.wineBottles / 12),
    }));

  const originalsByOrderNumber = new Map(
    qualifyingOriginals.filter((transaction) => transaction.orderNumber).map((transaction) => [transaction.orderNumber, transaction]),
  );
  const refundsByOriginalOrder = new Map<string, WineTransaction[]>();

  for (const transaction of transactions.values()) {
    const originalOrderNumber = transaction.refundFromOrderNumber;
    if (!originalOrderNumber || !originalsByOrderNumber.has(originalOrderNumber)) continue;
    const linked = refundsByOriginalOrder.get(originalOrderNumber) || [];
    linked.push(transaction);
    refundsByOriginalOrder.set(originalOrderNumber, linked);
  }

  const validationRows: CaseSalesValidationRow[] = qualifyingOriginals.map((original) => {
    const linkedTransactions = refundsByOriginalOrder.get(original.orderNumber) || [];
    const linkedRefunds = linkedTransactions.map((refund) => ({
      orderNumber: refund.orderNumber,
      id: refund.id,
      date: refund.date,
      wineBottles: roundQuantity(refund.wineBottles),
      wineProductSubtotal: money(refund.wineProductSubtotal),
    }));
    const refundedWineBottles = linkedRefunds.reduce((sum, refund) => sum + refund.wineBottles, 0);
    const refundedWineProductSubtotal = linkedRefunds.reduce((sum, refund) => sum + refund.wineProductSubtotal, 0);
    const remainingWineBottles = roundQuantity(original.wineBottles + refundedWineBottles);
    const casesRemainingAfterRefunds = Math.max(0, Math.floor(remainingWineBottles / 12));

    return {
      orderNumber: original.orderNumber,
      id: original.id,
      date: original.date,
      originalWineBottles: roundQuantity(original.wineBottles),
      grossWholeCases: original.grossWholeCases,
      linkedRefunds,
      refundedWineBottles: roundQuantity(refundedWineBottles),
      refundedWineProductSubtotal: money(refundedWineProductSubtotal),
      remainingWineBottles,
      casesRemainingAfterRefunds,
    };
  }).sort((a, b) => a.date.localeCompare(b.date) || a.orderNumber.localeCompare(b.orderNumber));

  const daily = new Map<string, { grossCases: number; cases: number; caseOrders: number }>();
  for (const item of validationRows) {
    if (!item.date) continue;
    const current = daily.get(item.date) || { grossCases: 0, cases: 0, caseOrders: 0 };
    current.grossCases += item.grossWholeCases;
    current.cases += item.casesRemainingAfterRefunds;
    current.caseOrders += 1;
    daily.set(item.date, current);
  }

  const grossCasesSold = validationRows.reduce((sum, item) => sum + item.grossWholeCases, 0);
  const casesRemainingAfterLinkedRefunds = validationRows.reduce((sum, item) => sum + item.casesRemainingAfterRefunds, 0);
  const linkedRefundTransactions = validationRows.reduce((sum, item) => sum + item.linkedRefunds.length, 0);
  const defaultGoalEnd = asOfDate ? endOfMonth(asOfDate) : null;

  return {
    version: 3,
    importedAt: new Date().toISOString(),
    sourceFilename: sourceFilename || 'Commerce7 orders.csv',
    sourceKind: 'csv',
    asOfDate,
    periodStartDate,
    goalCases: previous?.goalCases ?? null,
    goalEndDate: previous?.goalEndDate ?? defaultGoalEnd,
    casesSold: casesRemainingAfterLinkedRefunds,
    grossCasesSold,
    casesRemainingAfterLinkedRefunds,
    caseOrders: validationRows.length,
    wineTransactionsReviewed: transactions.size,
    wineRowsReviewed,
    bottleQuantityReviewed: roundQuantity(bottleQuantityReviewed),
    linkedRefundTransactions,
    dailyCases: Array.from(daily.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, ...value })),
    validationRows,
  };
}

export type Commerce7CaseSalesItem = {
  type?: string | null;
  purchaseType?: string | null;
  quantity?: number | null;
  volumeInML?: number | null;
  price?: number | null;
  productTitle?: string | null;
  sku?: string | null;
};

export type Commerce7CaseSalesOrder = {
  id?: string | null;
  orderNumber?: string | number | null;
  previousOrderNumber?: string | number | null;
  orderSubmittedDate?: string | null;
  channel?: string | null;
  posProfileId?: string | null;
  purchaseType?: string | null;
  paymentStatus?: string | null;
  items?: Commerce7CaseSalesItem[] | null;
};

function commerce7WineBottleQuantity(item: Commerce7CaseSalesItem, order: Commerce7CaseSalesOrder) {
  // Match Commerce7's Order Detail export: for Type = Wine, Bottle Quantity
  // represents units/containers sold, regardless of package volume. A 375 mL
  // dessert bottle therefore counts as 1 bottle, not 0.5 of a 750 mL equivalent.
  // The live Order API does not expose the export-only Bottle Quantity field,
  // so item Quantity is the matching live representation. Refund quantities are
  // normalized negative when Commerce7 reports them as positive quantities.
  const quantity = Number(item.quantity ?? 0);
  if (!Number.isFinite(quantity)) return 0;
  if (quantity < 0) return quantity;
  const purchaseType = String(item.purchaseType || order.purchaseType || '').trim().toUpperCase();
  if (purchaseType === 'REFUND') return -Math.abs(quantity);
  return quantity;
}

function transactionSummary(
  transactions: Map<string, WineTransaction>,
  options: {
    sourceFilename: string;
    previous?: CaseSalesSummary | null;
    importedAt?: string;
    periodStartDate: string;
    asOfDate: string;
    wineRowsReviewed: number;
    bottleQuantityReviewed: number;
    sourceKind?: 'csv' | 'commerce7-pos';
    sourceDetail?: string | null;
    posOrdersReviewed?: number;
    posProfileIds?: string[];
  },
): CaseSalesSummary {
  const qualifyingOriginals = Array.from(transactions.values())
    .filter((transaction) => !transaction.refundFromOrderNumber && transaction.wineBottles >= 12)
    .map((transaction) => ({ ...transaction, grossWholeCases: Math.floor(transaction.wineBottles / 12) }));

  const originalsByOrderNumber = new Map(
    qualifyingOriginals.filter((transaction) => transaction.orderNumber).map((transaction) => [transaction.orderNumber, transaction]),
  );
  const refundsByOriginalOrder = new Map<string, WineTransaction[]>();

  for (const transaction of transactions.values()) {
    const originalOrderNumber = transaction.refundFromOrderNumber;
    if (!originalOrderNumber || !originalsByOrderNumber.has(originalOrderNumber)) continue;
    const linked = refundsByOriginalOrder.get(originalOrderNumber) || [];
    linked.push(transaction);
    refundsByOriginalOrder.set(originalOrderNumber, linked);
  }

  const validationRows: CaseSalesValidationRow[] = qualifyingOriginals.map((original) => {
    const linkedTransactions = refundsByOriginalOrder.get(original.orderNumber) || [];
    const linkedRefunds = linkedTransactions.map((refund) => ({
      orderNumber: refund.orderNumber,
      id: refund.id,
      date: refund.date,
      wineBottles: roundQuantity(refund.wineBottles),
      wineProductSubtotal: money(refund.wineProductSubtotal),
    }));
    const refundedWineBottles = linkedRefunds.reduce((sum, refund) => sum + refund.wineBottles, 0);
    const refundedWineProductSubtotal = linkedRefunds.reduce((sum, refund) => sum + refund.wineProductSubtotal, 0);
    const remainingWineBottles = roundQuantity(original.wineBottles + refundedWineBottles);
    const casesRemainingAfterRefunds = Math.max(0, Math.floor(remainingWineBottles / 12));

    return {
      orderNumber: original.orderNumber,
      id: original.id,
      date: original.date,
      originalWineBottles: roundQuantity(original.wineBottles),
      grossWholeCases: original.grossWholeCases,
      linkedRefunds,
      refundedWineBottles: roundQuantity(refundedWineBottles),
      refundedWineProductSubtotal: money(refundedWineProductSubtotal),
      remainingWineBottles,
      casesRemainingAfterRefunds,
    };
  }).sort((a, b) => a.date.localeCompare(b.date) || a.orderNumber.localeCompare(b.orderNumber));

  const daily = new Map<string, { grossCases: number; cases: number; caseOrders: number }>();
  for (const item of validationRows) {
    if (!item.date) continue;
    const current = daily.get(item.date) || { grossCases: 0, cases: 0, caseOrders: 0 };
    current.grossCases += item.grossWholeCases;
    current.cases += item.casesRemainingAfterRefunds;
    current.caseOrders += 1;
    daily.set(item.date, current);
  }

  const grossCasesSold = validationRows.reduce((sum, item) => sum + item.grossWholeCases, 0);
  const casesRemainingAfterLinkedRefunds = validationRows.reduce((sum, item) => sum + item.casesRemainingAfterRefunds, 0);
  const linkedRefundTransactions = validationRows.reduce((sum, item) => sum + item.linkedRefunds.length, 0);
  const defaultGoalEnd = options.asOfDate ? endOfMonth(options.asOfDate) : null;

  return {
    version: 3,
    importedAt: options.importedAt || new Date().toISOString(),
    sourceFilename: options.sourceFilename,
    sourceKind: options.sourceKind,
    sourceDetail: options.sourceDetail ?? null,
    posOrdersReviewed: options.posOrdersReviewed,
    posProfileIds: options.posProfileIds,
    asOfDate: options.asOfDate,
    periodStartDate: options.periodStartDate,
    goalCases: options.previous?.goalCases ?? null,
    goalEndDate: options.previous?.goalEndDate ?? defaultGoalEnd,
    casesSold: casesRemainingAfterLinkedRefunds,
    grossCasesSold,
    casesRemainingAfterLinkedRefunds,
    caseOrders: validationRows.length,
    wineTransactionsReviewed: transactions.size,
    wineRowsReviewed: options.wineRowsReviewed,
    bottleQuantityReviewed: roundQuantity(options.bottleQuantityReviewed),
    linkedRefundTransactions,
    dailyCases: Array.from(daily.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, ...value })),
    validationRows,
  };
}

export function buildCaseSalesSummaryFromCommerce7Orders(
  orders: Commerce7CaseSalesOrder[],
  options: { monthStartDate: string; asOfDate: string; previous?: CaseSalesSummary | null; sourceDetail?: string | null; posOrdersReviewed?: number },
) {
  const transactions = new Map<string, WineTransaction>();
  let wineRowsReviewed = 0;
  let bottleQuantityReviewed = 0;
  const posProfileIds = new Set<string>();

  for (const order of orders) {
    const id = String(order.id || '').trim();
    if (!id) continue;
    if ((order.channel || '').toUpperCase() === 'POS' && order.posProfileId) posProfileIds.add(order.posProfileId);

    let wineBottles = 0;
    let wineProductSubtotal = 0;
    for (const item of order.items || []) {
      if ((item.type || '').trim().toLowerCase() !== 'wine') continue;
      wineRowsReviewed += 1;
      const bottles = commerce7WineBottleQuantity(item, order);
      wineBottles += bottles;
      bottleQuantityReviewed += bottles;
      const priceCents = Number(item.price ?? 0);
      if (Number.isFinite(priceCents)) wineProductSubtotal += (bottles * priceCents) / 100;
    }
    if (Math.abs(wineBottles) < 0.000001) {
      // Keep POS orders without Wine out of transaction counts; the raw POS order count is stored separately.
      continue;
    }

    const date = dateOnly(order.orderSubmittedDate || '');
    transactions.set(id, {
      id,
      orderNumber: String(order.orderNumber ?? '').trim(),
      refundFromOrderNumber: String(order.previousOrderNumber ?? '').trim(),
      date,
      wineBottles,
      wineProductSubtotal,
    });
  }

  return transactionSummary(transactions, {
    sourceFilename: 'Commerce7 live POS sync',
    sourceKind: 'commerce7-pos',
    sourceDetail: options.sourceDetail || null,
    previous: options.previous,
    periodStartDate: options.monthStartDate,
    asOfDate: options.asOfDate,
    wineRowsReviewed,
    bottleQuantityReviewed,
    posOrdersReviewed: options.posOrdersReviewed ?? orders.filter((order) => (order.channel || '').toUpperCase() === 'POS').length,
    posProfileIds: Array.from(posProfileIds).sort(),
  });
}

export function endOfMonth(date: string) {
  const parts = date.split('-').map(Number);
  if (parts.length !== 3 || parts.some((value) => !Number.isFinite(value))) return null;
  const [year, month] = parts;
  const last = new Date(Date.UTC(year, month, 0));
  return last.toISOString().slice(0, 10);
}

function utcDate(date: string) {
  const parts = date.split('-').map(Number);
  if (parts.length !== 3 || parts.some((value) => !Number.isFinite(value))) return null;
  return Date.UTC(parts[0], parts[1] - 1, parts[2]);
}

const CASE_SALES_TIME_ZONE = 'America/Detroit';
const CASE_SALES_DAY_COUNT_CUTOFF_HOUR = 17; // 5 PM; tasting room closes at 6 PM.

function localCaseSalesClock(now: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CASE_SALES_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || '';
  return {
    date: `${value('year')}-${value('month')}-${value('day')}`,
    hour: Number(value('hour') || 0),
  };
}

function addUtcDays(date: string, days: number) {
  const value = utcDate(date);
  if (value === null) return date;
  return new Date(value + days * 86400000).toISOString().slice(0, 10);
}

function inclusiveCalendarDays(startDate: string, endDate: string) {
  const start = utcDate(startDate);
  const end = utcDate(endDate);
  if (start === null || end === null || end < start) return 0;
  return Math.floor((end - start) / 86400000) + 1;
}

export function caseSalesGoalMetrics(summary: CaseSalesSummary, now = new Date()): CaseSalesGoalMetrics {
  const clock = localCaseSalesClock(now);
  const currentDayCountsAsUsed = clock.hour >= CASE_SALES_DAY_COUNT_CUTOFF_HOUR;

  // Average pace uses completed selling days only. Before 5 PM, today's partial day is excluded.
  const completedCandidate = currentDayCountsAsUsed ? clock.date : addUtcDays(clock.date, -1);
  const completedThrough = completedCandidate < summary.asOfDate ? completedCandidate : summary.asOfDate;
  const completedSellingDays = completedThrough >= summary.periodStartDate
    ? inclusiveCalendarDays(summary.periodStartDate, completedThrough)
    : 0;
  const completedCases = summary.dailyCases
    .filter((day) => day.date >= summary.periodStartDate && day.date <= completedThrough)
    .reduce((total, day) => total + day.cases, 0);
  const averageCasesPerDay = completedSellingDays > 0 ? completedCases / completedSellingDays : null;

  const goal = summary.goalCases;
  if (!goal || goal <= 0) {
    return {
      remainingCases: null,
      remainingDays: null,
      casesPerDayNeeded: null,
      averageCasesPerDay,
      completedSellingDays,
      completedCases,
      currentDayCountsAsUsed,
      progressPercent: null,
      goalReached: false,
    };
  }

  const casesCountingTowardGoal = summary.casesRemainingAfterLinkedRefunds ?? summary.casesSold;
  const remainingCases = Math.max(0, goal - casesCountingTowardGoal);
  const progressPercent = Math.max(0, Math.min(100, (casesCountingTowardGoal / goal) * 100));

  let remainingDays: number | null = null;
  if (summary.goalEndDate) {
    const firstAvailableDate = currentDayCountsAsUsed ? addUtcDays(clock.date, 1) : clock.date;
    remainingDays = inclusiveCalendarDays(firstAvailableDate, summary.goalEndDate);
  }
  const casesPerDayNeeded = remainingCases === 0 ? 0 : remainingDays && remainingDays > 0 ? remainingCases / remainingDays : null;

  return {
    remainingCases,
    remainingDays,
    casesPerDayNeeded,
    averageCasesPerDay,
    completedSellingDays,
    completedCases,
    currentDayCountsAsUsed,
    progressPercent,
    goalReached: remainingCases === 0,
  };
}
