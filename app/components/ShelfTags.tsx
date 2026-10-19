'use client';

import React, { useMemo, useState } from 'react';
import type { WineRecord } from '@/lib/types';

type ShelfTagLogo = 'lwc' | 'farm-fresh';

type ShelfTagDraft = {
  wineId: string;
  logo: ShelfTagLogo;
  lines: string[];
  regularPrice: number;
  clubPrice: number;
  casePrice: number;
};

type QueueItem = ShelfTagDraft & {
  id: string;
  quantity: number;
};

type EditorState = {
  source: 'wine-list' | 'queue';
  queueId?: string;
  draft: ShelfTagDraft;
};

const SearchIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
const PrinterIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5h18v5a2 2 0 0 1-2 2h-2M7 14h10v7H7z"/></svg>;
const PlusIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>;
const MinusIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>;
const TrashIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5M14 11v5"/></svg>;
const PencilIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="m4 20 4.5-1 10-10-3.5-3.5-10 10zM13.5 7 17 10.5"/></svg>;
const XIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6 6 18"/></svg>;

const TAG_BLUE = '#2b6f9d';
const LABEL_WIDTH_IN = 6;
const LABEL_HEIGHT_IN = 1.25;
const LABELS_PER_PAGE = 4;

const logoChoices: { value: ShelfTagLogo; label: string; src: string; alt: string }[] = [
  { value: 'lwc', label: 'LWC', src: '/lwc-logo.png', alt: 'Leelanau Cellars' },
  { value: 'farm-fresh', label: 'Farm Fresh', src: '/farm-fresh-logo-white.png', alt: 'Farm Fresh' },
];

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function money(value: number) {
  return `$${roundMoney(value).toFixed(2)}`;
}

