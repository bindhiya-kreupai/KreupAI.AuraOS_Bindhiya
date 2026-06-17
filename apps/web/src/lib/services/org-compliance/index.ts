/**
 * EPIC-09: Organization & Position Management compliance overlay.
 *
 *   S08 / S16 - PositionControl: per (period, department, position)
 *               budgeted vs approved vs filled vs vacant, overhire and
 *               frozen counts. headcountVariance() is the pure helper.
 *   S11       - Vacancy register: vacancyNumber, approval & fill
 *               state, ageing in days. agingDays() is pure.
 *   S17       - Audit checklist: items per category, severity, last
 *               result (PASS/FAIL/OBSERVATION). overdueChecklistCount()
 *               flags items older than 35 days for monthly cadence.
 *               failingChecklistCount() counts FAIL/OBSERVATION items.
 *   S17       - Monthly OrgComplianceCertificate gated on:
 *                 - checklistFailing > 0 (severity HIGH or CRITICAL)
 *                 - checklistOverdue > 0
 *                 - overhireTotal > 0
 *                 - vacanciesAgedOver90 > 0
 *                 - unapprovedVacancies > 0
 */

import { prisma } from '@aura/database';

export interface AuthContext {
  tenantId: string;
  userId: string;
}

export type ChecklistResult = 'PASS' | 'FAIL' | 'OBSERVATION' | null;

export function headcountVariance(input: { budgeted: number; approved: number; filled: number }): {
  vacant: number;
  overhire: number;
} {
  const vacant = Math.max(0, input.approved - input.filled);
  const overhire = Math.max(0, input.filled - input.approved);
  return { vacant, overhire };
}

export function agingDays(raisedAt: Date, filledAt: Date | null, now: Date = new Date()): number {
  const end = (filledAt ?? now).getTime();
  return Math.max(0, Math.floor((end - raisedAt.getTime()) / 86_400_000));
}

export interface OrgGatingInput {
  checklistFailingHighOrCritical: number;
  checklistOverdue: number;
  overhireTotal: number;
  vacanciesAgedOver90: number;
  unapprovedVacancies: number;
}

export function orgGatingReason(input: OrgGatingInput): string | null {
  const reasons: string[] = [];
  if (input.checklistFailingHighOrCritical > 0)
    reasons.push(`${input.checklistFailingHighOrCritical} HIGH/CRITICAL checklist item(s) failing`);
  if (input.checklistOverdue > 0)
    reasons.push(`${input.checklistOverdue} checklist item(s) overdue`);
  if (input.overhireTotal > 0)
    reasons.push(`${input.overhireTotal} overhire(s) above approved headcount`);
  if (input.vacanciesAgedOver90 > 0)
    reasons.push(`${input.vacanciesAgedOver90} vacancy(ies) aged over 90 days`);
  if (input.unapprovedVacancies > 0)
    reasons.push(`${input.unapprovedVacancies} vacancy(ies) without approval`);
  return reasons.length === 0 ? null : reasons.join('; ');
}

export const ORG_COMPLIANCE_CONSTANTS = {
  CATEGORIES: [
    'LEGAL_ENTITY',
    'DEPARTMENT',
    'COST_CENTER',
    'POSITION',
    'JOB_ARCHITECTURE',
    'GRADE',
    'POSITION_CONTROL',
    'REPORTING',
    'DELEGATION',
    'VACANCY',
    'CHANGE_MGMT',
    'NATIONALIZATION',
    'WORKFORCE_ANALYTICS',
  ],
  RESULTS: ['PASS', 'FAIL', 'OBSERVATION'],
  VACANCY_AGE_GATE_DAYS: 90,
};

class OrgAuditChecklistService {
  async upsert(
    input: {
      itemCode: string;
      label: string;
      category: string;
      country?: string;
      expectation?: string;
      evidence?: string;
      owner?: string;
      severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    },
    auth: AuthContext
  ) {
    return (prisma as any).orgAuditChecklistItem.upsert({
      where: {
        aura_org_audit_checklist_item_unique: {
          tenantId: auth.tenantId,
          itemCode: input.itemCode,
        },
      },
      update: {
        label: input.label,
        category: input.category,
        country: input.country ?? null,
        expectation: input.expectation ?? null,
        evidence: input.evidence ?? null,
        owner: input.owner ?? null,
        severity: input.severity ?? 'MEDIUM',
      },
      create: {
        tenantId: auth.tenantId,
        itemCode: input.itemCode,
        label: input.label,
        category: input.category,
        country: input.country ?? null,
        expectation: input.expectation ?? null,
        evidence: input.evidence ?? null,
        owner: input.owner ?? null,
        severity: input.severity ?? 'MEDIUM',
      },
    });
  }

  async record(id: string, result: ChecklistResult, notes: string | undefined, auth: AuthContext) {
    return (prisma as any).orgAuditChecklistItem.update({
      where: { id },
      data: {
        lastReviewedAt: new Date(),
        lastReviewedBy: auth.userId,
        lastResult: result,
        notes: notes ?? null,
      },
    });
  }

