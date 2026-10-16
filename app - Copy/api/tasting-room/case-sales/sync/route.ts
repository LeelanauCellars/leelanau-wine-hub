import { NextResponse } from 'next/server';
import { sessionRole } from '@/lib/auth';
import { buildCaseSalesSummaryFromCommerce7Orders, caseSalesGoalMetrics } from '@/lib/case-sales';
import { loadLatestCaseSalesSummary, saveCaseSalesSummary, caseSalesStorageConfigured } from '@/lib/case-sales-storage';
import { fetchCommerce7Orders, type Commerce7Order } from '@/lib/commerce7-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TIME_ZONE = 'America/Detroit';

function datePartsInTimeZone(value: Date, timeZone = TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || '';
  return { year: Number(get('year')), month: Number(get('month')), day: Number(get('day')) };
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function addUtcDays(date: string, days: number) {
  const [year, month, day] = date.split('-').map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return result.toISOString().slice(0, 10);
}

function monthBounds(now = new Date()) {
  const { year, month, day } = datePartsInTimeZone(now);
  const monthStartDate = isoDate(year, month, 1);
  const asOfDate = isoDate(year, month, day);
  const nextMonth = new Date(Date.UTC(year, month, 1));
  const nextMonthStartDate = nextMonth.toISOString().slice(0, 10);
  return { monthStartDate, asOfDate, nextMonthStartDate };
}

function localOrderDate(order: Commerce7Order) {
  if (!order.orderSubmittedDate) return '';
  const parsed = new Date(order.orderSubmittedDate);
  if (Number.isNaN(parsed.getTime())) return order.orderSubmittedDate.slice(0, 10);
  const { year, month, day } = datePartsInTimeZone(parsed);
  return isoDate(year, month, day);
}

export async function POST() {
  const role = await sessionRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (role !== 'admin' && role !== 'tasting') {
    return NextResponse.json({ error: 'Tasting Room or Admin access is required.' }, { status: 403 });
  }

  const storageConfigured = await caseSalesStorageConfigured();
  if (!storageConfigured) return NextResponse.json({ error: 'Vercel Blob is not connected to Central.' }, { status: 409 });

  try {
    const { monthStartDate, asOfDate, nextMonthStartDate } = monthBounds();
    // Commerce7 stores timestamps in UTC. Pull an extra day on each side, then filter in
    // America/Detroit so late-night tasting-room orders land on the correct local day/month.
    const queryStart = addUtcDays(monthStartDate, -1);
    const queryEnd = addUtcDays(nextMonthStartDate, 1);
    const { orders } = await fetchCommerce7Orders({ orderSubmittedDate: `btw:${queryStart}|${queryEnd}` });

    const inMonth = orders
      .map((order) => ({ ...order, __localDate: localOrderDate(order) }))
      .filter((order) => order.__localDate >= monthStartDate && order.__localDate < nextMonthStartDate)
      .filter((order) => (order.paymentStatus || '').toLowerCase() !== 'cancelled');

    const posOriginalOrderNumbers = new Set(
      inMonth
        .filter((order) => (order.channel || '').toUpperCase() === 'POS' && !order.previousOrderNumber)
        .map((order) => String(order.orderNumber ?? '').trim())
        .filter(Boolean),
    );

    const selectedOrders = inMonth
      .filter((order) => {
        if ((order.channel || '').toUpperCase() === 'POS') return true;
        const previous = String(order.previousOrderNumber ?? '').trim();
        return Boolean(previous && posOriginalOrderNumbers.has(previous));
      })
      .map(({ __localDate, ...order }) => ({ ...order, orderSubmittedDate: __localDate }));

    const posOrdersReviewed = inMonth.filter((order) => (order.channel || '').toUpperCase() === 'POS').length;
    const linkedAdjustments = selectedOrders.filter((order) => (order.channel || '').toUpperCase() !== 'POS' && order.previousOrderNumber).length;
    const previous = await loadLatestCaseSalesSummary().catch(() => null);
    const summary = buildCaseSalesSummaryFromCommerce7Orders(selectedOrders, {
      monthStartDate,
      asOfDate,
      previous,
      posOrdersReviewed,
      sourceDetail: `${posOrdersReviewed.toLocaleString()} POS orders reviewed${linkedAdjustments ? ` · ${linkedAdjustments.toLocaleString()} linked refund/exchange adjustment${linkedAdjustments === 1 ? '' : 's'} found outside the POS channel` : ''}`,
    });

    await saveCaseSalesSummary(summary);
    return NextResponse.json({
      summary,
      metrics: caseSalesGoalMetrics(summary),
      storageConfigured: true,
      liveSync: {
        monthStartDate,
        asOfDate,
        posOrdersReviewed,
        linkedAdjustments,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to sync Commerce7 POS orders.' }, { status: 502 });
  }
}
