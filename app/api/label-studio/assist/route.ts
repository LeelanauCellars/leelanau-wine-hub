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

function fallbackEdit(prompt: string, document: LabelDocument, selectedLayerId: string | null): LabelStudioAssistResponse {
  const layer = selectedLayer(document, selectedLayerId);
  const text = prompt.toLowerCase();
  const operations: LabelStudioOperation[] = [];

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
      const safe = sanitizeLabelLayer({ ...original, ...(raw.changes as object), id: original.id, type: original.type });
      if (!safe) continue;
      const { id: _id, type: _type, ...safeChanges } = safe;
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
    ...(layer.type === 'text' ? { text: layer.text, fontSize: layer.fontSize, fontWeight: layer.fontWeight, fontFamily: layer.fontFamily, letterSpacing: layer.letterSpacing, align: layer.align, color: layer.color } : {}),
    ...(layer.type === 'shape' ? { fill: layer.fill, stroke: layer.stroke, strokeWidth: layer.strokeWidth, radius: layer.radius } : {}),
    ...(layer.type === 'image' ? { fit: layer.fit, hasImage: Boolean(layer.src) } : {}),
  }));

  const systemInstruction = `You are Gemini inside Leelanau Cellars Label Studio, a precision wine-label editor. Convert the user's request into safe structured edits to the existing layered document.

RULES:
- Return ONLY valid JSON matching the requested shape. No markdown.
- Preserve every layer the user did not ask to change.
- NEVER edit, delete, duplicate, or reorder a locked layer.
- Prefer precise update operations over recreating layers.
- When the user says "this", "selected", or otherwise refers to the current object, use SELECTED_LAYER_ID.
- Coordinates and sizes are document pixels. The artboard origin is top-left.
- For "center" without another qualifier, horizontally center the selected/referenced layer: x=(document width-layer width)/2.
- For percentage size changes to text, change fontSize by that percentage. Do not scale unrelated layers.
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
  {"type":"move-layer","layerId":"existing-id","direction":"front|back|forward|backward"}
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
      const message = typeof parsed.message === 'string' && parsed.message.trim() ? parsed.message.trim().slice(0, 700) : operations.length ? 'Applied the requested label edit.' : 'No safe edit was needed.';
      const response: LabelStudioAssistResponse = { message, operations, provider: 'google-gemini', model };
      return NextResponse.json(response);
    } catch (error) {
      lastError = error;
    }
  }

  console.error('Label Studio Gemini edit failed', lastError);
  return NextResponse.json(fallbackEdit(prompt, document, selectedLayerId));
}
