import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type DROutcome = 'PLANNED' | 'IN_PROGRESS' | 'PASS' | 'FAIL' | 'INCONCLUSIVE';
export type DRScope = 'FULL' | 'PARTIAL' | 'RUNBOOK_TEST' | 'TABLETOP';

const OUTCOME_TRANSITIONS: Record<DROutcome, DROutcome[]> = {
  PLANNED: ['IN_PROGRESS', 'INCONCLUSIVE'],
  IN_PROGRESS: ['PASS', 'FAIL', 'INCONCLUSIVE'],
  PASS: [],
  FAIL: [],
  INCONCLUSIVE: [],
};

export class InvalidDROutcomeTransitionError extends Error {
  constructor(from: DROutcome, to: DROutcome) {
    super(`Invalid DR drill transition: ${from} → ${to}`);
    this.name = 'InvalidDROutcomeTransitionError';
  }
}

export class DRSLAMissedError extends Error {
  metric: 'RPO' | 'RTO';
  target: number;
  actual: number;
  constructor(metric: 'RPO' | 'RTO', target: number, actual: number) {
    super(`${metric} target ${target}min missed (actual ${actual}min)`);
    this.name = 'DRSLAMissedError';
    this.metric = metric;
    this.target = target;
    this.actual = actual;
  }
}

export class DisasterRecoveryService extends BaseService {
  constructor() {
    super('DisasterRecoveryService');
  }

  canTransition(from: DROutcome, to: DROutcome): boolean {
    return (OUTCOME_TRANSITIONS[from] ?? []).includes(to);
  }

  assertTransition(from: DROutcome, to: DROutcome): void {
    if (!this.canTransition(from, to)) throw new InvalidDROutcomeTransitionError(from, to);
  }

  /**
   * Pure: evaluate a drill against its RPO/RTO targets. Returns the verdict
   * (PASS / FAIL) with the missed-target details. Inconclusive when either
   * actual is missing.
   */
  evaluateDrill(input: {
    rpoTargetMin: number;
    rtoTargetMin: number;
    actualRpoMin?: number | null;
    actualRtoMin?: number | null;
  }): {
    verdict: DROutcome;
    missed: Array<{ metric: 'RPO' | 'RTO'; target: number; actual: number }>;
  } {
    if (input.actualRpoMin == null || input.actualRtoMin == null)
      return { verdict: 'INCONCLUSIVE', missed: [] };
    const missed: Array<{ metric: 'RPO' | 'RTO'; target: number; actual: number }> = [];
    if (input.actualRpoMin > input.rpoTargetMin)
      missed.push({ metric: 'RPO', target: input.rpoTargetMin, actual: input.actualRpoMin });
    if (input.actualRtoMin > input.rtoTargetMin)
      missed.push({ metric: 'RTO', target: input.rtoTargetMin, actual: input.actualRtoMin });
    return { verdict: missed.length === 0 ? 'PASS' : 'FAIL', missed };
  }

  async planDrill(input: {
    tenantId?: string;
    name: string;
    scope: DRScope;
    rpoTargetMin: number;
    rtoTargetMin: number;
    startedAt: Date;
    runbookVersion?: string;
    ownerUserId?: string;
    notes?: string;
    actorId: string;
  }) {
    return prisma.dRDrill.create({
      data: {
        tenantId: input.tenantId ?? null,
        name: input.name,
        scope: input.scope,
        rpoTargetMin: input.rpoTargetMin,
        rtoTargetMin: input.rtoTargetMin,
        startedAt: input.startedAt,
        outcome: 'PLANNED',
        runbookVersion: input.runbookVersion ?? null,
        ownerUserId: input.ownerUserId ?? null,
        notes: input.notes ?? null,
        createdBy: input.actorId,
      },
    });
  }

  async startDrill(id: string, actorId: string) {
    const drill = await prisma.dRDrill.findFirst({ where: { id } });
    if (!drill) return null;
    this.assertTransition(drill.outcome as DROutcome, 'IN_PROGRESS');
    return prisma.dRDrill.update({
      where: { id },
      data: { outcome: 'IN_PROGRESS', updatedBy: actorId },
    });
  }

  async completeDrill(input: {
    id: string;
    actorId: string;
    actualRpoMin: number;
    actualRtoMin: number;
    notes?: string;
  }) {
    const drill = await prisma.dRDrill.findFirst({ where: { id: input.id } });
    if (!drill) return null;
    const eval_ = this.evaluateDrill({
      rpoTargetMin: drill.rpoTargetMin,
      rtoTargetMin: drill.rtoTargetMin,
      actualRpoMin: input.actualRpoMin,
      actualRtoMin: input.actualRtoMin,
    });
    this.assertTransition(drill.outcome as DROutcome, eval_.verdict);
    return prisma.dRDrill.update({
      where: { id: input.id },
      data: {
        outcome: eval_.verdict,
        actualRpoMin: input.actualRpoMin,
        actualRtoMin: input.actualRtoMin,
        completedAt: new Date(),
        notes: input.notes ?? drill.notes,
        updatedBy: input.actorId,
      },
    });
  }

  /**
   * Backup-run reachability check — given a recovery point timestamp,
   * find the nearest SUCCESS backup that covers it (finishedAt ≤ rp and
   * either no expiresAt or expiresAt > now).
   */
  async findRecoverableBackup(input: {
    tenantId?: string | null;
    jobName: string;
    recoveryPoint: Date;
  }) {
    const now = new Date();
    return prisma.backupRun.findFirst({
      where: {
        tenantId: input.tenantId ?? undefined,
        jobName: input.jobName,
        status: 'SUCCESS',
        finishedAt: { lte: input.recoveryPoint, not: null },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { finishedAt: 'desc' },
    });
  }

  async list(params: {
    tenantId?: string | null;
    outcome?: DROutcome;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (params.tenantId !== undefined) where.tenantId = params.tenantId;
    if (params.outcome) where.outcome = params.outcome;
    const [items, total] = await Promise.all([
      prisma.dRDrill.findMany({ where, orderBy: { startedAt: 'desc' }, skip, take: limit }),
      prisma.dRDrill.count({ where }),
    ]);
    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }
}

export const drService = new DisasterRecoveryService();
