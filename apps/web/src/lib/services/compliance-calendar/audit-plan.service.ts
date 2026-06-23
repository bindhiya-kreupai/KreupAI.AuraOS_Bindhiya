import { prisma } from '@aura/database';
import type { AuthContext } from './types';

export interface SamplingInput {
  auditPlanId: string;
  area: string;
  method: 'RANDOM' | 'RISK_BASED' | 'STRATIFIED';
  population: Array<{ id: string; weight?: number }>;
  sampleSize: number;
}

/**
 * EPIC-35-S07–S08: Annual audit plan + sampling + findings + management reviews.
 */
export class AuditPlanService {
  async createPlan(
    input: {
      year: number;
      title: string;
      scope: string;
      areas: string[];
      ownerRole: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).auditPlan.create({
      data: {
        tenantId: auth.tenantId,
        year: input.year,
        title: input.title,
        scope: input.scope,
        areasJson: input.areas,
        ownerRole: input.ownerRole,
        status: 'DRAFT',
        createdBy: auth.userId,
      },
    });
  }

  async approve(planId: string, auth: AuthContext) {
    return (prisma as any).auditPlan.update({
      where: { id: planId },
      data: { status: 'APPROVED', approvedAt: new Date(), approvedBy: auth.userId },
    });
  }

  async listPlans(tenantId: string, filter: { year?: number; status?: string } = {}) {
    return (prisma as any).auditPlan.findMany({
      where: { tenantId, ...filter },
      orderBy: { year: 'desc' },
    });
  }

  async sample(input: SamplingInput, auth: AuthContext) {
    const { population, sampleSize, method } = input;
    if (sampleSize <= 0) throw new Error('sampleSize must be > 0');
    const selections = this.select(population, sampleSize, method);
    return (prisma as any).auditSample.create({
      data: {
        tenantId: auth.tenantId,
        auditPlanId: input.auditPlanId,
        area: input.area,
        method,
        populationSize: population.length,
        sampleSize: selections.length,
        selectionsJson: selections,
      },
    });
  }

  select(
    population: Array<{ id: string; weight?: number }>,
    sampleSize: number,
    method: 'RANDOM' | 'RISK_BASED' | 'STRATIFIED'
  ) {
    if (population.length === 0) return [];
    const size = Math.min(sampleSize, population.length);
    if (method === 'RANDOM') {
      const copy = [...population];
      const picks: typeof population = [];
      while (picks.length < size && copy.length) {
        const idx = Math.floor(Math.random() * copy.length);
        picks.push(copy.splice(idx, 1)[0]);
      }
      return picks;
    }
    if (method === 'RISK_BASED') {
      const sorted = [...population].sort((a, b) => (b.weight ?? 1) - (a.weight ?? 1));
      return sorted.slice(0, size);
    }
    // STRATIFIED: pick every Nth
    const step = Math.max(1, Math.floor(population.length / size));
    return population.filter((_, i) => i % step === 0).slice(0, size);
  }

  async recordTestResult(
    input: {
      auditPlanId: string;
      area: string;
      testKey: string;
      sampleId?: string;
      passed: boolean;
      notes?: string;
      evidenceUrl?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).auditTestResult.create({
      data: {
        tenantId: auth.tenantId,
        auditPlanId: input.auditPlanId,
        area: input.area,
        testKey: input.testKey,
        sampleId: input.sampleId,
        passed: input.passed,
        notes: input.notes,
        evidenceUrl: input.evidenceUrl,
        performedBy: auth.userId,
      },
    });
  }

  async raiseFinding(
    input: {
      auditPlanId: string;
      area: string;
      title: string;
      description: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    },
    auth: AuthContext
  ) {
    return (prisma as any).auditFinding.create({
      data: {
        tenantId: auth.tenantId,
        auditPlanId: input.auditPlanId,
        area: input.area,
        title: input.title,
        description: input.description,
        severity: input.severity,
        status: 'OPEN',
        createdBy: auth.userId,
      },
    });
  }

  async raiseCorrectiveAction(
    findingId: string,
    input: { description: string; ownerRole: string; dueDate: Date },
    auth: AuthContext
  ) {
    return (prisma as any).correctiveAction.create({
      data: {
        tenantId: auth.tenantId,
        findingId,
        description: input.description,
        ownerRole: input.ownerRole,
        dueDate: input.dueDate,
        status: 'OPEN',
      },
    });
  }

  async closeCorrectiveAction(actionId: string) {
    return (prisma as any).correctiveAction.update({
      where: { id: actionId },
      data: { status: 'CLOSED', closedAt: new Date() },
    });
  }

  async escalateOverdueActions(auth: AuthContext) {
    const overdue = await (prisma as any).correctiveAction.findMany({
      where: {
        tenantId: auth.tenantId,
        status: 'OPEN',
        dueDate: { lt: new Date() },
        escalatedAt: null,
      },
    });
    for (const a of overdue as Array<{ id: string }>) {
      await (prisma as any).correctiveAction.update({
        where: { id: a.id },
        data: { escalatedAt: new Date() },
      });
    }
    return { escalated: overdue.length };
  }

  async scheduleReview(input: { period: string; scheduledFor: Date }, auth: AuthContext) {
    const openCount = await (prisma as any).correctiveAction.count({
      where: { tenantId: auth.tenantId, status: 'OPEN' },
    });
    return (prisma as any).managementReview.upsert({
      where: { aura_management_review_unique: { tenantId: auth.tenantId, period: input.period } },
      update: {
        scheduledFor: input.scheduledFor,
        openActionsAtTime: openCount,
      },
      create: {
        tenantId: auth.tenantId,
        period: input.period,
        scheduledFor: input.scheduledFor,
        openActionsAtTime: openCount,
        status: 'SCHEDULED',
      },
    });
  }

  async listReviews(tenantId: string) {
    return (prisma as any).managementReview.findMany({
      where: { tenantId },
      orderBy: { scheduledFor: 'desc' },
    });
  }
}

export const auditPlanService = new AuditPlanService();