  async list(tenantId: string, filter: { category?: string; severity?: string } = {}) {
    return (prisma as any).orgAuditChecklistItem.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        ...(filter.category ? { category: filter.category } : {}),
        ...(filter.severity ? { severity: filter.severity } : {}),
      },
      orderBy: [{ category: 'asc' }, { itemCode: 'asc' }],
      take: 500,
    });
  }

  async overdueCount(tenantId: string, now: Date = new Date()): Promise<number> {
    const rows = await (prisma as any).orgAuditChecklistItem.findMany({
      where: { tenantId, status: 'ACTIVE' },
      select: { lastReviewedAt: true },
    });
    return rows.filter((r: any) => {
      const last = r.lastReviewedAt ? new Date(r.lastReviewedAt).getTime() : 0;
      return (now.getTime() - last) / 86_400_000 > 35;
    }).length;
  }

  async failingHighOrCriticalCount(tenantId: string): Promise<number> {
    return (prisma as any).orgAuditChecklistItem.count({
      where: {
        tenantId,
        status: 'ACTIVE',
        lastResult: { in: ['FAIL', 'OBSERVATION'] },
        severity: { in: ['HIGH', 'CRITICAL'] },
      },
    });
  }
}

export const orgAuditChecklistService = new OrgAuditChecklistService();

class OrgPositionControlService {
  async upsert(
    input: {
      period: string;
      departmentId?: string;
      positionId?: string;
      country?: string;
      budgetedHeadcount: number;
      approvedHeadcount: number;
      filledHeadcount: number;
      frozenCount?: number;
      notes?: string;
    },
    auth: AuthContext
  ) {
    const { vacant, overhire } = headcountVariance({
      budgeted: input.budgetedHeadcount,
      approved: input.approvedHeadcount,
      filled: input.filledHeadcount,
    });
    return (prisma as any).orgPositionControl.upsert({
      where: {
        aura_org_position_control_unique: {
          tenantId: auth.tenantId,
          period: input.period,
          departmentId: input.departmentId ?? null,
          positionId: input.positionId ?? null,
        },
      },
      update: {
        country: input.country ?? null,
        budgetedHeadcount: input.budgetedHeadcount,
        approvedHeadcount: input.approvedHeadcount,
        filledHeadcount: input.filledHeadcount,
        vacantHeadcount: vacant,
        overhireCount: overhire,
        frozenCount: input.frozenCount ?? 0,
        notes: input.notes ?? null,
      },
      create: {
        tenantId: auth.tenantId,
        period: input.period,
        departmentId: input.departmentId ?? null,
        positionId: input.positionId ?? null,
        country: input.country ?? null,
        budgetedHeadcount: input.budgetedHeadcount,
        approvedHeadcount: input.approvedHeadcount,
        filledHeadcount: input.filledHeadcount,
        vacantHeadcount: vacant,
        overhireCount: overhire,
        frozenCount: input.frozenCount ?? 0,
        notes: input.notes ?? null,
      },
    });
  }

  async list(tenantId: string, filter: { period?: string; departmentId?: string } = {}) {
    return (prisma as any).orgPositionControl.findMany({
      where: {
        tenantId,
        ...(filter.period ? { period: filter.period } : {}),
        ...(filter.departmentId ? { departmentId: filter.departmentId } : {}),
      },
      orderBy: [{ period: 'desc' }, { departmentId: 'asc' }],
      take: 500,
    });
  }

  async overhireTotal(tenantId: string, period: string): Promise<number> {
    const rows: Array<{ overhireCount: number }> = await (
      prisma as any
    ).orgPositionControl.findMany({
      where: { tenantId, period },
      select: { overhireCount: true },
    });
    return rows.reduce((s, r) => s + r.overhireCount, 0);
  }

  async departmentsCovered(tenantId: string, period: string): Promise<number> {
    const rows: Array<{ departmentId: string | null }> = await (
      prisma as any
    ).orgPositionControl.findMany({
      where: { tenantId, period },
      select: { departmentId: true },
    });
    return new Set(rows.map((r) => r.departmentId).filter(Boolean)).size;
  }
}

export const orgPositionControlService = new OrgPositionControlService();

class OrgVacancyService {
  async raise(
    input: {
      vacancyNumber: string;
      positionId?: string;
      departmentId?: string;
      country?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).orgVacancy.upsert({
      where: {
        aura_org_vacancy_unique: {
          tenantId: auth.tenantId,
          vacancyNumber: input.vacancyNumber,
        },
      },
      update: input,
      create: {
        tenantId: auth.tenantId,
        ...input,
        raisedAt: new Date(),
        status: 'OPEN',
      },
    });
  }

  async approve(id: string, auth: AuthContext) {
    return (prisma as any).orgVacancy.update({
      where: { id },
      data: { approvedAt: new Date(), approvedBy: auth.userId, status: 'APPROVED' },
    });
  }

