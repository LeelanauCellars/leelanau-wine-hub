'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import LabelStudio from '@/app/components/LabelStudio';
import { SEED_LABELS, type LabelLibraryItem } from '@/lib/labels';

type LibraryResponse = { labels?: LabelLibraryItem[]; canUpload?: boolean; storageConfigured?: boolean; error?: string };

type IconProps = React.SVGProps<SVGSVGElement>;
const Icon = ({ children, ...props }: IconProps) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>;
const UploadIcon = (p: IconProps) => <Icon {...p}><path d="M12 16V4m-4 4 4-4 4 4M5 20h14"/></Icon>;
const SearchIcon = (p: IconProps) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>;
const SparklesIcon = (p: IconProps) => <Icon {...p}><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/></Icon>;
const FileIcon = (p: IconProps) => <Icon {...p}><path d="M6 2h8l4 4v16H6zM14 2v5h5M9 12h6M9 16h6"/></Icon>;
const TrashIcon = (p: IconProps) => <Icon {...p}><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></Icon>;
const PlusIcon = (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;

function slugify(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || `label-${Date.now()}`;
}

function bytes(value?: number) {
  if (!value) return '';
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Labels({ isAdmin }: { isAdmin: boolean }) {
  const [labels, setLabels] = useState<LabelLibraryItem[]>(SEED_LABELS);
  const [activeLabel, setActiveLabel] = useState<LabelLibraryItem | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadVintage, setUploadVintage] = useState('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function loadLabels() {
    setLoading(true);
    try {
      const response = await fetch('/api/labels', { cache: 'no-store' });
      const data = await response.json() as LibraryResponse;
      if (!response.ok) throw new Error(data.error || 'Unable to load labels.');
      if (Array.isArray(data.labels)) setLabels(data.labels);
      if (data.storageConfigured === false) setNotice('Vercel Blob is not connected, so uploaded labels are unavailable. The bundled originals still work.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to load uploaded labels. Bundled originals are still available.');
      setLabels(SEED_LABELS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadLabels(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return labels;
    return labels.filter((label) => `${label.name} ${label.vintage || ''} ${label.files.map((file) => file.name).join(' ')}`.toLowerCase().includes(q));
  }, [labels, query]);

  async function upload() {
    if (!uploadName.trim() || !uploadFiles.length || uploading) return;
    setUploading(true);
    setNotice('');
    try {
      const form = new FormData();
      form.set('name', uploadName.trim());
      form.set('vintage', uploadVintage.trim());
      uploadFiles.forEach((file) => form.append('files', file));
      const response = await fetch('/api/labels', { method: 'POST', body: form });
      const data = await response.json() as { label?: LabelLibraryItem; error?: string };
      if (!response.ok || !data.label) throw new Error(data.error || 'Unable to upload label files.');
      setLabels((current) => [data.label!, ...current]);
      setUploadOpen(false);
      setUploadName('');
      setUploadVintage('');
      setUploadFiles([]);
      setNotice(`${data.label.name} was added to the Label Library.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to upload label files.');
    } finally {
      setUploading(false);
    }
  }

  async function remove(label: LabelLibraryItem) {
    if (label.source !== 'uploaded' || !window.confirm(`Delete ${label.name} and its uploaded files from the Label Library?`)) return;
    try {
      const response = await fetch(`/api/labels?id=${encodeURIComponent(label.id)}`, { method: 'DELETE' });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Unable to delete label.');
      setLabels((current) => current.filter((item) => item.id !== label.id));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to delete label.');
    }
  }

  function blankStudio() {
    const name = window.prompt('Name this label canvas:', 'Untitled Label')?.trim();
    if (!name) return;
    const slug = `${slugify(name)}-${Date.now()}`;
    setActiveLabel({ id: slug, slug, name, source: 'uploaded', files: [] });
  }

  if (activeLabel) return <LabelStudio label={activeLabel} back={() => setActiveLabel(null)} />;

  return <div className="px-5 py-7 md:px-8 lg:px-10 lg:py-10">
    <div className="mx-auto max-w-[1480px]">
      <div className="flex flex-col gap-5 border-b border-black/10 pb-7 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#3976b7]">Creative Library</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-.045em] md:text-5xl">Labels</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-black/50">Keep original label files in one place, then open any label in Studio when you want to experiment without touching the original artwork.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={blankStudio} className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-black shadow-sm hover:bg-black/[.03]"><PlusIcon className="h-4 w-4" /> Blank Studio</button>
          {isAdmin && <button type="button" onClick={() => setUploadOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#3976b7] px-4 py-3 text-xs font-black text-white shadow-sm transition hover:bg-[#2f669f]"><UploadIcon className="h-4 w-4" /> Upload Label Files</button>}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3976b7]/10 text-[#3976b7]"><FileIcon className="h-5 w-5" /></span><div><p className="text-sm font-black">Label Library</p><p className="mt-1 text-xs font-semibold leading-5 text-black/45">Original AI, PDF, PNG, JPG and SVG files live here. The 2024 artwork you attached is already loaded below.</p></div></div>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-5 shadow-sm">
          <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><SparklesIcon className="h-5 w-5" /></span><div><p className="text-sm font-black">Label Studio + Vector Trace</p><p className="mt-1 text-xs font-semibold leading-5 text-black/50">Open a sandbox copy, edit layers with Gemini, or trace a PNG/JPG into SVG vector artwork. The original library file stays untouched.</p></div></div>
        </div>
      </div>

      {notice && <div className="mt-5 rounded-xl border border-[#3976b7]/15 bg-[#f5f9fd] px-4 py-3 text-xs font-semibold text-black/55">{notice}</div>}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md"><SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search label library…" className="w-full rounded-xl border border-black/10 bg-white py-3 pl-10 pr-4 text-sm font-semibold outline-none focus:border-[#3976b7]/40" /></div>
        <p className="text-xs font-black text-black/35">{loading ? 'Loading…' : `${filtered.length} label${filtered.length === 1 ? '' : 's'}`}</p>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((label) => {
          const pdf = label.files.find((file) => file.kind === 'pdf');
          const ai = label.files.find((file) => file.kind === 'ai');
          return <article key={label.id} className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <button type="button" onClick={() => setActiveLabel(label)} className="block w-full text-left">
              <div className="relative flex h-[250px] items-center justify-center overflow-hidden bg-[#f4f4f2] p-5">
                {label.preview ? <div className={`flex h-full w-full items-center justify-center gap-2 ${label.previewBack ? '' : 'max-w-[190px]'}`}><img src={label.preview} alt={`${label.name} front label preview`} className="min-w-0 h-full flex-1 object-contain transition duration-300 group-hover:scale-[1.015]" />{label.previewBack && <img src={label.previewBack} alt={`${label.name} back label preview`} className="min-w-0 h-full flex-1 object-contain transition duration-300 group-hover:scale-[1.015]" />}</div> : <div className="flex h-28 w-24 items-center justify-center rounded-xl border border-black/10 bg-white text-black/25 shadow-sm"><FileIcon className="h-9 w-9" /></div>}
                <div className="absolute left-3 top-3 flex gap-1.5"><span className="rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.08em] text-black/55 shadow-sm">{label.source === 'bundled' ? 'Original' : 'Uploaded'}</span>{label.vintage && <span className="rounded-full bg-black/75 px-2.5 py-1 text-[9px] font-black text-white shadow-sm">{label.vintage}</span>}</div>
              </div>
              <div className="p-4 pb-3"><h2 className="text-lg font-black tracking-[-.025em]">{label.name}</h2><div className="mt-2 flex flex-wrap gap-1.5">{label.files.map((file) => <span key={file.url} className="rounded-md bg-[#f1f3f5] px-2 py-1 text-[9px] font-black uppercase tracking-[.08em] text-black/45">{file.kind}{file.size ? ` · ${bytes(file.size)}` : ''}</span>)}</div></div>
            </button>
            <div className="flex flex-wrap items-center gap-2 border-t border-black/8 px-4 py-3">
              <button type="button" onClick={() => setActiveLabel(label)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#3976b7] px-3 py-2 text-[10px] font-black text-white"><SparklesIcon className="h-3.5 w-3.5" /> Open Studio</button>
              {pdf && <a href={pdf.url} target="_blank" rel="noreferrer" className="rounded-lg border border-black/10 px-3 py-2 text-[10px] font-black text-black/60 hover:bg-black/[.03]">View PDF</a>}
              {ai && <a href={ai.downloadUrl || ai.url} download={ai.name} className="rounded-lg border border-black/10 px-3 py-2 text-[10px] font-black text-black/60 hover:bg-black/[.03]">AI File</a>}
              {isAdmin && label.source === 'uploaded' && <button type="button" onClick={() => void remove(label)} className="ml-auto rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label={`Delete ${label.name}`}><TrashIcon className="h-4 w-4" /></button>}
            </div>
          </article>;
        })}
      </div>

      {!filtered.length && <div className="mt-6 rounded-2xl border border-dashed border-black/15 bg-white p-10 text-center"><p className="text-sm font-black">No labels found.</p><p className="mt-1 text-xs font-semibold text-black/40">Try another search or upload a new label package.</p></div>}
    </div>

    {uploadOpen && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]">
      <button type="button" onClick={() => !uploading && setUploadOpen(false)} className="absolute inset-0" aria-label="Close upload" />
      <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.15em] text-[#3976b7]">Label Library</p><h2 className="mt-1 text-2xl font-black tracking-[-.03em]">Upload label files</h2><p className="mt-2 text-xs font-semibold leading-5 text-black/45">Group the related originals under one label entry. You can include AI, PDF, PNG, JPG or SVG files.</p></div><button type="button" onClick={() => !uploading && setUploadOpen(false)} className="rounded-lg px-2 py-1 text-lg font-black text-black/30 hover:bg-black/[.04]">×</button></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_120px]"><label><span className="mb-1 block text-[10px] font-black text-black/45">Label name</span><input value={uploadName} onChange={(event) => setUploadName(event.target.value)} placeholder="e.g. Estate Chardonnay" className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#3976b7]/40" /></label><label><span className="mb-1 block text-[10px] font-black text-black/45">Vintage</span><input value={uploadVintage} onChange={(event) => setUploadVintage(event.target.value)} placeholder="2024" className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#3976b7]/40" /></label></div>
        <button type="button" onClick={() => fileRef.current?.click()} className="mt-4 flex min-h-28 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/10 bg-[#fafafa] p-5 text-center hover:border-[#3976b7]/30 hover:bg-[#f7fbff]"><UploadIcon className="h-6 w-6 text-[#3976b7]"/><p className="mt-2 text-xs font-black">Choose label files</p><p className="mt-1 text-[10px] font-semibold text-black/35">AI · PDF · PNG · JPG · SVG · up to 25 MB each</p></button>
        <input ref={fileRef} type="file" multiple accept=".ai,.pdf,.png,.jpg,.jpeg,.svg,application/pdf,image/png,image/jpeg,image/svg+xml" className="hidden" onChange={(event) => setUploadFiles(Array.from(event.target.files || []).slice(0, 8))} />
        {uploadFiles.length > 0 && <div className="mt-3 space-y-1.5 rounded-xl bg-[#f7f8fa] p-3">{uploadFiles.map((file) => <div key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 text-[10px] font-semibold"><span className="truncate">{file.name}</span><span className="shrink-0 text-black/35">{bytes(file.size)}</span></div>)}</div>}
        <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setUploadOpen(false)} disabled={uploading} className="rounded-xl border border-black/10 px-4 py-2.5 text-xs font-black disabled:opacity-40">Cancel</button><button type="button" onClick={() => void upload()} disabled={!uploadName.trim() || !uploadFiles.length || uploading} className="rounded-xl bg-[#3976b7] px-5 py-2.5 text-xs font-black text-white disabled:opacity-40">{uploading ? 'Uploading…' : 'Add to Library'}</button></div>
      </div>
    </div>}
  </div>;
}
