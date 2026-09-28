import { NextRequest, NextResponse } from 'next/server';
import { sessionRole } from '@/lib/auth';
import { QUICK_FACTS, CURRENT_TASTING_MENU_TEXT } from '@/lib/tasting-room-content';
import { loadLatestCaseSalesSummary } from '@/lib/case-sales-storage';
import { caseSalesGoalMetrics } from '@/lib/case-sales';
import { listMenuBlobs, loadMenuText } from '@/lib/blob-rest';
import {
  type AskCentralSource,
  type AskDistributionWine,
  type AskPortalRole,
  type AskWine,
  questionNeedsCaseSales,
  questionNeedsQuickFacts,
  questionNeedsTastingMenu,
  retrieveDistributionSources,
  retrieveWineSources,
} from '@/lib/ask-central';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type HistoryItem = { role: 'user' | 'assistant'; content: string };

type AskBody = {
  question?: unknown;
  portalRole?: unknown;
  wines?: unknown;
  distributionWines?: unknown;
  history?: unknown;
};

function validPortalRole(value: unknown): value is AskPortalRole {
  return value === 'admin' || value === 'tasting' || value === 'sales' || value === 'distribution';
}

function allowedPortal(session: 'admin' | 'sales' | 'tasting', portal: AskPortalRole) {
  if (session === 'admin') return true;
  if (session === 'tasting') return portal === 'tasting';
  return portal === 'sales' || portal === 'distribution';
}

function safeWineArray(value: unknown) {
  if (!Array.isArray(value)) return [] as AskWine[];
  return value.filter((item): item is AskWine => Boolean(item && typeof item === 'object' && typeof (item as AskWine).name === 'string')).slice(0, 250);
}

function safeDistributionArray(value: unknown) {
  if (!Array.isArray(value)) return [] as AskDistributionWine[];
  return value.filter((item): item is AskDistributionWine => Boolean(item && typeof item === 'object' && typeof (item as AskDistributionWine).name === 'string')).slice(0, 250);
}

function safeHistory(value: unknown) {
  if (!Array.isArray(value)) return [] as HistoryItem[];
  return value
    .filter((item): item is HistoryItem => Boolean(item && typeof item === 'object' && ((item as HistoryItem).role === 'user' || (item as HistoryItem).role === 'assistant') && typeof (item as HistoryItem).content === 'string'))
    .slice(-4)
    .map((item) => ({ ...item, content: item.content.slice(0, 1000) }));
}

async function currentMenuText() {
  try {
    const [current] = await listMenuBlobs();
    if (!current) return CURRENT_TASTING_MENU_TEXT.trim();
    return (await loadMenuText(current)).text;
  } catch {
    return CURRENT_TASTING_MENU_TEXT.trim();
  }
}

function addSource(sources: AskCentralSource[], source: Omit<AskCentralSource, 'id'>) {
  const existing = sources.find((item) => item.type === source.type && item.path === source.path && item.title === source.title);
  if (existing) return existing;
  const item = { ...source, id: `S${sources.length + 1}` };
  sources.push(item);
  return item;
}

function sourceBlock(sources: AskCentralSource[]) {
  return sources.map((source) => `${source.id} | ${source.type.toUpperCase()} | ${source.title}\n${source.summary}`).join('\n\n');
}

