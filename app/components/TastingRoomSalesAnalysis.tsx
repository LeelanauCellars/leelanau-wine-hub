'use client';

import React, { useMemo, useState } from 'react';
import type {
  CombinedWineProductSales,
  TastingRoomSalesAnalysis as Analysis,
  TastingRoomSalesPeriodSummary,
} from '@/lib/tasting-room-sales';

type PeriodDraft = { key: string; label: string; startDate: string; endDate: string };

type MetricRow = {
  label: string;
  value: (summary: TastingRoomSalesPeriodSummary) => number | null;
  format: 'number' | 'decimal' | 'currency' | 'percent';
};

type MetricSection = { title: string; rows: MetricRow[] };

const sections: MetricSection[] = [
  {
    title: 'Wine',
    rows: [
      { label: 'Wine Bottles Sold', value: (s) => s.wine.bottlesSold, format: 'number' },
      { label: 'Cases Sold (Bottle Equivalent)', value: (s) => s.wine.casesSold, format: 'decimal' },
      { label: 'Net Sales on Wine', value: (s) => s.wine.netSales, format: 'currency' },
      { label: 'Transactions Featuring Wine', value: (s) => s.wine.transactions, format: 'number' },
      { label: 'Avg. Price per Bottle Sold', value: (s) => s.wine.avgPricePerBottle, format: 'currency' },
      { label: 'Avg. Wine Bottles Sold Per Transaction', value: (s) => s.wine.avgBottlesPerTransaction, format: 'decimal' },
      { label: 'Avg. Net Sales Per Transaction', value: (s) => s.wine.avgNetSalesPerTransaction, format: 'currency' },
    ],
  },
  {
    title: 'Case Sales',
    rows: [
      { label: 'Number of Cases Sold', value: (s) => s.caseSales.numberOfCasesSold, format: 'number' },
      { label: 'Transactions Featuring a Case or More', value: (s) => s.caseSales.transactionsFeaturingCase, format: 'number' },
      { label: 'Net Sales on Orders Featuring a Case', value: (s) => s.caseSales.netSalesOnOrdersFeaturingCase, format: 'currency' },
      { label: 'Percentage of Wine Transactions Featuring a Case', value: (s) => s.caseSales.percentageWineTransactionsFeaturingCase, format: 'percent' },
    ],
  },
  {
    title: 'Wine by the Glass Sales',
    rows: [
      { label: 'Quantity Sold', value: (s) => s.wineByGlass.quantitySold, format: 'number' },
      { label: 'Total Transactions', value: (s) => s.wineByGlass.transactions, format: 'number' },
      { label: 'Net Sales', value: (s) => s.wineByGlass.netSales, format: 'currency' },
    ],
  },
  {
    title: 'Tastings Sales',
    rows: [
      { label: 'Quantity Sold (Excluding Free)', value: (s) => s.tastings.paidQuantity, format: 'number' },
      { label: 'Free Tastings', value: (s) => s.tastings.freeTastings, format: 'number' },
      { label: 'Knot Free Tastings', value: (s) => s.tastings.knotFreeTastings, format: 'number' },
      { label: 'Total Transactions', value: (s) => s.tastings.transactions, format: 'number' },
      { label: 'Net Sales', value: (s) => s.tastings.netSales, format: 'currency' },
    ],
  },
  {
    title: 'Merch and Apparel',
    rows: [
      { label: 'Quantity Sold', value: (s) => s.merch.quantitySold, format: 'number' },
      { label: 'Net Sales', value: (s) => s.merch.netSales, format: 'currency' },
    ],
  },
  {
    title: 'Overall',
    rows: [
      { label: 'Transactions', value: (s) => s.overall.transactions, format: 'number' },
      { label: 'Net Sales', value: (s) => s.overall.netSales, format: 'currency' },
      { label: 'Avg. Per Day', value: (s) => s.overall.averagePerDay, format: 'currency' },
      { label: 'Net Sales Total (For Confirmation)', value: (s) => s.overall.netSalesConfirmation, format: 'currency' },
    ],
  },
];

