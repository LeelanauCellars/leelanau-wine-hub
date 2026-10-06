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
  engine?: string;
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

const CUTOUT_MODEL_URL = process.env.NEXT_PUBLIC_PRODUCT_CUTOUT_MODEL_URL
  || 'https://huggingface.co/edgetools/u2netp/resolve/25dee37ab19c5b6ad64ba6578eba63f1ae07720c/u2netp.onnx';
const ORT_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/ort.min.js';
const ORT_WASM_PATH = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/';
const CUTOUT_SIZE = 320;
const OUTPUT_SIZE = 2048;
const TARGET_FILL = 0.84;

type OrtRuntime = {
  env: { wasm: { wasmPaths: string; numThreads: number } };
  InferenceSession: { create: (modelUrl: string, options?: Record<string, unknown>) => Promise<any> };
  Tensor: new (type: string, data: Float32Array, dims: number[]) => any;
};

declare global {
  interface Window {
    ort?: OrtRuntime;
  }
}

let ortRuntimePromise: Promise<OrtRuntime> | null = null;
let cutoutSessionPromise: Promise<any> | null = null;

function loadOrtRuntime() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Product cutout is only available in the browser.'));
  if (window.ort) return Promise.resolve(window.ort);
  if (ortRuntimePromise) return ortRuntimePromise;

  ortRuntimePromise = new Promise<OrtRuntime>((resolve, reject) => {
    const finish = () => {
      if (window.ort) resolve(window.ort);
      else reject(new Error('Central could not start the local product cutout engine.'));
    };

    const existing = document.querySelector<HTMLScriptElement>('script[data-central-ort="1"]');
    if (existing) {
      existing.addEventListener('load', finish, { once: true });
      existing.addEventListener('error', () => reject(new Error('Central could not load the local product cutout engine.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = ORT_SCRIPT_URL;
    script.async = true;
    script.dataset.centralOrt = '1';
    script.onload = finish;
    script.onerror = () => reject(new Error('Central could not load the local product cutout engine. Check the internet connection and try again.'));
    document.head.appendChild(script);
  });

  return ortRuntimePromise;
}

async function getCutoutSession() {
  const ort = await loadOrtRuntime();
  ort.env.wasm.wasmPaths = ORT_WASM_PATH;
  ort.env.wasm.numThreads = 1;
  if (!cutoutSessionPromise) {
    cutoutSessionPromise = ort.InferenceSession.create(CUTOUT_MODEL_URL, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    });
  }
  const session = await cutoutSessionPromise;
  return { ort, session };
}

function smoothstep01(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

function findAlphaBounds(data: Uint8ClampedArray, width: number, height: number) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let visible = 0;
  for (let i = 0; i < width * height; i += 1) {
    if (data[i * 4 + 3] <= 18) continue;
    visible += 1;
    const x = i % width;
    const y = Math.floor(i / width);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY, visible };
}

async function createLocalCutout(file: File, progress: (message: string) => void) {
  progress('Loading Central’s product cutout model…');
  const prepared = await prepareForUpload(file);
  const image = await loadImageElement(prepared);
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;

  progress('Separating the product from the scene…');
  const modelCanvas = document.createElement('canvas');
  modelCanvas.width = CUTOUT_SIZE;
  modelCanvas.height = CUTOUT_SIZE;
  const modelContext = modelCanvas.getContext('2d', { willReadFrequently: true });
  if (!modelContext) throw new Error('Your browser could not prepare the cutout model.');
  modelContext.drawImage(image, 0, 0, CUTOUT_SIZE, CUTOUT_SIZE);
  const modelPixels = modelContext.getImageData(0, 0, CUTOUT_SIZE, CUTOUT_SIZE).data;

  const input = new Float32Array(3 * CUTOUT_SIZE * CUTOUT_SIZE);
  const plane = CUTOUT_SIZE * CUTOUT_SIZE;
  for (let i = 0; i < plane; i += 1) {
    const p = i * 4;
    input[i] = (modelPixels[p] / 255 - 0.485) / 0.229;
    input[plane + i] = (modelPixels[p + 1] / 255 - 0.456) / 0.224;
    input[plane * 2 + i] = (modelPixels[p + 2] / 255 - 0.406) / 0.225;
  }

  const { ort, session } = await getCutoutSession();
  const tensor = new ort.Tensor('float32', input, [1, 3, CUTOUT_SIZE, CUTOUT_SIZE]);
  const feeds: Record<string, any> = {};
  feeds[session.inputNames[0]] = tensor;
  const outputMap = await session.run(feeds);
  const firstOutput = outputMap[session.outputNames[0]];
  if (!firstOutput) throw new Error('Central could not create a product mask from that photo.');

  const values = firstOutput.data as Float32Array;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < values.length; i += 1) {
    const v = values[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = Math.max(1e-6, max - min);

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = CUTOUT_SIZE;
  maskCanvas.height = CUTOUT_SIZE;
  const maskContext = maskCanvas.getContext('2d');
  if (!maskContext) throw new Error('Your browser could not build the product mask.');
  const maskImage = maskContext.createImageData(CUTOUT_SIZE, CUTOUT_SIZE);
  for (let i = 0; i < plane; i += 1) {
    const normalized = (values[i] - min) / range;
    const alpha = Math.round(255 * smoothstep01((normalized - 0.08) / 0.78));
    const p = i * 4;
    maskImage.data[p] = alpha;
    maskImage.data[p + 1] = alpha;
    maskImage.data[p + 2] = alpha;
    maskImage.data[p + 3] = 255;
  }
  maskContext.putImageData(maskImage, 0, 0);

  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = width;
  sourceCanvas.height = height;
  const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
  if (!sourceContext) throw new Error('Your browser could not create the transparent cutout.');
  sourceContext.drawImage(image, 0, 0, width, height);
  const sourceData = sourceContext.getImageData(0, 0, width, height);

  const fullMask = document.createElement('canvas');
  fullMask.width = width;
  fullMask.height = height;
  const fullMaskContext = fullMask.getContext('2d', { willReadFrequently: true });
  if (!fullMaskContext) throw new Error('Your browser could not resize the product mask.');
  fullMaskContext.imageSmoothingEnabled = true;
  fullMaskContext.drawImage(maskCanvas, 0, 0, width, height);
  const fullMaskData = fullMaskContext.getImageData(0, 0, width, height).data;

  for (let i = 0; i < width * height; i += 1) {
    sourceData.data[i * 4 + 3] = fullMaskData[i * 4];
  }
  sourceContext.clearRect(0, 0, width, height);
  sourceContext.putImageData(sourceData, 0, 0);

  const bounds = findAlphaBounds(sourceData.data, width, height);
  const visibleRatio = bounds.visible / Math.max(1, width * height);
  if (bounds.maxX < bounds.minX || bounds.maxY < bounds.minY || visibleRatio < 0.008) {
    throw new Error('Central could not isolate a product in that photo. Try again with the item fully visible and separated from your hand or other objects.');
  }

  progress('Centering the product on a 2048 × 2048 transparent PNG…');
  const bboxWidth = bounds.maxX - bounds.minX + 1;
  const bboxHeight = bounds.maxY - bounds.minY + 1;
  const targetMax = Math.round(OUTPUT_SIZE * TARGET_FILL);
  const scale = Math.min(targetMax / bboxWidth, targetMax / bboxHeight);
  const drawWidth = Math.max(1, Math.round(bboxWidth * scale));
  const drawHeight = Math.max(1, Math.round(bboxHeight * scale));
  const dx = Math.round((OUTPUT_SIZE - drawWidth) / 2);
  const dy = Math.round((OUTPUT_SIZE - drawHeight) / 2);

  const output = document.createElement('canvas');
  output.width = OUTPUT_SIZE;
  output.height = OUTPUT_SIZE;
  const out = output.getContext('2d');
  if (!out) throw new Error('Your browser could not build the final PNG.');
  out.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  out.imageSmoothingEnabled = true;
  out.imageSmoothingQuality = 'high';
  out.drawImage(sourceCanvas, bounds.minX, bounds.minY, bboxWidth, bboxHeight, dx, dy, drawWidth, drawHeight);

  const blob = await new Promise<Blob | null>((resolve) => output.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Your browser could not export the transparent PNG.');
  return new File([blob], `${cleanFileBase(file.name.replace(/\.[^.]+$/, ''))}-2048-transparent.png`, { type: 'image/png' });
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
      const cutout = await createLocalCutout(file, setProcessMessage);
      setProcessMessage('Saving the finished PNG…');
      const form = new FormData();
      form.append('image', cutout);
      form.append('precut', '1');
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
          <p className="mt-3 max-w-3xl text-sm leading-6 text-black/55">Central isolates the product with a local cutout model, centers it on a 2048 × 2048 transparent PNG, then lets you download it or publish it to Commerce7 when you are ready.</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-xs leading-5 text-black/50 shadow-sm"><span className="font-black text-black/70">Nothing publishes automatically.</span><br/>You approve the final image first.</div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3976b7]/10 text-[#3976b7]"><SearchIcon className="h-4 w-4" /></div><div><p className="text-sm font-black">1. Match the product <span className="font-bold text-black/35">(optional)</span></p><p className="text-[11px] text-black/45">Enter or scan the SKU/UPC only if you want to publish to Commerce7.</p></div></div>
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
            <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3976b7]/10 text-[#3976b7]"><UploadIcon className="h-4 w-4" /></div><div><p className="text-sm font-black">2. Upload a photo</p><p className="text-[11px] text-black/45">Place, hang or lay the item by itself before taking the photo.</p></div></div>
            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => chooseFile(event.target.files?.[0])} />
            <button type="button" onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files?.[0]); }} className={`mt-4 flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-7 text-center transition ${dragging ? 'border-[#3976b7] bg-[#3976b7]/[.05]' : 'border-black/15 bg-[#f8f9fb] hover:border-[#3976b7]/40'}`}>
              <UploadIcon className="h-6 w-6 text-black/25" /><p className="mt-3 text-sm font-black">{file ? file.name : 'Choose or drop an image'}</p><p className="mt-1 text-[10px] leading-4 text-black/40">JPG, PNG or WebP · phone photos are resized before upload</p>
            </button>
            <div className="mt-4 rounded-2xl bg-[#f8f9fb] p-3 text-[10px] leading-5 text-black/45"><span className="font-black text-black/60">Best results:</span> do not hold the product in your hand. Place, hang or lay it by itself, show the entire item with a little space around it, and use a contrasting background. Central does not redraw or alter logos, colors, or artwork.</div>
            <button type="button" onClick={() => void processImage()} disabled={!file || processing} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3976b7] px-4 py-3 text-xs font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40"><Sparkles className="h-4 w-4" /> {processing ? 'Creating product PNG…' : 'Create 2048 × 2048 PNG'}</button>
            {processMessage && <p className="mt-3 text-[11px] font-bold leading-5 text-black/50">{processMessage}</p>}
          </section>
        </div>

        <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-black/35">Review</p><h2 className="mt-1 text-xl font-black">Before & after</h2></div>{(file || processed) && <button type="button" onClick={reset} className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-[10px] font-black text-black/55"><RefreshCw className="h-3.5 w-3.5" /> Start over</button>}</div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div><p className="mb-2 text-[10px] font-black uppercase tracking-[.14em] text-black/35">Original</p><div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-[#f4f5f7]">{originalUrl ? <img src={originalUrl} alt="Original upload" className="h-full w-full object-contain" /> : <div className="px-8 text-center text-xs font-bold leading-5 text-black/25">Your uploaded photo will appear here.</div>}</div></div>
            <div><p className="mb-2 text-[10px] font-black uppercase tracking-[.14em] text-black/35">Commerce7-ready PNG</p><div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-black/10" style={{ backgroundImage: 'linear-gradient(45deg,#eef0f3 25%,transparent 25%),linear-gradient(-45deg,#eef0f3 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eef0f3 75%),linear-gradient(-45deg,transparent 75%,#eef0f3 75%)', backgroundSize: '24px 24px', backgroundPosition: '0 0,0 12px,12px -12px,-12px 0px' }}>{processing ? <div className="px-8 text-center"><Sparkles className="mx-auto h-7 w-7 animate-pulse text-[#3976b7]" /><p className="mt-3 text-xs font-black text-black/50">Central is removing the background…</p><p className="mt-1 text-[10px] leading-4 text-black/35">A local subject-segmentation model is isolating the product. No paid image API is used.</p></div> : processed ? <img src={processed.url} alt="Processed transparent product" className="h-full w-full object-contain" /> : <div className="px-8 text-center text-xs font-bold leading-5 text-black/25">The transparent 2048 × 2048 result will appear here.</div>}</div></div>
          </div>

          {processed && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2 text-sm font-black text-emerald-900"><Check className="h-4 w-4" /> Ready to review</div><p className="mt-1 text-[11px] font-bold text-emerald-800/70">2048 × 2048 · transparent PNG · local cutout model · no paid API</p></div><button type="button" onClick={() => void downloadRemote(processed.downloadUrl || processed.url, downloadName).catch((error) => setProcessMessage(error instanceof Error ? error.message : 'Unable to download image.'))} className="flex items-center justify-center gap-2 rounded-xl border border-emerald-700/15 bg-white px-4 py-2.5 text-xs font-black text-emerald-900"><Download className="h-4 w-4" /> Download PNG</button></div></div>}

          <div className="mt-6 border-t border-black/10 pt-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-sm font-black">3. Publish to Commerce7 <span className="font-bold text-black/35">(optional)</span></p><p className="mt-1 max-w-2xl text-[11px] leading-5 text-black/45">You can stop after Download PNG. When you are ready to use the image in Commerce7, match a SKU/UPC and Central will ask for confirmation before changing the product.</p></div><button type="button" onClick={() => void publish()} disabled={!selected || !processed || publishing} className="shrink-0 rounded-xl bg-black px-5 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-35">{publishing ? 'Publishing…' : 'Approve & Publish'}</button></div>
            {selected && <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#f8f9fb] p-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">{selected.productImage ? <img src={selected.productImage} alt="Current Commerce7 product" className="h-full w-full object-contain" /> : <Package className="h-5 w-5 text-black/20" />}</div><div className="min-w-0"><p className="truncate text-xs font-black">{selected.productTitle}</p><p className="mt-1 text-[10px] text-black/45">SKU {selected.sku || '—'} · UPC {selected.upc || '—'}</p></div></div>}
            {publishMessage && <p className={`mt-3 rounded-xl px-3 py-2.5 text-[11px] font-bold leading-5 ${/confirmed|accepted|publishing/i.test(publishMessage) ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{publishMessage}</p>}
          </div>
        </section>
      </div>
    </div>
  </div>;
}
