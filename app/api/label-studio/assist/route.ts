import { NextRequest, NextResponse } from 'next/server';
import { sessionRole } from '@/lib/auth';
import {
  sanitizeLabelLayer,
  type LabelDocument,
  type LabelLayer,
  type LabelStudioAssistResponse,
  type LabelStudioOperation,
} from '@/lib/label-studio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RequestBody = {
  prompt?: unknown;
  project?: unknown;
  document?: unknown;
  selectedLayerId?: unknown;
};

function safeDocument(value: unknown): LabelDocument | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<LabelDocument>;
  if (!raw.projectSlug || typeof raw.projectSlug !== 'string' || !Array.isArray(raw.layers)) return null;
  const layers = raw.layers.map(sanitizeLabelLayer).filter((layer): layer is LabelLayer => Boolean(layer)).slice(0, 80);
  if (!layers.length) return null;
  return {
    id: typeof raw.id === 'string' ? raw.id.slice(0, 120) : `label-${raw.projectSlug}`,
    projectSlug: raw.projectSlug.slice(0, 120),
    name: typeof raw.name === 'string' ? raw.name.slice(0, 200) : 'Label',
    width: typeof raw.width === 'number' ? Math.max(100, Math.min(6000, raw.width)) : 1000,
    height: typeof raw.height === 'number' ? Math.max(100, Math.min(6000, raw.height)) : 1400,
    background: typeof raw.background === 'string' ? raw.background.slice(0, 40) : '#ffffff',
    units: 'px',
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
    layers,
  };
}

function selectedLayer(document: LabelDocument, selectedLayerId: string | null) {
  return selectedLayerId ? document.layers.find((layer) => layer.id === selectedLayerId) || null : null;
}

function safeColor(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const color = value.trim().slice(0, 80);
  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color)) return color;
  if (/^rgba?\([^\)]{1,70}\)$/i.test(color)) return color;
  if (/^[a-z]{3,24}$/i.test(color)) return color;
  return null;
}