export async function POST(request: NextRequest) {
  const session = await sessionRole();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: AskBody;
  try {
    body = await request.json() as AskBody;
  } catch {
    return NextResponse.json({ error: 'Ask Central received an invalid request.' }, { status: 400 });
  }

  const question = typeof body.question === 'string' ? body.question.trim().slice(0, 1600) : '';
  if (!question) return NextResponse.json({ error: 'Ask a question first.' }, { status: 400 });
  const portalRole: AskPortalRole = validPortalRole(body.portalRole) ? body.portalRole : session;
  if (!allowedPortal(session, portalRole)) return NextResponse.json({ error: 'This portal is not available for your current access.' }, { status: 403 });

  const wines = portalRole === 'distribution' ? [] : safeWineArray(body.wines);
  const distributionWines = portalRole === 'tasting' ? [] : safeDistributionArray(body.distributionWines);
  const history = safeHistory(body.history);
  const lastUserContext = [...history].reverse().find((item) => item.role === 'user')?.content || '';
  const retrievalQuestion = lastUserContext ? `${lastUserContext} ${question}` : question;
  const sources: AskCentralSource[] = [];

  for (const source of retrieveWineSources(retrievalQuestion, wines, 24)) {
    const winePath = /\btech\s*sheet/i.test(question) && (portalRole === 'admin' || portalRole === 'sales')
      ? source.path.replace('/wine-library/', '/tech-sheets/')
      : /\b(spec|specs|upc|gtin|dimension|weight|case pack)\b/i.test(question)
        ? `${source.path}/specs`
        : source.path;
    addSource(sources, { type: source.type, title: source.title, path: winePath, summary: source.summary });
  }
  if (portalRole === 'admin' || portalRole === 'sales' || portalRole === 'distribution') {
    const distroSources = retrieveDistributionSources(retrievalQuestion, distributionWines, 1, 30);
    for (const source of distroSources) addSource(sources, { type: source.type, title: source.title, path: source.path, summary: source.summary });
  }

  if ((portalRole === 'admin' || portalRole === 'tasting' || portalRole === 'sales') && questionNeedsQuickFacts(retrievalQuestion)) {
    addSource(sources, {
      type: 'quick-facts',
      title: 'Leelanau Cellars Quick Facts',
      path: '/quick-facts',
      summary: JSON.stringify(QUICK_FACTS),
    });
  }

  if ((portalRole === 'admin' || portalRole === 'tasting') && questionNeedsCaseSales(retrievalQuestion)) {
    try {
      const summary = await loadLatestCaseSalesSummary();
      if (summary) {
        const metrics = caseSalesGoalMetrics(summary);
        addSource(sources, {
          type: 'case-sales',
          title: 'Case Sales Tracker',
          path: '/case-sales',
          summary: JSON.stringify({
            asOfDate: summary.asOfDate,
            grossCasesSold: summary.grossCasesSold,
            casesRemainingAfterLinkedRefunds: summary.casesRemainingAfterLinkedRefunds,
            transactionsFeaturingCaseOrMore: summary.caseOrders,
            goalCases: summary.goalCases,
            goalEndDate: summary.goalEndDate,
            dailyCases: summary.dailyCases,
            metrics,
          }),
        });
      }
    } catch {
      // The assistant can still answer from other Central sources.
    }
  }

  if ((portalRole === 'admin' || portalRole === 'tasting' || portalRole === 'sales') && questionNeedsTastingMenu(retrievalQuestion)) {
    addSource(sources, {
      type: 'tasting-menu',
      title: 'Current Tasting Room Menu',
      path: '/tasting-menu',
      summary: await currentMenuText(),
    });
  }

  if (!sources.length) {
    // Give the model a small general Central index so it can explain that a requested fact is not available
    // without inventing an answer, while still recognizing known wine names.
    for (const source of retrieveWineSources(retrievalQuestion, wines, 5)) {
      addSource(sources, { type: source.type, title: source.title, path: source.path, summary: source.summary });
    }
  }

  const primaryModel = process.env.ASK_CENTRAL_GEMINI_MODEL?.trim() || 'gemini-3.1-flash-lite';
  const fallbackModel = process.env.ASK_CENTRAL_GEMINI_FALLBACK_MODEL?.trim() || 'gemini-3.5-flash';
  const historyText = history.length ? `\nRECENT CONVERSATION:\n${history.map((item) => `${item.role.toUpperCase()}: ${item.content}`).join('\n')}` : '';

  // Keep the Gemini prompt lean. Earlier versions could pass dozens of matching
  // records even though staff usually need one or two exact answers. Operational
  // sources always stay in the prompt, then we keep the strongest wine/distribution
  // matches. This materially reduces model input latency without changing what
  // Central searches.
  const operationalSources = sources.filter((source) => source.type === 'case-sales' || source.type === 'tasting-menu' || source.type === 'quick-facts');
  const wineSources = sources.filter((source) => source.type === 'wine');
  const distributionSources = sources.filter((source) => source.type === 'distribution');
  const distributionPriority = /\b(gtin|dimension|weight|case pack|package|meijer|target|distribution|distributor)\b/i.test(retrievalQuestion);
  const selectedSources = [
    ...operationalSources,
    ...(distributionPriority ? distributionSources.slice(0, 8) : wineSources.slice(0, 9)),
    ...(distributionPriority ? wineSources.slice(0, 4) : distributionSources.slice(0, 5)),
  ].slice(0, 10).map((source, index) => ({ ...source, id: `S${index + 1}` }));

  const context = sourceBlock(selectedSources);
  const systemInstruction = `You are Ask Central, the internal Leelanau Cellars information assistant.\n\nRULES:\n- Answer ONLY from the CENTRAL SOURCES supplied in the prompt. Do not use general wine knowledge, web knowledge, or assumptions.\n- If Central does not contain enough information, say exactly that you could not find the answer in Central.\n- Never invent UPCs, GTINs, prices, dimensions, awards, vintages, menu status, case-sales numbers, or other facts.\n- Keep answers concise and practical for winery staff. Prefer short paragraphs or 3-6 bullets instead of long responses.\n- You may use **bold** for short labels. Do not use markdown headings.\n- When a factual statement comes from a source, cite its source ID in square brackets, for example [S1].\n- Prefer exact identifiers and measurements when they are available.\n- For current tasting-menu questions, only call a wine current if the Current Tasting Room Menu source supports it.\n- For case-sales questions, distinguish gross cases from cases remaining after linked refunds when relevant.\n- Do not expose information outside the current portal's supplied sources.`;
  const prompt = `PORTAL: ${portalRole}\nQUESTION: ${question}${historyText}\n\nCENTRAL SOURCES:\n${context || '(No matching Central source was found.)'}`;

  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({
        error: 'Gemini is not configured for Ask Central.',
        hint: 'Add GEMINI_API_KEY to the Vercel project environment variables, then redeploy.',
      }, { status: 503 });
    }

    // Preserve the runtime guard as a concrete string for nested request helpers.
    // TypeScript intentionally does not carry the narrowing of an outer optional
    // variable into a nested function closure.
    const requiredApiKey: string = apiKey;

    type GeminiPayload = {
      error?: { message?: string; status?: string };
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
        finishReason?: string;
      }>;
      promptFeedback?: { blockReason?: string };
    };

    class GeminiHttpError extends Error {
      status: number;
      retryable: boolean;
      canFallback: boolean;

      constructor(message: string, status: number, retryable: boolean, canFallback = retryable) {
        super(message);
        this.name = 'GeminiHttpError';
        this.status = status;
        this.retryable = retryable;
        this.canFallback = canFallback;
      }
    }

    async function generate(model: string, timeoutMs: number) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      let response: Response;

      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': requiredApiKey,
            },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemInstruction }] },
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 450, temperature: 0.2 },
            }),
            cache: 'no-store',
            signal: controller.signal,
          },
        );
      } catch (error) {
        if (controller.signal.aborted) {
          throw new GeminiHttpError(`${model} took too long to respond.`, 504, true, true);
        }
        throw error;
      } finally {
        clearTimeout(timeout);
      }

      const raw = await response.text();
      let payload: GeminiPayload = {};

      try {
        payload = raw ? JSON.parse(raw) as GeminiPayload : {};
      } catch {
        if (!response.ok) throw new GeminiHttpError(`Gemini returned HTTP ${response.status}.`, response.status, response.status >= 500);
        throw new Error('Gemini returned an unreadable response.');
      }

      if (!response.ok) {
        const apiMessage = payload.error?.message?.trim();
        if (response.status === 401 || response.status === 403) {
          throw new GeminiHttpError(apiMessage || 'Gemini rejected the API key. Check GEMINI_API_KEY in Vercel.', response.status, false, false);
        }
        if (response.status === 429) {
          throw new GeminiHttpError(apiMessage || 'Gemini is temporarily rate limited.', response.status, true, true);
        }
        if (response.status === 404) {
          throw new GeminiHttpError(apiMessage || `Gemini model ${model} is unavailable.`, response.status, false, true);
        }
        if (response.status >= 500) {
          throw new GeminiHttpError(apiMessage || 'Gemini is temporarily unavailable.', response.status, true, true);
        }
        throw new GeminiHttpError(apiMessage || `Gemini request failed with HTTP ${response.status}.`, response.status, false, false);
      }

      const answer = (payload.candidates?.[0]?.content?.parts || [])
        .map((part) => part.text || '')
        .join('')
        .trim();

      if (!answer) {
        const blockReason = payload.promptFeedback?.blockReason;
        throw new Error(blockReason ? `Gemini did not return an answer (${blockReason}).` : 'Gemini did not return an answer.');
      }

      return answer;
    }

    // Speed-first failover: one fast attempt on Flash-Lite, then immediately
    // try the stronger Flash model if the first model is overloaded, rate-limited,
    // missing, or slow. No multi-second exponential retry chain.
    const models = Array.from(new Set([primaryModel, fallbackModel].filter(Boolean)));
    let lastError: unknown = null;

    for (let modelIndex = 0; modelIndex < models.length; modelIndex += 1) {
      const model = models[modelIndex];
      try {
        const answer = await generate(model, modelIndex === 0 ? 4500 : 6500);
        return NextResponse.json({
          answer,
          sources: selectedSources.map(({ id, type, title, path }) => ({ id, type, title, path })),
          model,
          provider: 'google-gemini',
          fallbackUsed: modelIndex > 0,
        });
      } catch (error) {
        lastError = error;
        const geminiError = error instanceof GeminiHttpError ? error : null;

        // Authentication/configuration failures should surface immediately.
        if (geminiError && !geminiError.canFallback && !geminiError.retryable) throw error;

        // Temporary demand, rate-limit, missing-model, and timeout failures move
        // straight to the fallback instead of making staff wait through retries.
        if (modelIndex < models.length - 1 && (geminiError?.canFallback ?? false)) continue;
        throw error;
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Ask Central is temporarily unavailable.');
  } catch (error) {
    console.error('Ask Central failed', error);

    const status = error instanceof Error && 'status' in error && typeof (error as { status?: unknown }).status === 'number'
      ? (error as { status: number }).status
      : 0;

    if (status === 401 || status === 403) {
      return NextResponse.json({
        error: 'Ask Central could not authenticate with Gemini.',
        hint: 'Check GEMINI_API_KEY in the Vercel project, then redeploy if the key was changed.',
      }, { status: 502 });
    }

    if (status === 429) {
      return NextResponse.json({
        error: 'Ask Central is temporarily at its Gemini usage limit.',
        hint: 'Both Gemini models were tried automatically. Please try again in a moment.',
      }, { status: 503 });
    }

    if (status >= 500) {
      return NextResponse.json({
        error: 'Ask Central is busy right now.',
        hint: 'Ask Central tried both Gemini models automatically. Please try again in a moment.',
      }, { status: 503 });
    }

    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Ask Central is temporarily unavailable.',
      hint: 'Ask Central automatically tries a backup Gemini model when the first one is unavailable.',
    }, { status: 502 });
  }
}
