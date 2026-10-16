'use client';

import React, { useMemo, useState } from 'react';
import type { WineRecord } from '@/lib/types';

type ShelfTagLogo = 'lwc' | 'farm-fresh';

type QueueItem = {
  id: string;
  wineId: string;
  logo: ShelfTagLogo;
  quantity: number;
};

const SearchIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
const PrinterIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5h18v5a2 2 0 0 1-2 2h-2M7 14h10v7H7z"/></svg>;
const PlusIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>;
const MinusIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>;
const TrashIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5M14 11v5"/></svg>;

const TAG_BLUE = '#2b6f9d';
const LABEL_WIDTH_IN = 6;
const LABEL_HEIGHT_IN = 1.25;
const LABELS_PER_PAGE = 8;

const logoChoices: { value: ShelfTagLogo; label: string; src: string; alt: string }[] = [
  { value: 'lwc', label: 'LWC', src: '/lwc-logo.png', alt: 'Leelanau Cellars' },
  { value: 'farm-fresh', label: 'Farm Fresh', src: '/farm-fresh-logo-white.png', alt: 'Farm Fresh' },
];

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function defaultLogo(wine: WineRecord): ShelfTagLogo {
  return wine.brand.toLowerCase().includes('farm fresh') ? 'farm-fresh' : 'lwc';
}

function queueId(wineId: string, logo: ShelfTagLogo) {
  return `${wineId}::${logo}`;
}

function labelName(wine: WineRecord) {
  const vintage = /^20\d{2}$/.test(wine.vintage || '') && !wine.name.includes(wine.vintage) ? ` ${wine.vintage}` : '';
  return `${wine.name}${vintage}`.trim();
}

function splitTagLines(value: string) {
  const text = value.replace(/\s+/g, ' ').trim();
  if (!text) return [''];
  const raw = text.split(' ');
  if (raw.length <= 1) return [text];
  if (raw.length === 2) return raw;
  if (raw.length === 3) return raw;

  const last = raw[raw.length - 1];
  if (/^20\d{2}$/.test(last)) {
    const front = raw.slice(0, -1);
    if (front.length === 3) return [`${front[0]} ${front[1]}`, front[2], last];
    if (front.length === 2) return [front[0], front[1], last];
    const mid = Math.ceil(front.length / 2);
    return [front.slice(0, mid).join(' '), front.slice(mid).join(' '), last].filter(Boolean);
  }

  const totalLength = raw.reduce((sum, word) => sum + word.length, 0);
  if (raw.length <= 4 && totalLength <= 26) {
    return [raw.slice(0, Math.ceil(raw.length / 2)).join(' '), raw.slice(Math.ceil(raw.length / 2)).join(' ')].filter(Boolean);
  }

  const target = totalLength / 3;
  const lines: string[] = [];
  let current = '';
  for (let index = 0; index < raw.length; index += 1) {
    const word = raw[index];
    const next = current ? `${current} ${word}` : word;
    const remainingWords = raw.length - index - 1;
    const remainingLines = 2 - lines.length;
    if (current && next.length > target + 2 && remainingWords >= remainingLines) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);

  if (lines.length <= 3) return lines;
  return [lines[0], lines[1], lines.slice(2).join(' ')].filter(Boolean);
}

function tagLineConfig(wine: WineRecord) {
  const lines = splitTagLines(labelName(wine));
  const lineCount = Math.min(Math.max(lines.length, 1), 3);
  const trimmed = lineCount === 3 ? lines.slice(0, 3) : lines.slice(0, 2);
  return {
    lines: trimmed,
    lineCount: trimmed.length,
    titleSize: trimmed.length >= 3 ? 20.7 : 26.2,
  };
}

