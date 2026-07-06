import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type ModelCode =
  'ATTRITION_RISK' | 'PERF_FORECAST' | 'PROMOTION_READINESS' | 'TIME_TO_HIRE' | 'SOURCING_FUNNEL';

export type ScoreBand = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type PredictionSubjectType =
  'EMPLOYEE' | 'CANDIDATE' | 'REQUISITION' | 'TEAM' | 'DEPARTMENT';

export class ScoreOutOfRangeError extends Error {
  constructor(score: number) {
    super(`Classifier score ${score} must be in [0, 1].`);
    this.name = 'ScoreOutOfRangeError';
  }
}

const CLASSIFIER_MODELS = new Set<ModelCode>(['ATTRITION_RISK', 'PROMOTION_READINESS']);

export class PredictionResultService extends BaseService {
  constructor() {
    super('PredictionResultService');
  }

  /**
   * Pure: bucket a classifier score (0..1) into a band. The thresholds
   * match the attrition-risk surface in the workforce dashboard so the
   * UI doesn't need to re-implement them.
   */
  scoreToBand(score: number): ScoreBand {
    if (score < 0.25) return 'LOW';
    if (score < 0.5) return 'MEDIUM';
    if (score < 0.75) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Pure: returns true when a classifier score is in the closed unit
   * interval. Regressors (TIME_TO_HIRE etc.) bypass this check.
   */
  isClassifier(modelCode: ModelCode): boolean {
    return CLASSIFIER_MODELS.has(modelCode);
  }

  async record(input: {
    tenantId: string;
    modelCardId?: string;
    modelCode: ModelCode;
    modelVersion: string;
    subjectType: PredictionSubjectType;
    subjectId: string;
    scoreValue: number;
    features?: Record<string, unknown>;
    explanations?: Record<string, unknown>;
    confidence?: number;
    confidenceInterval?: { lo: number; hi: number };
    expiresAt?: Date;
  }) {
    if (this.isClassifier(input.modelCode)) {
      if (input.scoreValue < 0 || input.scoreValue > 1) {
        throw new ScoreOutOfRangeError(input.scoreValue);
      }
    }
    // Supersede prior active predictions for the same subject + model so the
    // workforce dashboard never shows two scores at once.
    await (prisma as any).predictionResult.updateMany({
      where: {
        tenantId: input.tenantId,
        modelCode: input.modelCode,
        subjectType: input.subjectType,
        subjectId: input.subjectId,
        active: true,
      },
      data: { active: false },
    });
    return (prisma as any).predictionResult.create({
      data: {
        tenantId: input.tenantId,
        modelCardId: input.modelCardId ?? null,
        modelCode: input.modelCode,
        modelVersion: input.modelVersion,
        subjectType: input.subjectType,
        subjectId: input.subjectId,
        scoreValue: input.scoreValue,
        scoreBand: this.isClassifier(input.modelCode) ? this.scoreToBand(input.scoreValue) : null,
        features: (input.features ?? {}) as never,
        explanations: (input.explanations ?? {}) as never,
        confidence: input.confidence ?? null,
        confidenceInterval: (input.confidenceInterval ?? null) as never,
        expiresAt: input.expiresAt ?? null,
        active: true,
      },
    });
  }

  async activeFor(
    tenantId: string,
    modelCode: ModelCode,
    subjectType: PredictionSubjectType,
    subjectId: string
  ) {
    return (prisma as any).predictionResult.findFirst({
      where: { tenantId, modelCode, subjectType, subjectId, active: true },
      orderBy: { scoredAt: 'desc' },
    });
  }

  async list(params: {
    tenantId: string;
    modelCode?: ModelCode;
    subjectType?: PredictionSubjectType;
    subjectId?: string;
    scoreBand?: ScoreBand;
    activeOnly?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { tenantId: params.tenantId };
    if (params.modelCode) where.modelCode = params.modelCode;
    if (params.subjectType) where.subjectType = params.subjectType;
    if (params.subjectId) where.subjectId = params.subjectId;
    if (params.scoreBand) where.scoreBand = params.scoreBand;
    if (params.activeOnly) where.active = true;
    const [items, total] = await Promise.all([
      (prisma as any).predictionResult.findMany({
        where,
        orderBy: { scoredAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).predictionResult.count({ where }),
    ]);
    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }
}

export const predictionResultService = new PredictionResultService();
