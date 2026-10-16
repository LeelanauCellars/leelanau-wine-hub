import { NextRequest, NextResponse } from 'next/server';
import { sessionRole } from '@/lib/auth';
import type { TechSheetDraft } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RequestBody = {
  prompt?: unknown;
  draft?: unknown;
  wine?: unknown;
  approvedLifestyleImages?: unknown;
};

type AssistResponse = {
  message: string;
  patch: Partial<TechSheetDraft>;
  provider: 'google-gemini' | 'tech-sheet-local';
  model?: string;
  degraded?: boolean;
};

const STRING_LIMITS: Partial<Record<keyof TechSheetDraft, number>> = {
  wineName: 160,
  tastingNotes: 5200,
  abv: 80,
  casePack: 140,
  upc: 80,
  gtin: 100,
  retailerCost: 100,
  distributorCost: 100,
  srp: 100,
  lifestyleTitle: 220,
  footer: 500,
};

const STRING_KEYS = new Set<keyof TechSheetDraft>([
  'wineName', 'tastingNotes', 'abv', 'casePack', 'upc', 'gtin', 'retailerCost', 'distributorCost', 'srp', 'lifestyleTitle', 'footer',
]);

const BOOLEAN_KEYS = new Set<keyof TechSheetDraft>([
  'includeTastingNotes', 'includeWineSpecs', 'includeHighlights', 'includeCasePackaging', 'autoHeaderColor',
]);

function safeText(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : null;
}

function sanitizeRichText(value: unknown, max = 5200) {
  if (typeof value !== 'string') return null;
  let text = value.slice(0, max)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<(?!\/?(?:strong|b|u|mark|br)\b)[^>]*>/gi, '')
    .replace(/<(strong|b|u)\b[^>]*>/gi, '<$1>')
    .replace(/<mark\b[^>]*>/gi, '<mark>')
    .replace(/<br\b[^>]*>/gi, '<br>');
  return text.trim();
}

function safeColor(value: unknown) {
  if (typeof value !== 'string') return null;
  const color = value.trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color.toUpperCase() : null;
}

function safeStringArray(value: unknown, maxItems: number, maxLength: number, rich = false) {
  if (!Array.isArray(value)) return null;
  return value
    .slice(0, maxItems)
    .map((item) => rich ? sanitizeRichText(item, maxLength) : safeText(item, maxLength))
    .filter((item): item is string => Boolean(item));
}

function safePatch(value: unknown): Partial<TechSheetDraft> {
  if (!value || typeof value !== 'object') return {};
  const raw = value as Record<string, unknown>;
  const patch: Partial<TechSheetDraft> = {};

  for (const key of STRING_KEYS) {
    if (!(key in raw)) continue;
    if (key === 'tastingNotes') {
      const text = sanitizeRichText(raw[key], STRING_LIMITS[key] || 5200);
      if (text !== null) patch.tastingNotes = text;
      continue;
    }
    const text = safeText(raw[key], STRING_LIMITS[key] || 500);
    if (text === null) continue;
    // TypeScript cannot infer the indexed subtype from the runtime key set.
    (patch as unknown as Record<string, unknown>)[key] = text;
  }

  for (const key of BOOLEAN_KEYS) {
    if (typeof raw[key] === 'boolean') (patch as unknown as Record<string, unknown>)[key] = raw[key];
  }

  if ('highlights' in raw) {
    const highlights = safeStringArray(raw.highlights, 8, 900, true);
    if (highlights) patch.highlights = highlights;
  }
  if ('lifestyleBullets' in raw) {
    const bullets = safeStringArray(raw.lifestyleBullets, 10, 300, false);
    if (bullets) patch.lifestyleBullets = bullets;
  }
  if ('headerColor' in raw) {
    const color = safeColor(raw.headerColor);
    if (color) patch.headerColor = color;
  }
  if ('bottleScale' in raw && typeof raw.bottleScale === 'number' && Number.isFinite(raw.bottleScale)) {
    patch.bottleScale = Math.max(0.5, Math.min(4, raw.bottleScale));
  }
  if ('bottleOffsetY' in raw && typeof raw.bottleOffsetY === 'number' && Number.isFinite(raw.bottleOffsetY)) {
    patch.bottleOffsetY = Math.round(Math.max(-140, Math.min(80, raw.bottleOffsetY)));
  }

  return patch;
}

function localPatch(prompt: string): AssistResponse {
  const lower = prompt.toLowerCase();
  const patch: Partial<TechSheetDraft> = {};
  const hide = /(remove|hide|omit|turn off|take off|delete)/;
  const show = /(show|include|turn on|add back|restore)/;

  if (/tasting notes?/.test(lower)) {
    if (hide.test(lower)) patch.includeTastingNotes = false;
    else if (show.test(lower)) patch.includeTastingNotes = true;
    if (/clear|empty/.test(lower)) patch.tastingNotes = '';
  }
  if (/wine specs?|specs?/.test(lower)) {
    if (hide.test(lower)) patch.includeWineSpecs = false;
    else if (show.test(lower)) patch.includeWineSpecs = true;
  }
  if (/highlights?/.test(lower)) {
    if (hide.test(lower)) patch.includeHighlights = false;
    else if (show.test(lower)) patch.includeHighlights = true;
    if (/clear|empty/.test(lower)) patch.highlights = [];
  }

  const keys = Object.keys(patch);
  return {
    message: keys.length
      ? 'Applied the section change locally. Gemini was unavailable, so no copy was rewritten.'
      : 'Gemini is temporarily unavailable. Section commands such as “remove Wine Specs” still work locally; copywriting changes were not applied.',
    patch,
    provider: 'tech-sheet-local',
    degraded: true,
  };
}

