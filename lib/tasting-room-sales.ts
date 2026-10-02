import type { Commerce7Order, Commerce7OrderItem } from '@/lib/commerce7-server';

export type SalesPeriodInput = {
  id: string;
  startDate: string;
  endDate: string;
  label?: string;
};

export type WineSalesSummary = {
  bottlesSold: number;
  casesSold: number;
  netSales: number;
  transactions: number;
  avgPricePerBottle: number | null;
  avgBottlesPerTransaction: number | null;
  avgNetSalesPerTransaction: number | null;
};

export type CaseRefundReviewRow = {
  originalOrderNumber: string;
  originalWineBottleQuantity: number;
  originalWineNetSales: number;
  refundExchangeOrderNumber: string;
  refundedWineQuantity: number;
  refundedWineNetSales: number;
  grossCaseWineSales: number;
  caseWineSalesAfterLinkedRefunds: number;
};

export type CaseSalesAnalysisSummary = {
  numberOfCasesSold: number;
  transactionsFeaturingCase: number;
  netSalesOnOrdersFeaturingCase: number;
  percentageWineTransactionsFeaturingCase: number | null;
  refundReview: CaseRefundReviewRow[];
};

export type SimpleSalesBucket = {
  quantitySold: number;
  transactions: number;
  netSales: number;
};

export type TastingSalesBucket = {
  paidQuantity: number;
  freeTastings: number;
  knotFreeTastings: number;
  transactions: number;
  netSales: number;
};

export type MerchSalesBucket = {
  quantitySold: number;
  netSales: number;
};

export type FoodOtherItem = {
  productTitle: string;
  type: string;
  sku: string;
  quantity: number;
  netSales: number;
};

export type FoodOtherBucket = {
  netSales: number;
  items: FoodOtherItem[];
};

export type OverallSalesSummary = {
  transactions: number;
  netSales: number;
  averagePerDay: number | null;
  netSalesConfirmation: number;
};

export type WineProductSales = {
  sku: string;
  wine: string;
  bottlesSold: number;
  casesSold: number;
};

export type ValidationSummary = {
  categoryNetSales: number;
  overallNetSales: number;
  difference: number;
  wineProductBottleTotal: number;
  wineProductCaseTotal: number;
  passed: boolean;
};

export type TastingRoomSalesPeriodSummary = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  calendarDays: number;
  ordersReviewed: number;
  posProfileIds: string[];
  wine: WineSalesSummary;
  caseSales: CaseSalesAnalysisSummary;
  wineByGlass: SimpleSalesBucket;
  tastings: TastingSalesBucket;
  merch: MerchSalesBucket;
  foodOther: FoodOtherBucket;
  overall: OverallSalesSummary;
  wineProducts: WineProductSales[];
  validation: ValidationSummary;
  reviewNeeded: string[];
};

export type CombinedWineProductSales = {
  sku: string;
  wine: string;
  periods: Record<string, { bottlesSold: number; casesSold: number }>;
  combinedBottlesSold: number;
  combinedCasesSold: number;
};

export type TastingRoomSalesAnalysis = {
  generatedAt: string;
  periods: TastingRoomSalesPeriodSummary[];
  combined: TastingRoomSalesPeriodSummary | null;
  wineProducts: CombinedWineProductSales[];
};

type WorkingOrder = {
  id: string;
  orderNumber: string;
  previousOrderNumber: string;
  date: string;
  purchaseType: string;
  posProfileId: string;
  overallNetSales: number;
  wineBottles: number;
  wineNetSales: number;
  hasWine: boolean;
  wineByGlassQuantity: number;
  wineByGlassNetSales: number;
  hasWineByGlass: boolean;
  tastingPaidQuantity: number;
  tastingKnotQuantity: number;
  tastingNetSales: number;
  hasTasting: boolean;
  merchQuantity: number;
  merchNetSales: number;
  foodOtherNetSales: number;
};

type ProductAccumulator = {
  sku: string;
  titleCounts: Map<string, number>;
  bottlesSold: number;
};

