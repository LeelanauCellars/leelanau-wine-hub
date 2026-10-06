'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type ProductMatch = {
  productId: string;
  productTitle: string;
  productType: string;
  productImage?: string;
  adminStatus?: string;
  webStatus?: string;
  variantId?: string;
  variantTitle?: string;
  sku?: string;
  upc?: string;
};

type ProcessedImage = {
  url: string;
  downloadUrl?: string;
  width: number;
  height: number;
  format: string;
  transparent: boolean;
  model?: string;
};

type IconProps = React.SVGProps<SVGSVGElement>;
const Icon = ({ children, ...props }: IconProps) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>;
const SearchIcon = (p: IconProps) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>;
const UploadIcon = (p: IconProps) => <Icon {...p}><path d="M12 16V4m-4 4 4-4 4 4M5 20h14"/></Icon>;
const Sparkles = (p: IconProps) => <Icon {...p}><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/></Icon>;
const Check = (p: IconProps) => <Icon {...p}><path d="m5 12 4 4L19 6"/></Icon>;
const Download = (p: IconProps) => <Icon {...p}><path d="M12 3v12m-4-4 4 4 4-4M5 20h14"/></Icon>;
const RefreshCw = (p: IconProps) => <Icon {...p}><path d="M20 6v5h-5M4 18v-5h5M18.5 11A7 7 0 0 0 6 7.5L4 11M5.5 13A7 7 0 0 0 18 16.5L20 13"/></Icon>;
const Package = (p: IconProps) => <Icon {...p}><path d="m3 7 9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10"/></Icon>;

function cleanFileBase(value = 'product') {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'product';
}

function loadImageElement(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Central could not read that image.')); };
    image.src = url;
  });
}

