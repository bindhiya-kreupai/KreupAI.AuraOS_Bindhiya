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
import {
  normalisePaging,
  prismaPageArgs,
  buildPaginatedResult,
  type PaginationInput,
  type PaginatedResult,
} from '@/lib/services/pagination';

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

// In-memory fallback stores for environments where Prisma models aren't migrated
const memAuditChecklist = new Map<string, any>();
const memPositionControl = new Map<string, any>();
const memVacancy = new Map<string, any>();
const memCertificate = new Map<string, any>();

function hasModel(name: string): boolean {
  return typeof (prisma as any)[name] !== 'undefined';
}

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
    if (hasModel('orgAuditChecklistItem')) {
      return (prisma as any).orgAuditChecklistItem.upsert({
        where: {
          tenantId_itemCode: {
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

    const key = `${auth.tenantId}:${input.itemCode}`;
    const existing = memAuditChecklist.get(key);
    const item = {
      id: existing?.id ?? `chk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tenantId: auth.tenantId,
      itemCode: input.itemCode,
      label: input.label,
      category: input.category,
      country: input.country ?? null,
      expectation: input.expectation ?? null,
      evidence: input.evidence ?? null,
      owner: input.owner ?? null,
      severity: input.severity ?? 'MEDIUM',
      status: 'ACTIVE',
      lastResult: existing?.lastResult ?? null,
      lastReviewedAt: existing?.lastReviewedAt ?? null,
      notes: existing?.notes ?? null,
    };
    memAuditChecklist.set(key, item);
    return item;
  }

  async record(id: string, result: ChecklistResult, notes: string | undefined, auth: AuthContext) {
    if (hasModel('orgAuditChecklistItem')) {
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

    for (const [key, item] of memAuditChecklist.entries()) {
      if (item.id === id) {
        const updated = {
          ...item,
          lastReviewedAt: new Date(),
          lastReviewedBy: auth.userId,
          lastResult: result,
          notes: notes ?? null,
        };
        memAuditChecklist.set(key, updated);
        return updated;
      }
    }
    throw new Error('item not found');
  }

  async list(
    tenantId: string,
    filter: { category?: string; severity?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const page = normalisePaging(paging);

    if (hasModel('orgAuditChecklistItem')) {
      const where = {
        tenantId,
        status: 'ACTIVE',
        ...(filter.category ? { category: filter.category } : {}),
        ...(filter.severity ? { severity: filter.severity } : {}),
      };
      const [items, total] = await Promise.all([
        (prisma as any).orgAuditChecklistItem.findMany({
          where,
          orderBy: [{ category: 'asc' }, { itemCode: 'asc' }],
          ...prismaPageArgs(page),
        }),
        (prisma as any).orgAuditChecklistItem.count({ where }),
      ]);
      return buildPaginatedResult(items, total, page);
    }

    const items = Array.from(memAuditChecklist.values()).filter(
      (r) =>
        r.tenantId === tenantId &&
        r.status === 'ACTIVE' &&
        (!filter.category || r.category === filter.category) &&
        (!filter.severity || r.severity === filter.severity)
    );
    const total = items.length;
    const paged = items.slice((page.page - 1) * page.pageSize, page.page * page.pageSize);
    return buildPaginatedResult(paged, total, page);
  }

  async overdueCount(tenantId: string, now: Date = new Date()): Promise<number> {
    if (hasModel('orgAuditChecklistItem')) {
      const rows = await (prisma as any).orgAuditChecklistItem.findMany({
        where: { tenantId, status: 'ACTIVE' },
        select: { lastReviewedAt: true },
      });
      return rows.filter((r: any) => {
        const last = r.lastReviewedAt ? new Date(r.lastReviewedAt).getTime() : 0;
        return (now.getTime() - last) / 86_400_000 > 35;
      }).length;
    }

    const rows = Array.from(memAuditChecklist.values()).filter(
      (r) => r.tenantId === tenantId && r.status === 'ACTIVE'
    );
    return rows.filter((r) => {
      const last = r.lastReviewedAt ? new Date(r.lastReviewedAt).getTime() : 0;
      return (now.getTime() - last) / 86_400_000 > 35;
    }).length;
  }

  async failingHighOrCriticalCount(tenantId: string): Promise<number> {
    if (hasModel('orgAuditChecklistItem')) {
      return (prisma as any).orgAuditChecklistItem.count({
        where: {
          tenantId,
          status: 'ACTIVE',
          lastResult: { in: ['FAIL', 'OBSERVATION'] },
          severity: { in: ['HIGH', 'CRITICAL'] },
        },
      });
    }

    return Array.from(memAuditChecklist.values()).filter(
      (r) =>
        r.tenantId === tenantId &&
        r.status === 'ACTIVE' &&
        ['FAIL', 'OBSERVATION'].includes(r.lastResult) &&
        ['HIGH', 'CRITICAL'].includes(r.severity)
    ).length;
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

    if (hasModel('orgPositionControl')) {
      return (prisma as any).orgPositionControl.upsert({
        where: {
          tenantId_period_departmentId_positionId: {
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

    const key = `${auth.tenantId}:${input.period}:${input.departmentId ?? ''}:${input.positionId ?? ''}`;
    const existing = memPositionControl.get(key);
    const item = {
      id: existing?.id ?? `pos-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
    };
    memPositionControl.set(key, item);
    return item;
  }

  async list(
    tenantId: string,
    filter: { period?: string; departmentId?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const page = normalisePaging(paging);

    if (hasModel('orgPositionControl')) {
      const where = {
        tenantId,
        ...(filter.period ? { period: filter.period } : {}),
        ...(filter.departmentId ? { departmentId: filter.departmentId } : {}),
      };
      const [items, total] = await Promise.all([
        (prisma as any).orgPositionControl.findMany({
          where,
          orderBy: [{ period: 'desc' }, { departmentId: 'asc' }],
          ...prismaPageArgs(page),
        }),
        (prisma as any).orgPositionControl.count({ where }),
      ]);
      return buildPaginatedResult(items, total, page);
    }

    const items = Array.from(memPositionControl.values()).filter(
      (r) =>
        r.tenantId === tenantId &&
        (!filter.period || r.period === filter.period) &&
        (!filter.departmentId || r.departmentId === filter.departmentId)
    );
    const total = items.length;
    const paged = items.slice((page.page - 1) * page.pageSize, page.page * page.pageSize);
    return buildPaginatedResult(paged, total, page);
  }

  async overhireTotal(tenantId: string, period: string): Promise<number> {
    if (hasModel('orgPositionControl')) {
      const rows: Array<{ overhireCount: number }> = await (
        prisma as any
      ).orgPositionControl.findMany({
        where: { tenantId, period },
        select: { overhireCount: true },
      });
      return rows.reduce((s, r) => s + r.overhireCount, 0);
    }

    return Array.from(memPositionControl.values())
      .filter((r) => r.tenantId === tenantId && r.period === period)
      .reduce((s, r) => s + (r.overhireCount ?? 0), 0);
  }

  async departmentsCovered(tenantId: string, period: string): Promise<number> {
    if (hasModel('orgPositionControl')) {
      const rows: Array<{ departmentId: string | null }> = await (
        prisma as any
      ).orgPositionControl.findMany({
        where: { tenantId, period },
        select: { departmentId: true },
      });
      return new Set(rows.map((r) => r.departmentId).filter(Boolean)).size;
    }

    const rows = Array.from(memPositionControl.values()).filter(
      (r) => r.tenantId === tenantId && r.period === period
    );
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
    if (hasModel('orgVacancy')) {
      return (prisma as any).orgVacancy.upsert({
        where: {
          tenantId_vacancyNumber: {
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

    const key = `${auth.tenantId}:${input.vacancyNumber}`;
    const existing = memVacancy.get(key);
    const item = {
      id: existing?.id ?? `vac-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tenantId: auth.tenantId,
      vacancyNumber: input.vacancyNumber,
      positionId: input.positionId ?? null,
      departmentId: input.departmentId ?? null,
      country: input.country ?? null,
      raisedAt: existing?.raisedAt ?? new Date(),
      status: existing?.status ?? 'OPEN',
      approvedAt: existing?.approvedAt ?? null,
      approvedBy: existing?.approvedBy ?? null,
      filledAt: existing?.filledAt ?? null,
      candidateId: existing?.candidateId ?? null,
      agingDays: existing?.agingDays ?? 0,
    };
    memVacancy.set(key, item);
    return item;
  }

  async approve(id: string, auth: AuthContext) {
    if (hasModel('orgVacancy')) {
      return (prisma as any).orgVacancy.update({
        where: { id },
        data: { approvedAt: new Date(), approvedBy: auth.userId, status: 'APPROVED' },
      });
    }

    for (const [key, v] of memVacancy.entries()) {
      if (v.id === id) {
        const updated = {
          ...v,
          approvedAt: new Date(),
          approvedBy: auth.userId,
          status: 'APPROVED',
        };
        memVacancy.set(key, updated);
        return updated;
      }
    }
    throw new Error('vacancy not found');
  }

  async fill(id: string, candidateId: string | undefined, auth: AuthContext) {
    if (hasModel('orgVacancy')) {
      const row = await (prisma as any).orgVacancy.findUnique({ where: { id } });
      if (!row || row.tenantId !== auth.tenantId) throw new Error('vacancy not found');
      const filledAt = new Date();
      const aging = agingDays(new Date(row.raisedAt), filledAt);
      return (prisma as any).orgVacancy.update({
        where: { id },
        data: { filledAt, candidateId: candidateId ?? null, agingDays: aging, status: 'FILLED' },
      });
    }

    for (const [key, row] of memVacancy.entries()) {
      if (row.id === id) {
        if (row.tenantId !== auth.tenantId) throw new Error('vacancy not found');
        const filledAt = new Date();
        const aging = agingDays(new Date(row.raisedAt), filledAt);
        const updated = {
          ...row,
          filledAt,
          candidateId: candidateId ?? null,
          agingDays: aging,
          status: 'FILLED',
        };
        memVacancy.set(key, updated);
        return updated;
      }
    }
    throw new Error('vacancy not found');
  }

  async list(
    tenantId: string,
    filter: { status?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const page = normalisePaging(paging);

    if (hasModel('orgVacancy')) {
      const where = {
        tenantId,
        ...(filter.status ? { status: filter.status } : {}),
      };
      const [rows, total] = await Promise.all([
        (prisma as any).orgVacancy.findMany({
          where,
          orderBy: { raisedAt: 'desc' },
          ...prismaPageArgs(page),
        }),
        (prisma as any).orgVacancy.count({ where }),
      ]);
      const now = new Date();
      const items = rows.map((r: any) => ({
        ...r,
        agingDays: r.status === 'FILLED' ? r.agingDays : agingDays(new Date(r.raisedAt), null, now),
      }));
      return buildPaginatedResult(items, total, page);
    }

    const rows = Array.from(memVacancy.values()).filter(
      (r) => r.tenantId === tenantId && (!filter.status || r.status === filter.status)
    );
    const now = new Date();
    const items = rows.map((r: any) => ({
      ...r,
      agingDays: r.status === 'FILLED' ? r.agingDays : agingDays(new Date(r.raisedAt), null, now),
    }));
    const total = items.length;
    const paged = items.slice((page.page - 1) * page.pageSize, page.page * page.pageSize);
    return buildPaginatedResult(paged, total, page);
  }

  async openAged(tenantId: string, gateDays = ORG_COMPLIANCE_CONSTANTS.VACANCY_AGE_GATE_DAYS) {
    if (hasModel('orgVacancy')) {
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

    const rows = Array.from(memVacancy.values()).filter(
      (r) => r.tenantId === tenantId && ['OPEN', 'APPROVED'].includes(r.status)
    );
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

    let checklistTotal = 0;
    let checklistFailingHighOrCritical = 0;
    let checklistOverdue = 0;
    let overhireTotal = 0;
    let departmentsCovered = 0;
    let vacancyAged = { aged: 0, unapproved: 0, open: 0 };

    if (hasModel('orgAuditChecklistItem')) {
      checklistTotal = await (prisma as any).orgAuditChecklistItem.count({
        where: { tenantId, status: 'ACTIVE' },
      });
    } else {
      checklistTotal = Array.from(memAuditChecklist.values()).filter(
        (r) => r.tenantId === tenantId && r.status === 'ACTIVE'
      ).length;
    }

    checklistFailingHighOrCritical =
      await orgAuditChecklistService.failingHighOrCriticalCount(tenantId);
    checklistOverdue = await orgAuditChecklistService.overdueCount(tenantId);
    overhireTotal = await orgPositionControlService.overhireTotal(tenantId, period);
    departmentsCovered = await orgPositionControlService.departmentsCovered(tenantId, period);
    vacancyAged = await orgVacancyService.openAged(tenantId);

    let frozenTotal = 0;
    if (hasModel('orgPositionControl')) {
      const frozenTotalRows: Array<{ frozenCount: number }> = await (
        prisma as any
      ).orgPositionControl.findMany({
        where: { tenantId, period },
        select: { frozenCount: true },
      });
      frozenTotal = frozenTotalRows.reduce((s, r) => s + r.frozenCount, 0);
    } else {
      frozenTotal = Array.from(memPositionControl.values())
        .filter((r) => r.tenantId === tenantId && r.period === period)
        .reduce((s, r) => s + (r.frozenCount ?? 0), 0);
    }

    const gating = orgGatingReason({
      checklistFailingHighOrCritical,
      checklistOverdue,
      overhireTotal,
      vacanciesAgedOver90: vacancyAged.aged,
      unapprovedVacancies: vacancyAged.unapproved,
    });

    if (hasModel('orgComplianceCertificate')) {
      return (prisma as any).orgComplianceCertificate.upsert({
        where: { tenantId_period: { tenantId, period } },
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

    const key = `${tenantId}:${period}`;
    const cert = {
      id: `cert-${Date.now()}`,
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
      metricsJson: { period },
      generatedAt: new Date(),
    };
    memCertificate.set(key, cert);
    return cert;
  }

  async sign(
    period: string,
    attestations: Array<{ field: string; value: string }>,
    auth: AuthContext
  ) {
    if (hasModel('orgComplianceCertificate')) {
      const cert = await (prisma as any).orgComplianceCertificate.findUnique({
        where: { tenantId_period: { tenantId: auth.tenantId, period } },
      });
      if (!cert) throw new Error('certificate not found');
      if (cert.gatingReason) throw new Error('cannot sign while gated');
      return (prisma as any).orgComplianceCertificate.update({
        where: { tenantId_period: { tenantId: auth.tenantId, period } },
        data: {
          status: 'SIGNED',
          attestationsJson: attestations as any,
          signedAt: new Date(),
          signedBy: auth.userId,
        },
      });
    }

    const key = `${auth.tenantId}:${period}`;
    const cert = memCertificate.get(key);
    if (!cert) throw new Error('certificate not found');
    if (cert.gatingReason) throw new Error('cannot sign while gated');
    cert.status = 'SIGNED';
    cert.attestationsJson = attestations;
    cert.signedAt = new Date();
    cert.signedBy = auth.userId;
    memCertificate.set(key, cert);
    return cert;
  }

  async list(tenantId: string) {
    if (hasModel('orgComplianceCertificate')) {
      return (prisma as any).orgComplianceCertificate.findMany({
        where: { tenantId },
        orderBy: { period: 'desc' },
        take: 24,
      });
    }

    return Array.from(memCertificate.values()).filter((r) => r.tenantId === tenantId);
  }
}

export const orgComplianceCertificateService = new OrgComplianceCertificateService();
