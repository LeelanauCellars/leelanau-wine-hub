'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { code128SvgDataUrl } from '@/lib/code128';
import type { MerchCategory, MerchProduct, MerchVariant } from '@/lib/merch-types';

type QueueItem = {
  variant: MerchVariant;
  quantity: number;
};

type IssueFilter = 'all' | 'missingUpc' | 'missingPrice' | 'missingSku' | 'duplicateUpc' | 'ready';
type CategoryFilter = 'All' | 'Apparel' | MerchCategory;

type MerchResponse = {
  configured?: boolean;
  products?: MerchProduct[];
  totalProducts?: number;
  totalVariants?: number;
  detectedTypes?: string[];
  error?: string;
};

const SearchIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
const PrinterIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5h18v5a2 2 0 0 1-2 2h-2M7 14h10v7H7z"/></svg>;
const PlusIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>;
const MinusIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>;
const TrashIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5M14 11v5"/></svg>;
const RefreshIcon = ({ spin = false }: { spin?: boolean }) => <svg viewBox="0 0 24 24" className={`h-4 w-4 ${spin ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6v5h-5M4 18v-5h5M18.5 11A7 7 0 0 0 6 7.5L4 11M5.5 13A7 7 0 0 0 18 16.5L20 13"/></svg>;
const AlertIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3 2.5 20h19zM12 9v4M12 17h.01"/></svg>;

const categoryFilters: CategoryFilter[] = ['All', 'Apparel', 'Hoodies', 'Shirts', 'Hats', 'Glassware', 'Accessories', 'Other'];

function money(value: number | null) {
  if (value === null || !Number.isFinite(value)) return '—';
  return `$${value.toFixed(2)}`;
}

function labelPrice(value: number) {
  return Number.isInteger(value) ? `$${value.toFixed(0)}` : `$${value.toFixed(2)}`;
}

function variantLabel(value: string) {
  const clean = value.trim();
  return clean || 'One Size';
}

function productPrice(product: MerchProduct) {
  const prices = product.variants.map((variant) => variant.price).filter((value): value is number => typeof value === 'number');
  if (!prices.length) return 'Price missing';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? money(min) : `From ${money(min)}`;
}

function variantIssues(variant: MerchVariant, duplicateUpcs: Set<string>) {
  return {
    missingUpc: !variant.upcCode,
    missingPrice: variant.price === null,
    missingSku: !variant.sku,
    duplicateUpc: Boolean(variant.upcCode && duplicateUpcs.has(variant.upcCode)),
  };
}

function readyToPrint(variant: MerchVariant, duplicateUpcs: Set<string>) {
  const issues = variantIssues(variant, duplicateUpcs);
  return !issues.missingUpc && !issues.missingPrice && !issues.missingSku && !issues.duplicateUpc;
}

function issueSummary(variant: MerchVariant, duplicateUpcs: Set<string>) {
  const issues = variantIssues(variant, duplicateUpcs);
  const labels: string[] = [];
  if (issues.missingUpc) labels.push('Missing UPC');
  if (issues.missingPrice) labels.push('Missing price');
  if (issues.missingSku) labels.push('Missing SKU');
  if (issues.duplicateUpc) labels.push('Duplicate UPC');
  return labels;
}

function MerchLabel({ variant }: { variant: MerchVariant }) {
  const barcode = code128SvgDataUrl(variant.upcCode);
  return <div className="merch-label-page">
    <div className="merch-label-price">{labelPrice(variant.price ?? 0)}</div>
    <div className="merch-label-barcode"><img src={barcode} alt="" /></div>
    <div className="merch-label-upc">{variant.upcCode}</div>
    <div className="merch-label-sku">{variant.sku}</div>
  </div>;
}

function StatusPill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'good' | 'warn' | 'bad' | 'neutral' }) {
  const tones = {
    good: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warn: 'bg-amber-50 text-amber-800 border-amber-200',
    bad: 'bg-red-50 text-red-700 border-red-200',
    neutral: 'bg-black/[.04] text-black/50 border-black/10',
  };
  return <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[.08em] ${tones[tone]}`}>{children}</span>;
}