async function prepareForUpload(file: File) {
  const image = await loadImageElement(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
  const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
  const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser could not prepare the photo.');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));
  if (!blob) throw new Error('Your browser could not prepare the photo.');
  return new File([blob], `${cleanFileBase(file.name.replace(/\.[^.]+$/, ''))}-prepared.jpg`, { type: 'image/jpeg' });
}

async function downloadRemote(url: string, filename: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to download the processed image.');
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export default function Commerce7ImageUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [lookup, setLookup] = useState('');
  const [matches, setMatches] = useState<ProductMatch[]>([]);
  const [selected, setSelected] = useState<ProductMatch | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => { if (originalUrl) URL.revokeObjectURL(originalUrl); }, [originalUrl]);

  const downloadName = useMemo(() => `${cleanFileBase(selected?.productTitle || file?.name.replace(/\.[^.]+$/, '') || 'commerce7-product')}-2048-transparent.png`, [selected?.productTitle, file?.name]);

  async function searchProduct() {
    const query = lookup.trim();
    if (!query) { setSearchMessage('Enter or scan a SKU or UPC first.'); return; }
    setSearching(true);
    setSearchMessage('');
    setMatches([]);
    setSelected(null);
    setPublishMessage('');
    try {
      const response = await fetch(`/api/commerce7/image-upload/product?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
      const data = await response.json() as { matches?: ProductMatch[]; error?: string };
      if (!response.ok) throw new Error(data.error || 'Unable to search Commerce7.');
      const next = data.matches || [];
      setMatches(next);
      if (next.length === 1) setSelected(next[0]);
      setSearchMessage(next.length === 0 ? 'No exact SKU or UPC match was found in Commerce7.' : next.length === 1 ? 'Product matched.' : `${next.length} matches found. Choose the correct product below.`);
    } catch (error) {
      setSearchMessage(error instanceof Error ? error.message : 'Unable to search Commerce7.');
    } finally {
      setSearching(false);
    }
  }

  function chooseFile(next?: File | null) {
    if (!next) return;
    if (!/^image\/(?:png|jpeg|webp)$/i.test(next.type)) { setProcessMessage('Use a JPG, PNG, or WebP photo.'); return; }
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setFile(next);
    setOriginalUrl(URL.createObjectURL(next));
    setProcessed(null);
    setProcessMessage('');
    setPublishMessage('');
  }

  async function processImage() {
    if (!file) { setProcessMessage('Choose a product photo first.'); return; }
    setProcessing(true);
    setProcessMessage('Preparing photo…');
    setProcessed(null);
    setPublishMessage('');
    try {
      const prepared = await prepareForUpload(file);
      setProcessMessage('Gemini is cleaning the product and removing the background…');
      const form = new FormData();
      form.append('image', prepared);
      const response = await fetch('/api/commerce7/image-upload/process', { method: 'POST', body: form });
      const data = await response.json() as ProcessedImage & { error?: string };
      if (!response.ok) throw new Error(data.error || 'Unable to process the image.');
      setProcessed(data);
      setProcessMessage('Ready to review. The original Commerce7 product has not been changed.');
    } catch (error) {
      setProcessMessage(error instanceof Error ? error.message : 'Unable to process the image.');
    } finally {
      setProcessing(false);
    }
  }

  async function publish() {
    if (!selected || !processed) return;
    const okay = window.confirm(`Replace the primary Commerce7 image for “${selected.productTitle}” with this processed PNG?`);
    if (!okay) return;
    setPublishing(true);
    setPublishMessage('Publishing to Commerce7…');
    try {
      const response = await fetch('/api/commerce7/image-upload/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selected.productId, imageUrl: processed.url }),
      });
      const data = await response.json() as { error?: string; message?: string; confirmed?: boolean };
      if (!response.ok) throw new Error(data.error || 'Unable to publish to Commerce7.');
      setPublishMessage(data.message || 'Commerce7 accepted the new image.');
      setSelected((current) => current ? { ...current, productImage: processed.url } : current);
    } catch (error) {
      setPublishMessage(error instanceof Error ? error.message : 'Unable to publish to Commerce7.');
    } finally {
      setPublishing(false);
    }
  }

  function reset() {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setFile(null);
    setOriginalUrl('');
    setProcessed(null);
    setProcessMessage('');
    setPublishMessage('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return <div className="min-h-screen bg-[#f5f6f8] px-4 py-8 sm:px-6 lg:px-10">
    <div className="mx-auto max-w-[1220px]">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#3976b7]">Commerce7 · Product Images</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-.035em] sm:text-4xl">Image Upload to Commerce7</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-black/55">Turn a phone photo into a clean 2048 × 2048 transparent PNG, review it, then publish it to the matching Commerce7 product.</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-xs leading-5 text-black/50 shadow-sm"><span className="font-black text-black/70">Nothing publishes automatically.</span><br/>You approve the final image first.</div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3976b7]/10 text-[#3976b7]"><SearchIcon className="h-4 w-4" /></div><div><p className="text-sm font-black">1. Match the product</p><p className="text-[11px] text-black/45">Enter or scan the Commerce7 SKU or UPC.</p></div></div>
            <div className="mt-4 flex gap-2">
              <input value={lookup} onChange={(event) => setLookup(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void searchProduct(); } }} placeholder="SKU or UPC" className="min-w-0 flex-1 rounded-xl border border-black/10 bg-[#f8f9fb] px-3 py-2.5 text-sm font-bold outline-none transition focus:border-[#3976b7]/45 focus:ring-2 focus:ring-[#3976b7]/10" />
              <button type="button" onClick={() => void searchProduct()} disabled={searching} className="rounded-xl bg-black px-4 py-2.5 text-xs font-black text-white disabled:opacity-50">{searching ? 'Finding…' : 'Find'}</button>
            </div>
            {searchMessage && <p className={`mt-3 text-[11px] font-bold leading-5 ${matches.length ? 'text-emerald-700' : 'text-black/50'}`}>{searchMessage}</p>}
            {matches.length > 0 && <div className="mt-4 space-y-2">{matches.map((match) => <button key={`${match.productId}-${match.variantId || match.sku || match.upc}`} type="button" onClick={() => { setSelected(match); setPublishMessage(''); }} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${selected?.productId === match.productId && selected?.variantId === match.variantId ? 'border-[#3976b7] bg-[#3976b7]/[.05] ring-2 ring-[#3976b7]/10' : 'border-black/10 hover:border-black/20'}`}>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f4f5f7]">{match.productImage ? <img src={match.productImage} alt="" className="h-full w-full object-contain" /> : <Package className="h-5 w-5 text-black/20" />}</div>
              <div className="min-w-0"><p className="truncate text-xs font-black">{match.productTitle}</p><p className="mt-1 text-[10px] font-bold text-black/40">{match.productType}{match.variantTitle ? ` · ${match.variantTitle}` : ''}</p><p className="mt-1 truncate text-[10px] text-black/45">SKU {match.sku || '—'} · UPC {match.upc || '—'}</p></div>
              {selected?.productId === match.productId && selected?.variantId === match.variantId && <Check className="ml-auto h-4 w-4 shrink-0 text-[#3976b7]" />}
            </button>)}</div>}
          </section>

          <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3976b7]/10 text-[#3976b7]"><UploadIcon className="h-4 w-4" /></div><div><p className="text-sm font-black">2. Upload a photo</p><p className="text-[11px] text-black/45">A simple, well-lit photo gives Gemini the best starting point.</p></div></div>
            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => chooseFile(event.target.files?.[0])} />
            <button type="button" onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files?.[0]); }} className={`mt-4 flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-7 text-center transition ${dragging ? 'border-[#3976b7] bg-[#3976b7]/[.05]' : 'border-black/15 bg-[#f8f9fb] hover:border-[#3976b7]/40'}`}>
              <UploadIcon className="h-6 w-6 text-black/25" /><p className="mt-3 text-sm font-black">{file ? file.name : 'Choose or drop an image'}</p><p className="mt-1 text-[10px] leading-4 text-black/40">JPG, PNG or WebP · phone photos are resized before upload</p>
            </button>
            <div className="mt-4 rounded-2xl bg-[#f8f9fb] p-3 text-[10px] leading-5 text-black/45"><span className="font-black text-black/60">Best results:</span> show the entire product, shoot straight-on, use decent lighting, and avoid covering logos or product details.</div>
            <button type="button" onClick={() => void processImage()} disabled={!file || processing} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3976b7] px-4 py-3 text-xs font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40"><Sparkles className="h-4 w-4" /> {processing ? 'AI cleanup in progress…' : 'Process with Gemini'}</button>
            {processMessage && <p className="mt-3 text-[11px] font-bold leading-5 text-black/50">{processMessage}</p>}
          </section>
        </div>

        <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-black/35">Review</p><h2 className="mt-1 text-xl font-black">Before & after</h2></div>{(file || processed) && <button type="button" onClick={reset} className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-[10px] font-black text-black/55"><RefreshCw className="h-3.5 w-3.5" /> Start over</button>}</div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div><p className="mb-2 text-[10px] font-black uppercase tracking-[.14em] text-black/35">Original</p><div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-[#f4f5f7]">{originalUrl ? <img src={originalUrl} alt="Original upload" className="h-full w-full object-contain" /> : <div className="px-8 text-center text-xs font-bold leading-5 text-black/25">Your uploaded photo will appear here.</div>}</div></div>
            <div><p className="mb-2 text-[10px] font-black uppercase tracking-[.14em] text-black/35">Commerce7-ready PNG</p><div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-black/10" style={{ backgroundImage: 'linear-gradient(45deg,#eef0f3 25%,transparent 25%),linear-gradient(-45deg,#eef0f3 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eef0f3 75%),linear-gradient(-45deg,transparent 75%,#eef0f3 75%)', backgroundSize: '24px 24px', backgroundPosition: '0 0,0 12px,12px -12px,-12px 0px' }}>{processing ? <div className="px-8 text-center"><Sparkles className="mx-auto h-7 w-7 animate-pulse text-[#3976b7]" /><p className="mt-3 text-xs font-black text-black/50">Gemini is cleaning the product…</p><p className="mt-1 text-[10px] leading-4 text-black/35">Wrinkles, presentation and background are being corrected.</p></div> : processed ? <img src={processed.url} alt="Processed transparent product" className="h-full w-full object-contain" /> : <div className="px-8 text-center text-xs font-bold leading-5 text-black/25">The transparent 2048 × 2048 result will appear here.</div>}</div></div>
          </div>

          {processed && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2 text-sm font-black text-emerald-900"><Check className="h-4 w-4" /> Ready to review</div><p className="mt-1 text-[11px] font-bold text-emerald-800/70">2048 × 2048 · transparent PNG · centered product</p></div><button type="button" onClick={() => void downloadRemote(processed.downloadUrl || processed.url, downloadName).catch((error) => setProcessMessage(error instanceof Error ? error.message : 'Unable to download image.'))} className="flex items-center justify-center gap-2 rounded-xl border border-emerald-700/15 bg-white px-4 py-2.5 text-xs font-black text-emerald-900"><Download className="h-4 w-4" /> Download PNG</button></div></div>}

          <div className="mt-6 border-t border-black/10 pt-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-sm font-black">3. Publish to Commerce7</p><p className="mt-1 max-w-2xl text-[11px] leading-5 text-black/45">Publishing requires a matched SKU/UPC and a processed image. Central will ask for confirmation before it changes the product.</p></div><button type="button" onClick={() => void publish()} disabled={!selected || !processed || publishing} className="shrink-0 rounded-xl bg-black px-5 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-35">{publishing ? 'Publishing…' : 'Approve & Publish'}</button></div>
            {selected && <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#f8f9fb] p-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">{selected.productImage ? <img src={selected.productImage} alt="Current Commerce7 product" className="h-full w-full object-contain" /> : <Package className="h-5 w-5 text-black/20" />}</div><div className="min-w-0"><p className="truncate text-xs font-black">{selected.productTitle}</p><p className="mt-1 text-[10px] text-black/45">SKU {selected.sku || '—'} · UPC {selected.upc || '—'}</p></div></div>}
            {publishMessage && <p className={`mt-3 rounded-xl px-3 py-2.5 text-[11px] font-bold leading-5 ${/confirmed|accepted|publishing/i.test(publishMessage) ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{publishMessage}</p>}
          </div>
        </section>
      </div>
    </div>
  </div>;
}