function defaultLogo(wine: WineRecord): ShelfTagLogo {
  return wine.brand.toLowerCase().includes('farm fresh') ? 'farm-fresh' : 'lwc';
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
    const middle = Math.ceil(raw.length / 2);
    return [raw.slice(0, middle).join(' '), raw.slice(middle).join(' ')].filter(Boolean);
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

function defaultDraft(wine: WineRecord, logo = defaultLogo(wine)): ShelfTagDraft {
  const regularPrice = roundMoney(Number(wine.price || 0));
  return {
    wineId: wine.id,
    logo,
    lines: splitTagLines(labelName(wine)).slice(0, 3),
    regularPrice,
    clubPrice: roundMoney(regularPrice * 0.8),
    casePrice: roundMoney(regularPrice * 0.75),
  };
}

function cleanLines(lines: string[]) {
  const cleaned = lines.map((line) => line.trim()).filter(Boolean).slice(0, 3);
  return cleaned.length ? cleaned : ['Wine'];
}

function tagLineConfig(lines: string[]) {
  const cleaned = cleanLines(lines);
  return {
    lines: cleaned,
    lineCount: cleaned.length,
    titleSize: cleaned.length >= 3 ? 20.7 : 26.2,
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

function labelHtml(tag: ShelfTagDraft, origin: string) {
  const { lines, lineCount, titleSize } = tagLineConfig(tag.lines);
  const logoSrc = `${origin}${tag.logo === 'farm-fresh' ? '/farm-fresh-logo-white.png' : '/lwc-logo.png'}`;
  const logoStyle = tag.logo === 'farm-fresh'
    ? 'left:.143in;width:.70in;height:.64in;'
    : 'left:.143in;width:.56in;height:.86in;background:#fff;border:2px solid #111;padding:.03in;';
  const topMap = lineCount >= 3 ? ['.13in', '.40in', '.67in'] : lineCount === 2 ? ['.24in', '.60in'] : ['.42in'];

  return `
    <article class="shelf-tag">
      <div class="shelf-tag-inner">
        <div class="tag-logo ${tag.logo}"><img src="${logoSrc}" alt="" style="${logoStyle}" /></div>
        <div class="tag-name tag-name-${lineCount}" style="font-size:${titleSize}pt;">${lines.map((line, index) => `<div style="top:${topMap[index]};">${escapeHtml(line)}</div>`).join('')}</div>
        <div class="tag-price tag-price-1">${escapeHtml(money(tag.regularPrice))}</div>
        <div class="tag-copy tag-copy-1">Regular Price</div>
        <div class="tag-price tag-price-2">${escapeHtml(money(tag.clubPrice))}</div>
        <div class="tag-copy tag-copy-2">Wine Club</div>
        <div class="tag-price tag-price-3">${escapeHtml(money(tag.casePrice))}</div>
        <div class="tag-copy tag-copy-3">Case Discount</div>
      </div>
    </article>`;
}

function PreviewTag({ tag }: { tag: ShelfTagDraft }) {
  const { lines, lineCount, titleSize } = tagLineConfig(tag.lines);
  const topMap = lineCount >= 3 ? [10.4, 32.0, 53.6] : lineCount === 2 ? [19.0, 48.8] : [33.6];
  const logoChoice = logoChoices.find((item) => item.value === tag.logo) || logoChoices[0];

  return <div className="relative aspect-[24/5] w-full overflow-hidden rounded-[14px] border border-black/10 shadow-sm" style={{ background: TAG_BLUE }}>
    <div className="absolute inset-0" style={{ fontFamily: 'Poppins, Arial, Helvetica, sans-serif' }}>
      <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${(0.143 / LABEL_WIDTH_IN) * 100}%`, width: tag.logo === 'farm-fresh' ? `${(0.70 / LABEL_WIDTH_IN) * 100}%` : `${(0.56 / LABEL_WIDTH_IN) * 100}%`, height: tag.logo === 'farm-fresh' ? `${(0.64 / LABEL_HEIGHT_IN) * 100}%` : `${(0.86 / LABEL_HEIGHT_IN) * 100}%`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: tag.logo === 'lwc' ? '#fff' : 'transparent', border: tag.logo === 'lwc' ? '2px solid #111' : '0', padding: tag.logo === 'lwc' ? '2px' : 0 }}>
        <img src={logoChoice.src} alt={logoChoice.alt} className="max-h-full max-w-full object-contain" />
      </div>

      <div className="absolute" style={{ left: `${(1.009 / LABEL_WIDTH_IN) * 100}%`, top: 0, width: `${(2.88 / LABEL_WIDTH_IN) * 100}%`, height: '100%' }}>
        {lines.map((line, index) => <div key={`${line}-${index}`} className="absolute left-0 whitespace-nowrap font-black text-white" style={{ top: `${topMap[index]}%`, fontSize: `${titleSize}pt`, lineHeight: 1, letterSpacing: '-0.03em', WebkitTextStroke: '1.6px #101010', textShadow: '-1px -1px 0 #111, 1px -1px 0 #111, -1px 1px 0 #111, 1px 1px 0 #111' }}>{line}</div>)}
      </div>

      <TagPricePreview price={tag.regularPrice} copy="Regular Price" top={17.6} />
      <TagPricePreview price={tag.clubPrice} copy="Wine Club" top={43.2} />
      <TagPricePreview price={tag.casePrice} copy="Case Discount" top={68.8} />
    </div>
  </div>;
}

function TagPricePreview({ price, copy, top }: { price: number; copy: string; top: number }) {
  return <>
    <div className="absolute whitespace-nowrap text-right font-black text-white" style={{ left: `${(3.22 / LABEL_WIDTH_IN) * 100}%`, top: `${top}%`, width: `${(1.13 / LABEL_WIDTH_IN) * 100}%`, fontSize: '17.8pt', lineHeight: 1, letterSpacing: '-0.03em', WebkitTextStroke: '1.35px #101010', textShadow: '-1px -1px 0 #111, 1px -1px 0 #111, -1px 1px 0 #111, 1px 1px 0 #111' }}>{money(price)}</div>
    <div className="absolute whitespace-nowrap font-black text-white" style={{ left: `${(4.466 / LABEL_WIDTH_IN) * 100}%`, top: `${top + 1.2}%`, fontSize: '9.9pt', lineHeight: 1.05, WebkitTextStroke: '.9px #101010', textShadow: '-1px -1px 0 #111, 1px -1px 0 #111, -1px 1px 0 #111, 1px 1px 0 #111' }}>{copy}</div>
  </>;
}

export default function ShelfTags({ wines }: { wines: WineRecord[] }) {
  const [query, setQuery] = useState('');
  const [showRetired, setShowRetired] = useState(false);
  const [selectedLogos, setSelectedLogos] = useState<Record<string, ShelfTagLogo>>({});
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [editor, setEditor] = useState<EditorState | null>(null);

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

  const queueExpanded = useMemo(() => queue.flatMap((item) => Array.from({ length: item.quantity }, () => ({
    wineId: item.wineId,
    logo: item.logo,
    lines: item.lines,
    regularPrice: item.regularPrice,
    clubPrice: item.clubPrice,
    casePrice: item.casePrice,
  }))), [queue]);

  const totalQueue = queue.reduce((sum, item) => sum + item.quantity, 0);

  function selectedLogoForWine(wine: WineRecord) {
    return selectedLogos[wine.id] || defaultLogo(wine);
  }

  function updateSelectedLogo(wineId: string, logo: ShelfTagLogo) {
    setSelectedLogos((current) => ({ ...current, [wineId]: logo }));
  }

  function addToQueue(wine: WineRecord, draft = defaultDraft(wine, selectedLogoForWine(wine))) {
    setQueue((current) => {
      const existing = current.find((item) => item.wineId === wine.id);
      if (existing) return current.map((item) => item.wineId === wine.id ? { ...item, ...draft, quantity: item.quantity + 1 } : item);
      return [...current, { ...draft, id: `${wine.id}-${Date.now()}`, quantity: 1 }];
    });
  }

  function updateQueueQuantity(id: string, delta: number) {
    setQueue((current) => current
      .map((item) => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item)
      .filter((item) => item.quantity > 0));
  }

  function startPrint(items: ShelfTagDraft[]) {
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
<title>${items.length === 1 ? 'Shelf Tag' : `${items.length} Shelf Tags`}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
  @page { size: 8.5in 11in; margin: 0; }
  * { box-sizing: border-box; }
  html, body { width: 8.5in; margin: 0; padding: 0; background: #fff; }
  html, body, .shelf-tag, .shelf-tag * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body { font-family: 'Poppins', Arial, Helvetica, sans-serif; }
  .print-page {
    width: 8.5in;
    height: 11in;
    margin: 0;
    padding-top: .60in;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: .55in;
    overflow: hidden;
    background: #fff;
    break-after: page;
    page-break-after: always;
  }
  .print-page:last-child { break-after: auto; page-break-after: auto; }
  .shelf-tag {
    width: ${LABEL_WIDTH_IN}in;
    height: ${LABEL_HEIGHT_IN}in;
    flex: 0 0 ${LABEL_HEIGHT_IN}in;
    margin: 0;
    overflow: hidden;
    background: ${TAG_BLUE} !important;
  }
  .shelf-tag-inner { position: relative; width: 100%; height: 100%; color: #fff; background: ${TAG_BLUE} !important; }
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
<body>${pages.map((page) => `<section class="print-page">${page.map((tag) => labelHtml(tag, origin)).join('')}</section>`).join('')}
<script>
  const printWhenReady = () => setTimeout(() => { window.focus(); window.print(); }, 250);
  window.addEventListener('load', () => {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(printWhenReady);
    else printWhenReady();
  });
  window.addEventListener('afterprint', () => window.close());
<\/script>
</body>
</html>`);
    popup.document.close();
  }

  function openWineEditor(wine: WineRecord) {
    setEditor({ source: 'wine-list', draft: defaultDraft(wine, selectedLogoForWine(wine)) });
  }

  function openQueueEditor(item: QueueItem) {
    setEditor({ source: 'queue', queueId: item.id, draft: {
      wineId: item.wineId,
      logo: item.logo,
      lines: [...item.lines],
      regularPrice: item.regularPrice,
      clubPrice: item.clubPrice,
      casePrice: item.casePrice,
    } });
  }

  function saveEditorToQueue() {
    if (!editor) return;
    const draft = { ...editor.draft, lines: cleanLines(editor.draft.lines) };
    if (editor.source === 'queue' && editor.queueId) {
      setQueue((current) => current.map((item) => item.id === editor.queueId ? { ...item, ...draft } : item));
    } else {
      const wine = wines.find((candidate) => candidate.id === draft.wineId);
      if (wine) addToQueue(wine, draft);
    }
    setEditor(null);
  }

  return <>
    <div className="no-print mx-auto max-w-[1520px] p-5 md:p-8 xl:p-10">
      <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[.18em] text-black/38">Tasting Room</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-.04em] md:text-4xl">Shelf Price Tags</h1>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-black/55">Create one or multiple 6&quot; × 1.25&quot; shelf tags from Commerce7 pricing. Regular Price uses the Commerce7 price, Wine Club starts at 20% off, and Case Discount starts at 25% off. Any tag can be edited before printing.</p>
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

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_400px]">
        <div>
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
            <div className="hidden grid-cols-[minmax(0,1fr)_120px_88px_270px] items-center gap-3 border-b border-black/[.07] bg-[#f6f8fa] px-5 py-3 text-[11px] font-black uppercase tracking-[.11em] text-black lg:grid">
              <span>Wine</span><span>Logo</span><span>Price</span><span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-black/[.07]">
              {filtered.map((wine) => {
                const selectedLogo = selectedLogoForWine(wine);
                const draft = defaultDraft(wine, selectedLogo);
                return <article key={wine.id} className="px-4 py-4 transition hover:bg-[#fafbfd] md:px-5">
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_120px_88px_270px] lg:items-center lg:gap-3">
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

                    <div className="flex flex-wrap gap-1.5 lg:justify-end">
                      <button onClick={() => startPrint([draft])} className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-[#326eac] px-3 py-2 text-[12px] font-medium text-white transition hover:bg-[#285a8b]"><PrinterIcon className="h-3.5 w-3.5" /> Print</button>
                      <button onClick={() => openWineEditor(wine)} className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-[12px] font-medium text-black/70 transition hover:bg-black/[.03]"><PencilIcon /> Edit</button>
                      <button onClick={() => addToQueue(wine)} className="flex min-h-9 items-center justify-center gap-1 rounded-lg bg-[#5ba3f8] px-3 py-2 text-[12px] font-medium text-white transition hover:bg-[#4c91e3]"><PlusIcon /> Queue</button>
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
            <div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[.12em] text-black">6&quot; × 1.25&quot;</p><h2 className="mt-1 text-xl font-black">Print Queue</h2><p className="mt-1 text-[13px] leading-5 text-black/65">4 shelf tags per letter page with cutting room between each tag.</p></div><span className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white">{totalQueue}</span></div>

            <div className="mt-4 space-y-3 max-h-[460px] overflow-y-auto pr-1">{queue.map((item) => {
              const wine = wines.find((candidate) => candidate.id === item.wineId);
              if (!wine) return null;
              const logoLabel = logoChoices.find((choice) => choice.value === item.logo)?.label || 'LWC';
              return <div key={item.id} className="rounded-xl border border-black/[.08] bg-[#fafbfc] p-3">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-black leading-4">{cleanLines(item.lines).join(' / ')}</p><p className="mt-1 text-[11px] font-bold text-black/65">{logoLabel} · {money(item.regularPrice)}</p></div><button onClick={() => setQueue((current) => current.filter((candidate) => candidate.id !== item.id))} className="rounded-lg p-1.5 text-black/35 hover:bg-red-50 hover:text-red-600" aria-label="Remove tag"><TrashIcon /></button></div>
                <div className="mt-3 flex items-center justify-between gap-3"><button onClick={() => openQueueEditor(item)} className="flex items-center gap-1 text-[11px] font-black text-[#326eac]"><PencilIcon /> Edit tag</button><div className="flex items-center gap-1"><button onClick={() => updateQueueQuantity(item.id, -1)} className="rounded-lg border border-black/10 bg-white p-1.5"><MinusIcon /></button><span className="min-w-7 text-center text-xs font-black">{item.quantity}</span><button onClick={() => updateQueueQuantity(item.id, 1)} className="rounded-lg border border-black/10 bg-white p-1.5"><PlusIcon /></button></div></div>
              </div>;
            })}</div>

            {!queue.length && <div className="mt-4 rounded-xl border border-dashed border-black/15 bg-[#fafbfc] px-4 py-10 text-center"><p className="text-sm font-black text-black/60">Queue is empty</p><p className="mt-1 text-[11px] leading-4 text-black/55">Add shelf tags from the wine list.</p></div>}

            <button disabled={!totalQueue} onClick={() => startPrint(queueExpanded)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#326eac] px-4 py-4 text-sm font-semibold text-white transition hover:bg-[#285a8b] disabled:cursor-not-allowed disabled:opacity-30"><PrinterIcon /> PRINT {totalQueue || 0} TAG{totalQueue === 1 ? '' : 'S'}</button>
            {queue.length > 0 && <button onClick={() => setQueue([])} className="mt-2 w-full rounded-lg px-3 py-2 text-[10px] font-bold text-black/40 hover:bg-black/[.03]">Clear queue</button>}
            <p className="mt-4 text-[11px] leading-5 text-black/60">The blue background is forced into print/PDF output. Print at 100% scale with headers and footers off so the shelf tag remains exactly 6&quot; × 1.25&quot;.</p>
          </div>

          {queue[0] && <div className="mt-5 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[.12em] text-black/45">Preview</p>
            <div className="mt-3"><PreviewTag tag={queue[0]} /></div>
          </div>}
        </aside>
      </div>
    </div>

    {editor && <ShelfTagEditor
      editor={editor}
      wines={wines}
      setEditor={setEditor}
      saveToQueue={saveEditorToQueue}
      printTag={(draft) => startPrint([{ ...draft, lines: cleanLines(draft.lines) }])}
    />}
  </>;
}

function ShelfTagEditor({ editor, wines, setEditor, saveToQueue, printTag }: {
  editor: EditorState;
  wines: WineRecord[];
  setEditor: React.Dispatch<React.SetStateAction<EditorState | null>>;
  saveToQueue: () => void;
  printTag: (draft: ShelfTagDraft) => void;
}) {
  const wine = wines.find((candidate) => candidate.id === editor.draft.wineId);
  const draft = editor.draft;

  function update(patch: Partial<ShelfTagDraft>) {
    setEditor((current) => current ? { ...current, draft: { ...current.draft, ...patch } } : current);
  }

  function updateLine(index: number, value: string) {
    const lines = [...draft.lines];
    while (lines.length < 3) lines.push('');
    lines[index] = value;
    update({ lines });
  }

  function resetFromCommerce7() {
    if (!wine) return;
    const next = defaultDraft(wine, draft.logo);
    update({ regularPrice: next.regularPrice, clubPrice: next.clubPrice, casePrice: next.casePrice, lines: next.lines });
  }

  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
    <div className="max-h-[92vh] w-full max-w-[820px] overflow-y-auto rounded-3xl bg-white shadow-2xl">
      <div className="flex items-start justify-between gap-4 border-b border-black/10 px-6 py-5">
        <div><p className="text-[10px] font-black uppercase tracking-[.14em] text-black/40">Shelf Price Tag</p><h2 className="mt-1 text-2xl font-black tracking-[-.03em]">Edit before printing</h2><p className="mt-1 text-sm font-semibold text-black/50">These changes apply only to this shelf tag. Commerce7 is not changed.</p></div>
        <button onClick={() => setEditor(null)} className="rounded-xl border border-black/10 p-2.5 text-black/45 hover:bg-black/[.04]" aria-label="Close editor"><XIcon /></button>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className="mb-1.5 block text-[10px] font-black uppercase tracking-[.1em] text-black/45">Logo</span><select value={draft.logo} onChange={(event) => update({ logo: event.target.value as ShelfTagLogo })} className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-semibold outline-none focus:border-[#326eac]">{logoChoices.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}</select></label>
            <div className="flex items-end"><button type="button" onClick={resetFromCommerce7} className="h-11 w-full rounded-xl border border-black/10 bg-[#fafbfc] px-4 text-xs font-black text-black/65 hover:bg-black/[.04]">Reset name + prices</button></div>
          </div>

          <div className="mt-5">
            <p className="text-[10px] font-black uppercase tracking-[.1em] text-black/45">Wine name lines</p>
            <p className="mt-1 text-xs leading-5 text-black/45">Use two lines for 26.2 pt type or three lines for 20.7 pt type. Blank third line = two-line layout.</p>
            <div className="mt-3 grid gap-2">{[0, 1, 2].map((index) => <input key={index} value={draft.lines[index] || ''} onChange={(event) => updateLine(index, event.target.value)} placeholder={`Line ${index + 1}${index === 2 ? ' (optional)' : ''}`} className="h-11 rounded-xl border border-black/10 px-3 text-sm font-semibold outline-none focus:border-[#326eac]" />)}</div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <PriceInput label="Regular Price" value={draft.regularPrice} onChange={(value) => update({ regularPrice: value, clubPrice: roundMoney(value * 0.8), casePrice: roundMoney(value * 0.75) })} />
            <PriceInput label="Wine Club" value={draft.clubPrice} onChange={(value) => update({ clubPrice: value })} />
            <PriceInput label="Case Discount" value={draft.casePrice} onChange={(value) => update({ casePrice: value })} />
          </div>
          <p className="mt-2 text-[11px] leading-5 text-black/45">Club and Case prices start at 20% and 25% off the Commerce7 regular price, but all three values can be overridden here when needed.</p>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[.12em] text-black/45">Live preview</p>
          <PreviewTag tag={draft} />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-black/10 bg-[#fafbfc] px-6 py-4 sm:flex-row sm:justify-end">
        <button onClick={() => setEditor(null)} className="rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-black text-black/60">Cancel</button>
        <button onClick={() => printTag(draft)} className="flex items-center justify-center gap-2 rounded-xl border border-[#326eac]/20 bg-white px-5 py-3 text-sm font-black text-[#326eac]"><PrinterIcon /> Print this tag</button>
        <button onClick={saveToQueue} className="rounded-xl bg-[#326eac] px-5 py-3 text-sm font-black text-white">{editor.source === 'queue' ? 'Save changes' : 'Add edited tag to queue'}</button>
      </div>
    </div>
  </div>;
}

function PriceInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label><span className="mb-1.5 block text-[10px] font-black uppercase tracking-[.1em] text-black/45">{label}</span><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-black/35">$</span><input type="number" min="0" step="0.01" value={Number.isFinite(value) ? value : 0} onChange={(event) => onChange(roundMoney(Number(event.target.value) || 0))} className="h-11 w-full rounded-xl border border-black/10 pl-7 pr-3 text-sm font-black outline-none focus:border-[#326eac]" /></div></label>;
}
