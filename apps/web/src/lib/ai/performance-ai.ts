import { prisma } from '@aura/database';
import { emptyPerformanceDashboard } from './performance-fallback';
import {
  idealBellCurve,
  PERFORMANCE_MODEL_ALGORITHM,
  PERFORMANCE_MODEL_CODE,
  PERFORMANCE_MODEL_TYPE,
  PERFORMANCE_MODEL_VERSION,
  toScore,
  trendForRatings,
} from './performance-rules';
import { retrievePerformanceReviews } from './performance-retrieval';
import type { PerformanceDashboard, PerformanceEmployeeInsight } from './performance-types';

async function ensureModel(tenantId: string, userId: string) {
  const existing = await prisma.predictiveModel.findFirst({
    where: { tenantId, code: PERFORMANCE_MODEL_CODE, isDeleted: false },
  });
  if (existing) {
    return existing.isActive
      ? existing
      : prisma.predictiveModel.update({
          where: { id: existing.id },
          data: { isActive: true, updatedBy: userId },
        });
  }
  return prisma.predictiveModel.create({
    data: {
      tenantId,
      code: PERFORMANCE_MODEL_CODE,
      name: 'Performance Analysis v1',
      description: 'Recency-weighted performance review analysis',
      modelType: PERFORMANCE_MODEL_TYPE,
      algorithm: PERFORMANCE_MODEL_ALGORITHM,
      trainingDataset: { source: 'performance_reviews' },
      features: { fields: ['finalRating', 'managerRating', 'selfRating', 'completedAt'] },
      targetVariable: 'next_review_rating',
      version: PERFORMANCE_MODEL_VERSION,
      parameters: { recencyWeight: 0.7 },
      status: 'ACTIVE',
      isActive: true,
      createdBy: userId,
      updatedBy: userId,
    },
  });
}

export async function getPerformanceDashboard(
  tenantId: string,
  opts?: { userId?: string; persist?: boolean; employeeId?: string; teamId?: string }
): Promise<PerformanceDashboard> {
  const started = Date.now();
  const allReviews = await retrievePerformanceReviews(tenantId, opts?.teamId);
  const reviews = opts?.employeeId
    ? allReviews.filter((review) => review.employeeId === opts.employeeId)
    : allReviews;
  if (!reviews.length) return emptyPerformanceDashboard();

  const byEmployee = new Map<string, typeof reviews>();
  for (const review of reviews) {
    byEmployee.set(review.employeeId, [...(byEmployee.get(review.employeeId) || []), review]);
  }
  const employees: PerformanceEmployeeInsight[] = [...byEmployee.entries()].map(
    ([employeeId, history]) => {
      const ratings = history.map((review) => review.rating);
      const weighted = ratings.reduce((sum, rating, index) => sum + rating * (index + 1), 0);
      const weight = (ratings.length * (ratings.length + 1)) / 2;
      const rating = weighted / weight;
      return {
        employeeId,
        rating: Math.round(rating * 100) / 100,
        score: toScore(rating),
        trend: trendForRatings(ratings),
        confidence: Math.min(0.95, 0.45 + ratings.length * 0.1),
      };
    }
  );

  const distribution = [1, 2, 3, 4, 5].map((rating) => ({
    rating: String(rating),
    count: reviews.filter((review) => Math.round(review.rating) === rating).length,
    ideal: idealBellCurve(reviews.length, rating),
  }));
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const averageScore =
    employees.reduce((sum, employee) => sum + employee.score, 0) / employees.length;
  const improving = employees.filter((employee) => employee.trend === 'IMPROVING').length;
  const declining = employees.filter((employee) => employee.trend === 'DECLINING').length;
  const trend =
    improving > declining ? 'IMPROVING' : declining > improving ? 'DECLINING' : 'STABLE';
  const topPerformers = [...employees]
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.ceil(employees.length * 0.2)));
  const dashboard: PerformanceDashboard = {
    summary: {
      totalReviews: reviews.length,
      employeesReviewed: employees.length,
      averageRating: Math.round(averageRating * 100) / 100,
      averagePredictedScore: Math.round(averageScore),
      trend,
      modelVersion: PERFORMANCE_MODEL_VERSION,
      lastRunAt: new Date().toISOString(),
    },
    distribution,
    bellCurve: distribution,
    topPerformers,
    insights: [
      `Average review rating is ${averageRating.toFixed(2)} out of 5.`,
      `${topPerformers.length} employee(s) are currently in the top performance cohort.`,
      trend === 'DECLINING'
        ? `${declining} employee(s) show a declining rating trend.`
        : `${improving} employee(s) show an improving rating trend.`,
    ],
  };

  if (opts?.persist !== false) {
    try {
      const model = await ensureModel(tenantId, opts?.userId || 'system');
      await prisma.prediction.create({
        data: {
          modelId: model.id,
          tenantId,
          entityType: opts?.employeeId ? 'Employee' : opts?.teamId ? 'Team' : 'Tenant',
          entityId: opts?.employeeId || opts?.teamId || tenantId,
          predictedValue: averageScore,
          confidence: Math.min(0.95, 0.45 + reviews.length * 0.03),
          predictedDate: new Date(),
          inputFeatures: {
            reviewCount: reviews.length,
            employeeCount: employees.length,
            dashboard,
          },
          createdBy: opts?.userId || 'system',
        },
      });
      await prisma.aIRunRecord.create({
        data: {
          tenantId,
          runType: 'performance_analysis',
          output: { averageScore: Math.round(averageScore), reviewCount: reviews.length },
          completedAt: new Date(),
          durationMs: Date.now() - started,
          createdBy: opts?.userId || 'system',
        },
      });
    } catch (error) {
      console.warn('[performance-analysis] persist skipped', error);
    }
  }
  return dashboard;
}