export default function MerchApparel({ isAdmin }: { isAdmin: boolean }) {
  const [products, setProducts] = useState<MerchProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Loading merchandise from Commerce7…');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [issueFilter, setIssueFilter] = useState<IssueFilter>('all');
  const [selectedByProduct, setSelectedByProduct] = useState<Record<string, string>>({});
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [printJobs, setPrintJobs] = useState<MerchVariant[]>([]);
  const [printNonce, setPrintNonce] = useState(0);
  const [printNotice, setPrintNotice] = useState('');

  async function loadMerch() {
    setLoading(true);
    setMessage('Loading merchandise from Commerce7…');
    try {
      const response = await fetch('/api/commerce7/merch', { cache: 'no-store' });
      const data = await response.json() as MerchResponse;
      if (!response.ok) throw new Error(data.error || 'Unable to load merchandise.');
      setProducts(data.products || []);
      setMessage(`${data.totalProducts || 0} merchandise products · ${data.totalVariants || 0} variants synced from Commerce7`);
    } catch (error) {
      setProducts([]);
      setMessage(error instanceof Error ? error.message : 'Unable to load merchandise from Commerce7.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadMerch(); }, []);

  const allVariants = useMemo(() => products.flatMap((product) => product.variants), [products]);
  const duplicateUpcs = useMemo(() => {
    const counts = new Map<string, number>();
    for (const variant of allVariants) if (variant.upcCode) counts.set(variant.upcCode, (counts.get(variant.upcCode) || 0) + 1);
    return new Set(Array.from(counts.entries()).filter(([, count]) => count > 1).map(([upc]) => upc));
  }, [allVariants]);

  const issueCounts = useMemo(() => {
    let missingUpc = 0, missingPrice = 0, missingSku = 0, duplicateUpc = 0, ready = 0;
    for (const variant of allVariants) {
      const issues = variantIssues(variant, duplicateUpcs);
      if (issues.missingUpc) missingUpc += 1;
      if (issues.missingPrice) missingPrice += 1;
      if (issues.missingSku) missingSku += 1;
      if (issues.duplicateUpc) duplicateUpc += 1;
      if (readyToPrint(variant, duplicateUpcs)) ready += 1;
    }
    return { missingUpc, missingPrice, missingSku, duplicateUpc, ready };
  }, [allVariants, duplicateUpcs]);

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatch = category === 'All'
        || (category === 'Apparel' ? ['Hoodies', 'Shirts', 'Hats'].includes(product.category) : product.category === category);
      if (!categoryMatch) return false;

      const variants = product.variants.filter((variant) => {
        const haystack = `${product.name} ${product.category} ${variant.variantName} ${variant.sku} ${variant.upcCode}`.toLowerCase();
        if (needle && !haystack.includes(needle)) return false;
        const issues = variantIssues(variant, duplicateUpcs);
        if (issueFilter === 'missingUpc' && !issues.missingUpc) return false;
        if (issueFilter === 'missingPrice' && !issues.missingPrice) return false;
        if (issueFilter === 'missingSku' && !issues.missingSku) return false;
        if (issueFilter === 'duplicateUpc' && !issues.duplicateUpc) return false;
        if (issueFilter === 'ready' && !readyToPrint(variant, duplicateUpcs)) return false;
        return true;
      });
      return variants.length > 0;
    });
  }, [products, query, category, issueFilter, duplicateUpcs]);

  const totalQueue = queue.reduce((sum, item) => sum + item.quantity, 0);

  function addToQueue(variant: MerchVariant) {
    if (!readyToPrint(variant, duplicateUpcs)) return;
    setQueue((current) => {
      const existing = current.find((item) => item.variant.id === variant.id);
      if (existing) return current.map((item) => item.variant.id === variant.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { variant, quantity: 1 }];
    });
  }

  function changeQuantity(id: string, delta: number) {
    setQueue((current) => current
      .map((item) => item.variant.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item)
      .filter((item) => item.quantity > 0));
  }

  function startPrint(variants: MerchVariant[], notice = '') {
    if (!variants.length) return;
    setPrintJobs(variants);
    setPrintNotice(notice);
    setPrintNonce((value) => value + 1);
  }

  useEffect(() => {
    if (!printJobs.length || !printNonce) return;
    const previousTitle = document.title;
    document.title = printJobs.length === 1 ? `${printJobs[0].sku || 'Merch'} - DYMO Label` : `${printJobs.length} DYMO Labels`;
    document.body.classList.add('merch-label-printing');
    const timer = window.setTimeout(() => window.print(), 120);
    const cleanup = () => {
      document.title = previousTitle;
      document.body.classList.remove('merch-label-printing');
      setPrintJobs([]);
    };
    window.addEventListener('afterprint', cleanup, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('afterprint', cleanup);
    };
  }, [printNonce]);

  function printQueue() {
    const labels = queue.flatMap((item) => Array.from({ length: item.quantity }, () => item.variant));
    startPrint(labels);
  }

  return <>
    <div className="no-print mx-auto max-w-[1520px] p-5 md:p-8 xl:p-10">
      <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[.22em] text-[#3976b7]">Tasting Room · Operations</p>
          <h1 className="text-3xl font-black tracking-[-.04em] md:text-4xl">Merch / Apparel</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-black/52">Search Commerce7 merchandise, choose the exact size or variant, and print a DYMO 30334 price/barcode label without changing the stored UPC.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-xs font-bold text-black/55 shadow-sm">{message}</div>
          <button onClick={() => void loadMerch()} disabled={loading} className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-xs font-black shadow-sm disabled:opacity-45"><RefreshIcon spin={loading} /> Refresh</button>
        </div>
      </div>

      {isAdmin && <div className="mb-5 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[.14em] text-black/40">Commerce7 label health</p><p className="mt-1 text-xs leading-5 text-black/45">These are warnings only. Product data remains managed in Commerce7.</p></div>
          <div className="flex flex-wrap gap-2">
            <IssueButton active={issueFilter === 'ready'} onClick={() => setIssueFilter(issueFilter === 'ready' ? 'all' : 'ready')} label="Ready" count={issueCounts.ready} tone="good" />
            <IssueButton active={issueFilter === 'missingUpc'} onClick={() => setIssueFilter(issueFilter === 'missingUpc' ? 'all' : 'missingUpc')} label="Missing UPC" count={issueCounts.missingUpc} tone="bad" />
            <IssueButton active={issueFilter === 'missingPrice'} onClick={() => setIssueFilter(issueFilter === 'missingPrice' ? 'all' : 'missingPrice')} label="Missing price" count={issueCounts.missingPrice} tone="warn" />
            <IssueButton active={issueFilter === 'missingSku'} onClick={() => setIssueFilter(issueFilter === 'missingSku' ? 'all' : 'missingSku')} label="Missing SKU" count={issueCounts.missingSku} tone="warn" />
            <IssueButton active={issueFilter === 'duplicateUpc'} onClick={() => setIssueFilter(issueFilter === 'duplicateUpc' ? 'all' : 'duplicateUpc')} label="Duplicate UPC" count={issueCounts.duplicateUpc} tone="bad" />
          </div>
        </div>
      </div>}

      <div className="mb-6 grid gap-3 xl:grid-cols-[1fr_auto]">
        <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35"><SearchIcon /></span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search merchandise…" className="h-12 w-full rounded-xl border border-black/10 bg-white pl-11 pr-4 text-sm shadow-sm outline-none focus:border-black/30" /></div>
        <div className="flex max-w-full gap-2 overflow-x-auto pb-1">{categoryFilters.map((item) => <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-xl border px-4 py-3 text-xs font-bold ${category === item ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black/60 hover:border-black/25'}`}>{item}</button>)}</div>
      </div>

      {!loading && !products.length && <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900"><strong>Merchandise could not be loaded.</strong> {message} This feature only reads merchandise from the existing server-side Commerce7 connection.</div>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
            <div className="hidden grid-cols-[minmax(220px,1.4fr)_minmax(165px,.85fr)_minmax(120px,.75fr)_minmax(132px,.8fr)_90px_230px] items-center gap-4 border-b border-black/[.07] bg-[#f6f8fa] px-5 py-3 text-[9px] font-black uppercase tracking-[.13em] text-black/35 lg:grid">
              <span>Item</span><span>Variant / Size</span><span>SKU</span><span>UPC</span><span>Price</span><span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-black/[.07]">
              {filteredProducts
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((product) => {
                  const selectedId = selectedByProduct[product.id] || product.variants[0]?.id;
                  const selected = product.variants.find((variant) => variant.id === selectedId) || product.variants[0];
                  const issues = selected ? issueSummary(selected, duplicateUpcs) : [];
                  const ready = selected ? readyToPrint(selected, duplicateUpcs) : false;
                  return <article key={product.id} className="px-4 py-4 transition hover:bg-[#fafbfd] md:px-5">
                    <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.4fr)_minmax(165px,.85fr)_minmax(120px,.75fr)_minmax(132px,.8fr)_90px_230px] lg:items-center lg:gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-[15px] font-black leading-5">{product.name}</h2>
                          {!ready && selected && <StatusPill tone={issues.includes('Missing UPC') || issues.includes('Duplicate UPC') ? 'bad' : 'warn'}>{issues[0] || 'Issue'}</StatusPill>}
                        </div>
                        <p className="mt-1 text-[9px] font-black uppercase tracking-[.12em] text-[#3976b7]">{product.category}</p>
                      </div>

                      <div>
                        <span className="mb-1 block text-[9px] font-black uppercase tracking-[.11em] text-black/35 lg:hidden">Variant / Size</span>
                        {product.variants.length > 1 ? <select
                          value={selected?.id || ''}
                          onChange={(event) => setSelectedByProduct((current) => ({ ...current, [product.id]: event.target.value }))}
                          className="h-10 w-full rounded-lg border border-black/10 bg-white px-3 text-[12px] font-bold outline-none focus:border-black/30"
                        >
                          {product.variants.map((variant) => <option key={variant.id} value={variant.id}>{variantLabel(variant.variantName)}</option>)}
                        </select> : <div className="text-[12px] font-bold text-black/60">{selected ? variantLabel(selected.variantName) : '—'}</div>}
                      </div>

                      <div className="min-w-0">
                        <span className="mb-1 block text-[9px] font-black uppercase tracking-[.11em] text-black/35 lg:hidden">SKU</span>
                        <p className="break-all text-[11px] font-black">{selected?.sku || '—'}</p>
                      </div>

                      <div className="min-w-0">
                        <span className="mb-1 block text-[9px] font-black uppercase tracking-[.11em] text-black/35 lg:hidden">UPC</span>
                        <p className="break-all font-mono text-[10px] font-bold text-black/70">{selected?.upcCode || '—'}</p>
                      </div>

                      <div>
                        <span className="mb-1 block text-[9px] font-black uppercase tracking-[.11em] text-black/35 lg:hidden">Price</span>
                        <p className="text-[13px] font-black">{selected ? money(selected.price) : '—'}</p>
                      </div>

                      <div className="flex gap-2 lg:justify-end">
                        <button disabled={!ready || !selected} onClick={() => selected && startPrint([selected])} className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-black px-3 py-2 text-[10px] font-black uppercase tracking-[.04em] text-white disabled:cursor-not-allowed disabled:opacity-25 lg:flex-none"><PrinterIcon className="h-3.5 w-3.5" /> Print Price Tag</button>
                        <button disabled={!ready || !selected} onClick={() => selected && addToQueue(selected)} className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-[10px] font-black disabled:cursor-not-allowed disabled:opacity-25 lg:flex-none"><PlusIcon /> Queue</button>
                      </div>
                    </div>

                    {selected && !ready && <div className="mt-2 flex flex-wrap gap-1.5 lg:ml-[calc(0px)]">{issues.slice(1).map((issue) => <StatusPill key={issue} tone={issue === 'Duplicate UPC' || issue === 'Missing UPC' ? 'bad' : 'warn'}>{issue}</StatusPill>)}</div>}
                  </article>;
                })}
            </div>
          </div>

          {!loading && products.length > 0 && !filteredProducts.length && <div className="rounded-2xl border border-dashed border-black/15 bg-white py-20 text-center"><p className="font-black">No merchandise matches those filters.</p><button onClick={() => { setQuery(''); setCategory('All'); setIssueFilter('all'); }} className="mt-3 text-xs font-black text-[#326eac]">Clear filters</button></div>}
        </div>

        <aside className="self-start xl:sticky xl:top-6">
          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#3976b7]">DYMO 30334</p><h2 className="mt-1 text-xl font-black">Label Queue</h2><p className="mt-1 text-xs leading-5 text-black/45">2¼″ × 1¼″ · one label page per quantity</p></div><span className="rounded-lg bg-black px-3 py-2 text-xs font-black text-white">{totalQueue}</span></div>
            <div className="mt-4 space-y-3">{queue.map((item) => <div key={item.variant.id} className="rounded-xl border border-black/[.08] bg-[#fafbfc] p-3">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black leading-4">{item.variant.productName}</p><p className="mt-1 text-[10px] font-bold text-black/45">{variantLabel(item.variant.variantName)} · {item.variant.sku}</p></div><button onClick={() => setQueue((current) => current.filter((candidate) => candidate.variant.id !== item.variant.id))} className="rounded-lg p-1.5 text-black/35 hover:bg-red-50 hover:text-red-600" aria-label="Remove label"><TrashIcon /></button></div>
              <div className="mt-3 flex items-center justify-between"><span className="font-mono text-[9px] text-black/40">{item.variant.upcCode}</span><div className="flex items-center gap-1"><button onClick={() => changeQuantity(item.variant.id, -1)} className="rounded-lg border border-black/10 bg-white p-1.5"><MinusIcon /></button><span className="min-w-7 text-center text-xs font-black">{item.quantity}</span><button onClick={() => changeQuantity(item.variant.id, 1)} className="rounded-lg border border-black/10 bg-white p-1.5"><PlusIcon /></button></div></div>
            </div>)}</div>
            {!queue.length && <div className="mt-4 rounded-xl border border-dashed border-black/15 bg-[#fafbfc] px-4 py-10 text-center"><p className="text-sm font-black text-black/35">Queue is empty</p><p className="mt-1 text-[10px] leading-4 text-black/30">Add a ready-to-print variant from any merchandise row.</p></div>}
            <button disabled={!totalQueue} onClick={printQueue} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-30"><PrinterIcon /> PRINT {totalQueue || 0} LABEL{totalQueue === 1 ? '' : 'S'}</button>
            {queue.length > 0 && <button onClick={() => setQueue([])} className="mt-2 w-full rounded-lg px-3 py-2 text-[10px] font-bold text-black/40 hover:bg-black/[.03]">Clear queue</button>}
            <p className="mt-4 text-[10px] leading-4 text-black/35">Choose a variant in the list, then print it immediately or add it to the queue for batch printing.</p>
          </div>
        </aside>
      </div>
      {printNotice && <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl bg-black px-4 py-3 text-xs font-bold text-white shadow-xl">{printNotice}<button onClick={() => setPrintNotice('')} className="ml-3 text-white/60">×</button></div>}
    </div>

    <div className="merch-print-root" aria-hidden="true">
      {printJobs.map((variant, index) => <MerchLabel key={`${variant.id}-${index}`} variant={variant} />)}
    </div>
  </>;
}

function VariantFact({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div><dt className="text-[9px] font-black uppercase tracking-[.1em] text-black/35">{label}</dt><dd className={`mt-1 break-all font-bold ${mono ? 'font-mono text-[10px]' : 'text-[11px]'}`}>{value}</dd></div>;
}

function IssueButton({ active, onClick, label, count, tone }: { active: boolean; onClick: () => void; label: string; count: number; tone: 'good' | 'warn' | 'bad' }) {
  const tones = {
    good: active ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warn: active ? 'border-amber-700 bg-amber-700 text-white' : 'border-amber-200 bg-amber-50 text-amber-800',
    bad: active ? 'border-red-700 bg-red-700 text-white' : 'border-red-200 bg-red-50 text-red-700',
  };
  return <button onClick={onClick} className={`rounded-xl border px-3 py-2 text-[10px] font-black ${tones[tone]}`}>{label} <span className="ml-1 opacity-70">{count}</span></button>;
}
