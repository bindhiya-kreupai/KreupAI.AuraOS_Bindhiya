import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type ModelRiskTier = 'UNACCEPTABLE' | 'HIGH' | 'LIMITED' | 'MINIMAL';
export type ModelStatus = 'DRAFT' | 'UNDER_REVIEW' | 'PUBLISHED' | 'DEPRECATED' | 'RECALLED';

export type FairnessMetric =
  'DEMOGRAPHIC_PARITY' | 'EQUAL_OPPORTUNITY' | 'DISPARATE_IMPACT_RATIO' | 'CALIBRATION';

const MODEL_TRANSITIONS: Record<ModelStatus, ModelStatus[]> = {
  DRAFT: ['UNDER_REVIEW', 'RECALLED'],
  UNDER_REVIEW: ['PUBLISHED', 'DRAFT', 'RECALLED'],
  PUBLISHED: ['DEPRECATED', 'RECALLED'],
  DEPRECATED: ['RECALLED'],
  RECALLED: [],
};

export class InvalidModelTransitionError extends Error {
  constructor(from: ModelStatus, to: ModelStatus) {
    super(`Invalid model card transition: ${from} → ${to}`);
    this.name = 'InvalidModelTransitionError';
  }
}

export class UnpublishableHighRiskModelError extends Error {
  constructor(reasons: string[]) {
    super(`HIGH-risk model cannot be PUBLISHED: ${reasons.join('; ')}`);
    this.name = 'UnpublishableHighRiskModelError';
  }
}

export interface CohortRow {
  name: string;
  n: number;
  positiveRate: number;
}

/**
 * Pure: 4/5ths rule (EEOC) — pass if every cohort's positive rate
 * ratio over the max is ≥ 0.80.
 */
export function fourFifthsPassed(cohorts: CohortRow[]): {
  passed: boolean;
  worstRatio: number;
  worstCohortGap: number;
} {
  if (cohorts.length === 0) return { passed: true, worstRatio: 1, worstCohortGap: 0 };
  const max = Math.max(...cohorts.map((c) => c.positiveRate));
  let worstRatio = 1;
  for (const c of cohorts) {
    const ratio = max === 0 ? 1 : c.positiveRate / max;
    if (ratio < worstRatio) worstRatio = ratio;
  }
  return {
    passed: worstRatio >= 0.8,
    worstRatio,
    worstCohortGap: max - Math.min(...cohorts.map((c) => c.positiveRate)),
  };
}

export class AIGovernanceService extends BaseService {
  constructor() {
    super('AIGovernanceService');
  }

  // ---------- Model cards ----------

  canModelTransition(from: ModelStatus, to: ModelStatus): boolean {
    return (MODEL_TRANSITIONS[from] ?? []).includes(to);
  }

  assertModelTransition(from: ModelStatus, to: ModelStatus): void {
    if (!this.canModelTransition(from, to)) throw new InvalidModelTransitionError(from, to);
  }

  async createModelCard(input: {
    tenantId?: string;
    modelName: string;
    modelVersion: string;
    modelType: string;
    riskTier?: ModelRiskTier;
    intendedUse: string;
    prohibitedUse?: string;
    trainingData?: Record<string, unknown>;
    knownLimitations?: string;
    actorId: string;
  }) {
    return (prisma as any).aIModelCard.create({
      data: {
        tenantId: input.tenantId ?? null,
        modelName: input.modelName,
        modelVersion: input.modelVersion,
        modelType: input.modelType,
        riskTier: input.riskTier ?? 'HIGH',
        intendedUse: input.intendedUse,
        prohibitedUse: input.prohibitedUse ?? null,
        trainingData: (input.trainingData ?? {}) as object,
        knownLimitations: input.knownLimitations ?? null,
        status: 'DRAFT',
        createdBy: input.actorId,
      },
    });
  }

  /**
   * Pre-publish validation gate for HIGH-risk models. Returns the list of
   * blocking reasons (empty = good to publish). Throws
   * UnpublishableHighRiskModelError when caller tries to publish despite
   * findings.
   */
  validateHighRiskPublishable(card: {
    riskTier: string;
    intendedUse: string;
    knownLimitations: string | null;
    fairnessMetrics: unknown;
    performanceMetrics: unknown;
    biasAudits?: Array<{ passed: boolean; auditDate: Date }>;
  }): string[] {
    if (card.riskTier !== 'HIGH') return [];
    const reasons: string[] = [];
    if (!card.intendedUse || card.intendedUse.trim().length < 20)
      reasons.push('intendedUse must be ≥ 20 chars (EU AI Act Annex IV)');
    if (!card.knownLimitations) reasons.push('knownLimitations is required for HIGH-risk models');

    const fm = card.fairnessMetrics as Record<string, unknown> | null;
    if (!fm || Object.keys(fm).length === 0)
      reasons.push('fairnessMetrics must include at least one metric');

    const pm = card.performanceMetrics as Record<string, unknown> | null;
    if (!pm || Object.keys(pm).length === 0)
      reasons.push('performanceMetrics must include at least one metric');

    const audits = card.biasAudits ?? [];
    const recent = audits.find(
      (a) => a.auditDate.getTime() > Date.now() - 365 * 24 * 60 * 60 * 1000
    );
    if (!recent)
      reasons.push('At least one passing bias audit within the last 12 months is required');
    else if (!recent.passed) reasons.push('The most recent bias audit must pass before publish');

    return reasons;
  }

