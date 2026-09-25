export type CaseSalesDaily = {
  date: string;
  cases: number;
  caseOrders: number;
};

export type CaseSalesSummary = {
  version: 1;
  importedAt: string;
  sourceFilename: string;
  asOfDate: string;
  periodStartDate: string;
  goalCases: number | null;
  goalEndDate: string | null;
  casesSold: number;
  caseOrders: number;
  posOrdersReviewed: number;
  bottleQuantityReviewed: number;
  dailyCases: CaseSalesDaily[];
};

export type CaseSalesGoalMetrics = {
  remainingCases: number | null;
  remainingDays: number | null;
  casesPerDayNeeded: number | null;
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

function headerIndex(headers: string[], names: string[], fallback: number) {
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

export function parseCaseSalesCsv(text: string, sourceFilename: string, previous?: CaseSalesSummary | null): CaseSalesSummary {
  const rows = parseCsvRows(text);
  if (rows.length < 2) throw new Error('The CSV does not contain any order rows.');

  const headers = rows[0];
  // Commerce7 order export: B = Order Submitted Date, E = Order Number, CK = Bottle Quantity.
  const submittedIndex = headerIndex(headers, ['Order Submitted Date'], 1);
  const orderIndex = headerIndex(headers, ['Order Number'], 4);
  const bottleIndex = headerIndex(headers, ['Bottle Quantity'], 88);
  const channelIndex = headerIndex(headers, ['Channel'], -1);
  const posProfileIndex = headerIndex(headers, ['POS Profile'], -1);

  if (!headers[orderIndex] || !headers[bottleIndex]) {
    throw new Error('Central could not find Order Number (column E) and Bottle Quantity (column CK) in this report.');
  }

  type OrderRollup = { bottles: number; date: string };
  const orders = new Map<string, OrderRollup>();
  let periodStartDate = '';
  let asOfDate = '';

  for (const row of rows.slice(1)) {
    const channel = channelIndex >= 0 ? (row[channelIndex] || '').trim().toLowerCase() : '';
    const posProfile = posProfileIndex >= 0 ? (row[posProfileIndex] || '').trim() : '';
    // When a Commerce7 Channel column is present, this tracker intentionally counts POS only.
    // If Channel is absent, a nonblank POS Profile is treated as POS; otherwise the uploaded report is assumed to be pre-filtered.
    if (channelIndex >= 0 && channel && channel !== 'pos') continue;
    if (channelIndex < 0 && posProfileIndex >= 0 && !posProfile) continue;

    const orderNumber = (row[orderIndex] || '').trim();
    if (!orderNumber) continue;
    const bottles = numeric(row[bottleIndex] || '');
    const date = dateOnly(row[submittedIndex] || '');
    const current = orders.get(orderNumber) || { bottles: 0, date };
    current.bottles += bottles;
    if (date && (!current.date || compareDate(date, current.date) > 0)) current.date = date;
    orders.set(orderNumber, current);

    if (date) {
      if (!periodStartDate || compareDate(date, periodStartDate) < 0) periodStartDate = date;
      if (!asOfDate || compareDate(date, asOfDate) > 0) asOfDate = date;
    }
  }

  if (!orders.size) throw new Error('No tasting-room POS orders were found in this report.');

  const daily = new Map<string, { cases: number; caseOrders: number }>();
  let casesSold = 0;
  let caseOrders = 0;
  let bottleQuantityReviewed = 0;

  for (const order of orders.values()) {
    const positiveBottles = Math.max(0, order.bottles);
    bottleQuantityReviewed += positiveBottles;
    const cases = Math.floor(positiveBottles / 12);
    if (cases < 1) continue;
    casesSold += cases;
    caseOrders += 1;
    if (order.date) {
      const item = daily.get(order.date) || { cases: 0, caseOrders: 0 };
      item.cases += cases;
      item.caseOrders += 1;
      daily.set(order.date, item);
    }
  }

  const defaultGoalEnd = asOfDate ? endOfMonth(asOfDate) : null;

  return {
    version: 1,
    importedAt: new Date().toISOString(),
    sourceFilename: sourceFilename || 'Commerce7 orders.csv',
    asOfDate,
    periodStartDate,
    goalCases: previous?.goalCases ?? null,
    goalEndDate: previous?.goalEndDate ?? defaultGoalEnd,
    casesSold,
    caseOrders,
    posOrdersReviewed: orders.size,
    bottleQuantityReviewed: Math.round(bottleQuantityReviewed * 100) / 100,
    dailyCases: Array.from(daily.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, ...value })),
  };
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

export function caseSalesGoalMetrics(summary: CaseSalesSummary): CaseSalesGoalMetrics {
  const goal = summary.goalCases;
  if (!goal || goal <= 0) {
    return { remainingCases: null, remainingDays: null, casesPerDayNeeded: null, progressPercent: null, goalReached: false };
  }

  const remainingCases = Math.max(0, goal - summary.casesSold);
  const progressPercent = Math.max(0, Math.min(100, (summary.casesSold / goal) * 100));
  const start = utcDate(summary.asOfDate);
  const end = summary.goalEndDate ? utcDate(summary.goalEndDate) : null;
  const remainingDays = start !== null && end !== null ? Math.max(0, Math.floor((end - start) / 86400000)) : null;
  const casesPerDayNeeded = remainingCases === 0 ? 0 : remainingDays && remainingDays > 0 ? remainingCases / remainingDays : null;

  return {
    remainingCases,
    remainingDays,
    casesPerDayNeeded,
    progressPercent,
    goalReached: remainingCases === 0,
  };
}
