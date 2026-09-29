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

type SvgPaint = { raw: string; hex: string; target: 'fill' | 'stroke'; count: number };

function cssColorToHex(value = ''): string | null {
  const raw = value.trim().toLowerCase();
  if (!raw || raw === 'none' || raw === 'transparent' || raw.startsWith('url(') || raw === 'currentcolor' || raw === 'inherit') return null;
  const short = raw.match(/^#([0-9a-f]{3})$/i);
  if (short) return `#${short[1].split('').map((part) => part + part).join('')}`.toUpperCase();
  const full = raw.match(/^#([0-9a-f]{6})(?:[0-9a-f]{2})?$/i);
  if (full) return `#${full[1]}`.toUpperCase();
  const rgb = raw.match(/^rgba?\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,\)]+)(?:\s*,[^\)]*)?\)$/i);
  if (rgb) {
    const channel = (input: string) => {
      const text = input.trim();
      const numeric = Number.parseFloat(text);
      if (!Number.isFinite(numeric)) return 0;
      return Math.round(clamp(text.endsWith('%') ? numeric * 2.55 : numeric, 0, 255));
    };
    return `#${[channel(rgb[1]), channel(rgb[2]), channel(rgb[3])].map((item) => item.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
  }
  const named: Record<string, string> = { white: '#FFFFFF', black: '#000000', red: '#FF0000', green: '#008000', blue: '#0000FF', gray: '#808080', grey: '#808080', yellow: '#FFFF00', orange: '#FFA500', purple: '#800080', pink: '#FFC0CB', navy: '#000080', gold: '#FFD700', burgundy: '#800020', maroon: '#800000', cream: '#FFFDD0', beige: '#F5F5DC' };
  return named[raw] || null;
}


function liveTextSvg(layer: LabelLayer) {
  const lines = (layer.text || '').split('\n');
  const fontSize = layer.fontSize || 48;
  const lineHeight = fontSize * .95;
  const anchor = layer.align === 'left' ? 'start' : layer.align === 'right' ? 'end' : 'middle';
  const x = layer.align === 'left' ? 0 : layer.align === 'right' ? layer.width : layer.width / 2;
  const firstY = layer.height / 2 - ((Math.max(1, lines.length) - 1) * lineHeight) / 2;
  const tspans = lines.map((line, index) => `<tspan x="${x}" y="${firstY + index * lineHeight}">${xmlEscape(line)}</tspan>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layer.width}" height="${layer.height}" viewBox="0 0 ${layer.width} ${layer.height}" preserveAspectRatio="none"><text x="${x}" y="${firstY}" text-anchor="${anchor}" dominant-baseline="middle" fill="${xmlEscape(layer.color || '#111111')}" font-family="${xmlEscape(layer.fontFamily || 'Arial, Helvetica, sans-serif')}" font-size="${fontSize}" font-weight="${layer.fontWeight || 700}" letter-spacing="${layer.letterSpacing || 0}">${tspans}</text></svg>`;
}

function HexColorControl({ value, onCommit, compact = false }: { value: string; onCommit: (color: string) => void; compact?: boolean }) {
  const normalized = cssColorToHex(value) || '#000000';
  const [draft, setDraft] = useState(normalized);
  useEffect(() => setDraft(normalized), [normalized]);
  const commit = () => {
    const next = cssColorToHex(draft);
    if (!next) { setDraft(normalized); return; }
    setDraft(next);
    onCommit(next);
  };
  return <div className={`flex items-center gap-1.5 ${compact ? '' : 'w-full'}`}>
    <input aria-label="Color picker" type="color" value={normalized} onChange={(event) => { const next = event.target.value.toUpperCase(); setDraft(next); onCommit(next); }} className={`${compact ? 'h-7 w-8' : 'h-9 w-10'} shrink-0 rounded-lg border border-black/10 bg-white p-1`} />
    <input aria-label="Hex color" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); commit(); } if (event.key === 'Escape') setDraft(normalized); }} spellCheck={false} className={`${compact ? 'h-7 w-[76px] text-[9px]' : 'h-9 min-w-0 flex-1 text-xs'} rounded-lg border border-black/10 bg-white px-2 font-mono font-bold uppercase outline-none focus:border-[#3976b7]/50`} />
    <button type="button" onClick={commit} className={`${compact ? 'h-7 px-2 text-[8px]' : 'h-9 px-2.5 text-[9px]'} rounded-lg border border-black/10 bg-white font-black hover:border-[#3976b7]/30 hover:text-[#3976b7]`}>Apply</button>
  </div>;
}

function extractSvgPaints(svg = ''): SvgPaint[] {
  const values = new Map<string, SvgPaint>();
  const add = (target: 'fill' | 'stroke', rawValue: string) => {
    const raw = rawValue.trim();
    const hex = cssColorToHex(raw);
    if (!hex) return;
    const key = `${target}:${raw.toLowerCase().replace(/\s+/g, '')}`;
    const existing = values.get(key);
    if (existing) existing.count += 1;
    else values.set(key, { raw, hex, target, count: 1 });
  };
  for (const match of svg.matchAll(/\b(fill|stroke)\s*=\s*["']([^"']+)["']/gi)) add(match[1].toLowerCase() as 'fill' | 'stroke', match[2]);
  for (const match of svg.matchAll(/\bstyle\s*=\s*["']([^"']+)["']/gi)) {
    for (const part of match[1].split(';')) {
      const style = part.match(/^\s*(fill|stroke)\s*:\s*(.+?)\s*$/i);
      if (style) add(style[1].toLowerCase() as 'fill' | 'stroke', style[2]);
    }
  }
  return Array.from(values.values());
}

function replaceSvgPaint(svg: string, from: string, to: string, target: 'fill' | 'stroke' | 'both' = 'both') {
  if (!svg || !from || !to) return svg;
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let next = svg;
  const targets = target === 'both' ? ['fill', 'stroke'] : [target];
  for (const property of targets) {
    next = next.replace(new RegExp(`(${property}\\s*=\\s*["'])${escaped}(["'])`, 'gi'), `$1${to}$2`);
    next = next.replace(new RegExp(`(${property}\\s*:\s*)${escaped}(?=\\s*(?:;|["']))`, 'gi'), `$1${to}`);
  }
  return next;
}

function recolorLayerPaint(layer: LabelLayer, from: string, to: string, target: 'fill' | 'stroke' | 'both' = 'both'): LabelLayer {
  if (layer.type === 'vector' && layer.svg) return { ...layer, svg: replaceSvgPaint(layer.svg, from, to, target) };
  if (layer.type === 'text' && layer.renderMode === 'outline' && layer.outlineSvg) {
    const next = { ...layer, outlineSvg: replaceSvgPaint(layer.outlineSvg, from, to, target) };
    if (target !== 'stroke') next.color = to;
    return next;
  }
  return layer;
}