function promptColor(prompt: string): string | null {
  const hex = prompt.match(/#[0-9a-f]{3,8}\b/i)?.[0];
  if (hex) return safeColor(hex);
  const named: Record<string, string> = {
    white: '#FFFFFF', black: '#000000', red: '#FF0000', green: '#008000', blue: '#0000FF', navy: '#000080',
    gold: '#FFD700', yellow: '#FFFF00', orange: '#FFA500', purple: '#800080', pink: '#FFC0CB', burgundy: '#800020',
    maroon: '#800000', gray: '#808080', grey: '#808080', cream: '#FFFDD0', beige: '#F5F5DC',
  };
  const lower = prompt.toLowerCase();
  for (const [name, value] of Object.entries(named)) if (new RegExp(`\\b${name}\\b`, 'i').test(lower)) return value;
  return null;
}

function svgPaintSummary(svg = '') {
  const counts = new Map<string, { value: string; target: 'fill' | 'stroke'; count: number }>();
  const add = (target: 'fill' | 'stroke', raw: string) => {
    const value = raw.trim();
    if (!value || /^(none|transparent|inherit|currentcolor)$/i.test(value) || /^url\(/i.test(value)) return;
    const key = `${target}:${value.toLowerCase().replace(/\s+/g, '')}`;
    const existing = counts.get(key);
    if (existing) existing.count += 1;
    else counts.set(key, { value, target, count: 1 });
  };
  for (const match of svg.matchAll(/\b(fill|stroke)\s*=\s*["']([^"']+)["']/gi)) add(match[1].toLowerCase() as 'fill' | 'stroke', match[2]);
  for (const match of svg.matchAll(/\bstyle\s*=\s*["']([^"']+)["']/gi)) {
    for (const part of match[1].split(';')) {
      const style = part.match(/^\s*(fill|stroke)\s*:\s*(.+?)\s*$/i);
      if (style) add(style[1].toLowerCase() as 'fill' | 'stroke', style[2]);
    }
  }
  return Array.from(counts.values()).sort((a, b) => b.count - a.count).slice(0, 12);
}

function fallbackEdit(prompt: string, document: LabelDocument, selectedLayerId: string | null): LabelStudioAssistResponse {
  const layer = selectedLayer(document, selectedLayerId);
  const text = prompt.toLowerCase();
  const operations: LabelStudioOperation[] = [];

  const requestedColor = promptColor(prompt);
  if (/background/.test(text) && requestedColor) {
    return {
      message: `Changed the visible label background to ${requestedColor}. Gemini was unavailable, so no other objects were changed.`,
      operations: [{ type: 'set-background', color: requestedColor }],
      provider: 'label-studio-local',
      degraded: true,
    };
  }

  if (!layer) {
    return {
      message: 'Select a layer first for a precise edit. Gemini is unavailable right now, so Label Studio did not guess which object you meant.',
      operations,
      provider: 'label-studio-local',
      degraded: true,
    };
  }

  const amountMatch = prompt.match(/(-?\d+(?:\.\d+)?)\s*(px|pixels?|%|percent)?/i);
  const amount = amountMatch ? Number(amountMatch[1]) : null;
  const changes: Partial<LabelLayer> = {};

  if (/center|centre/.test(text)) {
    if (/vertical/.test(text)) changes.y = Math.round((document.height - layer.height) / 2);
    else changes.x = Math.round((document.width - layer.width) / 2);
  }
  if (amount !== null && /(move|shift).*(up|higher)/.test(text)) changes.y = layer.y - Math.abs(amount);
  if (amount !== null && /(move|shift).*(down|lower)/.test(text)) changes.y = layer.y + Math.abs(amount);
  if (amount !== null && /(move|shift).*(left)/.test(text)) changes.x = layer.x - Math.abs(amount);
  if (amount !== null && /(move|shift).*(right)/.test(text)) changes.x = layer.x + Math.abs(amount);

  if (layer.type === 'text') {
    if (/bold|bolder|heavier/.test(text)) changes.fontWeight = Math.min(1000, (layer.fontWeight || 700) + 100);
    if (/lighter|less bold/.test(text)) changes.fontWeight = Math.max(100, (layer.fontWeight || 700) - 100);
    if (amount !== null && /(larger|bigger|increase|grow)/.test(text)) {
      changes.fontSize = amountMatch?.[2]?.startsWith('%') || /percent|%/.test(amountMatch?.[2] || '')
        ? Math.round((layer.fontSize || 48) * (1 + Math.abs(amount) / 100))
        : Math.round((layer.fontSize || 48) + Math.abs(amount));
    }
    if (amount !== null && /(smaller|decrease|reduce|shrink)/.test(text)) {
      changes.fontSize = amountMatch?.[2]?.startsWith('%') || /percent|%/.test(amountMatch?.[2] || '')
        ? Math.round((layer.fontSize || 48) * (1 - Math.abs(amount) / 100))
        : Math.max(4, Math.round((layer.fontSize || 48) - Math.abs(amount)));
    }
  }

  if (!Object.keys(changes).length) {
    return {
      message: 'Gemini is temporarily unavailable. I can still handle simple selected-layer edits such as “move down 40px,” “center this,” or “make this 15% larger.”',
      operations,
      provider: 'label-studio-local',
      degraded: true,
    };
  }

  operations.push({ type: 'update', layerId: layer.id, changes });
  return {
    message: `Applied a local precision edit to ${layer.name}. Gemini was unavailable, so no other layers were changed.`,
    operations,
    provider: 'label-studio-local',
    degraded: true,
  };
}

function safeOperations(value: unknown, document: LabelDocument): LabelStudioOperation[] {
  if (!Array.isArray(value)) return [];
  const validIds = new Set(document.layers.map((layer) => layer.id));
  const operations: LabelStudioOperation[] = [];
  for (const item of value.slice(0, 20)) {
    if (!item || typeof item !== 'object') continue;
    const raw = item as Record<string, unknown>;
    const type = raw.type;
    if (type === 'update' && typeof raw.layerId === 'string' && validIds.has(raw.layerId) && raw.changes && typeof raw.changes === 'object') {
      const original = document.layers.find((layer) => layer.id === raw.layerId);
      if (!original || original.locked) continue;
      const requested = raw.changes as Record<string, unknown>;
      const safe = sanitizeLabelLayer({ ...original, ...requested, id: original.id, type: original.type });
      if (!safe) continue;
      const safeChanges: Partial<LabelLayer> = {};
      const requestedKeys = new Set(Object.keys(requested));
      if (requestedKeys.has('name')) safeChanges.name = safe.name;
      if (requestedKeys.has('visible')) safeChanges.visible = safe.visible;
      if (requestedKeys.has('x')) safeChanges.x = safe.x;
      if (requestedKeys.has('y')) safeChanges.y = safe.y;
      if (requestedKeys.has('width')) safeChanges.width = safe.width;
      if (requestedKeys.has('height')) safeChanges.height = safe.height;
      if (requestedKeys.has('rotation')) safeChanges.rotation = safe.rotation;
      if (requestedKeys.has('opacity')) safeChanges.opacity = safe.opacity;
      if (original.type === 'text') {
        if (requestedKeys.has('text')) safeChanges.text = safe.text;
        if (requestedKeys.has('fontSize')) safeChanges.fontSize = safe.fontSize;
        if (requestedKeys.has('fontWeight')) safeChanges.fontWeight = safe.fontWeight;
        if (requestedKeys.has('fontFamily')) safeChanges.fontFamily = safe.fontFamily;
        if (requestedKeys.has('letterSpacing')) safeChanges.letterSpacing = safe.letterSpacing;
        if (requestedKeys.has('align')) safeChanges.align = safe.align;
        if (requestedKeys.has('color')) safeChanges.color = safe.color;
      }
      if (original.type === 'shape') {
        if (requestedKeys.has('fill')) safeChanges.fill = safe.fill;
        if (requestedKeys.has('stroke')) safeChanges.stroke = safe.stroke;
        if (requestedKeys.has('strokeWidth')) safeChanges.strokeWidth = safe.strokeWidth;
        if (requestedKeys.has('radius')) safeChanges.radius = safe.radius;
      }
      if (original.type === 'image' && requestedKeys.has('fit')) safeChanges.fit = safe.fit;
      if (!Object.keys(safeChanges).length) continue;
      operations.push({ type: 'update', layerId: original.id, changes: safeChanges });
      continue;
    }
    if (type === 'add-text' && raw.layer) {
      const safe = sanitizeLabelLayer(raw.layer);
      if (!safe || safe.type !== 'text') continue;
      operations.push({ type: 'add-text', layer: safe });
      continue;
    }
    if (type === 'add-shape' && raw.layer) {
      const safe = sanitizeLabelLayer(raw.layer);
      if (!safe || safe.type !== 'shape') continue;
      operations.push({ type: 'add-shape', layer: safe });
      continue;
    }
    if (type === 'recolor' && typeof raw.layerId === 'string' && validIds.has(raw.layerId)) {
      const original = document.layers.find((layer) => layer.id === raw.layerId);
      const from = typeof raw.from === 'string' ? raw.from.trim().slice(0, 120) : '';
      const to = safeColor(raw.to);
      const target = raw.target === 'stroke' || raw.target === 'both' ? raw.target : 'fill';
      if (!original || original.locked || !from || !to || !(original.type === 'vector' || (original.type === 'text' && original.renderMode === 'outline' && original.outlineSvg))) continue;
      operations.push({ type: 'recolor', layerId: original.id, from, to, target });
      continue;
    }
    if (type === 'set-background') {
      const color = safeColor(raw.color);
      if (!color) continue;
      operations.push({ type: 'set-background', color });
      continue;
    }
    if ((type === 'delete' || type === 'duplicate') && typeof raw.layerId === 'string' && validIds.has(raw.layerId)) {
      const original = document.layers.find((layer) => layer.id === raw.layerId);
      if (!original || (type === 'delete' && original.locked)) continue;
      operations.push({ type, layerId: raw.layerId });
      continue;
    }
    if (type === 'move-layer' && typeof raw.layerId === 'string' && validIds.has(raw.layerId) && ['front','back','forward','backward'].includes(String(raw.direction))) {
      operations.push({ type, layerId: raw.layerId, direction: raw.direction as 'front' | 'back' | 'forward' | 'backward' });
    }
  }
  return operations;
}

export async function POST(request: NextRequest) {
  const role = await sessionRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (role === 'tasting') return NextResponse.json({ error: 'Label Studio is available to Admin and Sales access.' }, { status: 403 });

  let body: RequestBody;
  try {
    body = await request.json() as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Label Studio received an invalid request.' }, { status: 400 });
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim().slice(0, 1800) : '';
  const document = safeDocument(body.document);
  const selectedLayerId = typeof body.selectedLayerId === 'string' ? body.selectedLayerId : null;
  const project = body.project && typeof body.project === 'object' ? body.project as { slug?: unknown; name?: unknown } : {};

  if (!prompt) return NextResponse.json({ error: 'Describe the label edit first.' }, { status: 400 });
  if (!document) return NextResponse.json({ error: 'Label Studio could not read the current document.' }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return NextResponse.json(fallbackEdit(prompt, document, selectedLayerId));

  // Preserve the runtime guard as a concrete string for the nested Gemini helper.
  // TypeScript does not retain narrowing of an outer optional variable inside a closure.
  const requiredApiKey: string = apiKey;

  const primaryModel = process.env.LABEL_STUDIO_GEMINI_MODEL?.trim() || process.env.ASK_CENTRAL_GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';
  const fallbackModel = process.env.LABEL_STUDIO_GEMINI_FALLBACK_MODEL?.trim() || process.env.ASK_CENTRAL_GEMINI_FALLBACK_MODEL?.trim() || 'gemini-3.1-flash-lite';

  const layerSummary = document.layers.map((layer, index) => ({
    order: index,
    id: layer.id,
    name: layer.name,
    type: layer.type,
    locked: layer.locked,
    visible: layer.visible,
    x: layer.x,
    y: layer.y,
    width: layer.width,
    height: layer.height,
    rotation: layer.rotation,
    opacity: layer.opacity,
    ...(layer.type === 'text' ? { text: layer.text, fontSize: layer.fontSize, fontWeight: layer.fontWeight, fontFamily: layer.fontFamily, sourceFontFamily: layer.sourceFontFamily, renderMode: layer.renderMode, letterSpacing: layer.letterSpacing, align: layer.align, color: layer.color } : {}),
    ...(layer.type === 'shape' ? { fill: layer.fill, stroke: layer.stroke, strokeWidth: layer.strokeWidth, radius: layer.radius } : {}),
    ...(layer.type === 'image' ? { fit: layer.fit, hasImage: Boolean(layer.src) } : {}),
    ...(layer.type === 'vector' ? { paints: svgPaintSummary(layer.svg || '') } : {}),
    ...(layer.type === 'text' && layer.renderMode === 'outline' && layer.outlineSvg ? { outlinePaints: svgPaintSummary(layer.outlineSvg) } : {}),
  }));

  const systemInstruction = `You are Gemini inside Leelanau Cellars Label Studio, a precision wine-label editor. Convert the user's request into safe structured edits to the existing layered document.

RULES:
- Return ONLY valid JSON matching the requested shape. No markdown.
- Preserve every layer the user did not ask to change.
- NEVER edit, delete, duplicate, or reorder a locked layer.
- Prefer precise update operations over recreating layers.
- Vector artwork stores its real colors inside SVG. NEVER try to recolor a vector with an update operation. Use a recolor operation and copy the exact "from" value from that layer's paints list.
- For an outlined text layer, a color-only request should preserve the exact outline and use recolor (or an update with color only); do not switch fonts or recreate the text.
- For an outlined text wording change, send ONLY the requested text value (plus position only if explicitly requested). Label Studio will rebuild the wording from original Illustrator glyph outlines when it can; never add fontFamily/fontSize/fontWeight just because text changed.
- For an outlined text size change, scale width and height proportionally instead of changing fontSize. This preserves the exact Illustrator lettering.
- When the user asks to change the label/background color, use set-background. This changes the visible imported label background as well as the artboard.
- When the user says "this", "selected", or otherwise refers to the current object, use SELECTED_LAYER_ID.
- Coordinates and sizes are document pixels. The artboard origin is top-left.
- For "center" without another qualifier, horizontally center the selected/referenced layer: x=(document width-layer width)/2.
- For percentage size changes to LIVE text, change fontSize by that percentage. For OUTLINE text, scale width and height by that percentage. Do not scale unrelated layers.
- If the user asks for a creative improvement but does not identify exact objects, make at most 3 restrained edits and describe them in message.
- Do not invent regulatory facts, UPCs, alcohol percentages, legal copy, winery addresses, or factual wine data.
- You may add text or simple rectangular/rounded shape layers. Do not claim you created vector illustrations or native Adobe Illustrator files.
- Keep the message concise and explain exactly what will change.

OUTPUT SHAPE:
{"message":"short summary","operations":[
  {"type":"update","layerId":"existing-id","changes":{"x":100,"fontSize":72}},
  {"type":"add-text","layer":{"id":"ai-text","name":"Name","type":"text","visible":true,"locked":false,"x":100,"y":100,"width":500,"height":100,"rotation":0,"opacity":1,"text":"TEXT","fontSize":48,"fontWeight":700,"fontFamily":"Arial, Helvetica, sans-serif","letterSpacing":0,"align":"center","color":"#111111"}},
  {"type":"add-shape","layer":{"id":"ai-shape","name":"Shape","type":"shape","visible":true,"locked":false,"x":100,"y":100,"width":500,"height":200,"rotation":0,"opacity":1,"fill":"#ffffff","stroke":"#111111","strokeWidth":0,"radius":20}},
  {"type":"delete","layerId":"existing-id"},
  {"type":"duplicate","layerId":"existing-id"},
  {"type":"move-layer","layerId":"existing-id","direction":"front|back|forward|backward"},
  {"type":"recolor","layerId":"existing-vector-id","from":"rgb(100%, 100%, 100%)","to":"#D4AF37","target":"fill|stroke|both"},
  {"type":"set-background","color":"#17324D"}
]}`;

  const promptText = `PROJECT: ${String(project.name || document.name)} (${String(project.slug || document.projectSlug)})\nDOCUMENT: ${document.width}x${document.height}px\nSELECTED_LAYER_ID: ${selectedLayerId || '(none)'}\nUSER REQUEST: ${prompt}\n\nLAYERS (bottom to top):\n${JSON.stringify(layerSummary)}`;

  type GeminiPayload = {
    error?: { message?: string };
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  async function generate(model: string, timeoutMs: number) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': requiredApiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
          generationConfig: {
            maxOutputTokens: 1100,
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingLevel: 'minimal' },
          },
        }),
        cache: 'no-store',
        signal: controller.signal,
      });
      const raw = await response.text();
      let payload: GeminiPayload = {};
      try { payload = raw ? JSON.parse(raw) as GeminiPayload : {}; } catch { /* handled below */ }
      if (!response.ok) throw new Error(payload.error?.message || `Gemini returned HTTP ${response.status}.`);
      const text = (payload.candidates?.[0]?.content?.parts || []).map((part) => part.text || '').join('').trim();
      if (!text) throw new Error('Gemini did not return an edit.');
      return text;
    } finally {
      clearTimeout(timeout);
    }
  }

  const models = Array.from(new Set([primaryModel, fallbackModel].filter(Boolean)));
  let lastError: unknown = null;
  for (let index = 0; index < models.length; index += 1) {
    const model = models[index];
    try {
      const raw = await generate(model, index === 0 ? 5000 : 7000);
      const parsed = JSON.parse(raw) as { message?: unknown; operations?: unknown };
      const operations = safeOperations(parsed.operations, document);
      const message = operations.length
        ? (typeof parsed.message === 'string' && parsed.message.trim() ? parsed.message.trim().slice(0, 700) : 'Applied the requested label edit.')
        : 'Gemini described an edit, but it did not return a safe command that Central could apply. Nothing on the label was changed.';
      const response: LabelStudioAssistResponse = { message, operations, provider: 'google-gemini', model };
      return NextResponse.json(response);
    } catch (error) {
      lastError = error;
    }
  }

  console.error('Label Studio Gemini edit failed', lastError);
  return NextResponse.json(fallbackEdit(prompt, document, selectedLayerId));
}
