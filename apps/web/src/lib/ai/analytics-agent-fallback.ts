import type { AnalyticsAgentAction } from './analytics-agent-types';

export function parseAnalyticsAgentFallbackIntent(message: string): {
  intent: AnalyticsAgentAction;
  params: Record<string, unknown>;
  confidence: number;
} {
  const lower = message.toLowerCase();

  if (lower.includes('trend') || lower.includes('over time') || lower.includes('compare')) {
    return { intent: 'ANALYZE_TREND', params: { category: 'workforce' }, confidence: 0.8 };
  }
  if (lower.includes('anomal') || lower.includes('unusual') || lower.includes('outlier')) {
    return { intent: 'DETECT_ANOMALIES', params: {}, confidence: 0.85 };
  }
  if (lower.includes('report') || lower.includes('export')) {
    return {
      intent: 'GENERATE_REPORT',
      params: { reportType: 'workforce_summary' },
      confidence: 0.8,
    };
  }
  if (lower.includes('insight') || lower.includes('summary') || lower.includes('overview')) {
    return { intent: 'GENERATE_INSIGHT', params: { category: 'workforce' }, confidence: 0.85 };
  }

  return { intent: 'GENERAL_QUERY', params: {}, confidence: 0.5 };
}

export function formatAnalyticsActionResult(
  intent: AnalyticsAgentAction,
  data: unknown,
  ctx?: {
    workforceSummary?: { headcount: number; departments: number };
    sentimentSummary?: { overall: string; score: number };
  }
): string {
  switch (intent) {
    case 'GENERATE_INSIGHT': {
      const insight = data as { summary?: string; insights?: string[] };
      if (insight?.summary) return insight.summary;
      if (Array.isArray(insight?.insights) && insight.insights.length) {
        return `Key insights:\n\n${insight.insights.map((i) => `• ${i}`).join('\n')}`;
      }
      if (ctx?.workforceSummary) {
        return `Workforce overview: ${ctx.workforceSummary.headcount} employees across ${ctx.workforceSummary.departments} departments.${
          ctx.sentimentSummary
            ? ` Overall sentiment: ${ctx.sentimentSummary.overall} (${ctx.sentimentSummary.score}).`
            : ''
        }`;
      }
      return 'Workforce insights generated from available tenant data.';
    }
    case 'ANALYZE_TREND':
      return typeof data === 'object' && data !== null
        ? `Trend analysis complete. See detailed metrics in the analytics dashboard.`
        : 'Trend analysis unavailable for the selected period.';
    case 'DETECT_ANOMALIES':
      if (Array.isArray(data) && data.length) {
        return `Detected ${data.length} anomaly/anomalies requiring review.`;
      }
      return 'No significant anomalies detected in the current data set.';
    case 'GENERATE_REPORT':
      return 'Workforce summary report generated. Download from the reporting module.';
    default:
      return "I'm your analytics assistant. Ask about workforce insights, trends, anomalies, or reports.";
  }
}

export const ANALYTICS_SUGGESTED_ACTIONS = [
  'Generate workforce insights',
  'Analyze headcount trends',
  'Detect attendance anomalies',
  'Create workforce summary report',
];