export async function POST(request: NextRequest) {
  const role = await sessionRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (role === 'tasting') return NextResponse.json({ error: 'Tech Sheet Assistant is available to Admin and Sales access.' }, { status: 403 });

  let body: RequestBody;
  try {
    body = await request.json() as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Tech Sheet Assistant received an invalid request.' }, { status: 400 });
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim().slice(0, 2200) : '';
  if (!prompt) return NextResponse.json({ error: 'Describe the tech-sheet change first.' }, { status: 400 });

  const currentDraft = body.draft && typeof body.draft === 'object' ? body.draft as Record<string, unknown> : {};
  const wine = body.wine && typeof body.wine === 'object' ? body.wine as Record<string, unknown> : {};
  const approvedLifestyleImages = Array.isArray(body.approvedLifestyleImages)
    ? body.approvedLifestyleImages.slice(0, 20).filter((item) => item && typeof item === 'object')
    : [];

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return NextResponse.json(localPatch(prompt));
  const requiredApiKey: string = apiKey;

  const primaryModel = process.env.TECH_SHEET_GEMINI_MODEL?.trim() || process.env.ASK_CENTRAL_GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';
  const fallbackModel = process.env.TECH_SHEET_GEMINI_FALLBACK_MODEL?.trim() || process.env.ASK_CENTRAL_GEMINI_FALLBACK_MODEL?.trim() || 'gemini-3.1-flash-lite';

  const systemInstruction = `You are Gemini inside Leelanau Cellars Central's Tech Sheet Builder. You edit ONLY the current sales tech-sheet draft. You never modify Commerce7, the Wine Library, or source records.

RULES:
- Return ONLY valid JSON: {"message":"short explanation","patch":{...}}. No markdown.
- Include ONLY fields that actually need to change. Never echo the whole draft.
- Do not invent wine facts, awards, prices, UPCs, GTINs, ABV, case size, legal claims, retailer/distributor costs, or production facts. Use the supplied source context only.
- You may rewrite existing tasting notes/highlights for clarity, length, sales usefulness, or tone, but preserve factual meaning.
- Tech-sheet section visibility is controlled with includeTastingNotes, includeWineSpecs, includeHighlights.
- To remove a section, set its include... field false. To restore it, set true. Do not erase its content unless the user explicitly asks to clear it.
- Allowed inline formatting inside tastingNotes/highlights: <strong>...</strong>, <u>...</u>, <mark>...</mark>, and <br>. No other HTML.
- If asked to bold/underline/highlight specific existing copy, return that field with only the requested markup added.
- highlights must be an array of strings, one selling point per item. Keep it concise; normally 1-4 items.
- lifestyleBullets must be an array of concise strings.
- headerColor must be a six-digit hex color such as #5BA3F8.
- bottleScale is 0.5-4. bottleOffsetY is -140 to 80.
- Do not create or guess image URLs. Lifestyle imagery is managed separately in the builder.
- Keep the response message concise and say what changed.

ALLOWED PATCH KEYS:
wineName, includeTastingNotes, includeWineSpecs, includeHighlights, tastingNotes, highlights, abv, casePack, upc, gtin, retailerCost, distributorCost, srp, includeCasePackaging, lifestyleTitle, lifestyleBullets, bottleScale, bottleOffsetY, headerColor, autoHeaderColor, footer.`;

  const promptText = `USER REQUEST: ${prompt}\n\nCURRENT TECH SHEET DRAFT:\n${JSON.stringify(currentDraft)}\n\nSOURCE WINE CONTEXT (facts may be used, not invented):\n${JSON.stringify(wine)}\n\nAPPROVED LIFESTYLE ASSET METADATA (reference only):\n${JSON.stringify(approvedLifestyleImages)}`;

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
            maxOutputTokens: 1400,
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
      const raw = await generate(model, index === 0 ? 6000 : 8000);
      const parsed = JSON.parse(raw) as { message?: unknown; patch?: unknown };
      const patch = safePatch(parsed.patch);
      const message = Object.keys(patch).length
        ? (typeof parsed.message === 'string' && parsed.message.trim() ? parsed.message.trim().slice(0, 700) : 'Applied the requested tech-sheet changes.')
        : 'Gemini did not return a safe change that Central could apply. The tech sheet was left unchanged.';
      const response: AssistResponse = { message, patch, provider: 'google-gemini', model };
      return NextResponse.json(response);
    } catch (error) {
      lastError = error;
    }
  }

  console.error('Tech Sheet Gemini edit failed', lastError);
  return NextResponse.json(localPatch(prompt));
}
