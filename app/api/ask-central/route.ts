import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
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
    .slice(-6)
    .map((item) => ({ ...item, content: item.content.slice(0, 1800) }));
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

  const model = process.env.ASK_CENTRAL_MODEL?.trim() || 'openai/gpt-5.6-luna';
  const historyText = history.length ? `\nRECENT CONVERSATION:\n${history.map((item) => `${item.role.toUpperCase()}: ${item.content}`).join('\n')}` : '';
  const context = sourceBlock(sources);

  try {
    const result = await generateText({
      model,
      system: `You are Ask Central, the internal Leelanau Cellars information assistant.\n\nRULES:\n- Answer ONLY from the CENTRAL SOURCES supplied in the prompt. Do not use general wine knowledge, web knowledge, or assumptions.\n- If Central does not contain enough information, say exactly that you could not find the answer in Central.\n- Never invent UPCs, GTINs, prices, dimensions, awards, vintages, menu status, case-sales numbers, or other facts.\n- Keep answers concise and practical for winery staff.\n- When a factual statement comes from a source, cite its source ID in square brackets, for example [S1].\n- Prefer exact identifiers and measurements when they are available.\n- For current tasting-menu questions, only call a wine current if the Current Tasting Room Menu source supports it.\n- For case-sales questions, distinguish gross cases from cases remaining after linked refunds when relevant.\n- Do not expose information outside the current portal's supplied sources.`,
      prompt: `PORTAL: ${portalRole}\nQUESTION: ${question}${historyText}\n\nCENTRAL SOURCES:\n${context || '(No matching Central source was found.)'}`,
      maxOutputTokens: 1000,
    });

    return NextResponse.json({
      answer: result.text.trim() || 'I could not find an answer in Central.',
      sources: sources.slice(0, 12).map(({ id, type, title, path }) => ({ id, type, title, path })),
      model,
    });
  } catch (error) {
    console.error('Ask Central failed', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Ask Central is temporarily unavailable.',
      hint: 'If this is the first deployment with Ask Central, make sure Vercel AI Gateway is available for this project and redeploy.',
    }, { status: 502 });
  }
}