type FoodOtherAccumulator = {
  productTitle: string;
  type: string;
  sku: string;
  quantity: number;
  netSales: number;
};

const KNOWN_WINE_BY_GLASS_TASTING_SKUS = new Set([
  'GLASSOFWINE',
  'WINECLUBGLASS',
  'FROSE',
  'BUILDYOUROWN',
  'FLIGHTBUBBLY',
  'FLIGHTDRYRED',
  'FLIGHTDRYWHT',
  'FLIGHTSWEETWHT',
  'FLIGHTVARIETY',
  'FREETASTING',
]);
const PAID_TASTING_SKU = 'TASTINGWITHGLASS';
const KNOT_FREE_TASTING_SKU = 'KNOTBARFREETASTING';
const EXPECTED_TYPES = new Set(['Wine', 'Tasting', 'Bundle', 'General Merchandise']);

function finite(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function round(value: number, digits = 2) {
  const multiplier = 10 ** digits;
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}

function centsToDollars(value: unknown) {
  return finite(value) / 100;
}

function upper(value: unknown) {
  return String(value ?? '').trim().toUpperCase();
}

function itemPurchaseType(item: Commerce7OrderItem, order: Commerce7Order) {
  return upper(item.purchaseType || order.purchaseType || 'Regular');
}

function signedQuantity(item: Commerce7OrderItem, order: Commerce7Order) {
  const quantity = finite(item.quantity);
  if (quantity < 0) return quantity;
  if (itemPurchaseType(item, order) === 'REFUND') return -Math.abs(quantity);
  return quantity;
}

function signedOrderSubtotal(order: Commerce7Order) {
  const subtotal = centsToDollars(order.subTotal);
  if (subtotal < 0) return subtotal;
  if (upper(order.purchaseType) === 'REFUND') return -Math.abs(subtotal);
  return subtotal;
}

function itemNetSales(item: Commerce7OrderItem, order: Commerce7Order) {
  const price = centsToDollars(item.price);
  return price * signedQuantity(item, order);
}

function wineBottleQuantity(item: Commerce7OrderItem, order: Commerce7Order) {
  const quantity = signedQuantity(item, order);
  const volume = finite(item.volumeInML);
  if (volume > 0) return quantity * (volume / 750);
  return quantity;
}

function daysInclusive(startDate: string, endDate: string) {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 0;
  return Math.floor((end - start) / 86400000) + 1;
}

function mostCommonTitle(counts: Map<string, number>, fallback: string) {
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || fallback;
}

function normalizeTitle(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function periodLabel(input: SalesPeriodInput) {
  if (input.label?.trim()) return input.label.trim();
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const start = new Date(`${input.startDate}T00:00:00Z`);
  const end = new Date(`${input.endDate}T00:00:00Z`);
  if (input.startDate === input.endDate) return formatter.format(start);
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

function periodSummary(input: SalesPeriodInput, orders: Commerce7Order[]): TastingRoomSalesPeriodSummary {
  const workingOrders: WorkingOrder[] = [];
  const products = new Map<string, ProductAccumulator>();
  const foodOther = new Map<string, FoodOtherAccumulator>();
  const review = new Set<string>();
  const conflictingTitles = new Map<string, Set<string>>();
  const posProfileIds = new Set<string>();
  let missingWineVolume = 0;
  let negativeQuantityRows = 0;
  let refundExchangeOrders = 0;
  const newTypes = new Set<string>();
  const newTastingSkus = new Set<string>();

  for (const order of orders) {
    const id = String(order.id || '').trim();
    if (!id) continue;
    if (order.posProfileId) posProfileIds.add(order.posProfileId);
    if (upper(order.purchaseType) === 'REFUND' || upper(order.purchaseType) === 'EXCHANGE' || order.previousOrderNumber) refundExchangeOrders += 1;

    const working: WorkingOrder = {
      id,
      orderNumber: String(order.orderNumber ?? '').trim(),
      previousOrderNumber: String(order.previousOrderNumber ?? '').trim(),
      date: String(order.orderSubmittedDate || '').slice(0, 10),
      purchaseType: upper(order.purchaseType || 'Regular'),
      posProfileId: String(order.posProfileId || '').trim(),
      overallNetSales: signedOrderSubtotal(order),
      wineBottles: 0,
      wineNetSales: 0,
      hasWine: false,
      wineByGlassQuantity: 0,
      wineByGlassNetSales: 0,
      hasWineByGlass: false,
      tastingPaidQuantity: 0,
      tastingKnotQuantity: 0,
      tastingNetSales: 0,
      hasTasting: false,
      merchQuantity: 0,
      merchNetSales: 0,
      foodOtherNetSales: 0,
    };

    for (const item of order.items || []) {
      const type = String(item.type || '').trim();
      const sku = upper(item.sku);
      const title = normalizeTitle(String(item.productTitle || '').trim() || 'Untitled item');
      const quantity = signedQuantity(item, order);
      const netSales = itemNetSales(item, order);
      if (quantity < 0) negativeQuantityRows += 1;

      if (type && !EXPECTED_TYPES.has(type)) newTypes.add(type);
      if (!type) newTypes.add('(blank)');

      if (type === 'Wine') {
        working.hasWine = true;
        if (!(finite(item.volumeInML) > 0)) missingWineVolume += 1;
        const bottles = wineBottleQuantity(item, order);
        working.wineBottles += bottles;
        working.wineNetSales += netSales;

        const productKey = sku || `NO-SKU:${String(item.productVariantId || item.productId || title)}`;
        const product = products.get(productKey) || { sku: sku || '—', titleCounts: new Map<string, number>(), bottlesSold: 0 };
        product.bottlesSold += bottles;
        product.titleCounts.set(title, (product.titleCounts.get(title) || 0) + 1);
        products.set(productKey, product);
        const titles = conflictingTitles.get(productKey) || new Set<string>();
        titles.add(title);
        conflictingTitles.set(productKey, titles);
        continue;
      }

      if (type === 'Bundle') {
        working.hasWineByGlass = true;
        working.wineByGlassQuantity += quantity;
        working.wineByGlassNetSales += netSales;
        continue;
      }

      if (type === 'Tasting') {
        if (sku === PAID_TASTING_SKU) {
          working.hasTasting = true;
          working.tastingPaidQuantity += quantity;
          working.tastingNetSales += netSales;
          continue;
        }
        if (sku === KNOT_FREE_TASTING_SKU) {
          working.hasTasting = true;
          working.tastingKnotQuantity += quantity;
          working.tastingNetSales += netSales;
          continue;
        }
        if (KNOWN_WINE_BY_GLASS_TASTING_SKUS.has(sku)) {
          working.hasWineByGlass = true;
          working.wineByGlassQuantity += quantity;
          working.wineByGlassNetSales += netSales;
          if (sku === 'FREETASTING') review.add('SKU FREETASTING was included in Wine by the Glass under the current August 2026 reporting convention. Confirm that treatment if this convention changes.');
          continue;
        }
        newTastingSkus.add(sku || '(blank SKU)');
      }

      if (type === 'General Merchandise') {
        working.merchQuantity += quantity;
        working.merchNetSales += netSales;
        continue;
      }

      // Unknown/new items are intentionally left in Food/Other rather than guessed into a permanent category.
      working.foodOtherNetSales += netSales;
      const foodKey = `${title}\u0000${type}\u0000${sku}`;
      const detail = foodOther.get(foodKey) || { productTitle: title, type: type || '—', sku: sku || '—', quantity: 0, netSales: 0 };
      detail.quantity += quantity;
      detail.netSales += netSales;
      foodOther.set(foodKey, detail);
    }

    workingOrders.push(working);
  }

  const wineOrders = workingOrders.filter((order) => order.hasWine);
  const wineBottles = wineOrders.reduce((sum, order) => sum + order.wineBottles, 0);
  const wineNetSales = wineOrders.reduce((sum, order) => sum + order.wineNetSales, 0);
  const wineTransactions = wineOrders.length;

  const qualifyingCaseOrders = wineOrders.filter((order) => !order.previousOrderNumber && order.purchaseType !== 'REFUND' && order.wineBottles >= 12);
  const numberOfCasesSold = qualifyingCaseOrders.reduce((sum, order) => sum + Math.floor(order.wineBottles / 12), 0);
  const caseNetSales = qualifyingCaseOrders.reduce((sum, order) => sum + order.wineNetSales, 0);
  const refundsByOriginal = new Map<string, WorkingOrder[]>();
  for (const order of workingOrders) {
    if (!order.previousOrderNumber) continue;
    const linked = refundsByOriginal.get(order.previousOrderNumber) || [];
    linked.push(order);
    refundsByOriginal.set(order.previousOrderNumber, linked);
  }
  const refundReview: CaseRefundReviewRow[] = [];
  for (const original of qualifyingCaseOrders) {
    const linked = refundsByOriginal.get(original.orderNumber) || [];
    const wineLinked = linked.filter((order) => order.hasWine);
    if (!wineLinked.length) continue;
    const totalLinkedSales = wineLinked.reduce((sum, order) => sum + order.wineNetSales, 0);
    for (const refund of wineLinked) {
      refundReview.push({
        originalOrderNumber: original.orderNumber,
        originalWineBottleQuantity: round(original.wineBottles, 3),
        originalWineNetSales: round(original.wineNetSales),
        refundExchangeOrderNumber: refund.orderNumber,
        refundedWineQuantity: round(refund.wineBottles, 3),
        refundedWineNetSales: round(refund.wineNetSales),
        grossCaseWineSales: round(original.wineNetSales),
        caseWineSalesAfterLinkedRefunds: round(original.wineNetSales + totalLinkedSales),
      });
    }
  }

  const glassOrders = workingOrders.filter((order) => order.hasWineByGlass);
  const tastingOrders = workingOrders.filter((order) => order.hasTasting);
  const productRows = Array.from(products.values()).map((product) => {
    const bottles = round(product.bottlesSold, 3);
    return {
      sku: product.sku,
      wine: mostCommonTitle(product.titleCounts, product.sku),
      bottlesSold: bottles,
      casesSold: round(bottles / 12),
    };
  }).sort((a, b) => b.bottlesSold - a.bottlesSold || a.wine.localeCompare(b.wine));

  const wineProductBottleTotal = round(productRows.reduce((sum, row) => sum + row.bottlesSold, 0), 3);
  const wineProductCaseTotal = round(wineProductBottleTotal / 12);
  if (Math.abs(wineProductBottleTotal - round(wineBottles, 3)) > 0.001) {
    throw new Error(`Wine-by-product validation failed for ${periodLabel(input)}: product rows total ${wineProductBottleTotal} bottles but the Wine summary totals ${round(wineBottles, 3)}.`);
  }

  const foodItems = Array.from(foodOther.values())
    .map((item) => ({ ...item, quantity: round(item.quantity, 3), netSales: round(item.netSales) }))
    .sort((a, b) => Math.abs(b.netSales) - Math.abs(a.netSales) || a.productTitle.localeCompare(b.productTitle));
  const foodOtherNetSales = workingOrders.reduce((sum, order) => sum + order.foodOtherNetSales, 0);
  const overallNetSales = workingOrders.reduce((sum, order) => sum + order.overallNetSales, 0);
  const categoryNetSales = wineNetSales
    + glassOrders.reduce((sum, order) => sum + order.wineByGlassNetSales, 0)
    + tastingOrders.reduce((sum, order) => sum + order.tastingNetSales, 0)
    + workingOrders.reduce((sum, order) => sum + order.merchNetSales, 0)
    + foodOtherNetSales;
  const difference = round(categoryNetSales - overallNetSales);

  if (newTypes.size) review.add(`New/unexpected Type value${newTypes.size === 1 ? '' : 's'} found: ${Array.from(newTypes).sort().join(', ')}.`);
  if (newTastingSkus.size) review.add(`New Tasting SKU${newTastingSkus.size === 1 ? '' : 's'} need classification: ${Array.from(newTastingSkus).sort().join(', ')}. They were placed in Food/Other instead of being guessed.`);
  if (negativeQuantityRows) review.add(`${negativeQuantityRows} line item${negativeQuantityRows === 1 ? '' : 's'} contained negative/refund quantity.`);
  if (refundExchangeOrders) review.add(`${refundExchangeOrders} refund/exchange transaction${refundExchangeOrders === 1 ? '' : 's'} were included in the selected period.`);
  if (refundReview.length) review.add(`${refundReview.length} linked case-order refund/exchange row${refundReview.length === 1 ? '' : 's'} require Case Refund Review.`);
  if (missingWineVolume) review.add(`${missingWineVolume} Wine line item${missingWineVolume === 1 ? '' : 's'} had no usable volume; Quantity was used as Bottle Quantity.`);
  if (foodItems.length) review.add(`${foodItems.length} product/SKU combination${foodItems.length === 1 ? '' : 's'} landed in Food/Other.`);
  if (posProfileIds.size > 1) review.add(`${posProfileIds.size} different POS profiles were included in this period. Confirm they all belong in the Tasting Room report.`);
  for (const [key, titles] of conflictingTitles) {
    if (titles.size <= 1) continue;
    const sku = products.get(key)?.sku || key;
    review.add(`Wine SKU ${sku} appeared with multiple Product Titles: ${Array.from(titles).sort().join(' / ')}. The most common title is displayed.`);
  }
  if (Math.abs(difference) > 0.01) {
    review.add(`Category net sales differ from Overall Net Sales by ${difference >= 0 ? '+' : ''}$${difference.toFixed(2)}. This can indicate an order-level discount/adjustment or an API line-price difference; review the category totals before using them as a final accounting total.`);
  }

  const calendarDays = daysInclusive(input.startDate, input.endDate);
  return {
    id: input.id,
    label: periodLabel(input),
    startDate: input.startDate,
    endDate: input.endDate,
    calendarDays,
    ordersReviewed: workingOrders.length,
    posProfileIds: Array.from(posProfileIds).sort(),
    wine: {
      bottlesSold: round(wineBottles, 3),
      casesSold: round(wineBottles / 12),
      netSales: round(wineNetSales),
      transactions: wineTransactions,
      avgPricePerBottle: Math.abs(wineBottles) > 0.000001 ? round(wineNetSales / wineBottles) : null,
      avgBottlesPerTransaction: wineTransactions ? round(wineBottles / wineTransactions) : null,
      avgNetSalesPerTransaction: wineTransactions ? round(wineNetSales / wineTransactions) : null,
    },
    caseSales: {
      numberOfCasesSold,
      transactionsFeaturingCase: qualifyingCaseOrders.length,
      netSalesOnOrdersFeaturingCase: round(caseNetSales),
      percentageWineTransactionsFeaturingCase: wineTransactions ? round((qualifyingCaseOrders.length / wineTransactions) * 100) : null,
      refundReview,
    },
    wineByGlass: {
      quantitySold: round(glassOrders.reduce((sum, order) => sum + order.wineByGlassQuantity, 0), 3),
      transactions: glassOrders.length,
      netSales: round(glassOrders.reduce((sum, order) => sum + order.wineByGlassNetSales, 0)),
    },
    tastings: {
      paidQuantity: round(tastingOrders.reduce((sum, order) => sum + order.tastingPaidQuantity, 0), 3),
      freeTastings: 0,
      knotFreeTastings: round(tastingOrders.reduce((sum, order) => sum + order.tastingKnotQuantity, 0), 3),
      transactions: tastingOrders.length,
      netSales: round(tastingOrders.reduce((sum, order) => sum + order.tastingNetSales, 0)),
    },
    merch: {
      quantitySold: round(workingOrders.reduce((sum, order) => sum + order.merchQuantity, 0), 3),
      netSales: round(workingOrders.reduce((sum, order) => sum + order.merchNetSales, 0)),
    },
    foodOther: { netSales: round(foodOtherNetSales), items: foodItems },
    overall: {
      transactions: workingOrders.length,
      netSales: round(overallNetSales),
      averagePerDay: calendarDays ? round(overallNetSales / calendarDays) : null,
      netSalesConfirmation: round(overallNetSales),
    },
    wineProducts: productRows,
    validation: {
      categoryNetSales: round(categoryNetSales),
      overallNetSales: round(overallNetSales),
      difference,
      wineProductBottleTotal,
      wineProductCaseTotal,
      passed: Math.abs(difference) <= 0.01,
    },
    reviewNeeded: Array.from(review),
  };
}

function combineSummaries(periods: TastingRoomSalesPeriodSummary[]): TastingRoomSalesPeriodSummary | null {
  if (periods.length <= 1) return null;
  const calendarDays = periods.reduce((sum, period) => sum + period.calendarDays, 0);
  const wineBottles = periods.reduce((sum, period) => sum + period.wine.bottlesSold, 0);
  const wineNetSales = periods.reduce((sum, period) => sum + period.wine.netSales, 0);
  const wineTransactions = periods.reduce((sum, period) => sum + period.wine.transactions, 0);
  const caseTransactions = periods.reduce((sum, period) => sum + period.caseSales.transactionsFeaturingCase, 0);
  const overallNetSales = periods.reduce((sum, period) => sum + period.overall.netSales, 0);
  const categoryNetSales = periods.reduce((sum, period) => sum + period.validation.categoryNetSales, 0);
  const foodMap = new Map<string, FoodOtherAccumulator>();
  for (const period of periods) {
    for (const item of period.foodOther.items) {
      const key = `${item.productTitle}\u0000${item.type}\u0000${item.sku}`;
      const current = foodMap.get(key) || { ...item };
      if (foodMap.has(key)) {
        current.quantity += item.quantity;
        current.netSales += item.netSales;
      }
      foodMap.set(key, current);
    }
  }
  const combinedProductsMap = new Map<string, { wine: string; bottles: number }>();
  for (const period of periods) {
    for (const row of period.wineProducts) {
      const key = row.sku;
      const current = combinedProductsMap.get(key) || { wine: row.wine, bottles: 0 };
      current.bottles += row.bottlesSold;
      combinedProductsMap.set(key, current);
    }
  }
  const combinedProducts = Array.from(combinedProductsMap.entries()).map(([sku, value]) => ({
    sku,
    wine: value.wine,
    bottlesSold: round(value.bottles, 3),
    casesSold: round(value.bottles / 12),
  })).sort((a, b) => b.bottlesSold - a.bottlesSold || a.wine.localeCompare(b.wine));
  const difference = round(categoryNetSales - overallNetSales);

  return {
    id: 'combined',
    label: 'Combined Total',
    startDate: periods[0].startDate,
    endDate: periods[periods.length - 1].endDate,
    calendarDays,
    ordersReviewed: periods.reduce((sum, period) => sum + period.ordersReviewed, 0),
    posProfileIds: Array.from(new Set(periods.flatMap((period) => period.posProfileIds))).sort(),
    wine: {
      bottlesSold: round(wineBottles, 3),
      casesSold: round(wineBottles / 12),
      netSales: round(wineNetSales),
      transactions: wineTransactions,
      avgPricePerBottle: Math.abs(wineBottles) > 0.000001 ? round(wineNetSales / wineBottles) : null,
      avgBottlesPerTransaction: wineTransactions ? round(wineBottles / wineTransactions) : null,
      avgNetSalesPerTransaction: wineTransactions ? round(wineNetSales / wineTransactions) : null,
    },
    caseSales: {
      numberOfCasesSold: periods.reduce((sum, period) => sum + period.caseSales.numberOfCasesSold, 0),
      transactionsFeaturingCase: caseTransactions,
      netSalesOnOrdersFeaturingCase: round(periods.reduce((sum, period) => sum + period.caseSales.netSalesOnOrdersFeaturingCase, 0)),
      percentageWineTransactionsFeaturingCase: wineTransactions ? round((caseTransactions / wineTransactions) * 100) : null,
      refundReview: periods.flatMap((period) => period.caseSales.refundReview),
    },
    wineByGlass: {
      quantitySold: round(periods.reduce((sum, period) => sum + period.wineByGlass.quantitySold, 0), 3),
      transactions: periods.reduce((sum, period) => sum + period.wineByGlass.transactions, 0),
      netSales: round(periods.reduce((sum, period) => sum + period.wineByGlass.netSales, 0)),
    },
    tastings: {
      paidQuantity: round(periods.reduce((sum, period) => sum + period.tastings.paidQuantity, 0), 3),
      freeTastings: 0,
      knotFreeTastings: round(periods.reduce((sum, period) => sum + period.tastings.knotFreeTastings, 0), 3),
      transactions: periods.reduce((sum, period) => sum + period.tastings.transactions, 0),
      netSales: round(periods.reduce((sum, period) => sum + period.tastings.netSales, 0)),
    },
    merch: {
      quantitySold: round(periods.reduce((sum, period) => sum + period.merch.quantitySold, 0), 3),
      netSales: round(periods.reduce((sum, period) => sum + period.merch.netSales, 0)),
    },
    foodOther: {
      netSales: round(periods.reduce((sum, period) => sum + period.foodOther.netSales, 0)),
      items: Array.from(foodMap.values()).map((item) => ({ ...item, quantity: round(item.quantity, 3), netSales: round(item.netSales) }))
        .sort((a, b) => Math.abs(b.netSales) - Math.abs(a.netSales) || a.productTitle.localeCompare(b.productTitle)),
    },
    overall: {
      transactions: periods.reduce((sum, period) => sum + period.overall.transactions, 0),
      netSales: round(overallNetSales),
      averagePerDay: calendarDays ? round(overallNetSales / calendarDays) : null,
      netSalesConfirmation: round(overallNetSales),
    },
    wineProducts: combinedProducts,
    validation: {
      categoryNetSales: round(categoryNetSales),
      overallNetSales: round(overallNetSales),
      difference,
      wineProductBottleTotal: round(wineBottles, 3),
      wineProductCaseTotal: round(wineBottles / 12),
      passed: Math.abs(difference) <= 0.01,
    },
    reviewNeeded: Array.from(new Set(periods.flatMap((period) => period.reviewNeeded))),
  };
}

function combinedWineProducts(periods: TastingRoomSalesPeriodSummary[]) {
  const map = new Map<string, CombinedWineProductSales>();
  for (const period of periods) {
    for (const row of period.wineProducts) {
      const current = map.get(row.sku) || {
        sku: row.sku,
        wine: row.wine,
        periods: {},
        combinedBottlesSold: 0,
        combinedCasesSold: 0,
      };
      current.periods[period.id] = { bottlesSold: row.bottlesSold, casesSold: row.casesSold };
      current.combinedBottlesSold += row.bottlesSold;
      current.wine = row.wine || current.wine;
      map.set(row.sku, current);
    }
  }
  return Array.from(map.values()).map((row) => ({
    ...row,
    combinedBottlesSold: round(row.combinedBottlesSold, 3),
    combinedCasesSold: round(row.combinedBottlesSold / 12),
  })).sort((a, b) => b.combinedBottlesSold - a.combinedBottlesSold || a.wine.localeCompare(b.wine));
}

export function buildTastingRoomSalesAnalysis(periodOrders: Array<{ input: SalesPeriodInput; orders: Commerce7Order[] }>): TastingRoomSalesAnalysis {
  const periods = periodOrders.map(({ input, orders }) => periodSummary(input, orders));
  return {
    generatedAt: new Date().toISOString(),
    periods,
    combined: combineSummaries(periods),
    wineProducts: combinedWineProducts(periods),
  };
}
