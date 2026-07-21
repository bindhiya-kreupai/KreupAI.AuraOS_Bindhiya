import type { NlpInsightsDashboard } from './nlp-insights-types';

export function emptyNlpInsightsDashboard(): NlpInsightsDashboard {
  return {
    summary: {
      overallSentiment: 'NEUTRAL',
      averageScore: 0,
      responseCount: 0,
      trend: 'STABLE',
      positive: 0,
      negative: 0,
      neutral: 0,
      lastRunAt: null,
    },
    topTopics: [],
    recentFeedback: [],
    trends: [],
    needsRecompute: true,
  };
}
