import { prisma } from '@aura/database';
import { getNlpInsightsDashboard } from './nlp-insights-ai';
import type { AnalyticsRetrievalContext } from './analytics-agent-types';

export async function loadAnalyticsRetrievalContext(
  tenantId: string
): Promise<AnalyticsRetrievalContext> {
  const headcount = await prisma.employee
    .count({
      where: { isDeleted: false, company: { tenantId } },
    })
    .catch(() => 0);

  const departments = await prisma.department
    .count({
      where: { isDeleted: false, company: { tenantId } },
    })
    .catch(() => 0);

  const predictions = await prisma.prediction
    .groupBy({
      by: ['entityType'],
      where: { tenantId, isDeleted: false },
      _count: { id: true },
    })
    .catch(() => []);

  let sentimentSummary: AnalyticsRetrievalContext['sentimentSummary'];
  try {
    const nlp = await getNlpInsightsDashboard(tenantId, { persist: false });
    sentimentSummary = {
      overall: nlp.summary.overallSentiment,
      score: nlp.summary.averageScore,
      feedbackCount: nlp.summary.responseCount,
    };
  } catch {
    sentimentSummary = undefined;
  }

  return {
    workforceSummary: { headcount, departments },
    sentimentSummary,
    predictions: predictions.map((p) => ({
      type: p.entityType,
      count: p._count.id,
    })),
  };
}

export function analyticsRetrievalToCitations(ctx: AnalyticsRetrievalContext) {
  const citations: { title: string; source: string }[] = [];
  if (ctx.workforceSummary) {
    citations.push({ title: 'Workforce Headcount', source: 'aura_employee' });
  }
  if (ctx.sentimentSummary) {
    citations.push({ title: 'Sentiment Analysis', source: 'continuous_feedback' });
  }
  for (const p of ctx.predictions || []) {
    citations.push({ title: `${p.type} Predictions`, source: 'aura_prediction' });
  }
  return citations;
}