function pathBounds(d: string) {
  const tokens = d.match(/[a-zA-Z]|[-+]?(?:\d*\.)?\d+(?:[eE][-+]?\d+)?/g) || [];
  let index = 0, command = '', x = 0, y = 0, startX = 0, startY = 0;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const point = (px: number, py: number) => { minX = Math.min(minX, px); minY = Math.min(minY, py); maxX = Math.max(maxX, px); maxY = Math.max(maxY, py); };
  const number = () => Number(tokens[index++]);
  while (index < tokens.length) {
    if (/^[a-zA-Z]$/.test(tokens[index])) command = tokens[index++];
    if (!command) break;
    const relative = command === command.toLowerCase();
    const upper = command.toUpperCase();
    if (upper === 'Z') { x = startX; y = startY; point(x, y); command = ''; continue; }
    const remaining = () => index < tokens.length && !/^[a-zA-Z]$/.test(tokens[index]);
    if (!remaining()) continue;
    if (upper === 'M' || upper === 'L' || upper === 'T') {
      const nx = number(), ny = number(); x = relative ? x + nx : nx; y = relative ? y + ny : ny; if (upper === 'M') { startX = x; startY = y; command = relative ? 'l' : 'L'; } point(x, y); continue;
    }
    if (upper === 'H') { const nx = number(); x = relative ? x + nx : nx; point(x, y); continue; }
    if (upper === 'V') { const ny = number(); y = relative ? y + ny : ny; point(x, y); continue; }
    if (upper === 'C') {
      const values = Array.from({ length: 6 }, number); const baseX = x, baseY = y;
      for (let i = 0; i < 6; i += 2) point(relative ? baseX + values[i] : values[i], relative ? baseY + values[i + 1] : values[i + 1]);
      x = relative ? baseX + values[4] : values[4]; y = relative ? baseY + values[5] : values[5]; continue;
    }
    if (upper === 'S' || upper === 'Q') {
      const values = Array.from({ length: 4 }, number); const baseX = x, baseY = y;
      for (let i = 0; i < 4; i += 2) point(relative ? baseX + values[i] : values[i], relative ? baseY + values[i + 1] : values[i + 1]);
      x = relative ? baseX + values[2] : values[2]; y = relative ? baseY + values[3] : values[3]; continue;
    }
    if (upper === 'A') {
      const values = Array.from({ length: 7 }, number); const baseX = x, baseY = y;
      x = relative ? baseX + values[5] : values[5]; y = relative ? baseY + values[6] : values[6]; point(x, y); continue;
    }
    index += 1;
  }
  if (![minX, minY, maxX, maxY].every(Number.isFinite)) return null;
  return { minX, minY, maxX, maxY, width: Math.max(0, maxX - minX), height: Math.max(0, maxY - minY) };
}

