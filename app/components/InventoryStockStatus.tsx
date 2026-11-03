'use client';

import { useMemo, useRef, useState } from 'react';
import type { StockAnalysis } from '@/lib/stock-inventory';

function quantity(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(value);
}

export default function InventoryStockStatus() {
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [showExcluded, setShowExcluded] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const totals = useMemo(() => (analysis?.totals || []).filter((entry) => entry.productCode.toLowerCase().includes(query.trim().toLowerCase())), [analysis, query]);
  const excludedNoLot = analysis?.excludedRows.filter((line) => line.reason === 'No lot number').length ?? 0;
  const excludedDestDoc = analysis?.excludedRows.filter((line) => line.reason === 'DEST DOC populated').length ?? 0;
  const invalidQty = analysis?.excludedRows.filter((line) => line.reason === 'Invalid STKQTY').length ?? 0;

  async function processFile() {
    if (!file || busy) return;
    setBusy(true);
    setMessage('');
    setAnalysis(null);
    setReviewed(false);
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch('/api/tasting-room/inventory', { method: 'POST', body: form, cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'The PDF could not be processed.');
      setAnalysis(payload as StockAnalysis);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not process the file.');
    } finally { setBusy(false); }
  }

  async function downloadExcel() {
    if (!analysis || !reviewed || exporting) return;
    setExporting(true);
    setMessage('');
    try {
      const response = await fetch('/api/tasting-room/inventory/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: analysis.fileName, includedRows: analysis.includedRows, excludedRows: analysis.excludedRows }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Could not generate Excel file.');
      }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Leelanau-Stock-Status-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not export the file.');
    } finally { setExporting(false); }
  }

  return <div className="mx-auto max-w-[1320px] space-y-6 p-5 md:p-8 xl:p-10">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black tracking-[-.035em] text-[#122438] md:text-4xl">Inventory</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">Upload a Stock Status by CC and LOC PDF to calculate the total STKQTY for each Product Code.</p>
      </div>
    </header>

    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-lg font-black text-[#122438]">Upload stock-status report</h2>
      <p className="mt-2 text-sm leading-6 text-black/55">Rows count only when they have a <strong>LOT NUMBER</strong> and a blank <strong>DEST DOC</strong>. The original quantity is used as printed, with no case/bottle conversion. Files are processed for this session and are not saved to Central.</p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input ref={input} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(event) => { setFile(event.target.files?.[0] || null); setAnalysis(null); setReviewed(false); setMessage(''); }} />
        <button type="button" onClick={() => input.current?.click()} className="rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm font-bold hover:bg-black/[.035]">Choose PDF</button>
        <span className="min-w-[150px] max-w-full truncate text-sm text-black/55">{file?.name || 'No file selected'}</span>
        <button type="button" disabled={!file || busy || file.size > 4 * 1024 * 1024} onClick={() => void processFile()} className="rounded-xl bg-[#17304b] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#26496b] disabled:opacity-40">{busy ? 'Reading PDF…' : 'Calculate inventory'}</button>
      </div>
      <p className="mt-3 text-xs text-black/45">PDF limit: 4 MB. For best results, export a searchable PDF (not a scan). A newer upload replaces the current preview.</p>
      {file && file.size > 4 * 1024 * 1024 && <p className="mt-2 text-sm font-bold text-rose-600">This PDF is larger than the 4 MB upload limit.</p>}
      {message && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-800">{message}</p>}
    </section>

    {analysis && <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Product codes', quantity(analysis.totals.length)],
          ['Included lots', quantity(analysis.includedRows.length)],
          ['No lot · excluded', quantity(excludedNoLot)],
          ['DEST DOC · excluded', quantity(excludedDestDoc)],
        ].map(([label, value]) => <div key={label} className="rounded-2xl border border-black/10 bg-white p-5"><p className="text-xs font-semibold text-black/45">{label}</p><p className="mt-2 text-3xl font-black tabular-nums text-[#17304b]">{value}</p></div>)}
      </section>
      <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h2 className="text-lg font-black">Product-code totals</h2><p className="mt-1 text-sm text-black/50">{analysis.fileName} · {analysis.pageCount} pages · total eligible STK QTY: <strong>{quantity(analysis.includedQuantity)}</strong></p></div>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find product code…" className="w-full rounded-xl border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-[#326eac] sm:w-64" />
        </div>
        {(analysis.warnings.length > 0 || invalidQty > 0) && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <strong>Check this report before using the results.</strong>
          {analysis.warnings.map((warning) => <p className="mt-1" key={warning}>{warning}</p>)}
        </div>}
        <div className="mt-4 max-h-[520px] overflow-auto rounded-xl border border-black/10">
          <table className="w-full min-w-[440px] text-left text-sm">
            <thead className="sticky top-0 bg-[#f1f4f7] text-[#17304b]"><tr><th className="px-4 py-3 font-black">Product Code</th><th className="px-4 py-3 text-right font-black">STK QTY Sum</th><th className="px-4 py-3 text-right font-black">Lots</th></tr></thead>
            <tbody>{totals.map((row) => <tr key={row.productCode} className="border-t border-black/[.07]"><td className="px-4 py-2.5 font-semibold">{row.productCode}</td><td className="px-4 py-2.5 text-right font-bold tabular-nums">{quantity(row.stockQty)}</td><td className="px-4 py-2.5 text-right tabular-nums text-black/55">{row.rows}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="mt-5 border-t border-black/10 pt-5">
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-black/70"><input type="checkbox" checked={reviewed} onChange={(event) => setReviewed(event.target.checked)} className="mt-1 h-4 w-4 accent-[#17304b]" /><span>I have reviewed the product-code totals and the exclusions against the uploaded report.</span></label>
          <button type="button" disabled={!reviewed || exporting} onClick={() => void downloadExcel()} className="mt-4 rounded-xl bg-[#17304b] px-5 py-3 text-sm font-black text-white hover:bg-[#26496b] disabled:opacity-40">{exporting ? 'Creating spreadsheet…' : 'Download Excel spreadsheet (.xlsx)'}</button>
          <p className="mt-2 text-xs text-black/45">Excel includes Product Code totals, included lot rows, and excluded rows with reasons.</p>
        </div>
      </section>
      <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <button type="button" onClick={() => setShowExcluded((prev) => !prev)} className="text-sm font-bold text-[#17304b] underline underline-offset-4">{showExcluded ? 'Hide excluded rows' : `Review excluded rows (${analysis.excludedRows.length})`}</button>
        {showExcluded && <div className="mt-4 max-h-[340px] overflow-auto">
          <table className="w-full min-w-[620px] text-left text-xs"><thead className="sticky top-0 bg-[#f1f4f7]"><tr><th className="p-2">Product Code</th><th className="p-2">Lot</th><th className="p-2">DEST DOC</th><th className="p-2 text-right">STK QTY</th><th className="p-2">Reason</th><th className="p-2">Page</th></tr></thead><tbody>{analysis.excludedRows.map((item, index) => <tr className="border-t border-black/10" key={`${item.productCode}-${item.page}-${index}`}><td className="p-2">{item.productCode}</td><td className="p-2">{item.lotNumber || '—'}</td><td className="p-2">{item.destinationDocument || '—'}</td><td className="p-2 text-right">{item.stockQty === null ? '—' : quantity(item.stockQty)}</td><td className="p-2">{item.reason}</td><td className="p-2">{item.page}</td></tr>)}</tbody></table>
        </div>}
      </section>
    </>}
  </div>;
}
