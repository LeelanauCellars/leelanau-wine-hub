import fs from 'node:fs';
import path from 'node:path';
import type { SalesPeriodInput, TastingRoomSalesPeriodSummary } from '@/lib/tasting-room-sales';

type HistoricalProduct = { sku: string; wine: string; bottlesSold: number; netSales: number };
type HistoricalFoodItem = { productTitle: string; type: string; sku: string; quantity: number; netSales: number };
type HistoricalWineTransaction = { id: string; bottlesSold: number; netSales: number };
type HistoricalDay = {
  ordersReviewed: number;
  wine: { bottlesSold: number; netSales: number; transactions: number; transactionRows: HistoricalWineTransaction[] };
  caseSales: { numberOfCasesSold: number; transactionsFeaturingCase: number; netSalesOnOrdersFeaturingCase: number };
  wineByGlass: { quantitySold: number; transactions: number; netSales: number; transactionIds: string[] };
  tastings: { paidQuantity: number; freeTastings: number; knotFreeTastings: number; transactions: number; netSales: number; transactionIds: string[] };
  merch: { quantitySold: number; netSales: number };
  foodOther: { netSales: number; items: HistoricalFoodItem[] };
  overall: { transactions: number; netSales: number; transactionIds: string[] };
  wineProducts: HistoricalProduct[];
};
type HistoricalYear = { year: number; source: string; coverage: string[]; days: Record<string, HistoricalDay> };

const cache = new Map<number, HistoricalYear>();
const MIN_YEAR = 2020;
const MAX_YEAR = 2025;

function round(value: number, digits = 2) {
  const multiplier = 10 ** digits;
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}

function daysInclusive(startDate: string, endDate: string) {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  return Math.floor((end - start) / 86400000) + 1;
}

function eachDate(startDate: string, endDate: string) {
  const results: string[] = [];
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  for (let current = start; current <= end; current = new Date(current.getTime() + 86400000)) {
    results.push(current.toISOString().slice(0, 10));
  }
  return results;
}