function largeBackgroundPaint(svg = ''): SvgPaint | null {
  const view = svg.match(/viewBox\s*=\s*["']\s*([-+\d.eE]+)[ ,]+([-+\d.eE]+)[ ,]+([-+\d.eE]+)[ ,]+([-+\d.eE]+)\s*["']/i);
  const sourceWidth = view ? Math.abs(Number(view[3])) : 0;
  const sourceHeight = view ? Math.abs(Number(view[4])) : 0;
  if (!sourceWidth || !sourceHeight) return null;
  for (const tag of svg.matchAll(/<(path|rect)\b([^>]*)>/gi)) {
    const attrs = tag[2];
    const fill = attrs.match(/\bfill\s*=\s*["']([^"']+)["']/i)?.[1];
    const hex = fill ? cssColorToHex(fill) : null;
    if (!fill || !hex) continue;
    let width = 0, height = 0;
    if (tag[1].toLowerCase() === 'rect') {
      width = Number(attrs.match(/\bwidth\s*=\s*["']([^"']+)["']/i)?.[1]) || 0;
      height = Number(attrs.match(/\bheight\s*=\s*["']([^"']+)["']/i)?.[1]) || 0;
    } else {
      const d = attrs.match(/\bd\s*=\s*["']([^"']+)["']/i)?.[1] || '';
      const bounds = pathBounds(d); width = bounds?.width || 0; height = bounds?.height || 0;
    }
    if ((width * height) / (sourceWidth * sourceHeight) >= 0.65) return { raw: fill.trim(), hex, target: 'fill', count: 1 };
  }
  return null;
}

function backgroundVectorPaint(doc: LabelDocument): { layerId: string; paint: SvgPaint } | null {
  const candidates = [
    ...doc.layers.filter((layer) => layer.type === 'vector' && !layer.locked && /original vector artwork/i.test(layer.name)),
    ...doc.layers.filter((layer) => layer.type === 'vector' && !layer.locked && !/original vector artwork/i.test(layer.name)),
  ];
  for (const layer of candidates) {
    const paint = largeBackgroundPaint(layer.svg || '');
    if (paint) return { layerId: layer.id, paint };
  }
  return null;
}

function setVisibleLabelBackground(doc: LabelDocument, color: string): LabelDocument {
  const candidate = backgroundVectorPaint(doc);
  return {
    ...doc,
    background: color,
    layers: candidate ? doc.layers.map((layer) => layer.id === candidate.layerId ? recolorLayerPaint(layer, candidate.paint.raw, color, 'fill') : layer) : doc.layers,
  };
}

function documentVectorPaints(doc: LabelDocument): SvgPaint[] {
  const merged = new Map<string, SvgPaint>();
  for (const layer of doc.layers) {
    if (layer.locked) continue;
    const svg = layer.type === 'vector' ? layer.svg : layer.type === 'text' && layer.renderMode === 'outline' ? layer.outlineSvg : '';
    if (!svg) continue;
    for (const paint of extractSvgPaints(svg)) {
      const key = `${paint.target}:${paint.raw.toLowerCase().replace(/\s+/g, '')}`;
      const current = merged.get(key);
      if (current) current.count += paint.count;
      else merged.set(key, { ...paint });
    }
  }
  return Array.from(merged.values()).sort((a, b) => b.count - a.count);
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

function traceSignature(element: Element) {
  const style = element.getAttribute('style') || '';
  const fill = element.getAttribute('fill') || style.match(/fill\s*:\s*([^;]+)/i)?.[1] || '';
  const stroke = element.getAttribute('stroke') || style.match(/stroke\s*:\s*([^;]+)/i)?.[1] || '';
  return `${fill}|${stroke}`;
}

function traceSvgToLayers(svg: string, name: string, docWidth: number, docHeight: number): LabelLayer[] {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(svg, 'image/svg+xml');
  const root = parsed.documentElement;
  if (!root || root.nodeName.toLowerCase() !== 'svg') return [];
  const rawViewBox = (root.getAttribute('viewBox') || '').trim().split(/[ ,]+/).map(Number);
  const sourceWidth = rawViewBox.length === 4 && Number.isFinite(rawViewBox[2]) ? rawViewBox[2] : Number(root.getAttribute('width')) || 1000;
  const sourceHeight = rawViewBox.length === 4 && Number.isFinite(rawViewBox[3]) ? rawViewBox[3] : Number(root.getAttribute('height')) || 1000;
  const sourceX = rawViewBox.length === 4 && Number.isFinite(rawViewBox[0]) ? rawViewBox[0] : 0;
  const sourceY = rawViewBox.length === 4 && Number.isFinite(rawViewBox[1]) ? rawViewBox[1] : 0;
  const defs = Array.from(root.children).filter((element) => element.tagName.toLowerCase() === 'defs').map((element) => element.outerHTML).join('');
  const sourceChildren = Array.from(root.children).filter((element) => !['defs', 'metadata', 'title', 'desc'].includes(element.tagName.toLowerCase()));
  if (!sourceChildren.length) return [];

  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-10000px;top:-10000px;width:1px;height:1px;overflow:visible;visibility:hidden;pointer-events:none';
  const mounted = root.cloneNode(true) as SVGSVGElement;
  mounted.setAttribute('width', String(sourceWidth));
  mounted.setAttribute('height', String(sourceHeight));
  host.appendChild(mounted);
  document.body.appendChild(host);
  const mountedChildren = Array.from(mounted.children).filter((element) => !['defs', 'metadata', 'title', 'desc'].includes(element.tagName.toLowerCase()));

  type Run = { elements: Element[]; boxes: DOMRect[]; signature: string };
  const runs: Run[] = [];
  mountedChildren.forEach((mountedElement, index) => {
    const sourceElement = sourceChildren[index];
    if (!sourceElement || !(mountedElement instanceof SVGGraphicsElement)) return;
    let box: DOMRect;
    try { box = mountedElement.getBBox() as unknown as DOMRect; } catch { return; }
    if (!Number.isFinite(box.width) || !Number.isFinite(box.height) || box.width <= 0 || box.height <= 0) return;
    const signature = traceSignature(sourceElement);
    const prior = runs[runs.length - 1];
    if (prior && prior.signature === signature) {
      prior.elements.push(sourceElement);
      prior.boxes.push(box);
    } else {
      runs.push({ elements: [sourceElement], boxes: [box], signature });
    }
  });
  host.remove();
  if (!runs.length) return [];

  const targetMaxWidth = docWidth * 0.82;
  const targetMaxHeight = docHeight * 0.82;
  const scale = Math.min(targetMaxWidth / sourceWidth, targetMaxHeight / sourceHeight);
  const fullWidth = sourceWidth * scale;
  const fullHeight = sourceHeight * scale;
  const offsetX = (docWidth - fullWidth) / 2;
  const offsetY = (docHeight - fullHeight) / 2;
  return runs.slice(0, 80).map((run, index) => {
    const x1 = Math.min(...run.boxes.map((box) => box.x));
    const y1 = Math.min(...run.boxes.map((box) => box.y));
    const x2 = Math.max(...run.boxes.map((box) => box.x + box.width));
    const y2 = Math.max(...run.boxes.map((box) => box.y + box.height));
    const width = Math.max(1, x2 - x1);
    const height = Math.max(1, y2 - y1);
    const fragment = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x1} ${y1} ${width} ${height}" preserveAspectRatio="none">${defs}${run.elements.map((element) => element.outerHTML).join('')}</svg>`;
    return {
      id: `trace-${Date.now()}-${index}`,
      name: `${name.replace(/\.[^.]+$/, '') || 'Trace'} · Vector ${index + 1}`,
      type: 'vector' as const,
      visible: true,
      locked: false,
      x: Math.round(offsetX + (x1 - sourceX) * scale),
      y: Math.round(offsetY + (y1 - sourceY) * scale),
      width: Math.max(8, Math.round(width * scale)),
      height: Math.max(8, Math.round(height * scale)),
      rotation: 0,
      opacity: 1,
      svg: normalizeVectorSvg(fragment),
    };
  });
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
    if (layer.type === 'text' && layer.renderMode === 'outline' && layer.outlineSvg) {
      const outline = sizedVectorSvg(layer.outlineSvg, layer.width, layer.height);
      return `<g transform="${transform}" opacity="${layer.opacity}">${outline}</g>`;
    }
    return `<g transform="${transform}" opacity="${layer.opacity}">${liveTextSvg(layer)}</g>`;
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
  return createStarterLabelDocument(label.slug, label.name);
}

function textEditChanges(changes: Partial<LabelLayer>) {
  // Wording changes are handled separately so original Illustrator outline glyphs
  // can be preserved whenever possible. Only explicit typography controls switch
  // an object into browser-rendered live text.
  return ['fontSize', 'fontWeight', 'fontFamily', 'letterSpacing', 'align'].some((key) => key in changes);
}

type OutlineGlyph = { id: string; definition: string };
type OutlineTextResult = { svg: string | null; reason?: string };

function svgUseHref(element: Element) {
  return element.getAttribute('href') || element.getAttribute('xlink:href') || element.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';
}

function outlineGlyphAtlas(doc: LabelDocument, sourceFontFamily: string) {
  const atlas = new Map<string, OutlineGlyph>();
  if (!sourceFontFamily || typeof DOMParser === 'undefined') return atlas;
  const parser = new DOMParser();
  for (const candidate of doc.layers) {
    if (candidate.type !== 'text' || candidate.sourceFontFamily !== sourceFontFamily || !candidate.outlineSvg || !candidate.text) continue;
    try {
      const parsed = parser.parseFromString(candidate.outlineSvg, 'image/svg+xml');
      if (parsed.querySelector('parsererror')) continue;
      const uses = Array.from(parsed.querySelectorAll('use'));
      const chars = Array.from(candidate.text);
      if (uses.length !== chars.length) continue;
      const definitions = new Map(Array.from(parsed.querySelectorAll('defs [id]')).map((element) => [element.id, element.outerHTML]));
      chars.forEach((char, index) => {
        if (atlas.has(char)) return;
        const id = svgUseHref(uses[index]).replace(/^#/, '');
        const definition = definitions.get(id);
        if (id && definition) atlas.set(char, { id, definition });
      });
    } catch {
      // A malformed source fragment should not make the rest of the label unusable.
    }
  }
  return atlas;
}

function replaceOutlineTextExact(doc: LabelDocument, layer: LabelLayer, nextText: string): OutlineTextResult {
  if (layer.type !== 'text' || layer.renderMode !== 'outline' || !layer.outlineSvg || !layer.text) return { svg: null, reason: 'This object is not original outline text.' };
  const family = layer.sourceFontFamily || '';
  if (!family) return { svg: null, reason: 'The original font family could not be identified.' };
  const oldChars = Array.from(layer.text);
  const nextChars = Array.from(nextText);
  if (oldChars.length !== nextChars.length) return { svg: null, reason: `Exact outline editing currently keeps the same character count (${oldChars.length}).` };
  if (typeof DOMParser === 'undefined' || typeof XMLSerializer === 'undefined') return { svg: null, reason: 'Outline editing is not available in this browser.' };

  const parser = new DOMParser();
  const parsed = parser.parseFromString(layer.outlineSvg, 'image/svg+xml');
  if (parsed.querySelector('parsererror')) return { svg: null, reason: 'The original outline could not be read.' };
  const uses = Array.from(parsed.querySelectorAll('use'));
  if (uses.length !== oldChars.length) return { svg: null, reason: 'The original glyph layout is more complex than this precision editor currently supports.' };

  const atlas = outlineGlyphAtlas(doc, family);
  const missing = Array.from(new Set(nextChars.filter((char) => !atlas.has(char))));
  if (missing.length) return { svg: null, reason: `The original ${family} artwork does not contain glyph${missing.length === 1 ? '' : 's'} for ${missing.map((char) => JSON.stringify(char)).join(', ')} yet.` };

  let defs = parsed.querySelector('defs');
  if (!defs) {
    defs = parsed.createElementNS('http://www.w3.org/2000/svg', 'defs');
    parsed.documentElement.insertBefore(defs, parsed.documentElement.firstChild);
  }
  const existingIds = new Set(Array.from(parsed.querySelectorAll('[id]')).map((element) => element.id));
  nextChars.forEach((char, index) => {
    const glyph = atlas.get(char)!;
    if (!existingIds.has(glyph.id)) {
      const holder = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${glyph.definition}</svg>`, 'image/svg+xml');
      const node = holder.documentElement.firstElementChild;
      if (node) {
        defs!.appendChild(parsed.importNode(node, true));
        existingIds.add(glyph.id);
      }
    }
    uses[index].setAttribute('href', `#${glyph.id}`);
    uses[index].setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${glyph.id}`);
  });
  return { svg: new XMLSerializer().serializeToString(parsed.documentElement) };
}

function TextValueControl({ value, outline, sourceFontFamily, onCommit }: { value: string; outline: boolean; sourceFontFamily?: string; onCommit: (text: string) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const commit = () => onCommit(draft);
  return <div>
    <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); commit(); } if (event.key === 'Escape') setDraft(value); }} rows={3} className="w-full resize-none rounded-lg border border-black/10 px-2.5 py-2 text-xs font-semibold outline-none focus:border-[#3976b7]/50" />
    <div className="mt-1.5 flex items-center justify-between gap-2">
      <span className="text-[9px] font-semibold leading-4 text-black/35">{outline ? `Preserves original ${sourceFontFamily || 'Illustrator'} outlines when the replacement can use the existing glyphs.` : 'Live text'}</span>
      <button type="button" onClick={commit} disabled={draft === value} className="shrink-0 rounded-lg border border-[#3976b7]/20 bg-white px-2.5 py-1.5 text-[9px] font-black text-[#3976b7] disabled:opacity-30">Apply text</button>
    </div>
  </div>;
}

export default function LabelStudio({ label, back }: { label: LabelLibraryItem; back: () => void }) {
  const [side, setSide] = useState<'front' | 'back'>('front');
  const storageKey = `lwc-label-studio-v6:${label.slug}:${side}`;
  const versionsKey = `lwc-label-studio-versions-v6:${label.slug}:${side}`;
  const [doc, setDoc] = useState<LabelDocument>(() => starterDocument(label));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<LabelDocument[]>([]);
  const [redoStack, setRedoStack] = useState<LabelDocument[]>([]);
  const [versions, setVersions] = useState<StudioVersion[]>([]);
  const [drag, setDrag] = useState<DragState>(null);
  const [hydrated, setHydrated] = useState(false);
  const [assistantText, setAssistantText] = useState('');
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState('Select an imported object or describe the change you want. Gemini edits the real label objects and leaves everything else alone.');
  const [assistantMeta, setAssistantMeta] = useState('Gemini ready');
  const [showVersions, setShowVersions] = useState(false);
  const [zoom, setZoom] = useState(58);
  const artboardRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const traceInputRef = useRef<HTMLInputElement | null>(null);
  const [vectorizing, setVectorizing] = useState(false);
  const [importingOriginal, setImportingOriginal] = useState(false);

  const selected = useMemo(() => doc.layers.find((layer) => layer.id === selectedId) || null, [doc.layers, selectedId]);
  const selectedPaints = useMemo(() => {
    if (!selected) return [] as SvgPaint[];
    if (selected.type === 'vector') return extractSvgPaints(selected.svg || '');
    if (selected.type === 'text' && selected.renderMode === 'outline') return extractSvgPaints(selected.outlineSvg || '');
    return [] as SvgPaint[];
  }, [selected]);
  const labelPaints = useMemo(() => documentVectorPaints(doc), [doc]);
  const labelBackgroundPaint = useMemo(() => backgroundVectorPaint(doc), [doc]);
  const labelBackgroundHex = labelBackgroundPaint?.paint.hex || cssColorToHex(doc.background) || '#FFFFFF';
  const referenceSrc = side === 'back' ? (label.previewBack || label.preview || '') : (label.preview || label.previewBack || '');
  const editableSource = side === 'back' ? label.editable?.back : label.editable?.front;

  useEffect(() => {
    let cancelled = false;
    async function hydrateStudio() {
      setHydrated(false);
      setSelectedId(null);
      setUndoStack([]);
      setRedoStack([]);
      setImportingOriginal(Boolean(editableSource));
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as LabelDocument;
          if (!cancelled && parsed?.projectSlug === label.slug && Array.isArray(parsed.layers)) setDoc(parsed);
        } else if (editableSource) {
          const response = await fetch(editableSource, { cache: 'no-store' });
          if (!response.ok) throw new Error(`Original artwork import returned ${response.status}.`);
          const parsed = await response.json() as LabelDocument;
          if (!cancelled && parsed?.projectSlug === label.slug && Array.isArray(parsed.layers)) {
            setDoc(parsed);
            setAssistantMessage('Original Illustrator artwork imported as editable pieces. Background, Leelanau Cellars logo, vintage badge and text are separated so they can be edited independently.');
            setAssistantMeta('Original AI/PDF imported');
          }
        } else {
          const fresh = starterDocument(label);
          const svgFile = label.files.find((file) => file.kind === 'svg');
          const raster = referenceSrc;
          if (svgFile) {
            const response = await fetch(svgFile.url, { cache: 'no-store' });
            const svg = response.ok ? await response.text() : '';
            if (svg) fresh.layers.push({ id: `original-svg-${Date.now()}`, name: 'Original SVG Artwork', type: 'vector', visible: true, locked: false, x: 50, y: 50, width: 900, height: 1317, rotation: 0, opacity: 1, svg: normalizeVectorSvg(svg) });
          } else if (raster) {
            fresh.layers.push({ id: 'original-raster', name: 'Original Raster Artwork', type: 'image', visible: true, locked: false, x: 50, y: 50, width: 900, height: 1317, rotation: 0, opacity: 1, src: raster, fit: 'contain' });
            setAssistantMessage('This uploaded label is a flat image. Trace it to SVG to turn the artwork into vectors, or add/edit text on top.');
            setAssistantMeta('Raster original');
          }
          if (!cancelled) setDoc(fresh);
        }
        const savedVersions = window.localStorage.getItem(versionsKey);
        if (!cancelled) setVersions(savedVersions ? (JSON.parse(savedVersions) as StudioVersion[]).slice(0, 20) : []);
      } catch (error) {
        console.warn('Unable to prepare Label Studio document', error);
        if (!cancelled) {
          setDoc(starterDocument(label));
          setAssistantMessage(error instanceof Error ? error.message : 'Unable to import the original artwork.');
          setAssistantMeta('Import failed');
        }
      } finally {
        if (!cancelled) { setImportingOriginal(false); setHydrated(true); }
      }
    }
    void hydrateStudio();
    return () => { cancelled = true; };
  }, [label, side, storageKey, versionsKey, editableSource, referenceSrc]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(doc));
  }, [doc, hydrated, storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(versionsKey, JSON.stringify(versions.slice(0, 20)));
  }, [versions, hydrated, versionsKey]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === 'Escape') { setSelectedId(null); return; }
      if (!selectedId || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      const active = doc.layers.find((layer) => layer.id === selectedId);
      if (!active || active.locked) return;
      event.preventDefault();
      const step = event.shiftKey ? 10 : 1;
      const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
      const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
      commit((current) => ({ ...current, layers: current.layers.map((layer) => layer.id === selectedId ? { ...layer, x: layer.x + dx, y: layer.y + dy } : layer) }));
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [selectedId, doc.layers]);

  function beginDrag(event: React.PointerEvent<HTMLElement>, layer: LabelLayer, mode: 'move' | 'resize') {
    event.stopPropagation();
    setSelectedId(layer.id);
    if (layer.locked) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const state: DragState = { mode, layerId: layer.id, startX: event.clientX, startY: event.clientY, base: { ...layer }, before: cloneDoc(doc) };
    dragRef.current = state;
    setDrag(state);
  }

  function continueDrag(event: React.PointerEvent<HTMLElement>) {
    const active = dragRef.current;
    if (!active) return;
    event.preventDefault();
    const rect = artboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scale = rect.width / doc.width;
    if (!scale) return;
    const dx = (event.clientX - active.startX) / scale;
    const dy = (event.clientY - active.startY) / scale;
    setDoc((current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
      layers: current.layers.map((layer) => {
        if (layer.id !== active.layerId) return layer;
        if (active.mode === 'move') return { ...layer, x: Math.round(active.base.x + dx), y: Math.round(active.base.y + dy) };
        return {
          ...layer,
          width: Math.round(clamp(active.base.width + dx, 20, doc.width * 2)),
          height: Math.round(clamp(active.base.height + dy, 20, doc.height * 2)),
        };
      }),
    }));
  }

  function finishDrag(event?: React.PointerEvent<HTMLElement>) {
    const active = dragRef.current;
    if (!active) return;
    event?.preventDefault();
    dragRef.current = null;
    setUndoStack((stack) => [...stack.slice(-39), active.before]);
    setRedoStack([]);
    setDrag(null);
  }

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
    const effective = selected.type === 'text' && textEditChanges(changes) ? { ...changes, renderMode: 'live' as const } : changes;
    commit((current) => ({ ...current, layers: current.layers.map((layer) => layer.id === selected.id ? ({ ...layer, ...effective } as LabelLayer) : layer) }));
  }

  function applySelectedText(nextText: string) {
    if (!selected || selected.type !== 'text' || selected.locked || nextText === selected.text) return;
    if (selected.renderMode === 'outline' && selected.outlineSvg) {
      const exact = replaceOutlineTextExact(doc, selected, nextText);
      if (!exact.svg) {
        setAssistantMessage(`I kept the original lettering intact. ${exact.reason || 'That wording cannot be rebuilt exactly from the current outline glyphs.'} If you deliberately want an approximate browser font instead, choose “Make text live.”`);
        setAssistantMeta('Exact font preserved · edit not applied');
        return;
      }
      commit((current) => ({ ...current, layers: current.layers.map((layer) => layer.id === selected.id && layer.type === 'text' ? { ...layer, text: nextText, outlineSvg: exact.svg!, renderMode: 'outline' as const } : layer) }));
      setAssistantMessage(`Updated ${selected.name} using the original ${selected.sourceFontFamily || 'Illustrator'} vector glyphs. No substitute browser font was used.`);
      setAssistantMeta('Exact outline text');
      return;
    }
    updateSelected({ text: nextText });
  }

  function updateTextColor(color: string) {
    if (!selected || selected.type !== 'text') return;
    commit((current) => ({
      ...current,
      layers: current.layers.map((layer) => {
        if (layer.id !== selected.id || layer.type !== 'text') return layer;
        if (layer.renderMode === 'outline' && layer.outlineSvg) {
          let nextSvg = layer.outlineSvg;
          const fills = extractSvgPaints(nextSvg).filter((paint) => paint.target === 'fill');
          for (const paint of fills) nextSvg = replaceSvgPaint(nextSvg, paint.raw, color, 'fill');
          return { ...layer, color, outlineSvg: nextSvg };
        }
        return { ...layer, color };
      }),
    }));
  }

  function recolorSelectedPaint(from: string, to: string, target: 'fill' | 'stroke') {
    if (!selected || selected.locked) return;
    commit((current) => ({
      ...current,
      layers: current.layers.map((layer) => layer.id === selected.id ? recolorLayerPaint(layer, from, to, target) : layer),
    }));
  }

  function recolorEverywhere(from: string, to: string, target: 'fill' | 'stroke') {
    commit((current) => ({
      ...current,
      layers: current.layers.map((layer) => layer.locked ? layer : recolorLayerPaint(layer, from, to, target)),
    }));
  }

  function changeLabelBackground(color: string) {
    commit((current) => setVisibleLabelBackground(current, color));
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
    commit((current) => ({ ...current, layers: current.layers.length ? [current.layers[0], layer, ...current.layers.slice(1)] : [layer] }));
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
      const tracedLayers = traceSvgToLayers(svg, name, doc.width, doc.height);
      if (!tracedLayers.length) throw new Error('The trace finished, but no editable vector objects were found.');
      commit((current) => ({ ...current, layers: [...current.layers, ...tracedLayers] }));
      setSelectedId(tracedLayers[tracedLayers.length - 1].id);
      setAssistantMessage(`Vector trace added as ${tracedLayers.length} editable vector object${tracedLayers.length === 1 ? '' : 's'}. You can move, resize, hide, reorder or delete those pieces independently. Text from a flattened image is still vector outlines until it is rebuilt as live text.`);
      setAssistantMeta(`Vector Trace · ${tracedLayers.length} objects`);
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

  async function resetDocument() {
    if (!window.confirm('Reset this side to the original imported artwork? Your saved Versions will remain available.')) return;
    setUndoStack((stack) => [...stack.slice(-39), cloneDoc(doc)]);
    setRedoStack([]);
    window.localStorage.removeItem(storageKey);
    try {
      if (editableSource) {
        const response = await fetch(editableSource, { cache: 'no-store' });
        if (!response.ok) throw new Error('Unable to reload original artwork.');
        setDoc(await response.json() as LabelDocument);
      } else {
        const fresh = starterDocument(label);
        if (referenceSrc) fresh.layers.push({ id: 'original-raster', name: 'Original Raster Artwork', type: 'image', visible: true, locked: false, x: 50, y: 50, width: 900, height: 1317, rotation: 0, opacity: 1, src: referenceSrc, fit: 'contain' });
        setDoc(fresh);
      }
      setSelectedId(null);
    } catch (error) {
      setAssistantMessage(error instanceof Error ? error.message : 'Unable to reload original artwork.');
    }
  }

  function applyOperations(operations: LabelStudioOperation[]) {
    if (!operations.length) return [] as string[];
    const blockedTextEdits: string[] = [];
    const prepared = operations.slice(0, 20).map((operation) => {
      if (operation.type !== 'update' || typeof operation.changes.text !== 'string') return operation;
      const layer = doc.layers.find((item) => item.id === operation.layerId);
      if (!layer || layer.type !== 'text' || layer.renderMode !== 'outline' || !layer.outlineSvg || operation.changes.text === layer.text) return operation;
      const exact = replaceOutlineTextExact(doc, layer, operation.changes.text);
      if (exact.svg) return { ...operation, changes: { ...operation.changes, outlineSvg: exact.svg, renderMode: 'outline' as const } };
      blockedTextEdits.push(`${layer.name}: ${exact.reason || 'exact outline replacement was unavailable'}`);
      const changes = { ...operation.changes };
      delete changes.text;
      delete changes.fontFamily;
      delete changes.fontSize;
      delete changes.fontWeight;
      delete changes.letterSpacing;
      delete changes.align;
      return { ...operation, changes };
    });
    commit((current) => {
      let layers = [...current.layers];
      let background = current.background;
      for (const operation of prepared) {
        if (operation.type === 'update') {
          layers = layers.map((layer) => {
            if (layer.id !== operation.layerId || layer.locked) return layer;
            const incoming = layer.type === 'text' && textEditChanges(operation.changes) ? { ...operation.changes, renderMode: 'live' as const } : operation.changes;
            const safe = sanitizeLabelLayer({ ...layer, ...incoming, id: layer.id, type: layer.type });
            if (!safe) return layer;
            if (safe.type === 'text' && safe.renderMode === 'outline' && safe.outlineSvg && typeof operation.changes.color === 'string') {
              let outlineSvg = safe.outlineSvg;
              for (const paint of extractSvgPaints(outlineSvg).filter((item) => item.target === 'fill')) outlineSvg = replaceSvgPaint(outlineSvg, paint.raw, operation.changes.color, 'fill');
              return { ...safe, outlineSvg, color: operation.changes.color };
            }
            return safe;
          });
          continue;
        }
        if (operation.type === 'add-text' || operation.type === 'add-shape') {
          const safe = sanitizeLabelLayer(operation.layer);
          if (safe && safe.type === (operation.type === 'add-text' ? 'text' : 'shape')) layers.push({ ...safe, id: `${safe.id}-${Date.now()}-${layers.length}` });
          continue;
        }
        if (operation.type === 'recolor') {
          layers = layers.map((layer) => layer.id === operation.layerId && !layer.locked ? recolorLayerPaint(layer, operation.from, operation.to, operation.target) : layer);
          continue;
        }
        if (operation.type === 'set-background') {
          const next = setVisibleLabelBackground({ ...current, layers, background }, operation.color);
          layers = next.layers;
          background = next.background;
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
      return { ...current, layers, background };
    });
    return blockedTextEdits;
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
      const blocked = applyOperations(Array.isArray(data.operations) ? data.operations : []);
      setAssistantMessage(blocked.length ? `I kept the original Illustrator lettering rather than substituting the wrong font. ${blocked.join(' ')}` : (data.message || 'Applied the requested edit.'));
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
      <div className="mr-auto min-w-[190px]"><p className="text-[9px] font-black uppercase tracking-[.15em] text-[#3976b7]">Label Studio</p><h1 className="truncate text-sm font-black">{label.name}</h1></div>
      {(label.previewBack || label.editable?.back) && <div className="mr-2 flex rounded-lg border border-black/10 bg-[#f6f7f8] p-0.5"><button type="button" onClick={() => setSide('front')} className={`rounded-md px-3 py-1.5 text-[10px] font-black ${side === 'front' ? 'bg-white shadow-sm' : 'text-black/40'}`}>Front</button><button type="button" onClick={() => setSide('back')} className={`rounded-md px-3 py-1.5 text-[10px] font-black ${side === 'back' ? 'bg-white shadow-sm' : 'text-black/40'}`}>Back</button></div>}
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
        <div className="mb-3 flex items-center justify-between px-1"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-black/35">Layers</p><p className="text-xs font-black">{doc.layers.length} objects</p></div><button onClick={() => void resetDocument()} className="text-[10px] font-black text-black/35 hover:text-black">Reset</button></div>
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
          <div><p className="text-[10px] font-black uppercase tracking-[.12em] text-black/35">{importingOriginal ? 'Importing original artwork…' : `${doc.width} × ${doc.height} px · ${side} · ${doc.layers.length} editable objects`}</p><p className="mt-0.5 text-[9px] font-semibold text-black/30">Drag any unlocked object directly · Arrow keys nudge 1px · Shift + Arrow nudges 10px</p></div>
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
                cursor: layer.locked ? 'default' : (drag?.layerId === layer.id && drag.mode === 'move' ? 'grabbing' : 'grab'),
                userSelect: 'none',
                touchAction: 'none',
              };
              return <div
                key={layer.id}
                style={style}
                onPointerDown={(event) => beginDrag(event, layer, 'move')}
                onPointerMove={continueDrag}
                onPointerUp={finishDrag}
                onPointerCancel={finishDrag}
                className={`${selectedId === layer.id ? 'outline outline-2 outline-[#3976b7] outline-offset-[-1px]' : ''} ${drag?.layerId === layer.id && drag.mode === 'move' ? 'cursor-grabbing' : ''}`}
              >
                {layer.type === 'shape' && <div className="h-full w-full" style={{ background: layer.fill, border: `${(layer.strokeWidth || 0) * scale}px solid ${layer.stroke || 'transparent'}`, borderRadius: `${(layer.radius || 0) * scale}px` }} />}
                {layer.type === 'image' && <img src={layer.src || ''} alt="" draggable={false} className="h-full w-full pointer-events-none" style={{ objectFit: layer.fit || 'contain' }} />}
                {layer.type === 'vector' && <div className="h-full w-full pointer-events-none [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: normalizeVectorSvg(layer.svg || '') }} />}
                {layer.type === 'text' && layer.renderMode === 'outline' && layer.outlineSvg ? <div className="h-full w-full pointer-events-none [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: normalizeVectorSvg(layer.outlineSvg) }} /> : null}
                {layer.type === 'text' && !(layer.renderMode === 'outline' && layer.outlineSvg) && <div className="h-full w-full pointer-events-none [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: liveTextSvg(layer) }} />}
                {selectedId === layer.id && !layer.locked && <button
                  type="button"
                  aria-label="Resize selected layer"
                  onPointerDown={(event) => beginDrag(event, layer, 'resize')}
                  onPointerMove={continueDrag}
                  onPointerUp={finishDrag}
                  onPointerCancel={finishDrag}
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
          <div className="mb-3 rounded-xl border border-black/10 bg-[#fafbfc] p-3">
            <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black">Label background</p><p className="mt-0.5 text-[9px] font-semibold leading-4 text-black/40">Changes the visible imported label background, not just the artboard behind it.</p></div><div className="w-[190px]"><HexColorControl value={labelBackgroundHex} onCommit={changeLabelBackground} compact /></div></div>
            {labelPaints.length > 0 && <div className="mt-3 border-t border-black/5 pt-3"><p className="text-[9px] font-black uppercase tracking-[.1em] text-black/35">Global label colors</p><div className="mt-2 grid grid-cols-2 gap-1.5">{labelPaints.slice(0, 10).map((paint, index) => <div key={`${paint.target}-${paint.raw}-${index}`} className="flex items-center gap-2 rounded-lg border border-black/5 bg-white px-2 py-1.5" title={`Replace ${paint.raw} everywhere`}><div className="min-w-0 flex-1"><span className="mb-1 block truncate text-[8px] font-black uppercase tracking-[.06em] text-black/35">{paint.target} · all artwork</span><HexColorControl value={paint.hex} onCommit={(color) => recolorEverywhere(paint.raw, color, paint.target)} compact /></div></div>)}</div><p className="mt-2 text-[9px] font-semibold leading-4 text-black/35">Global colors affect every matching object. To recolor only the logo, background or badge, select that layer first and use its Vector Colors controls.</p></div>}
          </div>
          {selected ? <div className="space-y-3">
            <label className="block"><span className="mb-1 block text-[10px] font-black text-black/45">Layer name</span><input value={selected.name} onChange={(event) => updateSelected({ name: event.target.value })} className="w-full rounded-lg border border-black/10 px-2.5 py-2 text-xs font-semibold outline-none focus:border-[#3976b7]/50" /></label>
            <div className="grid grid-cols-2 gap-2">
              {(['x','y','width','height'] as const).map((key) => <label key={key}><span className="mb-1 block text-[9px] font-black uppercase tracking-[.08em] text-black/35">{key}</span><input type="number" value={Math.round(selected[key])} onChange={(event) => updateSelected({ [key]: num(event.target.value, selected[key]) } as Partial<LabelLayer>)} className="w-full rounded-lg border border-black/10 px-2.5 py-2 text-xs font-semibold" /></label>)}
            </div>
            <div className="grid grid-cols-2 gap-2"><label><span className="mb-1 block text-[9px] font-black uppercase tracking-[.08em] text-black/35">Rotation</span><input type="number" value={selected.rotation} onChange={(event) => updateSelected({ rotation: num(event.target.value) })} className="w-full rounded-lg border border-black/10 px-2.5 py-2 text-xs font-semibold" /></label><label><span className="mb-1 block text-[9px] font-black uppercase tracking-[.08em] text-black/35">Opacity</span><input type="number" min="0" max="1" step=".05" value={selected.opacity} onChange={(event) => updateSelected({ opacity: clamp(num(event.target.value, 1), 0, 1) })} className="w-full rounded-lg border border-black/10 px-2.5 py-2 text-xs font-semibold" /></label></div>
            {selected.type === 'text' && <>
              {selected.outlineSvg && <div className="rounded-xl border border-[#3976b7]/15 bg-[#f7fbff] p-3 text-[10px] font-semibold leading-4 text-black/55"><p className="font-black text-black/70">{selected.renderMode === 'outline' ? 'Exact original outline' : 'Live editable text'}</p><p className="mt-1">{selected.renderMode === 'outline' ? `This is the exact vector lettering from Illustrator${selected.sourceFontFamily ? ` (${selected.sourceFontFamily})` : ''}. Changing the wording/font switches this object to live text.` : 'The wording is now live text. Use Reset if you want the exact original outline back.'}</p>{selected.renderMode === 'outline' && <button type="button" onClick={() => updateSelected({ renderMode: 'live' })} className="mt-2 rounded-lg border border-[#3976b7]/20 bg-white px-2.5 py-1.5 text-[9px] font-black text-[#3976b7]">Make text live</button>}</div>}
              <label className="block"><span className="mb-1 block text-[10px] font-black text-black/45">Text</span><TextValueControl value={selected.text || ''} outline={selected.renderMode === 'outline' && Boolean(selected.outlineSvg)} sourceFontFamily={selected.sourceFontFamily} onCommit={applySelectedText} /></label>
              {selected.renderMode === 'outline' && selected.outlineSvg ? <div className="rounded-xl border border-black/5 bg-[#fafafa] p-3 text-[9px] font-semibold leading-4 text-black/45">Keep this in <b>Exact original outline</b> mode for the real Illustrator lettering. Resize the object on the canvas or change Width/Height above. Font size, weight and family controls only appear if you intentionally switch to live text.</div> : <>
                <div className="grid grid-cols-2 gap-2"><label><span className="mb-1 block text-[9px] font-black uppercase tracking-[.08em] text-black/35">Font size</span><input type="number" value={selected.fontSize || 48} onChange={(event) => updateSelected({ fontSize: num(event.target.value, 48) })} className="w-full rounded-lg border border-black/10 px-2.5 py-2 text-xs font-semibold" /></label><label><span className="mb-1 block text-[9px] font-black uppercase tracking-[.08em] text-black/35">Weight</span><input type="number" step="100" min="100" max="1000" value={selected.fontWeight || 700} onChange={(event) => updateSelected({ fontWeight: num(event.target.value, 700) })} className="w-full rounded-lg border border-black/10 px-2.5 py-2 text-xs font-semibold" /></label></div>
                <label className="block"><span className="mb-1 block text-[10px] font-black text-black/45">Font family</span><input value={selected.fontFamily || ''} onChange={(event) => updateSelected({ fontFamily: event.target.value })} className="w-full rounded-lg border border-black/10 px-2.5 py-2 text-xs font-semibold" /></label>
              </>}
              <div className={`grid gap-2 ${selected.renderMode === 'outline' && selected.outlineSvg ? 'grid-cols-1' : 'grid-cols-[1fr_1fr]'}`}><label><span className="mb-1 block text-[9px] font-black uppercase tracking-[.08em] text-black/35">Color</span><HexColorControl value={selected.color || '#111111'} onCommit={updateTextColor} /></label>{!(selected.renderMode === 'outline' && selected.outlineSvg) && <label><span className="mb-1 block text-[9px] font-black uppercase tracking-[.08em] text-black/35">Align</span><select value={selected.align || 'center'} onChange={(event) => updateSelected({ align: event.target.value as 'left' | 'center' | 'right' })} className="h-9 w-full rounded-lg border border-black/10 px-2 text-xs font-semibold"><option>left</option><option>center</option><option>right</option></select></label>}</div>
            </>}
            {selected.type === 'shape' && <div className="space-y-2"><label className="block"><span className="mb-1 block text-[9px] font-black uppercase tracking-[.08em] text-black/35">Fill</span><HexColorControl value={selected.fill || '#ffffff'} onCommit={(color) => updateSelected({ fill: color })} /></label><label className="block"><span className="mb-1 block text-[9px] font-black uppercase tracking-[.08em] text-black/35">Stroke</span><HexColorControl value={selected.stroke || '#111111'} onCommit={(color) => updateSelected({ stroke: color })} /></label><div className="grid grid-cols-2 gap-2"><label><span className="mb-1 block text-[9px] font-black uppercase tracking-[.08em] text-black/35">Stroke width</span><input type="number" min="0" value={selected.strokeWidth || 0} onChange={(event) => updateSelected({ strokeWidth: num(event.target.value) })} className="h-9 w-full rounded-lg border border-black/10 px-2 text-xs font-semibold" /></label><label><span className="mb-1 block text-[9px] font-black uppercase tracking-[.08em] text-black/35">Corners</span><input type="number" value={selected.radius || 0} onChange={(event) => updateSelected({ radius: num(event.target.value) })} className="h-9 w-full rounded-lg border border-black/10 px-2 text-xs font-semibold" /></label></div></div>}
            {selected.type === 'image' && <label className="block"><span className="mb-1 block text-[10px] font-black text-black/45">Image fit</span><select value={selected.fit || 'contain'} onChange={(event) => updateSelected({ fit: event.target.value as 'contain' | 'cover' | 'fill' })} className="w-full rounded-lg border border-black/10 px-2.5 py-2 text-xs font-semibold"><option value="contain">Contain</option><option value="cover">Cover</option><option value="fill">Stretch</option></select></label>}
            {selected.type === 'vector' && <div className="rounded-xl border border-[#3976b7]/15 bg-[#f7fbff] p-3"><p className="text-[10px] font-black text-black/70">Vector colors</p><p className="mt-1 text-[9px] font-semibold leading-4 text-black/45">These colors affect only this selected object. Hex values wait for Apply or Enter, so you can type the entire code before anything changes.</p>{selectedPaints.length ? <div className="mt-2 space-y-1.5">{selectedPaints.map((paint, index) => <div key={`${paint.target}-${paint.raw}-${index}`} className="flex items-center gap-2 rounded-lg border border-black/5 bg-white px-2 py-1.5"><div className="min-w-0 flex-1"><div className="mb-1 flex items-center justify-between gap-2"><span className="truncate text-[8px] font-black uppercase tracking-[.06em] text-black/35">{paint.target}</span><span className="text-[8px] font-black text-black/25">×{paint.count}</span></div><HexColorControl value={paint.hex} onCommit={(color) => recolorSelectedPaint(paint.raw, color, paint.target)} compact /></div></div>)}</div> : <p className="mt-2 text-[9px] font-semibold text-black/35">No direct solid fills or strokes were found in this object.</p>}</div>}
            <div className="grid grid-cols-4 gap-1"><button onClick={() => moveLayer(selected.id, 'back')} className="rounded-lg border border-black/10 px-1 py-2 text-[9px] font-black">Back</button><button onClick={() => moveLayer(selected.id, 'backward')} className="rounded-lg border border-black/10 px-1 py-2 text-[9px] font-black">−1</button><button onClick={() => moveLayer(selected.id, 'forward')} className="rounded-lg border border-black/10 px-1 py-2 text-[9px] font-black">+1</button><button onClick={() => moveLayer(selected.id, 'front')} className="rounded-lg border border-black/10 px-1 py-2 text-[9px] font-black">Front</button></div>
            <div className="grid grid-cols-2 gap-2"><button onClick={duplicateSelected} className="rounded-lg border border-black/10 px-3 py-2 text-[10px] font-black hover:bg-black/[.04]">Duplicate</button><button onClick={deleteSelected} disabled={selected.locked} className="rounded-lg border border-red-200 px-3 py-2 text-[10px] font-black text-red-600 disabled:opacity-30">Delete</button></div>
          </div> : <div className="rounded-xl bg-[#f7f8fa] p-4 text-xs font-semibold leading-5 text-black/45">Select a layer on the canvas or in the Layers panel to edit exact values.</div>}
        </div>

        <div className="p-4">
          <div className="mb-3 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3976b7]/10 text-[#3976b7]"><SparkleIcon /></span><div><p className="text-xs font-black">Gemini Label Assistant</p><p className="text-[9px] font-black uppercase tracking-[.1em] text-black/30">{assistantMeta}</p></div></div>
          <div className="rounded-xl border border-[#3976b7]/15 bg-[#f7fbff] p-3 text-[11px] font-semibold leading-5 text-black/60">{assistantMessage}</div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['Change the label background to navy', 'Change the Leelanau Cellars Logo to black', 'Change the selected vector white to gold', 'Center the selected layer'].map((suggestion) => <button key={suggestion} onClick={() => setAssistantText(suggestion)} className="rounded-full border border-black/10 bg-white px-2.5 py-1.5 text-[9px] font-black text-black/55 hover:border-[#3976b7]/30 hover:text-[#3976b7]">{suggestion}</button>)}
          </div>
          <textarea value={assistantText} onChange={(event) => setAssistantText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void askGemini(); } }} placeholder="Try: Make the selected wine name 12% larger and move it up 20px. Keep everything else unchanged." rows={4} className="mt-3 w-full resize-none rounded-xl border border-black/10 p-3 text-xs font-semibold leading-5 outline-none focus:border-[#3976b7]/45" />
          <button type="button" onClick={() => void askGemini()} disabled={!assistantText.trim() || assistantBusy} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3976b7] px-4 py-3 text-xs font-black text-white shadow-sm disabled:opacity-40"><SparkleIcon /> {assistantBusy ? 'Editing…' : 'Apply with Gemini'}</button>
          <p className="mt-2 text-[9px] font-semibold leading-4 text-black/35">Locked layers are protected from AI edits. Gemini can now issue real vector recolor and label-background commands, which Central applies directly to the SVG artwork.</p>
        </div>
      </aside>
    </div>
  </div>;
}