  async fill(id: string, candidateId: string | undefined, auth: AuthContext) {
    const row = await (prisma as any).orgVacancy.findUnique({ where: { id } });
    if (!row || row.tenantId !== auth.tenantId) throw new Error('vacancy not found');
    const filledAt = new Date();
    const aging = agingDays(new Date(row.raisedAt), filledAt);
    return (prisma as any).orgVacancy.update({
      where: { id },
      data: { filledAt, candidateId: candidateId ?? null, agingDays: aging, status: 'FILLED' },
    });
  }

  async list(tenantId: string, filter: { status?: string } = {}) {
    const rows = await (prisma as any).orgVacancy.findMany({
      where: {
        tenantId,
        ...(filter.status ? { status: filter.status } : {}),
      },
      orderBy: { raisedAt: 'desc' },
      take: 500,
    });
    const now = new Date();
    return rows.map((r: any) => ({
      ...r,
      agingDays: r.status === 'FILLED' ? r.agingDays : agingDays(new Date(r.raisedAt), null, now),
    }));
  }

  async openAged(tenantId: string, gateDays = ORG_COMPLIANCE_CONSTANTS.VACANCY_AGE_GATE_DAYS) {
    const rows = await (prisma as any).orgVacancy.findMany({
      where: { tenantId, status: { in: ['OPEN', 'APPROVED'] } },
      select: { raisedAt: true, approvedAt: true },
    });
    const now = new Date();
    let aged = 0;
    let unapproved = 0;
    for (const r of rows) {
      if (!r.approvedAt) unapproved += 1;
      const days = agingDays(new Date(r.raisedAt), null, now);
      if (days > gateDays) aged += 1;
    }
    return { aged, unapproved, open: rows.length };
  }
}

export const orgVacancyService = new OrgVacancyService();

class OrgComplianceCertificateService {
  async generate(period: string, auth: AuthContext) {
    const tenantId = auth.tenantId;
    const [
      checklistTotal,
      checklistFailingHighOrCritical,
      checklistOverdue,
      overhireTotal,
      departmentsCovered,
      vacancyAged,
    ] = await Promise.all([
      (prisma as any).orgAuditChecklistItem.count({ where: { tenantId, status: 'ACTIVE' } }),
      orgAuditChecklistService.failingHighOrCriticalCount(tenantId),
      orgAuditChecklistService.overdueCount(tenantId),
      orgPositionControlService.overhireTotal(tenantId, period),
      orgPositionControlService.departmentsCovered(tenantId, period),
      orgVacancyService.openAged(tenantId),
    ]);
    const frozenTotalRows: Array<{ frozenCount: number }> = await (
      prisma as any
    ).orgPositionControl.findMany({
      where: { tenantId, period },
      select: { frozenCount: true },
    });
    const frozenTotal = frozenTotalRows.reduce((s, r) => s + r.frozenCount, 0);

    const gating = orgGatingReason({
      checklistFailingHighOrCritical,
      checklistOverdue,
      overhireTotal,
      vacanciesAgedOver90: vacancyAged.aged,
      unapprovedVacancies: vacancyAged.unapproved,
    });

    return (prisma as any).orgComplianceCertificate.upsert({
      where: { aura_org_compliance_certificate_unique: { tenantId, period } },
      update: {
        checklistTotal,
        checklistFailing: checklistFailingHighOrCritical,
        checklistOverdue,
        overhireTotal,
        frozenTotal,
        vacanciesOpen: vacancyAged.open,
        vacanciesAgedOver90: vacancyAged.aged,
        unapprovedVacancies: vacancyAged.unapproved,
        departmentsCovered,
        gatingReason: gating,
        metricsJson: { period } as any,
        generatedAt: new Date(),
      },
      create: {
        tenantId,
        period,
        status: 'DRAFT',
        checklistTotal,
        checklistFailing: checklistFailingHighOrCritical,
        checklistOverdue,
        overhireTotal,
        frozenTotal,
        vacanciesOpen: vacancyAged.open,
        vacanciesAgedOver90: vacancyAged.aged,
        unapprovedVacancies: vacancyAged.unapproved,
        departmentsCovered,
        gatingReason: gating,
        metricsJson: { period } as any,
        generatedAt: new Date(),
      },
    });
  }

  async sign(
    period: string,
    attestations: Array<{ field: string; value: string }>,
    auth: AuthContext
  ) {
    const cert = await (prisma as any).orgComplianceCertificate.findUnique({
      where: { aura_org_compliance_certificate_unique: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not found');
    if (cert.gatingReason) throw new Error('cannot sign while gated');
    return (prisma as any).orgComplianceCertificate.update({
      where: { aura_org_compliance_certificate_unique: { tenantId: auth.tenantId, period } },
      data: {
        status: 'SIGNED',
        attestationsJson: attestations as any,
        signedAt: new Date(),
        signedBy: auth.userId,
      },
    });
  }

  async list(tenantId: string) {
    return (prisma as any).orgComplianceCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const orgComplianceCertificateService = new OrgComplianceCertificateService();
