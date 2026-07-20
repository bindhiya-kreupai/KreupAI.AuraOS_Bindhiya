import { PERFORMANCE_MODEL_VERSION } from './performance-rules';
import type { PerformanceDashboard } from './performance-types';

export function emptyPerformanceDashboard(): PerformanceDashboard {
  const distribution = [1, 2, 3, 4, 5].map((rating) => ({
    rating: String(rating),
    count: 0,
    ideal: 0,
  }));
  return {
    summary: {
      totalReviews: 0,
      employeesReviewed: 0,
      averageRating: 0,
      averagePredictedScore: 0,
      trend: 'STABLE',
      modelVersion: PERFORMANCE_MODEL_VERSION,
      lastRunAt: null,
    },
    distribution,
    bellCurve: distribution,
    topPerformers: [],
    insights: ['Insufficient completed performance reviews to generate insights.'],
    needsRecompute: true,
  };
}