function detroitToday() {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Detroit', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function firstOfMonth(date: string) {
  return `${date.slice(0, 7)}-01`;
}

function nextKey() {
  return `period-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatQuantity(value: number | null, decimals = 2) {
  if (value === null || !Number.isFinite(value)) return '—';
  if (Math.abs(value - Math.round(value)) < 0.000001) return Math.round(value).toLocaleString();
  return value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function formatMetric(value: number | null, format: MetricRow['format']) {
  if (value === null || !Number.isFinite(value)) return '—';
  if (format === 'currency') return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (format === 'percent') return `${value.toFixed(2)}%`;
  if (format === 'decimal') return value.toFixed(2);
  return formatQuantity(value);
}

function dateLabel(summary: TastingRoomSalesPeriodSummary) {
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const start = formatter.format(new Date(`${summary.startDate}T00:00:00Z`));
  const end = formatter.format(new Date(`${summary.endDate}T00:00:00Z`));
  return summary.startDate === summary.endDate ? start : `${start} – ${end}`;
}

function SummaryTable({ analysis }: { analysis: Analysis }) {
  const columns = analysis.combined ? [...analysis.periods, analysis.combined] : analysis.periods;
  return <div className="overflow-x-auto rounded-3xl border border-black/[.08] bg-white shadow-sm">
    <table className="min-w-[880px] w-full border-collapse text-sm">
      <thead>
        <tr className="bg-[#f7f9fb] text-left">
          <th className="sticky left-0 z-10 min-w-[300px] bg-[#f7f9fb] px-5 py-4 text-xs font-black uppercase tracking-[.12em] text-black/50">Tasting Room Sales Summary</th>
          {columns.map((column) => <th key={column.id} className="min-w-[180px] px-5 py-4 text-right align-bottom">
            <span className="block text-sm font-black text-black">{column.label}</span>
            <span className="mt-1 block text-[11px] font-bold text-black/40">{column.id === 'combined' ? `${column.calendarDays} calendar days` : dateLabel(column)}</span>
          </th>)}
        </tr>
      </thead>
      <tbody>
        {sections.flatMap((section) => [
          <tr key={`${section.title}-heading`} className="border-t border-black/[.08] bg-[#edf4fb]">
            <th className="sticky left-0 z-[1] bg-[#edf4fb] px-5 py-3 text-left text-xs font-black uppercase tracking-[.13em] text-[#326eac]">{section.title}</th>
            {columns.map((column) => <td key={column.id} className="px-5 py-3" />)}
          </tr>,
          ...section.rows.map((row) => <tr key={`${section.title}-${row.label}`} className="border-t border-black/[.06]">
            <th className="sticky left-0 z-[1] bg-white px-5 py-3 text-left font-bold text-black/65">{row.label}</th>
            {columns.map((column) => <td key={column.id} className={`px-5 py-3 text-right font-black ${column.id === 'combined' ? 'bg-[#fbfcfd]' : ''}`}>{formatMetric(row.value(column), row.format)}</td>)}
          </tr>),
        ])}
      </tbody>
    </table>
  </div>;
}

function WineProductTable({ analysis }: { analysis: Analysis }) {
  const showCombined = analysis.periods.length > 1;
  return <section className="mt-6 rounded-3xl border border-black/[.08] bg-white p-6 shadow-sm md:p-7">
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div><p className="text-[11px] font-black uppercase tracking-[.16em] text-[#326eac]">Product Detail</p><h2 className="mt-1 text-2xl font-black tracking-[-.03em]">Wine Sales by Product</h2></div>
      <p className="text-sm font-bold text-black/45">Sorted by combined bottles sold · bottle-equivalent cases</p>
    </div>
    <div className="mt-5 overflow-x-auto rounded-2xl border border-black/[.08]">
      <table className="min-w-[1050px] w-full border-collapse text-sm">
        <thead className="bg-[#f7f9fb] text-black/60">
          <tr>
            <th rowSpan={2} className="px-4 py-3 text-left font-black">Wine</th>
            <th rowSpan={2} className="px-4 py-3 text-left font-black">SKU</th>
            {analysis.periods.map((period) => <th key={period.id} colSpan={2} className="border-l border-black/[.06] px-4 py-3 text-center font-black">{period.label}</th>)}
            {showCombined && <th colSpan={2} className="border-l border-black/[.06] bg-[#edf4fb] px-4 py-3 text-center font-black text-[#326eac]">Combined Total</th>}
          </tr>
          <tr className="border-t border-black/[.06]">
            {analysis.periods.flatMap((period) => [<th key={`${period.id}-b`} className="border-l border-black/[.06] px-4 py-2 text-right font-black">Bottles</th>, <th key={`${period.id}-c`} className="px-4 py-2 text-right font-black">Cases</th>])}
            {showCombined && <><th className="border-l border-black/[.06] bg-[#f7fbff] px-4 py-2 text-right font-black">Bottles</th><th className="bg-[#f7fbff] px-4 py-2 text-right font-black">Cases</th></>}
          </tr>
        </thead>
        <tbody>
          {analysis.wineProducts.map((row) => <WineProductRow key={row.sku} row={row} periods={analysis.periods} showCombined={showCombined} />)}
          <tr className="border-t-2 border-black/15 bg-[#f7f9fb] font-black">
            <td className="px-4 py-3">TOTAL</td><td className="px-4 py-3">—</td>
            {analysis.periods.flatMap((period) => [
              <td key={`${period.id}-tb`} className="border-l border-black/[.06] px-4 py-3 text-right">{formatQuantity(period.wine.bottlesSold)}</td>,
              <td key={`${period.id}-tc`} className="px-4 py-3 text-right">{period.wine.casesSold.toFixed(2)}</td>,
            ])}
            {showCombined && analysis.combined && <><td className="border-l border-black/[.06] bg-[#edf4fb] px-4 py-3 text-right">{formatQuantity(analysis.combined.wine.bottlesSold)}</td><td className="bg-[#edf4fb] px-4 py-3 text-right">{analysis.combined.wine.casesSold.toFixed(2)}</td></>}
          </tr>
        </tbody>
      </table>
    </div>
  </section>;
}

function WineProductRow({ row, periods, showCombined }: { row: CombinedWineProductSales; periods: TastingRoomSalesPeriodSummary[]; showCombined: boolean }) {
  return <tr className="border-t border-black/[.06]">
    <td className="px-4 py-3 font-black">{row.wine}</td><td className="px-4 py-3 font-mono text-xs font-bold text-black/55">{row.sku}</td>
    {periods.flatMap((period) => {
      const value = row.periods[period.id] || { bottlesSold: 0, casesSold: 0 };
      return [<td key={`${period.id}-b`} className="border-l border-black/[.06] px-4 py-3 text-right font-black">{formatQuantity(value.bottlesSold)}</td>, <td key={`${period.id}-c`} className="px-4 py-3 text-right font-bold">{value.casesSold.toFixed(2)}</td>];
    })}
    {showCombined && <><td className="border-l border-black/[.06] bg-[#fbfcfd] px-4 py-3 text-right font-black">{formatQuantity(row.combinedBottlesSold)}</td><td className="bg-[#fbfcfd] px-4 py-3 text-right font-black">{row.combinedCasesSold.toFixed(2)}</td></>}
  </tr>;
}

function CaseRefundReview({ analysis }: { analysis: Analysis }) {
  const rows = analysis.periods.flatMap((period) => period.caseSales.refundReview.map((row) => ({ ...row, period: period.label })));
  if (!rows.length) return null;
  return <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50/60 p-6 md:p-7">
    <p className="text-[11px] font-black uppercase tracking-[.16em] text-amber-700">Review Required</p><h2 className="mt-1 text-2xl font-black">Case Refund Review</h2>
    <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-black/55">Gross case-order wine sales remain unchanged in the main summary. These linked refunds/exchanges are shown separately so the adjustment is not hidden.</p>
    <div className="mt-5 overflow-x-auto rounded-2xl border border-amber-200 bg-white">
      <table className="min-w-[1200px] w-full border-collapse text-sm"><thead className="bg-amber-50 text-black/65"><tr><th className="p-3 text-left font-black">Period</th><th className="p-3 text-left font-black">Original Order</th><th className="p-3 text-right font-black">Original Bottles</th><th className="p-3 text-right font-black">Original Wine Sales</th><th className="p-3 text-left font-black">Refund / Exchange</th><th className="p-3 text-right font-black">Refunded Qty</th><th className="p-3 text-right font-black">Refunded Wine Sales</th><th className="p-3 text-right font-black">After Linked Refunds</th></tr></thead>
      <tbody>{rows.map((row, index) => <tr key={`${row.originalOrderNumber}-${row.refundExchangeOrderNumber}-${index}`} className="border-t border-black/[.06]"><td className="p-3 font-bold">{row.period}</td><td className="p-3 font-black">{row.originalOrderNumber}</td><td className="p-3 text-right font-bold">{formatQuantity(row.originalWineBottleQuantity)}</td><td className="p-3 text-right font-bold">{formatMetric(row.originalWineNetSales, 'currency')}</td><td className="p-3 font-black">{row.refundExchangeOrderNumber}</td><td className="p-3 text-right font-bold">{formatQuantity(row.refundedWineQuantity)}</td><td className="p-3 text-right font-bold">{formatMetric(row.refundedWineNetSales, 'currency')}</td><td className="p-3 text-right font-black">{formatMetric(row.caseWineSalesAfterLinkedRefunds, 'currency')}</td></tr>)}</tbody></table>
    </div>
  </section>;
}

function ReviewSection({ analysis }: { analysis: Analysis }) {
  const foodRows = analysis.periods.flatMap((period) => period.foodOther.items.map((item) => ({ ...item, period: period.label })));
  const reviewRows = analysis.periods.flatMap((period) => period.reviewNeeded.map((message) => ({ period: period.label, message })));
  const combinedDifference = analysis.combined?.validation.difference ?? analysis.periods[0]?.validation.difference ?? 0;
  if (!foodRows.length && !reviewRows.length && Math.abs(combinedDifference) <= 0.01) return null;
  return <section className="mt-6 rounded-3xl border border-black/[.08] bg-white p-6 shadow-sm md:p-7">
    <p className="text-[11px] font-black uppercase tracking-[.16em] text-[#326eac]">Validation</p><h2 className="mt-1 text-2xl font-black">Review Needed</h2>
    {reviewRows.length > 0 && <div className="mt-4 grid gap-2">{reviewRows.map((row, index) => <div key={`${row.period}-${index}`} className="rounded-xl bg-[#f7f9fb] px-4 py-3 text-sm font-semibold leading-6 text-black/65"><strong className="text-black">{row.period}:</strong> {row.message}</div>)}</div>}
    {foodRows.length > 0 && <div className="mt-6"><h3 className="text-lg font-black">Food / Other</h3><p className="mt-1 text-sm font-semibold text-black/50">Items Central did not assign to Wine, Wine by the Glass, Tastings, or Merch/Apparel.</p><div className="mt-3 overflow-x-auto rounded-2xl border border-black/[.08]"><table className="min-w-[820px] w-full text-sm"><thead className="bg-[#f7f9fb]"><tr><th className="p-3 text-left font-black">Period</th><th className="p-3 text-left font-black">Product</th><th className="p-3 text-left font-black">Type</th><th className="p-3 text-left font-black">SKU</th><th className="p-3 text-right font-black">Qty</th><th className="p-3 text-right font-black">Net Sales</th></tr></thead><tbody>{foodRows.map((row, index) => <tr key={`${row.period}-${row.sku}-${index}`} className="border-t border-black/[.06]"><td className="p-3 font-bold">{row.period}</td><td className="p-3 font-black">{row.productTitle}</td><td className="p-3 font-bold">{row.type}</td><td className="p-3 font-mono text-xs font-bold">{row.sku}</td><td className="p-3 text-right font-bold">{formatQuantity(row.quantity)}</td><td className="p-3 text-right font-black">{formatMetric(row.netSales, 'currency')}</td></tr>)}</tbody></table></div></div>}
  </section>;
}

export default function TastingRoomSalesAnalysis() {
  const today = useMemo(() => detroitToday(), []);
  const [periods, setPeriods] = useState<PeriodDraft[]>([{ key: nextKey(), label: '', startDate: firstOfMonth(today), endDate: today }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  function updatePeriod(key: string, patch: Partial<PeriodDraft>) {
    setPeriods((current) => current.map((period) => period.key === key ? { ...period, ...patch } : period));
  }

  function addPeriod() {
    if (periods.length >= 4) return;
    setPeriods((current) => [...current, { key: nextKey(), label: '', startDate: firstOfMonth(today), endDate: today }]);
  }

  async function analyze() {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/tasting-room/sales-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periods: periods.map(({ label, startDate, endDate }) => ({ label, startDate, endDate })) }),
      });
      const payload = await response.json() as { analysis?: Analysis; error?: string };
      if (!response.ok || !payload.analysis) throw new Error(payload.error || 'Unable to analyze POS sales.');
      setAnalysis(payload.analysis);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to analyze POS sales.');
    } finally {
      setLoading(false);
    }
  }

  return <div className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 md:py-10">
    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="text-[11px] font-black uppercase tracking-[.18em] text-[#326eac]">Admin · Tasting Room</p><h1 className="mt-2 text-4xl font-black tracking-[-.045em] md:text-5xl">Sales Analysis</h1><p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-black/55">Choose a date range and Central will pull Commerce7 POS orders directly, apply the tasting-room reporting rules, validate the totals, and break Wine sales down by SKU.</p></div>
      {analysis && <div className="rounded-2xl border border-black/[.08] bg-[#f7f9fb] px-4 py-3 text-sm font-bold text-black/55">Last analyzed {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(analysis.generatedAt))}</div>}
    </div>

    <section className="mt-7 rounded-3xl border border-black/[.08] bg-white p-6 shadow-sm md:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-xl font-black">Reporting periods</h2><p className="mt-1 text-sm font-semibold text-black/50">Use one range for a normal report, or add non-overlapping ranges to compare weeks/months and create a Combined Total.</p></div><button type="button" onClick={addPeriod} disabled={periods.length >= 4} className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-black disabled:opacity-40">+ Add comparison period</button></div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {periods.map((period, index) => <div key={period.key} className="rounded-2xl border border-black/[.08] bg-[#f8f9fb] p-4">
          <div className="flex items-center justify-between gap-3"><span className="text-xs font-black uppercase tracking-[.13em] text-black/45">Period {index + 1}</span>{periods.length > 1 && <button type="button" onClick={() => setPeriods((current) => current.filter((item) => item.key !== period.key))} className="text-xs font-black text-red-600">Remove</button>}</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_145px_145px]"><label><span className="mb-1.5 block text-xs font-black text-black/55">Optional label</span><input value={period.label} onChange={(event) => updatePeriod(period.key, { label: event.target.value })} className="field-input h-11" placeholder="Aug. 1–8" /></label><label><span className="mb-1.5 block text-xs font-black text-black/55">Start</span><input type="date" value={period.startDate} onChange={(event) => updatePeriod(period.key, { startDate: event.target.value })} className="field-input h-11" /></label><label><span className="mb-1.5 block text-xs font-black text-black/55">End</span><input type="date" value={period.endDate} onChange={(event) => updatePeriod(period.key, { endDate: event.target.value })} className="field-input h-11" /></label></div>
        </div>)}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"><button type="button" onClick={() => void analyze()} disabled={loading || periods.some((period) => !period.startDate || !period.endDate)} className="inline-flex h-12 items-center justify-center rounded-xl bg-[#326eac] px-6 text-sm font-black text-white shadow-sm disabled:opacity-45">{loading ? 'Analyzing Commerce7 POS…' : 'Analyze POS Sales'}</button><p className="text-sm font-semibold text-black/45">POS only · America/Detroit dates · refunds/exchanges included</p></div>
      {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700">{error}</div>}
    </section>

    {analysis && <div className="mt-6">
      <SummaryTable analysis={analysis} />
      <CaseRefundReview analysis={analysis} />
      <WineProductTable analysis={analysis} />
      <ReviewSection analysis={analysis} />
    </div>}
  </div>;
}
