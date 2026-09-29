'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { LabelLibraryItem } from '@/lib/labels';
import {
  createStarterLabelDocument,
  sanitizeLabelLayer,
  type LabelDocument,
  type LabelLayer,
  type LabelStudioAssistResponse,
  type LabelStudioOperation,
} from '@/lib/label-studio';

type StudioVersion = {
  id: string;
  name: string;
  createdAt: string;
  document: LabelDocument;
};

type DragState = {
  mode: 'move' | 'resize';
  layerId: string;
  startX: number;
  startY: number;
  base: LabelLayer;
  before: LabelDocument;
} | null;

const cloneDoc = (doc: LabelDocument): LabelDocument => JSON.parse(JSON.stringify(doc)) as LabelDocument;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const num = (value: string, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function xmlEscape(value = '') {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function normalizeVectorSvg(svg = '') {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+=("[^"]*"|'[^']*')/gi, '')
    .replace(/<svg\b([^>]*)>/i, (match, attrs) => {
      const cleaned = String(attrs).replace(/\s(width|height)=(["'])[^"']*\2/gi, '');
      return `<svg${cleaned} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">`;
    });
}

function sizedVectorSvg(svg: string, width: number, height: number) {
  return normalizeVectorSvg(svg).replace(/<svg\b([^>]*)>/i, (_match, attrs) => {
    const cleaned = String(attrs)
      .replace(/\s(width|height)=(["'])[^"']*\2/gi, '')
      .replace(/\spreserveAspectRatio=(["'])[^"']*\1/gi, '');
    return `<svg${cleaned} width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet">`;
  });
}

async function downscaleRasterDataUrl(dataUrl: string, maxDimension = 1200) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not prepare that image for tracing.'));
    img.src = dataUrl;
  });
  const largest = Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height);
  if (!largest || largest <= maxDimension) return dataUrl;
  const scale = maxDimension / largest;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
  canvas.height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
  const context = canvas.getContext('2d');
  if (!context) return dataUrl;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

function downloadText(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function documentSvg(doc: LabelDocument) {
  const parts = doc.layers.filter((layer) => layer.visible).map((layer) => {
    const transform = `translate(${layer.x} ${layer.y}) rotate(${layer.rotation} ${layer.width / 2} ${layer.height / 2})`;
    if (layer.type === 'shape') {
      return `<g transform="${transform}" opacity="${layer.opacity}"><rect x="0" y="0" width="${layer.width}" height="${layer.height}" rx="${layer.radius || 0}" fill="${xmlEscape(layer.fill || 'transparent')}" stroke="${xmlEscape(layer.stroke || 'transparent')}" stroke-width="${layer.strokeWidth || 0}" /></g>`;
    }
    if (layer.type === 'image') {
      const preserve = layer.fit === 'fill' ? 'none' : layer.fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet';
      return `<g transform="${transform}" opacity="${layer.opacity}"><image href="${xmlEscape(layer.src || '')}" width="${layer.width}" height="${layer.height}" preserveAspectRatio="${preserve}" /></g>`;
    }
    if (layer.type === 'vector') {
      const vector = sizedVectorSvg(layer.svg || '', layer.width, layer.height);
      return `<g transform="${transform}" opacity="${layer.opacity}">${vector}</g>`;
    }
    const lines = (layer.text || '').split('\n');
    const fontSize = layer.fontSize || 48;
    const anchor = layer.align === 'left' ? 'start' : layer.align === 'right' ? 'end' : 'middle';
    const x = layer.align === 'left' ? 0 : layer.align === 'right' ? layer.width : layer.width / 2;
    const lineHeight = fontSize * 1.05;
    const top = Math.max(fontSize, (layer.height - lineHeight * Math.max(1, lines.length)) / 2 + fontSize);
    return `<g transform="${transform}" opacity="${layer.opacity}"><text x="${x}" y="${top}" text-anchor="${anchor}" fill="${xmlEscape(layer.color || '#111111')}" font-family="${xmlEscape(layer.fontFamily || 'Arial, Helvetica, sans-serif')}" font-size="${fontSize}" font-weight="${layer.fontWeight || 700}" letter-spacing="${layer.letterSpacing || 0}">${lines.map((line, index) => `<tspan x="${x}" dy="${index ? lineHeight : 0}">${xmlEscape(line)}</tspan>`).join('')}</text></g>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${doc.width}" height="${doc.height}" viewBox="0 0 ${doc.width} ${doc.height}"><rect width="100%" height="100%" fill="${xmlEscape(doc.background)}"/>${parts.join('')}</svg>`;
}

function Icon({ children, className = 'h-4 w-4' }: { children: React.ReactNode; className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{children}</svg>;
}

const EyeIcon = ({ off = false }: { off?: boolean }) => <Icon>{off ? <><path d="m3 3 18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5.5 0 9 8 9 8a16.5 16.5 0 0 1-2 3.1M6.6 6.6C4.2 8.3 3 12 3 12s3.5 8 9 8a9.7 9.7 0 0 0 4-.9"/></> : <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>}</Icon>;
const LockIcon = ({ locked = false }: { locked?: boolean }) => <Icon>{locked ? <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></> : <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 7-2.6"/></>}</Icon>;
const SparkleIcon = () => <Icon><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4z"/><path d="M19 15v5M16.5 17.5h5"/></Icon>;

function starterDocument(label: LabelLibraryItem): LabelDocument {
  const starter = createStarterLabelDocument(label.slug, label.name);
  if (!label.preview) return starter;
  const reference: LabelLayer = {
    id: 'project-reference', name: 'Original Label Reference', type: 'image', visible: true, locked: true,
    x: 25, y: 25, width: 950, height: 1350, rotation: 0, opacity: 0.28, src: label.preview, fit: 'contain',
  };
  return { ...starter, layers: [starter.layers[0], reference, ...starter.layers.slice(1)] };
}

export default function LabelStudio({ label, back }: { label: LabelLibraryItem; back: () => void }) {
  const storageKey = `lwc-label-studio-v2:${label.slug}`;
  const versionsKey = `lwc-label-studio-versions-v2:${label.slug}`;
  const [doc, setDoc] = useState<LabelDocument>(() => starterDocument(label));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<LabelDocument[]>([]);
  const [redoStack, setRedoStack] = useState<LabelDocument[]>([]);
  const [versions, setVersions] = useState<StudioVersion[]>([]);
  const [drag, setDrag] = useState<DragState>(null);
  const [hydrated, setHydrated] = useState(false);
  const [assistantText, setAssistantText] = useState('');
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState('Select a layer or describe the change you want. Gemini will edit the layered label, not redraw the whole design.');
  const [assistantMeta, setAssistantMeta] = useState('Gemini ready');
  const [showVersions, setShowVersions] = useState(false);
  const [zoom, setZoom] = useState(58);
  const artboardRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const traceInputRef = useRef<HTMLInputElement | null>(null);
  const [vectorizing, setVectorizing] = useState(false);

  const selected = useMemo(() => doc.layers.find((layer) => layer.id === selectedId) || null, [doc.layers, selectedId]);
  const referenceSrc = label.preview || label.previewBack || label.files.find((file) => file.kind === 'png' || file.kind === 'jpg' || file.kind === 'svg')?.url || '';

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as LabelDocument;
        if (parsed?.projectSlug === label.slug && Array.isArray(parsed.layers)) setDoc(parsed);
      }
      const savedVersions = window.localStorage.getItem(versionsKey);
      if (savedVersions) setVersions((JSON.parse(savedVersions) as StudioVersion[]).slice(0, 20));
    } catch (error) {
      console.warn('Unable to restore Label Studio document', error);
    }
    setHydrated(true);
  }, [label.slug, storageKey, versionsKey]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(doc));
  }, [doc, hydrated, storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(versionsKey, JSON.stringify(versions.slice(0, 20)));
  }, [versions, hydrated, versionsKey]);

  useEffect(() => {
    if (!drag) return;
    const move = (event: PointerEvent) => {
      const rect = artboardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const scale = rect.width / doc.width;
      const dx = (event.clientX - drag.startX) / scale;
      const dy = (event.clientY - drag.startY) / scale;
      setDoc((current) => ({
        ...current,
        updatedAt: new Date().toISOString(),
        layers: current.layers.map((layer) => {
          if (layer.id !== drag.layerId) return layer;
          if (drag.mode === 'move') return { ...layer, x: Math.round(drag.base.x + dx), y: Math.round(drag.base.y + dy) };
          return {
            ...layer,
            width: Math.round(clamp(drag.base.width + dx, 20, doc.width * 2)),
            height: Math.round(clamp(drag.base.height + dy, 20, doc.height * 2)),
          };
        }),
      }));
    };
    const up = () => {
      setUndoStack((stack) => [...stack.slice(-39), drag.before]);
      setRedoStack([]);
      setDrag(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [drag, doc.width, doc.height]);

  function commit(mutator: (current: LabelDocument) => LabelDocument) {
    setDoc((current) => {
      const before = cloneDoc(current);
      const next = mutator(cloneDoc(current));
      next.updatedAt = new Date().toISOString();
      setUndoStack((stack) => [...stack.slice(-39), before]);
      setRedoStack([]);
      return next;
    });
  }

  function updateSelected(changes: Partial<LabelLayer>) {
    if (!selected) return;
    commit((current) => ({ ...current, layers: current.layers.map((layer) => layer.id === selected.id ? ({ ...layer, ...changes } as LabelLayer) : layer) }));
  }

  function addText() {
    const id = `text-${Date.now()}`;
    const layer: LabelLayer = {
      id, name: 'New Text', type: 'text', visible: true, locked: false,
      x: 160, y: 560, width: 680, height: 120, rotation: 0, opacity: 1,
      text: 'NEW TEXT', fontSize: 72, fontWeight: 800, fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: 0, align: 'center', color: '#111111',
    };
    commit((current) => ({ ...current, layers: [...current.layers, layer] }));
    setSelectedId(id);
  }

  function addShape() {
    const id = `shape-${Date.now()}`;
    const layer: LabelLayer = {
      id, name: 'New Shape', type: 'shape', visible: true, locked: false,
      x: 180, y: 500, width: 640, height: 260, rotation: 0, opacity: 1,
      fill: '#d54231', stroke: '#d54231', strokeWidth: 0, radius: 24,
    };
    commit((current) => ({ ...current, layers: [...current.layers, layer] }));
    setSelectedId(id);
  }

  function addReference() {
    const existing = doc.layers.find((layer) => layer.id === 'project-reference');
    if (existing) {
      setSelectedId(existing.id);
      return;
    }
    const layer: LabelLayer = {
      id: 'project-reference', name: 'Original Label Reference', type: 'image', visible: true, locked: true,
      x: 40, y: 40, width: 920, height: 1320, rotation: 0, opacity: 0.32, src: referenceSrc, fit: 'contain',
    };
    commit((current) => ({ ...current, layers: [current.layers[0], layer, ...current.layers.slice(1)] }));
    setSelectedId(layer.id);
  }

  function uploadImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAssistantMessage('Import PNG, JPG, WEBP or SVG artwork here. PDF and Illustrator originals remain available in the Labels library.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const id = `image-${Date.now()}`;
      const layer: LabelLayer = {
        id, name: file.name.replace(/\.[^.]+$/, '') || 'Imported Artwork', type: 'image', visible: true, locked: false,
        x: 100, y: 100, width: 800, height: 1200, rotation: 0, opacity: 1, src: String(reader.result || ''), fit: 'contain',
      };
      commit((current) => ({ ...current, layers: [...current.layers, layer] }));
      setSelectedId(id);
    };
    reader.readAsDataURL(file);
  }

  async function vectorizeSource(source: string, name: string) {
    if (vectorizing) return;
    setVectorizing(true);
    setAssistantMessage(`Tracing ${name} into SVG paths…`);
    try {
      const { imageTracer } = await import('imagetracer');
      const svg = await imageTracer.imageToSVG(source, {
        ltres: 1, qtres: 1, pathomit: 4, rightangleenhance: true,
        colorsampling: 2, numberofcolors: 24, mincolorratio: 0, colorquantcycles: 3,
        layering: 0, strokewidth: 0, scale: 1, roundcoords: 2, viewbox: true,
      });
      const id = `vector-${Date.now()}`;
      const layer: LabelLayer = {
        id, name: `${name.replace(/\.[^.]+$/, '') || 'Artwork'} · Vector Trace`, type: 'vector', visible: true, locked: false,
        x: 100, y: 100, width: 800, height: 1200, rotation: 0, opacity: 1, svg: normalizeVectorSvg(svg),
      };
      commit((current) => ({ ...current, layers: [...current.layers, layer] }));
      setSelectedId(id);
      setAssistantMessage('Vector trace added. It stays resolution-independent when you resize or export the label. Text in a flattened image is traced as vector outlines, not recovered as editable font text.');
      setAssistantMeta('Vector Trace · beta');
    } catch (error) {
      setAssistantMessage(error instanceof Error ? error.message : 'Unable to vectorize that image.');
      setAssistantMeta('Vector Trace failed');
    } finally {
      setVectorizing(false);
    }
  }

  async function vectorizeImage(file?: File) {
    if (!file || vectorizing) return;
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      setAssistantMessage('Vector Trace works with PNG, JPG and WEBP files. SVG files are already vector artwork.');
      return;
    }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Could not read that image.'));
        reader.readAsDataURL(file);
      });
      await vectorizeSource(await downscaleRasterDataUrl(dataUrl), file.name);
    } catch (error) {
      setAssistantMessage(error instanceof Error ? error.message : 'Unable to read that image.');
    }
  }


  function deleteSelected() {
    if (!selected || selected.locked) return;
    commit((current) => ({ ...current, layers: current.layers.filter((layer) => layer.id !== selected.id) }));
    setSelectedId(null);
  }

  function duplicateSelected() {
    if (!selected) return;
    const copy = { ...selected, id: `${selected.id}-copy-${Date.now()}`, name: `${selected.name} Copy`, x: selected.x + 28, y: selected.y + 28, locked: false };
    commit((current) => ({ ...current, layers: [...current.layers, copy] }));
    setSelectedId(copy.id);
  }

  function moveLayer(id: string, direction: 'front' | 'back' | 'forward' | 'backward') {
    commit((current) => {
      const layers = [...current.layers];
      const index = layers.findIndex((layer) => layer.id === id);
      if (index < 0) return current;
      const [item] = layers.splice(index, 1);
      if (direction === 'front') layers.push(item);
      else if (direction === 'back') layers.unshift(item);
      else if (direction === 'forward') layers.splice(Math.min(layers.length, index + 1), 0, item);
      else layers.splice(Math.max(0, index - 1), 0, item);
      return { ...current, layers };
    });
  }

  function undo() {
    const previous = undoStack[undoStack.length - 1];
    if (!previous) return;
    setRedoStack((stack) => [...stack.slice(-39), cloneDoc(doc)]);
    setUndoStack((stack) => stack.slice(0, -1));
    setDoc(cloneDoc(previous));
  }

  function redo() {
    const next = redoStack[redoStack.length - 1];
    if (!next) return;
    setUndoStack((stack) => [...stack.slice(-39), cloneDoc(doc)]);
    setRedoStack((stack) => stack.slice(0, -1));
    setDoc(cloneDoc(next));
  }

  function saveVersion() {
    const snapshot: StudioVersion = {
      id: `v-${Date.now()}`,
      name: `${label.name} · Version ${versions.length + 1}`,
      createdAt: new Date().toISOString(),
      document: cloneDoc(doc),
    };
    setVersions((current) => [snapshot, ...current].slice(0, 20));
    setShowVersions(true);
    setAssistantMessage(`Saved ${snapshot.name}. You can restore it from Versions.`);
  }

  function restoreVersion(version: StudioVersion) {
    setUndoStack((stack) => [...stack.slice(-39), cloneDoc(doc)]);
    setRedoStack([]);
    setDoc(cloneDoc(version.document));
    setSelectedId(null);
    setShowVersions(false);
  }

  function resetDocument() {
    if (!window.confirm('Reset this Label Studio document to the starter canvas? Your saved Versions will remain available.')) return;
    setUndoStack((stack) => [...stack.slice(-39), cloneDoc(doc)]);
    setRedoStack([]);
    setDoc(starterDocument(label));
    setSelectedId(null);
  }

  function applyOperations(operations: LabelStudioOperation[]) {
    if (!operations.length) return;
    commit((current) => {
      let layers = [...current.layers];
      for (const operation of operations.slice(0, 20)) {
        if (operation.type === 'update') {
          layers = layers.map((layer) => {
            if (layer.id !== operation.layerId || layer.locked) return layer;
            const safe = sanitizeLabelLayer({ ...layer, ...operation.changes, id: layer.id, type: layer.type });
            return safe || layer;
          });
          continue;
        }
        if (operation.type === 'add-text' || operation.type === 'add-shape') {
          const safe = sanitizeLabelLayer(operation.layer);
          if (safe && safe.type === (operation.type === 'add-text' ? 'text' : 'shape')) layers.push({ ...safe, id: `${safe.id}-${Date.now()}-${layers.length}` });
          continue;
        }
        if (operation.type === 'delete') {
          layers = layers.filter((layer) => layer.id !== operation.layerId || layer.locked);
          continue;
        }
        if (operation.type === 'duplicate') {
          const source = layers.find((layer) => layer.id === operation.layerId);
          if (source) layers.push({ ...source, id: `${source.id}-ai-copy-${Date.now()}-${layers.length}`, name: `${source.name} Copy`, x: source.x + 24, y: source.y + 24, locked: false });
          continue;
        }
        if (operation.type === 'move-layer') {
          const index = layers.findIndex((layer) => layer.id === operation.layerId);
          if (index < 0) continue;
          const [item] = layers.splice(index, 1);
          if (operation.direction === 'front') layers.push(item);
          else if (operation.direction === 'back') layers.unshift(item);
          else if (operation.direction === 'forward') layers.splice(Math.min(layers.length, index + 1), 0, item);
          else layers.splice(Math.max(0, index - 1), 0, item);
        }
      }
      return { ...current, layers };
    });
  }

  async function askGemini(text = assistantText) {
    const prompt = text.trim();
    if (!prompt || assistantBusy) return;
    setAssistantBusy(true);
    setAssistantMessage('Working on the label…');
    try {
      const response = await fetch('/api/label-studio/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, project: { slug: label.slug, name: label.name }, document: doc, selectedLayerId: selectedId }),
      });
      const data = await response.json() as LabelStudioAssistResponse & { error?: string; hint?: string };
      if (!response.ok) throw new Error(data.error || data.hint || 'Label Assistant could not complete that edit.');
      applyOperations(Array.isArray(data.operations) ? data.operations : []);
      setAssistantMessage(data.message || 'Applied the requested edit.');
      setAssistantMeta(data.provider === 'google-gemini' ? `Gemini · ${data.model || 'model'}` : data.degraded ? 'Local edit fallback' : 'Label Assistant');
      setAssistantText('');
    } catch (error) {
      setAssistantMessage(error instanceof Error ? error.message : 'Label Assistant could not complete that edit.');
      setAssistantMeta('Edit not applied');
    } finally {
      setAssistantBusy(false);
    }
  }

  const renderScale = zoom / 100;

  return <div className="label-studio min-h-[calc(100vh-4rem)] bg-[#eef1f4] text-[#151515]">
    <div className="no-print sticky top-0 z-30 flex min-h-16 flex-wrap items-center gap-2 border-b border-black/10 bg-white px-4 py-2 shadow-sm">
      <button type="button" onClick={back} className="mr-1 rounded-lg border border-black/10 px-3 py-2 text-xs font-black hover:bg-black/[.04]">← Labels</button>
      <div className="mr-auto min-w-[190px]"><p className="text-[9px] font-black uppercase tracking-[.15em] text-[#3976b7]">Label Studio · Prototype</p><h1 className="truncate text-sm font-black">{label.name}</h1></div>
      <button type="button" onClick={undo} disabled={!undoStack.length} className="rounded-lg border border-black/10 px-3 py-2 text-xs font-black disabled:opacity-30">Undo</button>
      <button type="button" onClick={redo} disabled={!redoStack.length} className="rounded-lg border border-black/10 px-3 py-2 text-xs font-black disabled:opacity-30">Redo</button>
      <button type="button" onClick={saveVersion} className="rounded-lg border border-black/10 px-3 py-2 text-xs font-black hover:bg-black/[.04]">Save Version</button>
      <button type="button" onClick={() => setShowVersions((value) => !value)} className="rounded-lg border border-black/10 px-3 py-2 text-xs font-black hover:bg-black/[.04]">Versions {versions.length ? `(${versions.length})` : ''}</button>
      <button type="button" onClick={() => downloadText(`${label.slug}-label-studio.json`, JSON.stringify(doc, null, 2), 'application/json')} className="rounded-lg border border-black/10 px-3 py-2 text-xs font-black hover:bg-black/[.04]">JSON</button>
      <button type="button" onClick={() => downloadText(`${label.slug}-label.svg`, documentSvg(doc), 'image/svg+xml')} className="rounded-lg bg-[#3976b7] px-3 py-2 text-xs font-black text-white shadow-sm hover:bg-[#2f669f]">Export SVG</button>
    </div>

    {showVersions && <div className="no-print absolute right-4 top-[74px] z-40 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-black/10 bg-white p-3 shadow-2xl">
      <div className="mb-2 flex items-center justify-between"><div><p className="text-xs font-black">Versions</p><p className="text-[10px] font-semibold text-black/40">Saved in this browser for now.</p></div><button onClick={() => setShowVersions(false)} className="rounded-lg px-2 py-1 text-sm font-black text-black/40 hover:bg-black/[.04]">×</button></div>
      <div className="max-h-[420px] space-y-2 overflow-y-auto">
        {versions.length ? versions.map((version) => <button type="button" key={version.id} onClick={() => restoreVersion(version)} className="w-full rounded-xl border border-black/10 p-3 text-left hover:border-[#3976b7]/35 hover:bg-[#f7fbff]"><p className="text-xs font-black">{version.name}</p><p className="mt-1 text-[10px] font-semibold text-black/40">{new Date(version.createdAt).toLocaleString()}</p></button>) : <div className="rounded-xl bg-[#f7f8fa] p-4 text-center text-xs font-semibold text-black/45">No saved versions yet.</div>}
      </div>
    </div>}

    <div className="grid min-h-[calc(100vh-8rem)] xl:grid-cols-[260px_minmax(540px,1fr)_360px]">
      <aside className="no-print border-r border-black/10 bg-white p-3">
        <div className="mb-3 flex items-center justify-between px-1"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-black/35">Layers</p><p className="text-xs font-black">{doc.layers.length} objects</p></div><button onClick={resetDocument} className="text-[10px] font-black text-black/35 hover:text-black">Reset</button></div>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <button onClick={addText} className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-xs font-black hover:bg-[#f7f8fa]">+ Text</button>
          <button onClick={addShape} className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-xs font-black hover:bg-[#f7f8fa]">+ Shape</button>
          <button onClick={() => fileInputRef.current?.click()} className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-xs font-black hover:bg-[#f7f8fa]">+ Artwork</button>
          <button onClick={addReference} disabled={!referenceSrc} className="rounded-xl border border-[#3976b7]/20 bg-[#f3f8fd] px-3 py-2.5 text-xs font-black text-[#3976b7] hover:bg-[#eaf3fb] disabled:opacity-35">Reference</button>
          <button onClick={() => traceInputRef.current?.click()} disabled={vectorizing} className="col-span-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-xs font-black text-violet-700 hover:bg-violet-100 disabled:opacity-40">{vectorizing ? 'Tracing…' : 'Vector Trace PNG/JPG → SVG'}</button>
          {referenceSrc && <button onClick={() => void vectorizeSource(referenceSrc, `${label.name} original`)} disabled={vectorizing} className="col-span-2 rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-xs font-black text-violet-700 hover:bg-violet-50 disabled:opacity-40">Trace Original Preview → SVG</button>}
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={(event) => { uploadImage(event.target.files?.[0]); event.currentTarget.value = ''; }} />
          <input ref={traceInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => { void vectorizeImage(event.target.files?.[0]); event.currentTarget.value = ''; }} />
        </div>
        <div className="space-y-1.5">
          {[...doc.layers].reverse().map((layer) => <div key={layer.id} className={`group flex items-center gap-1.5 rounded-xl border px-2 py-2 ${selectedId === layer.id ? 'border-[#3976b7]/45 bg-[#eef6fd]' : 'border-transparent hover:border-black/10 hover:bg-[#f7f8fa]'}`}>
            <button type="button" onClick={() => commit((current) => ({ ...current, layers: current.layers.map((item) => item.id === layer.id ? { ...item, visible: !item.visible } : item) }))} className="rounded-md p-1 text-black/35 hover:bg-white hover:text-black" title={layer.visible ? 'Hide layer' : 'Show layer'}><EyeIcon off={!layer.visible} /></button>
            <button type="button" onClick={() => setSelectedId(layer.id)} className="min-w-0 flex-1 text-left"><p className="truncate text-[11px] font-black">{layer.name}</p><p className="text-[9px] font-bold uppercase tracking-[.08em] text-black/30">{layer.type}</p></button>
            <button type="button" onClick={() => commit((current) => ({ ...current, layers: current.layers.map((item) => item.id === layer.id ? { ...item, locked: !item.locked } : item) }))} className="rounded-md p-1 text-black/30 hover:bg-white hover:text-black" title={layer.locked ? 'Unlock layer' : 'Lock layer'}><LockIcon locked={layer.locked} /></button>
          </div>)}
        </div>
      </aside>

      <section className="relative flex min-h-[760px] flex-col overflow-hidden bg-[#dfe4e9]">
        <div className="no-print flex min-h-11 items-center justify-between gap-3 border-b border-black/10 bg-[#f8f9fa] px-4">
          <p className="text-[10px] font-black uppercase tracking-[.12em] text-black/35">{doc.width} × {doc.height} px · Layered document</p>
          <div className="flex items-center gap-2 text-[10px] font-black text-black/45"><span>Zoom</span><input aria-label="Zoom" type="range" min="35" max="90" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /><span className="w-9 text-right">{zoom}%</span></div>
        </div>
        <div className="flex flex-1 items-center justify-center overflow-auto p-8 md:p-12" onPointerDown={() => setSelectedId(null)}>
          <div
            ref={artboardRef}
            className="relative shrink-0 overflow-hidden bg-white shadow-[0_20px_60px_rgba(0,0,0,.18)] ring-1 ring-black/10"
            style={{ width: `${doc.width * renderScale}px`, height: `${doc.height * renderScale}px`, background: doc.background }}
          >
            {doc.layers.map((layer) => {
              if (!layer.visible) return null;
              const scale = renderScale;
              const style: React.CSSProperties = {
                position: 'absolute',
                left: layer.x * scale,
                top: layer.y * scale,
                width: layer.width * scale,
                height: layer.height * scale,
                transform: `rotate(${layer.rotation}deg)`,
                transformOrigin: 'center center',
                opacity: layer.opacity,
                cursor: layer.locked ? 'default' : 'move',
                userSelect: 'none',
                touchAction: 'none',
              };
              return <div
                key={layer.id}
                style={style}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  setSelectedId(layer.id);
                  if (layer.locked) return;
                  event.currentTarget.setPointerCapture?.(event.pointerId);
                  setDrag({ mode: 'move', layerId: layer.id, startX: event.clientX, startY: event.clientY, base: { ...layer }, before: cloneDoc(doc) });
                }}
                className={`${selectedId === layer.id ? 'outline outline-2 outline-[#3976b7] outline-offset-[-1px]' : ''}`}
              >
                {layer.type === 'shape' && <div className="h-full w-full" style={{ background: layer.fill, border: `${(layer.strokeWidth || 0) * scale}px solid ${layer.stroke || 'transparent'}`, borderRadius: `${(layer.radius || 0) * scale}px` }} />}
                {layer.type === 'image' && <img src={layer.src || ''} alt="" draggable={false} className="h-full w-full pointer-events-none" style={{ objectFit: layer.fit || 'contain' }} />}
                {layer.type === 'vector' && <div className="h-full w-full pointer-events-none [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: normalizeVectorSvg(layer.svg || '') }} />}
                {layer.type === 'text' && <div className="flex h-full w-full whitespace-pre-line" style={{ alignItems: 'center', justifyContent: layer.align === 'left' ? 'flex-start' : layer.align === 'right' ? 'flex-end' : 'center', textAlign: layer.align || 'center', color: layer.color || '#111', fontSize: `${(layer.fontSize || 48) * scale}px`, fontWeight: layer.fontWeight || 700, fontFamily: layer.fontFamily || 'Arial, Helvetica, sans-serif', letterSpacing: `${(layer.letterSpacing || 0) * scale}px`, lineHeight: .95 }}>{layer.text}</div>}
                {selectedId === layer.id && !layer.locked && <button
                  type="button"
                  aria-label="Resize selected layer"
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    setDrag({ mode: 'resize', layerId: layer.id, startX: event.clientX, startY: event.clientY, base: { ...layer }, before: cloneDoc(doc) });
                  }}
                  className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#3976b7] shadow"
                />}
              </div>;
            })}
          </div>
        </div>
      </section>

      <aside className="no-print border-l border-black/10 bg-white">
        <div className="border-b border-black/10 p-4">
          <div className="mb-3 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-black/35">Properties</p><p className="text-xs font-black">{selected?.name || 'No layer selected'}</p></div>{selected && <span className="rounded-full bg-[#f1f3f5] px-2 py-1 text-[9px] font-black uppercase tracking-[.1em] text-black/45">{selected.type}</span>}</div>
          {selected ? <div className="space-y-3">
            <label className="block"><span className="mb-1 block text-[10px] font-black text-black/45">Layer name</span><input value={selected.name} onChange={(event) => updateSelected({ name: event.target.value })} className="w-full rounded-lg border border-black/10 px-2.5 py-2 text-xs font-semibold outline-none focus:border-[#3976b7]/50" /></label>
            <div className="grid grid-cols-2 gap-2">
              {(['x','y','width','height'] as const).map((key) => <label key={key}><span className="mb-1 block text-[9px] font-black uppercase tracking-[.08em] text-black/35">{key}</span><input type="number" value={Math.round(selected[key])} onChange={(event) => updateSelected({ [key]: num(event.target.value, selected[key]) } as Partial<LabelLayer>)} className="w-full rounded-lg border border-black/10 px-2.5 py-2 text-xs font-semibold" /></label>)}
            </div>
            <div className="grid grid-cols-2 gap-2"><label><span className="mb-1 block text-[9px] font-black uppercase tracking-[.08em] text-black/35">Rotation</span><input type="number" value={selected.rotation} onChange={(event) => updateSelected({ rotation: num(event.target.value) })} className="w-full rounded-lg border border-black/10 px-2.5 py-2 text-xs font-semibold" /></label><label><span className="mb-1 block text-[9px] font-black uppercase tracking-[.08em] text-black/35">Opacity</span><input type="number" min="0" max="1" step=".05" value={selected.opacity} onChange={(event) => updateSelected({ opacity: clamp(num(event.target.value, 1), 0, 1) })} className="w-full rounded-lg border border-black/10 px-2.5 py-2 text-xs font-semibold" /></label></div>
            {selected.type === 'text' && <>
              <label className="block"><span className="mb-1 block text-[10px] font-black text-black/45">Text</span><textarea value={selected.text || ''} onChange={(event) => updateSelected({ text: event.target.value })} rows={3} className="w-full resize-none rounded-lg border border-black/10 px-2.5 py-2 text-xs font-semibold" /></label>
              <div className="grid grid-cols-2 gap-2"><label><span className="mb-1 block text-[9px] font-black uppercase tracking-[.08em] text-black/35">Font size</span><input type="number" value={selected.fontSize || 48} onChange={(event) => updateSelected({ fontSize: num(event.target.value, 48) })} className="w-full rounded-lg border border-black/10 px-2.5 py-2 text-xs font-semibold" /></label><label><span className="mb-1 block text-[9px] font-black uppercase tracking-[.08em] text-black/35">Weight</span><input type="number" step="100" min="100" max="1000" value={selected.fontWeight || 700} onChange={(event) => updateSelected({ fontWeight: num(event.target.value, 700) })} className="w-full rounded-lg border border-black/10 px-2.5 py-2 text-xs font-semibold" /></label></div>
              <label className="block"><span className="mb-1 block text-[10px] font-black text-black/45">Font family</span><input value={selected.fontFamily || ''} onChange={(event) => updateSelected({ fontFamily: event.target.value })} className="w-full rounded-lg border border-black/10 px-2.5 py-2 text-xs font-semibold" /></label>
              <div className="grid grid-cols-[1fr_1fr] gap-2"><label><span className="mb-1 block text-[9px] font-black uppercase tracking-[.08em] text-black/35">Color</span><input type="color" value={selected.color || '#111111'} onChange={(event) => updateSelected({ color: event.target.value })} className="h-9 w-full rounded-lg border border-black/10 p-1" /></label><label><span className="mb-1 block text-[9px] font-black uppercase tracking-[.08em] text-black/35">Align</span><select value={selected.align || 'center'} onChange={(event) => updateSelected({ align: event.target.value as 'left' | 'center' | 'right' })} className="h-9 w-full rounded-lg border border-black/10 px-2 text-xs font-semibold"><option>left</option><option>center</option><option>right</option></select></label></div>
            </>}
            {selected.type === 'shape' && <div className="grid grid-cols-2 gap-2"><label><span className="mb-1 block text-[9px] font-black uppercase tracking-[.08em] text-black/35">Fill</span><input type="color" value={selected.fill || '#ffffff'} onChange={(event) => updateSelected({ fill: event.target.value })} className="h-9 w-full rounded-lg border border-black/10 p-1" /></label><label><span className="mb-1 block text-[9px] font-black uppercase tracking-[.08em] text-black/35">Corners</span><input type="number" value={selected.radius || 0} onChange={(event) => updateSelected({ radius: num(event.target.value) })} className="h-9 w-full rounded-lg border border-black/10 px-2 text-xs font-semibold" /></label></div>}
            {selected.type === 'image' && <label className="block"><span className="mb-1 block text-[10px] font-black text-black/45">Image fit</span><select value={selected.fit || 'contain'} onChange={(event) => updateSelected({ fit: event.target.value as 'contain' | 'cover' | 'fill' })} className="w-full rounded-lg border border-black/10 px-2.5 py-2 text-xs font-semibold"><option value="contain">Contain</option><option value="cover">Cover</option><option value="fill">Stretch</option></select></label>}
            {selected.type === 'vector' && <div className="rounded-xl border border-[#3976b7]/15 bg-[#f7fbff] p-3 text-[10px] font-semibold leading-4 text-black/55">Vector artwork stays sharp at any size and is preserved in SVG export. This beta treats a trace as one vector object; path-by-path editing is the next step.</div>}
            <div className="grid grid-cols-4 gap-1"><button onClick={() => moveLayer(selected.id, 'back')} className="rounded-lg border border-black/10 px-1 py-2 text-[9px] font-black">Back</button><button onClick={() => moveLayer(selected.id, 'backward')} className="rounded-lg border border-black/10 px-1 py-2 text-[9px] font-black">−1</button><button onClick={() => moveLayer(selected.id, 'forward')} className="rounded-lg border border-black/10 px-1 py-2 text-[9px] font-black">+1</button><button onClick={() => moveLayer(selected.id, 'front')} className="rounded-lg border border-black/10 px-1 py-2 text-[9px] font-black">Front</button></div>
            <div className="grid grid-cols-2 gap-2"><button onClick={duplicateSelected} className="rounded-lg border border-black/10 px-3 py-2 text-[10px] font-black hover:bg-black/[.04]">Duplicate</button><button onClick={deleteSelected} disabled={selected.locked} className="rounded-lg border border-red-200 px-3 py-2 text-[10px] font-black text-red-600 disabled:opacity-30">Delete</button></div>
          </div> : <div className="rounded-xl bg-[#f7f8fa] p-4 text-xs font-semibold leading-5 text-black/45">Select a layer on the canvas or in the Layers panel to edit exact values.</div>}
        </div>

        <div className="p-4">
          <div className="mb-3 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3976b7]/10 text-[#3976b7]"><SparkleIcon /></span><div><p className="text-xs font-black">Gemini Label Assistant</p><p className="text-[9px] font-black uppercase tracking-[.1em] text-black/30">{assistantMeta}</p></div></div>
          <div className="rounded-xl border border-[#3976b7]/15 bg-[#f7fbff] p-3 text-[11px] font-semibold leading-5 text-black/60">{assistantMessage}</div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['Make the selected text 15% larger', 'Center the selected layer', 'Move the selected layer down 40px', 'Make this feel bolder without changing the locked layers'].map((suggestion) => <button key={suggestion} onClick={() => setAssistantText(suggestion)} className="rounded-full border border-black/10 bg-white px-2.5 py-1.5 text-[9px] font-black text-black/55 hover:border-[#3976b7]/30 hover:text-[#3976b7]">{suggestion}</button>)}
          </div>
          <textarea value={assistantText} onChange={(event) => setAssistantText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void askGemini(); } }} placeholder="Try: Keep everything else the same, but make PIZZA WINE 12% larger and move it up 20px." rows={4} className="mt-3 w-full resize-none rounded-xl border border-black/10 p-3 text-xs font-semibold leading-5 outline-none focus:border-[#3976b7]/45" />
          <button type="button" onClick={() => void askGemini()} disabled={!assistantText.trim() || assistantBusy} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3976b7] px-4 py-3 text-xs font-black text-white shadow-sm disabled:opacity-40"><SparkleIcon /> {assistantBusy ? 'Editing…' : 'Apply with Gemini'}</button>
          <p className="mt-2 text-[9px] font-semibold leading-4 text-black/35">Locked layers are protected from AI edits. Gemini returns structured edit commands; Central applies them to the label objects.</p>
        </div>
      </aside>
    </div>
  </div>;
}