function periodLabel(input: SalesPeriodInput) {
  if (input.label?.trim()) return input.label.trim();
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const start = new Date(`${input.startDate}T00:00:00Z`);
  const end = new Date(`${input.endDate}T00:00:00Z`);
  if (input.startDate === input.endDate) return formatter.format(start);
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

function loadYear(year: number) {
  const cached = cache.get(year);
  if (cached) return cached;
  if (year < MIN_YEAR || year > MAX_YEAR) throw new Error(`Historical Tasting Room sales are available from ${MIN_YEAR} through ${MAX_YEAR}.`);
  const file = path.join(process.cwd(), 'data', 'tasting-room-history', `${year}.json`);
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as HistoricalYear;
  cache.set(year, parsed);
  return parsed;
}

export function isHistoricalSalesPeriod(input: SalesPeriodInput) {
  return input.endDate <= `${MAX_YEAR}-12-31`;
}

export function historicalTastingRoomSalesPeriod(input: SalesPeriodInput): TastingRoomSalesPeriodSummary {
  const selectedDates = eachDate(input.startDate, input.endDate);
  const years = Array.from(new Set(selectedDates.map((value) => Number(value.slice(0, 4)))));
  if (years.some((year) => year < MIN_YEAR || year > MAX_YEAR)) {
    throw new Error(`Historical Tasting Room sales are available from ${MIN_YEAR} through ${MAX_YEAR}.`);
  }

  const yearData = new Map(years.map((year) => [year, loadYear(year)]));
  const coverageByYear = new Map(Array.from(yearData, ([year, data]) => [year, new Set(data.coverage)]));
  const missing = selectedDates.find((value) => !coverageByYear.get(Number(value.slice(0, 4)))?.has(value));
  if (missing) {
    throw new Error(`The historical Square export does not contain ${missing}. Choose a range covered by the uploaded 2020–2025 sales files.`);
  }

  const days = selectedDates.map((value) => yearData.get(Number(value.slice(0, 4)))?.days[value]).filter((value): value is HistoricalDay => Boolean(value));
  const wineTransactions = new Map<string, { bottlesSold: number; netSales: number }>();
  const glassTransactions = new Set<string>();
  const tastingTransactions = new Set<string>();
  const overallTransactions = new Set<string>();
  const products = new Map<string, { wine: string; bottlesSold: number; netSales: number }>();
  const foodItems = new Map<string, HistoricalFoodItem>();

  let glassQuantity = 0;
  let glassNetSales = 0;
  let tastingPaid = 0;
  let tastingFree = 0;
  let tastingKnot = 0;
  let tastingNetSales = 0;
  let merchQuantity = 0;
  let merchNetSales = 0;
  let foodNetSales = 0;
  let overallNetSales = 0;

  for (const day of days) {
    for (const row of day.wine.transactionRows) {
      const current = wineTransactions.get(row.id) || { bottlesSold: 0, netSales: 0 };
      current.bottlesSold += row.bottlesSold;
      current.netSales += row.netSales;
      wineTransactions.set(row.id, current);
    }
    day.wineByGlass.transactionIds.forEach((id) => glassTransactions.add(id));
    day.tastings.transactionIds.forEach((id) => tastingTransactions.add(id));
    day.overall.transactionIds.forEach((id) => overallTransactions.add(id));
    glassQuantity += day.wineByGlass.quantitySold;
    glassNetSales += day.wineByGlass.netSales;
    tastingPaid += day.tastings.paidQuantity;
    tastingFree += day.tastings.freeTastings;
    tastingKnot += day.tastings.knotFreeTastings;
    tastingNetSales += day.tastings.netSales;
    merchQuantity += day.merch.quantitySold;
    merchNetSales += day.merch.netSales;
    foodNetSales += day.foodOther.netSales;
    overallNetSales += day.overall.netSales;

    for (const row of day.wineProducts) {
      const current = products.get(row.sku) || { wine: row.wine, bottlesSold: 0, netSales: 0 };
      current.bottlesSold += row.bottlesSold;
      current.netSales += row.netSales;
      current.wine = row.wine || current.wine;
      products.set(row.sku, current);
    }
    for (const item of day.foodOther.items) {
      const key = `${item.productTitle}\u0000${item.type}\u0000${item.sku}`;
      const current = foodItems.get(key) || { ...item, quantity: 0, netSales: 0 };
      current.quantity += item.quantity;
      current.netSales += item.netSales;
      foodItems.set(key, current);
    }
  }

  const wineRows = Array.from(wineTransactions.values());
  const wineBottles = wineRows.reduce((sum, row) => sum + row.bottlesSold, 0);
  const wineNetSales = wineRows.reduce((sum, row) => sum + row.netSales, 0);
  const qualifyingCases = wineRows.filter((row) => row.bottlesSold >= 12 - 0.000001);
  const wineProducts = Array.from(products.entries()).map(([sku, value]) => ({
    sku,
    wine: value.wine,
    bottlesSold: round(value.bottlesSold, 3),
    casesSold: round(value.bottlesSold / 12),
    netSales: round(value.netSales),
  })).sort((a, b) => b.bottlesSold - a.bottlesSold || a.wine.localeCompare(b.wine));

  const calendarDays = daysInclusive(input.startDate, input.endDate);
  const wineTransactionsCount = wineTransactions.size;
  const caseTransactions = qualifyingCases.length;
  const categoryNetSales = wineNetSales + glassNetSales + tastingNetSales + merchNetSales + foodNetSales;
  const difference = round(categoryNetSales - overallNetSales);
  const productBottleTotal = round(wineProducts.reduce((sum, row) => sum + row.bottlesSold, 0), 3);
  const reviewNeeded: string[] = [];
  if (Math.abs(productBottleTotal - round(wineBottles, 3)) > 0.001) {
    reviewNeeded.push(`Historical Wine-by-product rows total ${productBottleTotal} bottles while the Wine summary totals ${round(wineBottles, 3)}.`);
  }
  if (Math.abs(difference) > 0.01) {
    reviewNeeded.push(`Historical category net sales differ from Overall Net Sales by ${difference >= 0 ? '+' : ''}$${difference.toFixed(2)}.`);
  }

  return {
    id: input.id,
    label: periodLabel(input),
    startDate: input.startDate,
    endDate: input.endDate,
    calendarDays,
    ordersReviewed: overallTransactions.size,
    posProfileIds: [],
    wine: {
      bottlesSold: round(wineBottles, 3),
      casesSold: round(wineBottles / 12),
      netSales: round(wineNetSales),
      transactions: wineTransactionsCount,
      avgPricePerBottle: Math.abs(wineBottles) > 0.000001 ? round(wineNetSales / wineBottles) : null,
      avgBottlesPerTransaction: wineTransactionsCount ? round(wineBottles / wineTransactionsCount) : null,
      avgNetSalesPerTransaction: wineTransactionsCount ? round(wineNetSales / wineTransactionsCount) : null,
    },
    caseSales: {
      numberOfCasesSold: qualifyingCases.reduce((sum, row) => sum + Math.floor(row.bottlesSold / 12 + 0.000001), 0),
      transactionsFeaturingCase: caseTransactions,
      netSalesOnOrdersFeaturingCase: round(qualifyingCases.reduce((sum, row) => sum + row.netSales, 0)),
      percentageWineTransactionsFeaturingCase: wineTransactionsCount ? round((caseTransactions / wineTransactionsCount) * 100) : null,
      refundReview: [],
    },
    wineByGlass: { quantitySold: round(glassQuantity, 3), transactions: glassTransactions.size, netSales: round(glassNetSales) },
    tastings: {
      paidQuantity: round(tastingPaid, 3),
      freeTastings: round(tastingFree, 3),
      knotFreeTastings: round(tastingKnot, 3),
      transactions: tastingTransactions.size,
      netSales: round(tastingNetSales),
    },
    merch: { quantitySold: round(merchQuantity, 3), netSales: round(merchNetSales) },
    foodOther: {
      netSales: round(foodNetSales),
      items: Array.from(foodItems.values()).map((item) => ({ ...item, quantity: round(item.quantity, 3), netSales: round(item.netSales) }))
        .sort((a, b) => Math.abs(b.netSales) - Math.abs(a.netSales) || a.productTitle.localeCompare(b.productTitle)),
    },
    overall: {
      transactions: overallTransactions.size,
      netSales: round(overallNetSales),
      averagePerDay: calendarDays ? round(overallNetSales / calendarDays) : null,
      netSalesConfirmation: round(overallNetSales),
    },
    wineProducts,
    validation: {
      categoryNetSales: round(categoryNetSales),
      overallNetSales: round(overallNetSales),
      difference,
      wineProductBottleTotal: productBottleTotal,
      wineProductCaseTotal: round(productBottleTotal / 12),
      passed: Math.abs(difference) <= 0.01 && Math.abs(productBottleTotal - round(wineBottles, 3)) <= 0.001,
    },
    reviewNeeded,
  };
}
