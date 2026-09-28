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

function parsedSummary(source: AskCentralSource) {
  try {
    const parsed = JSON.parse(source.summary) as unknown;
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '';
  if (Array.isArray(value)) {
    return value
      .map((item) => typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item))
      .filter(Boolean)
      .join(', ');
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== null && item !== undefined && item !== '')
      .slice(0, 6)
      .map(([key, item]) => `${key}: ${String(item)}`)
      .join(' · ');
  }
  return String(value);
}

function retrievalFallbackAnswer(question: string, sources: AskCentralSource[]) {
  const q = question.toLowerCase();

  if (!sources.length) {
    return "I couldn't find enough information in Central to answer that.";
  }

  const caseSource = sources.find((source) => source.type === 'case-sales');
  if (caseSource && /\b(case|cases|goal|sales|sold|pace|remaining|per day|tracker)\b/i.test(question)) {
    const data = parsedSummary(caseSource);
    if (data) {
      const metrics = data.metrics && typeof data.metrics === 'object' ? data.metrics as Record<string, unknown> : {};
      const sold = displayValue(data.casesRemainingAfterLinkedRefunds);
      const gross = displayValue(data.grossCasesSold);
      const goal = displayValue(data.goalCases);
      const remaining = displayValue(metrics.remainingCases);
      const perDay = displayValue(metrics.casesPerDayNeeded);
      const asOf = displayValue(data.asOfDate);
      const pieces = [
        sold ? `**Cases sold:** ${sold}` : '',
        gross && gross !== sold ? `**Gross cases:** ${gross}` : '',
        goal ? `**Goal:** ${goal}` : '',
        remaining ? `**Cases to go:** ${remaining}` : '',
        perDay ? `**Needed per day:** ${perDay}` : '',
        asOf ? `**As of:** ${asOf}` : '',
      ].filter(Boolean);
      return `Central pulled the live tracker directly.\n\n${pieces.join('\n')} [${caseSource.id}]`;
    }
  }

  const distributionIntent = /\b(gtin|upc|dimension|dimensions|weight|case pack|package|meijer|target|distribution|distributor|spec|specs)\b/i.test(question);
  const distributionSource = sources.find((source) => source.type === 'distribution');
  const wineSource = sources.find((source) => source.type === 'wine');

  const factsSource = sources.find((source) => source.type === 'quick-facts');
  if (factsSource) {
    const year = q.match(/\b20\d{2}\b/)?.[0];
    if (year && !wineSource) {
      const vintage = QUICK_FACTS.vintages.find((item) => item.year === year);
      if (vintage) {
        return `Central found the ${year} vintage notes directly:\n\n${vintage.bullets.map((item) => `• ${item}`).join('\n')} [${factsSource.id}]`;
      }
    }

    if (/\b(history|founded|founder|owner|family|story)\b/i.test(question)) {
      return `Central found the winery history directly:\n\n${QUICK_FACTS.story.bullets.slice(0, 4).map((item) => `• ${item}`).join('\n')} [${factsSource.id}]`;
    }

    if (/\b(vineyard|acre|acres|site|omena|pleasant hill|hilltop|m204)\b/i.test(question)) {
      const sites = QUICK_FACTS.vineyards.map((item) => `• **${item.site}:** ${item.features}`).join('\n');
      return `Central found the vineyard information directly:\n\n${QUICK_FACTS.vineyardNote}\n${sites} [${factsSource.id}]`;
    }
  }

  // General wine questions should stay on the Wine Library record. v63 checked
  // distribution first, which meant a Gemini outage could turn a question like
  // “What do you know about the 2021 Baco?” into an unrelated distribution wine.
  // Distribution only wins when the question explicitly asks for distribution/spec data.
  if (distributionIntent && distributionSource) {
    const data = parsedSummary(distributionSource);
    if (data) {
      const specs = data.specs && typeof data.specs === 'object' ? data.specs as Record<string, unknown> : {};
      const imperial = data.imperial && typeof data.imperial === 'object' ? data.imperial as Record<string, unknown> : {};
      const lines: string[] = [];
      const add = (label: string, value: unknown) => {
        const shown = displayValue(value);
        if (shown) lines.push(`**${label}:** ${shown}`);
      };

      add('Wine', data.name);
      if (/\bgtin\b/i.test(question)) add('GTIN', data.gtin);
      if (/\bupc\b/i.test(question)) add('UPC', data.upc);
      if (/\b(size|package|case|dimension|dimensions|weight|spec|specs)\b/i.test(question)) {
        add('Package size', specs.size);
        Object.entries(imperial).slice(0, 6).forEach(([key, value]) => add(key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase()), value));
      }
      if (/\b(abv|alcohol)\b/i.test(question)) add('ABV', specs.abv);
      if (/\b(composition|blend|grape)\b/i.test(question)) add('Composition', specs.composition);

      if (lines.length <= 1) {
        add('GTIN', data.gtin);
        add('UPC', data.upc);
        add('Package size', specs.size);
        add('ABV', specs.abv);
        add('Composition', specs.composition);
      }

      return `Central found the matching distribution record directly:\n\n${lines.join('\n')} [${distributionSource.id}]`;
    }
  }

  if (wineSource) {
    const data = parsedSummary(wineSource);
    if (data) {
      const lines: string[] = [];
      const add = (label: string, value: unknown) => {
        const shown = displayValue(value);
        if (shown) lines.push(`**${label}:** ${shown}`);
      };

      add('Wine', data.name);
      add('Vintage', data.vintage);
      if (/\b(price|cost|dollar|\$)\b/i.test(question)) add('Price', data.price);
      if (/\bupc\b/i.test(question)) add('UPC', data.upc);
      if (/\b(abv|alcohol)\b/i.test(question)) add('ABV', data.abv);
      if (/\b(sweet|dry|sweetness)\b/i.test(question)) add('Sweetness', data.sweetness);
      if (/\b(pair|food)\b/i.test(question)) add('Pairings', data.pairings);
      if (/\b(award|gold|silver|bronze|class)\b/i.test(question)) add('Awards', data.awards);
      if (/\b(taste|flavor|note|description|about|detail)\b/i.test(question)) {
        add('Tasting notes', data.tastingNotes);
        add('Description', data.shortDescription);
      }

      if (lines.length <= 2) {
        add('Varietal', data.varietal);
        add('Price', data.price);
        add('ABV', data.abv);
        add('Sweetness', data.sweetness);
        add('Tasting notes', data.tastingNotes);
      }

      return `Central found the matching wine record directly:\n\n${lines.slice(0, 7).join('\n')} [${wineSource.id}]`;
    }
  }

  if (distributionSource) {
    const data = parsedSummary(distributionSource);
    if (data) {
      const specs = data.specs && typeof data.specs === 'object' ? data.specs as Record<string, unknown> : {};
      const lines: string[] = [];
      const add = (label: string, value: unknown) => {
        const shown = displayValue(value);
        if (shown) lines.push(`**${label}:** ${shown}`);
      };
      add('Wine', data.name);
      add('GTIN', data.gtin);
      add('UPC', data.upc);
      add('Package size', specs.size);
      add('ABV', specs.abv);
      add('Composition', specs.composition);
      return `Central found the closest available distribution record directly:\n\n${lines.join('\n')} [${distributionSource.id}]`;
    }
  }

  const menuSource = sources.find((source) => source.type === 'tasting-menu');
  if (menuSource) {
    const items = menuSource.summary.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
    const terms = q.split(/[^a-z0-9]+/).filter((term) => term.length > 3);
    const matches = items.filter((item) => terms.some((term) => item.toLowerCase().includes(term))).slice(0, 12);
    if (matches.length) {
      return `Central found these matching wines on the current tasting menu:\n\n${matches.map((item) => `• ${item}`).join('\n')} [${menuSource.id}]`;
    }
  }

  return `Central found matching information in **${sources[0].title}**. Open Sources below to view it. [${sources[0].id}]`;
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

  const primaryModel = process.env.ASK_CENTRAL_GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';
  const fallbackModel = process.env.ASK_CENTRAL_GEMINI_FALLBACK_MODEL?.trim() || 'gemini-3.1-flash-lite';
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
              generationConfig: {
                maxOutputTokens: 450,
                thinkingConfig: { thinkingLevel: 'minimal' },
              },
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

    if (status === 429 || status >= 500) {
      return NextResponse.json({
        answer: retrievalFallbackAnswer(question, selectedSources),
        sources: selectedSources.map(({ id, type, title, path }) => ({ id, type, title, path })),
        model: 'central-direct',
        provider: 'central-retrieval',
        fallbackUsed: true,
        degraded: true,
      });
    }

    return NextResponse.json({
      answer: retrievalFallbackAnswer(question, selectedSources),
      sources: selectedSources.map(({ id, type, title, path }) => ({ id, type, title, path })),
      model: 'central-direct',
      provider: 'central-retrieval',
      fallbackUsed: true,
      degraded: true,
    });
  }
}
