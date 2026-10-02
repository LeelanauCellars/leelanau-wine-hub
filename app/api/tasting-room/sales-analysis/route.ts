import { NextRequest, NextResponse } from 'next/server';
import { sessionRole } from '@/lib/auth';
import { fetchCommerce7Orders, type Commerce7Order } from '@/lib/commerce7-server';
import { buildTastingRoomSalesAnalysis, type SalesPeriodInput } from '@/lib/tasting-room-sales';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TIME_ZONE = 'America/Detroit';
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

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

function localOrderDate(order: Commerce7Order) {
  if (!order.orderSubmittedDate) return '';
  const parsed = new Date(order.orderSubmittedDate);
  if (Number.isNaN(parsed.getTime())) return order.orderSubmittedDate.slice(0, 10);
  const { year, month, day } = datePartsInTimeZone(parsed);
  return isoDate(year, month, day);
}

function addUtcDays(date: string, days: number) {
  const [year, month, day] = date.split('-').map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return result.toISOString().slice(0, 10);
}

function daysInclusive(start: string, end: string) {
  const a = Date.parse(`${start}T00:00:00Z`);
  const b = Date.parse(`${end}T00:00:00Z`);
  return Math.floor((b - a) / 86400000) + 1;
}

function periodsOverlap(a: SalesPeriodInput, b: SalesPeriodInput) {
  return a.startDate <= b.endDate && b.startDate <= a.endDate;
}

function validPeriod(value: unknown, index: number): SalesPeriodInput {
  if (!value || typeof value !== 'object') throw new Error(`Reporting period ${index + 1} is invalid.`);
  const record = value as Record<string, unknown>;
  const startDate = String(record.startDate || '').trim();
  const endDate = String(record.endDate || '').trim();
  const label = String(record.label || '').trim();
  if (!ISO_DATE.test(startDate) || !ISO_DATE.test(endDate)) throw new Error(`Reporting period ${index + 1} needs a valid start and end date.`);
  if (endDate < startDate) throw new Error(`Reporting period ${index + 1} ends before it starts.`);
  if (daysInclusive(startDate, endDate) > 370) throw new Error(`Reporting period ${index + 1} is too large. Use a range of 370 days or less.`);
  return { id: `period-${index + 1}`, startDate, endDate, label: label || undefined };
}

async function ordersForPeriod(input: SalesPeriodInput) {
  // Commerce7 timestamps are UTC. Pull one day on either side, then filter in
  // America/Detroit so late-night POS orders land on the correct tasting-room date.
  const queryStart = addUtcDays(input.startDate, -1);
  const queryEndExclusive = addUtcDays(input.endDate, 2);
  const { orders } = await fetchCommerce7Orders({ orderSubmittedDate: `btw:${queryStart}|${queryEndExclusive}` });

  const local = orders
    .map((order) => ({ ...order, __localDate: localOrderDate(order) }))
    .filter((order) => order.__localDate >= input.startDate && order.__localDate <= input.endDate)
    .filter((order) => (order.paymentStatus || '').toLowerCase() !== 'cancelled');

  // Keep POS transactions plus any non-POS refund/exchange record that explicitly
  // links back to an original POS order in the same reporting period.
  const posOrderNumbers = new Set(
    local
      .filter((order) => (order.channel || '').toUpperCase() === 'POS')
      .map((order) => String(order.orderNumber ?? '').trim())
      .filter(Boolean),
  );

  return local
    .filter((order) => {
      if ((order.channel || '').toUpperCase() === 'POS') return true;
      const previous = String(order.previousOrderNumber ?? '').trim();
      return Boolean(previous && posOrderNumbers.has(previous));
    })
    .map(({ __localDate, ...order }) => ({ ...order, orderSubmittedDate: __localDate }));
}

export async function POST(request: NextRequest) {
  const role = await sessionRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (role !== 'admin') return NextResponse.json({ error: 'Admin access is required for Tasting Room Sales Analysis.' }, { status: 403 });

  try {
    const body = await request.json() as { periods?: unknown[] };
    const raw = Array.isArray(body.periods) ? body.periods : [];
    if (!raw.length) return NextResponse.json({ error: 'Add at least one reporting period.' }, { status: 400 });
    if (raw.length > 4) return NextResponse.json({ error: 'Central can compare up to four reporting periods at a time.' }, { status: 400 });

    const periods = raw.map(validPeriod).sort((a, b) => a.startDate.localeCompare(b.startDate));
    for (let i = 0; i < periods.length; i += 1) {
      for (let j = i + 1; j < periods.length; j += 1) {
        if (periodsOverlap(periods[i], periods[j])) {
          return NextResponse.json({ error: `Reporting periods cannot overlap (${periods[i].startDate}–${periods[i].endDate} and ${periods[j].startDate}–${periods[j].endDate}).` }, { status: 400 });
        }
      }
    }

    const periodOrders = [] as Array<{ input: SalesPeriodInput; orders: Commerce7Order[] }>;
    for (const input of periods) {
      periodOrders.push({ input, orders: await ordersForPeriod(input) });
    }

    const analysis = buildTastingRoomSalesAnalysis(periodOrders);
    return NextResponse.json({ analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to analyze Commerce7 POS sales.';
    const status = /rejected Order access|Commerce7 is not configured/i.test(message) ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
