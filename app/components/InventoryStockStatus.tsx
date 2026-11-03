'use client';

import { useMemo, useRef, useState } from 'react';
import type { InventoryMode, StockAnalysis } from '@/lib/stock-inventory';
import type { TemplateTarget } from '@/lib/inventory-template';

function quantity(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(value);
}

function saveDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}

type TemplatePreview = { candidates: TemplateTarget[]; defaultSheet: string; productCodesInReport: number };

export default function InventoryStockStatus() {
  const [mode, setMode] = useState<InventoryMode>('wine');
  const [excludeShippers, setExcludeShippers] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [query, setQuery] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [showExcluded, setShowExcluded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templatePreview, setTemplatePreview] = useState<TemplatePreview | null>(null);
  const [targetSheet, setTargetSheet] = useState('');
  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const [matching, setMatching] = useState(false);
  const [filling, setFilling] = useState(false);
  const pdfInput = useRef<HTMLInputElement>(null);
  const xlsxInput = useRef<HTMLInputElement>(null);

  function clearAnalysis() { setAnalysis(null); setReviewed(false); setMessage(''); setNotice(''); setTemplatePreview(null); setTargetSheet(''); }
  const totals = useMemo(() => (analysis?.totals || []).filter((entry) => entry.productCode.toLowerCase().includes(query.trim().toLowerCase())), [analysis, query]);
  const countByReason = (reason: string) => analysis?.excludedRows.filter((line) => line.reason === reason).length ?? 0;
  const selectedTarget = templatePreview?.candidates.find((target) => target.sheetName === targetSheet);

  function templateForm(action: 'inspect' | 'fill') {
    if (!analysis || !templateFile) throw new Error('Upload the PDF and select an Excel file first.');
    const form = new FormData();
    form.append('template', templateFile);
    form.append('includedRows', JSON.stringify(analysis.includedRows));
    form.append('mode', analysis.mode);
    form.append('costCenter', analysis.costCenter || '');
    form.append('excludeShippers', String(analysis.excludeShippers));
    form.append('action', action);
    if (action === 'fill') {
      form.append('sheetName', targetSheet);
      form.append('overwriteExisting', String(overwriteExisting));
    }
    return form;
  }

  async function processFile() {
    if (!file || busy) return;
    setBusy(true); clearAnalysis();
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('mode', mode);
      form.append('excludeShippers', String(excludeShippers));
      const response = await fetch('/api/tasting-room/inventory', { method: 'POST', body: form, cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'The PDF could not be processed.');
      setAnalysis(payload as StockAnalysis);
      setNotice(`Inventory calculated using ${mode === 'merch' ? 'Merch & Apparel' : 'Wine'} rules.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not process the PDF.'); }
    finally { setBusy(false); }
  }

  async function downloadExcel() {
    if (!analysis || !reviewed || exporting) return;
    setExporting(true); setMessage('');
    try {
      const response = await fetch('/api/tasting-room/inventory/export', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: analysis.fileName, mode: analysis.mode, excludeShippers: analysis.excludeShippers, includedRows: analysis.includedRows, excludedRows: analysis.excludedRows }),
      });
      if (!response.ok) { const error = await response.json(); throw new Error(error.error || 'Could not generate Excel file.'); }
      saveDownload(await response.blob(), `Leelanau-${mode === 'merch' ? 'Merch-Apparel' : 'Wine'}-Stock-Status-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not export the file.'); }
    finally { setExporting(false); }
  }

  async function inspectTemplate() {
    if (!analysis || analysis.mode !== 'wine' || !analysis.costCenter || !templateFile || matching) return;
    setMatching(true); setMessage(''); setTemplatePreview(null); setTargetSheet('');
    try {
      const response = await fetch('/api/tasting-room/inventory/template', { method: 'POST', body: templateForm('inspect'), cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not match this spreadsheet.');
      setTemplatePreview(data as TemplatePreview);
      setTargetSheet(data.defaultSheet || '');
      setNotice(`Cost center ${analysis.costCenter} matched to ${data.defaultSheet}. Review the matched products before downloading.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not inspect the workbook.'); }
    finally { setMatching(false); }
  }

  async function downloadFilledTemplate() {
    if (!analysis || analysis.mode !== 'wine' || !analysis.costCenter || !reviewed || !templateFile || !selectedTarget || filling) return;
    setFilling(true); setMessage('');
    try {
      const response = await fetch('/api/tasting-room/inventory/template', { method: 'POST', body: templateForm('fill'), cache: 'no-store' });
      if (!response.ok) { const error = await response.json(); throw new Error(error.error || 'Could not fill the Excel template.'); }
      const filled = response.headers.get('X-Inventory-Filled') || '?';
      const skipped = response.headers.get('X-Inventory-Skipped') || '0';
      const unmatched = response.headers.get('X-Inventory-Unmatched') || '0';
      saveDownload(await response.blob(), `${templateFile.name.replace(/\.xlsx$/i, '')}-${analysis.costCenter}-${targetSheet.replace(/\s+/g, '')}-Filled-${new Date().toISOString().slice(0,10)}.xlsx`);
      setNotice(`Downloaded ${targetSheet} (cost center ${analysis.costCenter}): ${filled} cells updated, ${skipped} left unchanged, ${unmatched} report product codes not present in the target sheet. The other E21 worksheet was untouched.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not fill workbook.'); }
    finally { setFilling(false); }
  }

  return <div className="mx-auto max-w-[1320px] space-y-6 p-5 md:p-8 xl:p-10">
    <header><h1 className="text-3xl font-black tracking-[-.035em] text-[#122438] md:text-4xl">Inventory</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-black/55">Turn your Stock Status by CC and LOC PDF into product-code totals, or use it to fill an existing inventory workbook.</p>
    </header>

    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-lg font-black text-[#122438]">1. Choose an inventory count</h2>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Inventory type">
        {([{ id: 'wine', label: 'Wine Inventory Count' }, { id: 'merch', label: 'Merch & Apparel Inventory Count' }] as const).map((option) =>
          <button key={option.id} type="button" aria-pressed={mode === option.id} onClick={() => { setMode(option.id); clearAnalysis(); }} className={`rounded-xl border px-4 py-3 text-sm font-bold ${mode === option.id ? 'border-[#17304b] bg-[#17304b] text-white' : 'border-black/15 bg-white text-[#17304b] hover:bg-[#f3f5f8]'}`}>{option.label}</button>)}
      </div>
      <p className="mt-3 text-sm leading-6 text-black/60">
        {mode === 'wine' ? 'Wine: a LOT NUMBER is required. Rows with a DEST DOC are always excluded. Cost center 102 fills TR - E21; cost center 104 fills ECOMM - E21.' : 'Merch & Apparel: includes products with or without LOT NUMBER. Rows with a DEST DOC are always excluded. This mode downloads a separate Excel inventory report and does not modify the wine workbook.'}
      </p>
      <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#17304b]">
        <input type="checkbox" checked={excludeShippers} onChange={(event) => { setExcludeShippers(event.target.checked); clearAnalysis(); }} className="h-4 w-4 accent-[#17304b]" /> Exclude SHIPPER products
      </label>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input ref={pdfInput} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(event) => { setFile(event.target.files?.[0] || null); clearAnalysis(); }} />
        <button type="button" onClick={() => pdfInput.current?.click()} className="rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm font-bold hover:bg-black/[.035]">Choose PDF</button>
        <span className="min-w-[150px] max-w-full truncate text-sm text-black/55">{file?.name || 'No PDF selected'}</span>
        <button type="button" disabled={!file || busy || file.size > 4 * 1024 * 1024} onClick={() => void processFile()} className="rounded-xl bg-[#17304b] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#26496b] disabled:opacity-40">{busy ? 'Reading PDF…' : 'Calculate inventory'}</button>
      </div>
      <p className="mt-3 text-xs text-black/45">Searchable PDF, maximum 4 MB. The uploaded files are processed for this session only; nothing is posted to Commerce7.</p>
      {file && file.size > 4 * 1024 * 1024 && <p className="mt-2 text-sm font-bold text-rose-600">This PDF is larger than the 4 MB upload limit.</p>}
      {message && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-800">{message}</p>}
      {notice && <p role="status" className="mt-4 rounded-lg border border-[#d6e6ed] bg-[#f3f8fa] p-3 text-sm text-[#17304b]">{notice}</p>}
    </section>

    {analysis && <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Product codes', quantity(analysis.totals.length)],
          ['Included rows', quantity(analysis.includedRows.length)],
          ['No lot · excluded', quantity(countByReason('No lot number'))],
          ['DEST DOC · excluded', quantity(countByReason('DEST DOC populated'))],
        ].map(([label, value]) => <div key={label} className="rounded-2xl border border-black/10 bg-white p-5"><p className="text-xs font-semibold text-black/45">{label}</p><p className="mt-2 text-3xl font-black tabular-nums text-[#17304b]">{value}</p></div>)}
      </section>
      <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h2 className="text-lg font-black">2. Review product-code totals</h2><p className="mt-1 text-sm text-black/50">{analysis.fileName} · {`Cost center: ${analysis.costCenter || 'Not verified'}`} · {analysis.pageCount} pages · total STK QTY: <strong>{quantity(analysis.includedQuantity)}</strong> · SHIPPER excluded: {quantity(countByReason('Shipper item'))}</p></div>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find product code…" className="w-full rounded-xl border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-[#326eac] sm:w-64" />
        </div>
        {!!analysis.warnings.length && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><strong>Review these extraction notes.</strong>{analysis.warnings.map((warning) => <p className="mt-1" key={warning}>{warning}</p>)}</div>}
        <div className="mt-4 max-h-[480px] overflow-auto rounded-xl border border-black/10">
          <table className="w-full min-w-[440px] text-left text-sm"><thead className="sticky top-0 bg-[#f1f4f7] text-[#17304b]"><tr><th className="px-4 py-3 font-black">Product Code</th><th className="px-4 py-3 text-right font-black">STK QTY Sum</th><th className="px-4 py-3 text-right font-black">Rows</th></tr></thead>
            <tbody>{totals.map((row) => <tr key={row.productCode} className="border-t border-black/[.07]"><td className="px-4 py-2.5 font-semibold">{row.productCode}</td><td className="px-4 py-2.5 text-right font-bold tabular-nums">{quantity(row.stockQty)}</td><td className="px-4 py-2.5 text-right tabular-nums text-black/55">{row.rows}</td></tr>)}</tbody>
          </table>
        </div>
        <label className="mt-5 flex cursor-pointer items-start gap-3 border-t border-black/10 pt-5 text-sm leading-6 text-black/70"><input type="checkbox" checked={reviewed} onChange={(event) => setReviewed(event.target.checked)} className="mt-1 h-4 w-4 accent-[#17304b]" /><span>I have reviewed these totals and the exclusion rules.</span></label>
        <button type="button" disabled={!reviewed || exporting} onClick={() => void downloadExcel()} className="mt-4 rounded-xl bg-[#17304b] px-5 py-3 text-sm font-black text-white hover:bg-[#26496b] disabled:opacity-40">{exporting ? 'Creating spreadsheet…' : 'Download new Excel inventory report'}</button>
        <p className="mt-2 text-xs text-black/45">Includes product totals, included rows, and an excluded-rows audit. Whole quantities display without a trailing decimal point.</p>
      </section>

      {analysis.mode === 'wine' && <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-lg font-black">3. Fill your E21 wine inventory spreadsheet</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-black/60">Central detects the cost center in your PDF and fills the matching wine worksheet automatically: <strong>102 → TR - E21</strong> or <strong>104 → ECOMM - E21</strong>. Product Codes are matched in column A and only <strong>E21 Stock Status (column D)</strong> is filled. Other sheets, physical counts, and formulas stay unchanged.</p>
        {!analysis.costCenter && <p role="alert" className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">This PDF does not identify exactly one cost center of 102 or 104. You can export the totals separately, but Central will not guess which wine worksheet to populate.</p>}
        {analysis.costCenter && <p className="mt-3 text-sm font-bold text-[#17304b]">Detected cost center {analysis.costCenter} → {analysis.costCenter === '102' ? 'TR - E21' : 'ECOMM - E21'} (automatic)</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input ref={xlsxInput} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={(event) => { setTemplateFile(event.target.files?.[0] || null); setTemplatePreview(null); setTargetSheet(''); }} />
          <button type="button" onClick={() => xlsxInput.current?.click()} className="rounded-xl border border-black/15 px-4 py-2.5 text-sm font-bold hover:bg-black/[.035]">Choose existing .xlsx</button>
          <span className="max-w-full truncate text-sm text-black/55">{templateFile?.name || 'No spreadsheet selected'}</span>
          <button type="button" disabled={!analysis.costCenter || !templateFile || !reviewed || matching || (templateFile?.size ?? 0) > 3 * 1024 * 1024} onClick={() => void inspectTemplate()} className="rounded-xl border border-[#17304b] px-4 py-2.5 text-sm font-bold text-[#17304b] disabled:opacity-40">{matching ? 'Matching codes…' : 'Match spreadsheet'}</button>
        </div>
        <p className="mt-2 text-xs text-black/45">.xlsx up to 3 MB. Your original file stays unchanged. Central selects the appropriate E21 sheet automatically, matching exact Product Codes (case/whitespace-insensitive).</p>
        {templatePreview && <div className="mt-5 space-y-4 border-t border-black/10 pt-5">
          <p className="text-sm font-semibold text-[#17304b]">Target worksheet: {targetSheet} · {selectedTarget?.matches || 0} matching rows (automatic; other sheets are protected)</p>
          {selectedTarget && <>
            <p className="text-sm text-black/60">Will fill <strong>{selectedTarget.sheetName}</strong>, column <strong>{selectedTarget.stockColumn}</strong>, matched against Product Codes in column <strong>{selectedTarget.productCodeColumn}</strong>. {selectedTarget.readyToFill} blanks ready, {selectedTarget.existingValues} existing values, {selectedTarget.formulaCells} protected formulas.</p>
            <div className="max-w-2xl overflow-auto rounded-xl border border-black/10"><table className="w-full min-w-[380px] text-left text-xs"><thead className="bg-[#f1f4f7]"><tr><th className="p-3">Excel row</th><th className="p-3">Product Code</th><th className="p-3 text-right">New STK QTY</th><th className="p-3">Current</th></tr></thead><tbody>{selectedTarget.preview.map((item) => <tr key={`${item.row}-${item.productCode}`} className="border-t border-black/[.06]"><td className="p-3">{item.row}</td><td className="p-3 font-semibold">{item.productCode}</td><td className="p-3 text-right">{quantity(item.stockQty)}</td><td className="p-3">{item.currentValue}</td></tr>)}</tbody></table></div>
          </>}
          <label className="flex items-center gap-2 text-sm text-black/70"><input type="checkbox" className="h-4 w-4 accent-[#17304b]" checked={overwriteExisting} onChange={(event) => setOverwriteExisting(event.target.checked)} /> Update existing Stock Status values on this sheet (recommended for a new report; formulas are protected)</label>
          <button type="button" disabled={!reviewed || !selectedTarget || filling} onClick={() => void downloadFilledTemplate()} className="rounded-xl bg-[#17304b] px-5 py-3 text-sm font-black text-white hover:bg-[#26496b] disabled:opacity-40">{filling ? 'Filling spreadsheet…' : 'Download filled copy of my spreadsheet'}</button>
        </div>}
      </section>}
      <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <button type="button" onClick={() => setShowExcluded((prev) => !prev)} className="text-sm font-bold text-[#17304b] underline underline-offset-4">{showExcluded ? 'Hide excluded rows' : `Review excluded rows (${analysis.excludedRows.length})`}</button>
        {showExcluded && <div className="mt-4 max-h-[340px] overflow-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="sticky top-0 bg-[#f1f4f7]"><tr><th className="p-2">Product Code</th><th className="p-2">Lot</th><th className="p-2">DEST DOC</th><th className="p-2 text-right">STK QTY</th><th className="p-2">Reason</th><th className="p-2">Page</th></tr></thead><tbody>{analysis.excludedRows.map((item, index) => <tr className="border-t border-black/10" key={`${item.productCode}-${item.page}-${index}`}><td className="p-2">{item.productCode}</td><td className="p-2">{item.lotNumber || '—'}</td><td className="p-2">{item.destinationDocument || '—'}</td><td className="p-2 text-right">{item.stockQty === null ? '—' : quantity(item.stockQty)}</td><td className="p-2">{item.reason}</td><td className="p-2">{item.page}</td></tr>)}</tbody></table></div>}
      </section>
    </>}
  </div>;
}