  async publishModel(id: string, actorId: string) {
    const card = await (prisma as any).aIModelCard.findFirst({
      where: { id, isDeleted: false },
      include: { biasAudits: true },
    });
    if (!card) return null;
    this.assertModelTransition(card.status as ModelStatus, 'PUBLISHED');

    const reasons = this.validateHighRiskPublishable({
      riskTier: card.riskTier,
      intendedUse: card.intendedUse,
      knownLimitations: card.knownLimitations,
      fairnessMetrics: card.fairnessMetrics,
      performanceMetrics: card.performanceMetrics,
      biasAudits: (card.biasAudits as any[]).map((b: any) => ({
        passed: b.passed,
        auditDate: b.auditDate,
      })),
    });
    if (reasons.length > 0) throw new UnpublishableHighRiskModelError(reasons);

    return (prisma as any).aIModelCard.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        validatedAt: new Date(),
        validatorUserId: actorId,
        updatedBy: actorId,
      },
    });
  }

  async deprecateModel(id: string, actorId: string) {
    const card = await (prisma as any).aIModelCard.findFirst({ where: { id, isDeleted: false } });
    if (!card) return null;
    this.assertModelTransition(card.status as ModelStatus, 'DEPRECATED');
    return (prisma as any).aIModelCard.update({
      where: { id },
      data: { status: 'DEPRECATED', deprecatedAt: new Date(), updatedBy: actorId },
    });
  }

  async recallModel(id: string, actorId: string) {
    const card = await (prisma as any).aIModelCard.findFirst({ where: { id, isDeleted: false } });
    if (!card) return null;
    this.assertModelTransition(card.status as ModelStatus, 'RECALLED');
    return (prisma as any).aIModelCard.update({
      where: { id },
      data: { status: 'RECALLED', updatedBy: actorId },
    });
  }

  // ---------- Bias audits ----------

  /**
   * Record a bias audit run. The pass/fail decision is computed from the
   * `cohorts` array using the 4/5ths rule; caller can override by passing
   * `forcePassed` (useful when the team has used a different fairness
   * metric like DEMOGRAPHIC_PARITY directly).
   */
  async recordBiasAudit(input: {
    tenantId?: string;
    modelCardId: string;
    auditor: string;
    cohorts: CohortRow[];
    metric?: FairnessMetric;
    threshold?: number;
    findings?: string;
    remediationPlan?: string;
    reportUrl?: string;
    forcePassed?: boolean;
    actorId: string;
  }) {
    const ratio = fourFifthsPassed(input.cohorts);
    const threshold = input.threshold ?? 0.8;
    const passed =
      input.forcePassed !== undefined ? input.forcePassed : ratio.worstRatio >= threshold;

    return (prisma as any).aIBiasAudit.create({
      data: {
        tenantId: input.tenantId ?? null,
        modelCardId: input.modelCardId,
        auditDate: new Date(),
        auditor: input.auditor,
        cohorts: input.cohorts as object,
        metric: input.metric ?? 'DISPARATE_IMPACT_RATIO',
        passed,
        worstCohortGap: ratio.worstCohortGap,
        threshold,
        findings: input.findings ?? null,
        remediationPlan: input.remediationPlan ?? null,
        reportUrl: input.reportUrl ?? null,
        createdBy: input.actorId,
      },
    });
  }

  async listModelCards(params: {
    tenantId?: string;
    status?: ModelStatus;
    riskTier?: ModelRiskTier;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { isDeleted: false };
    if (params.tenantId !== undefined) where.tenantId = params.tenantId;
    if (params.status) where.status = params.status;
    if (params.riskTier) where.riskTier = params.riskTier;
    const [items, total] = await Promise.all([
      (prisma as any).aIModelCard.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: { biasAudits: { orderBy: { auditDate: 'desc' }, take: 1 } },
      }),
      (prisma as any).aIModelCard.count({ where }),
    ]);
    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }
}

export const aiGovernanceService = new AIGovernanceService();