function tagPrices(wine: WineRecord) {
  const regular = Number(wine.price || 0);
  const club = regular * 0.8;
  const caseDiscount = regular * 0.75;
  return {
    regular: money(regular),
    club: money(club),
    caseDiscount: money(caseDiscount),
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function chunk<T>(items: T[], size: number) {
  const output: T[][] = [];
  for (let index = 0; index < items.length; index += size) output.push(items.slice(index, index + size));
  return output;
}

function labelHtml(wine: WineRecord, logo: ShelfTagLogo, origin: string) {
  const { lines, lineCount, titleSize } = tagLineConfig(wine);
  const prices = tagPrices(wine);
  const logoSrc = `${origin}${logo === 'farm-fresh' ? '/farm-fresh-logo-white.png' : '/lwc-logo.png'}`;
  const logoStyle = logo === 'farm-fresh'
    ? 'left:.145in;width:.66in;height:.56in;'
    : 'left:.143in;width:.56in;height:.86in;background:#fff;border:2px solid #111;padding:.03in;';
  const topMap = lineCount >= 3 ? ['.13in', '.40in', '.67in'] : lineCount === 2 ? ['.24in', '.60in'] : ['.42in'];

  return `
    <article class="shelf-tag">
      <div class="shelf-tag-inner">
        <div class="tag-logo ${logo}"><img src="${logoSrc}" alt="" style="${logoStyle}" /></div>
        <div class="tag-name tag-name-${lineCount}" style="font-size:${titleSize}pt;">${lines.map((line, index) => `<div style="top:${topMap[index]};">${escapeHtml(line)}</div>`).join('')}</div>
        <div class="tag-price tag-price-1">${escapeHtml(prices.regular)}</div>
        <div class="tag-copy tag-copy-1">Regular Price</div>
        <div class="tag-price tag-price-2">${escapeHtml(prices.club)}</div>
        <div class="tag-copy tag-copy-2">Wine Club</div>
        <div class="tag-price tag-price-3">${escapeHtml(prices.caseDiscount)}</div>
        <div class="tag-copy tag-copy-3">Case Discount</div>
      </div>
    </article>`;
}

function PreviewTag({ wine, logo }: { wine: WineRecord; logo: ShelfTagLogo }) {
  const { lines, lineCount, titleSize } = tagLineConfig(wine);
  const prices = tagPrices(wine);
  const topMap = lineCount >= 3 ? [10.4, 32.0, 53.6] : lineCount === 2 ? [19.0, 48.8] : [33.6];
  const logoChoice = logoChoices.find((item) => item.value === logo) || logoChoices[0];

  return <div className="relative aspect-[24/5] w-full overflow-hidden rounded-[18px] border border-black/10 shadow-sm" style={{ background: TAG_BLUE }}>
    <div className="absolute inset-0" style={{ fontFamily: 'Poppins, Arial, Helvetica, sans-serif' }}>
      <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${(0.143 / LABEL_WIDTH_IN) * 100}%`, width: logo === 'farm-fresh' ? `${(0.66 / LABEL_WIDTH_IN) * 100}%` : `${(0.56 / LABEL_WIDTH_IN) * 100}%`, height: logo === 'farm-fresh' ? `${(0.56 / LABEL_HEIGHT_IN) * 100}%` : `${(0.86 / LABEL_HEIGHT_IN) * 100}%`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: logo === 'lwc' ? '#fff' : 'transparent', border: logo === 'lwc' ? '2px solid #111' : '0', padding: logo === 'lwc' ? '2px' : 0 }}>
        <img src={logoChoice.src} alt={logoChoice.alt} className="max-h-full max-w-full object-contain" />
      </div>

      <div className="absolute" style={{ left: `${(1.009 / LABEL_WIDTH_IN) * 100}%`, top: 0, width: `${(2.88 / LABEL_WIDTH_IN) * 100}%`, height: '100%' }}>
        {lines.map((line, index) => <div key={`${wine.id}-${line}-${index}`} className="absolute left-0 whitespace-nowrap font-black text-white" style={{ top: `${topMap[index]}%`, fontSize: `${titleSize}pt`, lineHeight: 1, letterSpacing: '-0.03em', WebkitTextStroke: '1.6px #101010', textShadow: '-1px -1px 0 #111, 1px -1px 0 #111, -1px 1px 0 #111, 1px 1px 0 #111' }}>{line}</div>)}
      </div>

      <TagPricePreview price={prices.regular} copy="Regular Price" top={17.6} />
      <TagPricePreview price={prices.club} copy="Wine Club" top={43.2} />
      <TagPricePreview price={prices.caseDiscount} copy="Case Discount" top={68.8} />
    </div>
  </div>;
}

function TagPricePreview({ price, copy, top }: { price: string; copy: string; top: number }) {
  return <>
    <div className="absolute whitespace-nowrap text-right font-black text-white" style={{ left: `${(3.22 / LABEL_WIDTH_IN) * 100}%`, top: `${top}%`, width: `${(1.13 / LABEL_WIDTH_IN) * 100}%`, fontSize: '17.8pt', lineHeight: 1, letterSpacing: '-0.03em', WebkitTextStroke: '1.35px #101010', textShadow: '-1px -1px 0 #111, 1px -1px 0 #111, -1px 1px 0 #111, 1px 1px 0 #111' }}>{price}</div>
    <div className="absolute whitespace-nowrap font-black text-white" style={{ left: `${(4.466 / LABEL_WIDTH_IN) * 100}%`, top: `${top + 1.2}%`, fontSize: '9.9pt', lineHeight: 1.05, WebkitTextStroke: '.9px #101010', textShadow: '-1px -1px 0 #111, 1px -1px 0 #111, -1px 1px 0 #111, 1px 1px 0 #111' }}>{copy}</div>
  </>;
}

export default function ShelfTags({ wines }: { wines: WineRecord[] }) {
  const [query, setQuery] = useState('');
  const [showRetired, setShowRetired] = useState(false);
  const [selectedLogos, setSelectedLogos] = useState<Record<string, ShelfTagLogo>>({});
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const printableWines = useMemo(() => {
    return wines
      .filter((wine) => typeof wine.price === 'number' && Number.isFinite(wine.price))
      .filter((wine) => showRetired ? true : wine.status === 'Available')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [wines, showRetired]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return printableWines.filter((wine) => {
      if (!needle) return true;
      const haystack = `${wine.name} ${wine.brand} ${wine.collection || ''} ${wine.vintage || ''}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [printableWines, query]);

  const queueExpanded = useMemo(() => queue.flatMap((item) => {
    const wine = wines.find((candidate) => candidate.id === item.wineId);
    return wine ? Array.from({ length: item.quantity }, () => ({ wine, logo: item.logo })) : [];
  }), [queue, wines]);

  const totalQueue = queue.reduce((sum, item) => sum + item.quantity, 0);

  function selectedLogoForWine(wine: WineRecord) {
    return selectedLogos[wine.id] || defaultLogo(wine);
  }

  function updateSelectedLogo(wineId: string, logo: ShelfTagLogo) {
    setSelectedLogos((current) => ({ ...current, [wineId]: logo }));
  }

  function addToQueue(wine: WineRecord) {
    const logo = selectedLogoForWine(wine);
    const id = queueId(wine.id, logo);
    setQueue((current) => {
      const existing = current.find((item) => item.id === id);
      if (existing) return current.map((item) => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { id, wineId: wine.id, logo, quantity: 1 }];
    });
  }

  function updateQueueQuantity(id: string, delta: number) {
    setQueue((current) => current
      .map((item) => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item)
      .filter((item) => item.quantity > 0));
  }

  function startPrint(items: { wine: WineRecord; logo: ShelfTagLogo }[]) {
    if (!items.length) return;
    const popup = window.open('', '_blank', 'popup=yes,width=1024,height=900');
    if (!popup) {
      window.alert('The print window was blocked. Please allow pop-ups and try again.');
      return;
    }
    const origin = window.location.origin;
    const pages = chunk(items, LABELS_PER_PAGE);

    popup.document.open();
    popup.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${items.length === 1 ? escapeHtml(`${labelName(items[0].wine)} Shelf Tag`) : `${items.length} Shelf Tags`}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
  @page { size: 8.5in 11in; margin: .25in; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body { font-family: 'Poppins', Arial, Helvetica, sans-serif; }
  .print-page { width: 8in; min-height: 10.5in; margin: 0 auto; display: grid; grid-template-rows: repeat(${LABELS_PER_PAGE}, ${LABEL_HEIGHT_IN}in); align-content: start; gap: .06in; }
  .print-page + .print-page { break-before: page; page-break-before: always; }
  .shelf-tag { width: ${LABEL_WIDTH_IN}in; height: ${LABEL_HEIGHT_IN}in; margin: 0 auto; overflow: hidden; background: ${TAG_BLUE}; }
  .shelf-tag-inner { position: relative; width: 100%; height: 100%; color: #fff; }
  .tag-logo img { position: absolute; top: 50%; transform: translateY(-50%); object-fit: contain; }
  .tag-name { position: absolute; left: 1.009in; top: 0; width: 2.88in; height: 100%; }
  .tag-name div {
    position: absolute;
    left: 0;
    white-space: nowrap;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -.03em;
    color: #fff;
    -webkit-text-stroke: 1.6px #111;
    text-shadow: -1px -1px 0 #111, 1px -1px 0 #111, -1px 1px 0 #111, 1px 1px 0 #111;
  }
  .tag-price {
    position: absolute;
    left: 3.22in;
    width: 1.13in;
    text-align: right;
    white-space: nowrap;
    font-size: 17.8pt;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -.03em;
    color: #fff;
    -webkit-text-stroke: 1.35px #111;
    text-shadow: -1px -1px 0 #111, 1px -1px 0 #111, -1px 1px 0 #111, 1px 1px 0 #111;
  }
  .tag-copy {
    position: absolute;
    left: 4.466in;
    white-space: nowrap;
    font-size: 9.9pt;
    font-weight: 900;
    line-height: 1.05;
    color: #fff;
    -webkit-text-stroke: .9px #111;
    text-shadow: -1px -1px 0 #111, 1px -1px 0 #111, -1px 1px 0 #111, 1px 1px 0 #111;
  }
  .tag-price-1 { top: .22in; }
  .tag-copy-1 { top: .235in; }
  .tag-price-2 { top: .54in; }
  .tag-copy-2 { top: .555in; }
  .tag-price-3 { top: .86in; }
  .tag-copy-3 { top: .875in; }
</style>
</head>
<body>${pages.map((page) => `<section class="print-page">${page.map((item) => labelHtml(item.wine, item.logo, origin)).join('')}</section>`).join('')}
<script>
  window.addEventListener('load', () => {
    setTimeout(() => { window.focus(); window.print(); }, 180);
  });
  window.addEventListener('afterprint', () => window.close());
<\/script>
</body>
</html>`);
    popup.document.close();
  }

  return <div className="no-print mx-auto max-w-[1520px] p-5 md:p-8 xl:p-10">
    <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[.18em] text-black/38">Tasting Room</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-.04em] md:text-4xl">Shelf Price Tags</h1>
        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-black/55">Create one or multiple 6&quot; × 1.25&quot; shelf tags from Commerce7 pricing. Regular Price uses the Commerce7 price, Wine Club is 20% off, and Case Discount is 25% off.</p>
      </div>
      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-xs font-bold text-black/55 shadow-sm">{printableWines.length} wines with pricing ready</div>
    </div>

    <div className="mb-6 rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[.12em] text-black/45">Search wines</label>
          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35"><SearchIcon /></span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by wine name or brand…" className="h-12 w-full rounded-xl border border-black/10 bg-white pl-11 pr-4 text-sm shadow-sm outline-none focus:border-black/30" /></div>
        </div>
        <label className="inline-flex h-12 items-center gap-2 rounded-xl border border-black/10 bg-[#fafbfc] px-4 text-sm font-bold text-black/65"><input type="checkbox" checked={showRetired} onChange={(event) => setShowRetired(event.target.checked)} className="h-4 w-4 rounded border-black/20" /> Include non-available wines</label>
      </div>
    </div>

    <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
      <div>
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="hidden grid-cols-[minmax(0,1fr)_120px_88px_190px] items-center gap-3 border-b border-black/[.07] bg-[#f6f8fa] px-5 py-3 text-[11px] font-black uppercase tracking-[.11em] text-black lg:grid">
            <span>Wine</span><span>Logo</span><span>Price</span><span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-black/[.07]">
            {filtered.map((wine) => {
              const selectedLogo = selectedLogoForWine(wine);
              return <article key={wine.id} className="px-4 py-4 transition hover:bg-[#fafbfd] md:px-5">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_120px_88px_190px] lg:items-center lg:gap-3">
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-medium leading-5">{wine.name}{/^20\d{2}$/.test(wine.vintage || '') ? <span className="ml-1 font-semibold text-black/35">{wine.vintage}</span> : null}</h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-medium text-black/65">
                      <span>{wine.brand}</span>
                      <span>{wine.collection || '—'}</span>
                      <span className="font-black text-black">{money(Number(wine.price || 0))}</span>
                    </div>
                  </div>

                  <div>
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[.1em] text-black lg:hidden">Logo</span>
                    <select value={selectedLogo} onChange={(event) => updateSelectedLogo(wine.id, event.target.value as ShelfTagLogo)} className="h-10 w-full rounded-lg border border-black/10 bg-white px-3 text-[13px] font-medium outline-none focus:border-[#5ba3f8]">
                      {logoChoices.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[.1em] text-black lg:hidden">Price</span>
                    <p className="whitespace-nowrap text-[15px] font-medium">{money(Number(wine.price || 0))}</p>
                  </div>

                  <div className="flex gap-1.5 lg:justify-end">
                    <button onClick={() => startPrint([{ wine, logo: selectedLogo }])} className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#326eac] px-3 py-2 text-[12px] font-medium text-white transition hover:bg-[#285a8b] lg:w-[92px] lg:flex-none"><PrinterIcon className="h-3.5 w-3.5" /> Print</button>
                    <button onClick={() => addToQueue(wine)} className="flex min-h-9 flex-1 items-center justify-center gap-1 rounded-lg bg-[#5ba3f8] px-3 py-2 text-[12px] font-medium text-white transition hover:bg-[#4c91e3] lg:w-[86px] lg:flex-none"><PlusIcon /> Queue</button>
                  </div>
                </div>
              </article>;
            })}
          </div>
        </div>

        {!filtered.length && <div className="rounded-2xl border border-dashed border-black/15 bg-white py-20 text-center"><p className="font-black">No wines match those filters.</p><button onClick={() => { setQuery(''); setShowRetired(false); }} className="mt-3 text-xs font-black text-[#326eac]">Clear filters</button></div>}
      </div>

      <aside className="self-start 2xl:sticky 2xl:top-6">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[.12em] text-black">6&quot; × 1.25&quot;</p><h2 className="mt-1 text-xl font-black">Print Queue</h2><p className="mt-1 text-[13px] leading-5 text-black/65">Letter-size browser printing · 8 shelf tags per page</p></div><span className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white">{totalQueue}</span></div>

          <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">{queue.map((item) => {
            const wine = wines.find((candidate) => candidate.id === item.wineId);
            if (!wine) return null;
            const logoLabel = logoChoices.find((choice) => choice.value === item.logo)?.label || 'LWC';
            return <div key={item.id} className="rounded-xl border border-black/[.08] bg-[#fafbfc] p-3">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black leading-4">{wine.name}{/^20\d{2}$/.test(wine.vintage || '') ? ` ${wine.vintage}` : ''}</p><p className="mt-1 text-[11px] font-bold text-black/65">{logoLabel} · {money(Number(wine.price || 0))}</p></div><button onClick={() => setQueue((current) => current.filter((candidate) => candidate.id !== item.id))} className="rounded-lg p-1.5 text-black/35 hover:bg-red-50 hover:text-red-600" aria-label="Remove tag"><TrashIcon /></button></div>
              <div className="mt-3 flex items-center justify-between"><span className="text-[11px] font-semibold text-black/60">Club {money(Number(wine.price || 0) * 0.8)} · Case {money(Number(wine.price || 0) * 0.75)}</span><div className="flex items-center gap-1"><button onClick={() => updateQueueQuantity(item.id, -1)} className="rounded-lg border border-black/10 bg-white p-1.5"><MinusIcon /></button><span className="min-w-7 text-center text-xs font-black">{item.quantity}</span><button onClick={() => updateQueueQuantity(item.id, 1)} className="rounded-lg border border-black/10 bg-white p-1.5"><PlusIcon /></button></div></div>
            </div>;
          })}</div>

          {!queue.length && <div className="mt-4 rounded-xl border border-dashed border-black/15 bg-[#fafbfc] px-4 py-10 text-center"><p className="text-sm font-black text-black/60">Queue is empty</p><p className="mt-1 text-[11px] leading-4 text-black/55">Add shelf tags from the wine list.</p></div>}

          <button disabled={!totalQueue} onClick={() => startPrint(queueExpanded)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#326eac] px-4 py-4 text-sm font-semibold text-white transition hover:bg-[#285a8b] disabled:cursor-not-allowed disabled:opacity-30"><PrinterIcon /> PRINT {totalQueue || 0} TAG{totalQueue === 1 ? '' : 'S'}</button>
          {queue.length > 0 && <button onClick={() => setQueue([])} className="mt-2 w-full rounded-lg px-3 py-2 text-[10px] font-bold text-black/40 hover:bg-black/[.03]">Clear queue</button>}
          <p className="mt-4 text-[11px] leading-5 text-black/60">Tags use Poppins and the shelf-tag layout shown in your sample. Start with one test page to check printer scaling, then print the full batch.</p>
        </div>

        {queue[0] && (() => {
          const previewWine = wines.find((candidate) => candidate.id === queue[0].wineId);
          return previewWine ? <div className="mt-5 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[.12em] text-black/45">Preview</p>
            <div className="mt-3"><PreviewTag wine={previewWine} logo={queue[0].logo} /></div>
          </div> : null;
        })()}
      </aside>
    </div>
  </div>;
}
