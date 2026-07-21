export type PerformanceRatingBucket = {
  rating: string;
  count: number;
  ideal: number;
};

export type PerformanceEmployeeInsight = {
  employeeId: string;
  score: number;
  rating: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  confidence: number;
};

export type PerformanceDashboard = {
  summary: {
    totalReviews: number;
    employeesReviewed: number;
    averageRating: number;
    averagePredictedScore: number;
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    modelVersion: string;
    lastRunAt: string | null;
  };
  distribution: PerformanceRatingBucket[];
  bellCurve: PerformanceRatingBucket[];
  topPerformers: PerformanceEmployeeInsight[];
  insights: string[];
  needsRecompute?: boolean;
};
