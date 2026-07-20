export const PERFORMANCE_MODEL_CODE = 'PERFORMANCE_ANALYSIS_V1';
export const PERFORMANCE_MODEL_TYPE = 'PERFORMANCE';
export const PERFORMANCE_MODEL_VERSION = '1.0.0';
export const PERFORMANCE_MODEL_ALGORITHM = 'RECENCY_WEIGHTED_RATING';

export function toScore(rating: number): number {
  return Math.round(Math.max(0, Math.min(5, rating)) * 20);
}

export function trendForRatings(ratings: number[]): 'IMPROVING' | 'STABLE' | 'DECLINING' {
  if (ratings.length < 2) return 'STABLE';
  const change = ratings[ratings.length - 1] - ratings[ratings.length - 2];
  if (change >= 0.5) return 'IMPROVING';
  if (change <= -0.5) return 'DECLINING';
  return 'STABLE';
}

export function idealBellCurve(total: number, rating: number): number {
  const shares = [0.05, 0.15, 0.6, 0.15, 0.05];
  return Math.round(total * (shares[rating - 1] || 0));
}
