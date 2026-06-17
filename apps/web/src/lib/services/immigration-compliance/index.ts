/**
 * EPIC-07: Immigration & Work Authorization Compliance.
 *
 * Layered overlay on the existing visa-permit / employee tables. The
 * existing VisaPermitService handles individual permit CRUD; this
 * module adds the GCC compliance dimension on top:
 *
 *   S02 / S03 - ImmigrationAuthorizationMatrix per (country, documentCode,
 *               appliesTo): label, issuer (MOHRE / ICP / GDRFA / MHRSD /
 *               Qiwa / LMRA / PAM / MOI etc.), mandatory flag, validity
 *               months, renewal lead days. Catalogues every
 *               authorization a tenant must hold in each country.
 *   S04 / S05 - Optional override fields per matrix row support job-title /
 *               occupation rules and work-location restrictions.
 *   S06       - ImmigrationTransferCase: caseNumber, employeeId,
 *               transferType (INTRA_GCC / INTRA_ENTITY / INTRA_LOCATION
 *               / TITLE_CHANGE / EXIT_CANCELLATION), FSM
 *               REQUESTED -> APPROVED -> COMPLETED.
 *   S07       - Dependents/family visas modelled as appliesTo='DEPENDENT'
 *               in the matrix and via subjectType='DEPENDENT' alerts.
 *   S08       - ImmigrationRenewalAlert ladder. Pure alertWindow() helper
 *               folds a daysToExpiry into EXPIRED / WINDOW_7 / WINDOW_30
 *               / WINDOW_60. raiseAlerts() upserts at most one alert per
 *               (subject, document, expiresAt, window) so re-running the
 *               sweep is idempotent.
 *   S09       - Cancellation/exit linkage: alerts whose status flips to
 *               CANCELED count toward the EPIC-29 visa-exit certificate
 *               (already shipped).
 *   S10       - ImmigrationAuthorizationMatrix doubles as the immigration
 *               document register.
 *   S11       - ImmigrationAuditChecklistItem registry (severity, last
 *               result PASS/FAIL/OBSERVATION). overdueCount() flags items
 *               > 35 days since review.
 *   S12       - dashboard aggregates KPIs.
 *   S13       - ImmigrationRiskEntry L×I risk register, banded via
 *               riskBand() pure helper.
 *   S14       - PRO orchestration surfaces as the transfer-case workflow.
 *   S15       - Sample policy template surfaced via the audit checklist
 *               expectation field.
 *
 * Monthly ImmigrationComplianceCertificate. Pure immigrationGatingReason()
 * refuses sign while:
 *   - expired mandatory documents > 0
 *   - 7-day-window alerts unresolved
 *   - transfers open past 60 days from request
 *   - HIGH/CRITICAL checklist items failing
 *   - checklist items overdue
 *   - CRITICAL/HIGH risks open
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

export type RiskBand = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export function riskBand(score: number): RiskBand {
  if (score >= 20) return 'CRITICAL';
  if (score >= 12) return 'HIGH';
  if (score >= 6) return 'MEDIUM';
  return 'LOW';
}

export type AlertWindow = 'EXPIRED' | 'WINDOW_7' | 'WINDOW_30' | 'WINDOW_60' | null;

export function daysToExpiry(expiresAt: Date, now: Date = new Date()): number {
  return Math.floor((expiresAt.getTime() - now.getTime()) / 86_400_000);
}

/** EPIC-07-S08: pure ladder used by the alert sweep. */
export function alertWindow(daysToExpiry: number): AlertWindow {
  if (daysToExpiry < 0) return 'EXPIRED';
  if (daysToExpiry <= 7) return 'WINDOW_7';
  if (daysToExpiry <= 30) return 'WINDOW_30';
  if (daysToExpiry <= 60) return 'WINDOW_60';
  return null;
}

export interface ImmigrationGatingInput {
  expiredDocsTotal: number;
  alerts7dOpen: number;
  transfersOpenOverdue: number;
  checklistFailingHighOrCritical: number;
  checklistOverdue: number;
  criticalRisksOpen: number;
}

export function immigrationGatingReason(input: ImmigrationGatingInput): string | null {
  const reasons: string[] = [];
  if (input.expiredDocsTotal > 0)
    reasons.push(`${input.expiredDocsTotal} expired mandatory document(s)`);
  if (input.alerts7dOpen > 0)
    reasons.push(`${input.alerts7dOpen} renewal alert(s) inside 7-day window unresolved`);
  if (input.transfersOpenOverdue > 0)
    reasons.push(`${input.transfersOpenOverdue} transfer case(s) open > 60 days`);
  if (input.checklistFailingHighOrCritical > 0)
    reasons.push(`${input.checklistFailingHighOrCritical} HIGH/CRITICAL checklist item(s) failing`);
  if (input.checklistOverdue > 0)
    reasons.push(`${input.checklistOverdue} checklist item(s) overdue`);
  if (input.criticalRisksOpen > 0)
    reasons.push(`${input.criticalRisksOpen} CRITICAL/HIGH risk(s) open`);
  return reasons.length === 0 ? null : reasons.join('; ');
}

export const IMMIGRATION_COMPLIANCE_CONSTANTS = {
  COUNTRIES: ['UAE', 'KSA', 'BH', 'QA', 'OM', 'KW'],
  APPLIES_TO: ['EMPLOYEE', 'DEPENDENT', 'CONTRACTOR'],
  CATEGORIES: [
    'ENTRY_PERMIT',
    'WORK_PERMIT',
    'LABOUR_CARD',
    'RESIDENCE_VISA',
    'NATIONAL_ID',
    'IQAMA',
    'CPR',
    'QID',
    'CIVIL_ID',
    'DEPENDENT_VISA',
    'OCCUPATION_RULE',
    'WORK_LOCATION_RULE',
    'TRANSFER_MOBILITY',
    'CANCELLATION_EXIT',
    'PRO_TRANSACTION',
    'AUDIT',
  ],
  ALERT_WINDOWS: ['EXPIRED', 'WINDOW_7', 'WINDOW_30', 'WINDOW_60'],
  TRANSFER_TYPES: [
    'INTRA_GCC',
    'INTRA_ENTITY',
    'INTRA_LOCATION',
    'TITLE_CHANGE',
    'EXIT_CANCELLATION',
  ],
  TRANSFER_OVERDUE_DAYS: 60,
};

class AuthorizationMatrixService {
  async upsert(
    input: {
      country: string;
      documentCode: string;
      label: string;
      appliesTo?: 'EMPLOYEE' | 'DEPENDENT' | 'CONTRACTOR';
      issuer?: string;
      isMandatory?: boolean;
      validityMonths?: number;
      renewalLeadDays?: number;
      regulatorRef?: string;
      notes?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).immigrationAuthorizationMatrix.upsert({
      where: {
        aura_immigration_authorization_matrix_unique: {
          tenantId: auth.tenantId,
          country: input.country,
          documentCode: input.documentCode,
          appliesTo: input.appliesTo ?? 'EMPLOYEE',
        },
      },
      update: {
        label: input.label,
        issuer: input.issuer ?? null,
        isMandatory: input.isMandatory ?? true,
        validityMonths: input.validityMonths ?? null,
        renewalLeadDays: input.renewalLeadDays ?? 60,
        regulatorRef: input.regulatorRef ?? null,
        notes: input.notes ?? null,
      },
      create: {
        tenantId: auth.tenantId,
        country: input.country,
        documentCode: input.documentCode,
        appliesTo: input.appliesTo ?? 'EMPLOYEE',
        label: input.label,
        issuer: input.issuer ?? null,
        isMandatory: input.isMandatory ?? true,
        validityMonths: input.validityMonths ?? null,
        renewalLeadDays: input.renewalLeadDays ?? 60,
        regulatorRef: input.regulatorRef ?? null,
        notes: input.notes ?? null,
      },
    });
  }

  async list(
    tenantId: string,
    filter: { country?: string; appliesTo?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      status: 'ACTIVE',
      ...(filter.country ? { country: filter.country } : {}),
      ...(filter.appliesTo ? { appliesTo: filter.appliesTo } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).immigrationAuthorizationMatrix.findMany({
        where,
        orderBy: [{ country: 'asc' }, { appliesTo: 'asc' }, { documentCode: 'asc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).immigrationAuthorizationMatrix.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const authorizationMatrixService = new AuthorizationMatrixService();

class RenewalAlertService {
  /** EPIC-07-S08: idempotent sweep that raises an alert per crossed window. */
  async raise(
    input: {
      subjectType?: 'EMPLOYEE' | 'DEPENDENT' | 'CONTRACTOR';
      subjectId: string;
      country: string;
      documentCode: string;
      permitId?: string;
      expiresAt: Date;
    },
    auth: AuthContext,
    now: Date = new Date()
  ) {
    const window = alertWindow(daysToExpiry(input.expiresAt, now));
    if (!window) return null;
    return (prisma as any).immigrationRenewalAlert.upsert({
      where: {
        aura_immigration_renewal_alert_unique: {
          tenantId: auth.tenantId,
          subjectId: input.subjectId,
          documentCode: input.documentCode,
          expiresAt: input.expiresAt,
          window,
        },
      },
      update: {},
      create: {
        tenantId: auth.tenantId,
        subjectType: input.subjectType ?? 'EMPLOYEE',
        subjectId: input.subjectId,
        country: input.country,
        documentCode: input.documentCode,
        permitId: input.permitId ?? null,
        expiresAt: input.expiresAt,
        window,
        status: 'OPEN',
        raisedAt: now,
      },
    });
  }

  async acknowledge(id: string, auth: AuthContext) {
    return (prisma as any).immigrationRenewalAlert.update({
      where: { id },
      data: { acknowledgedAt: new Date(), acknowledgedBy: auth.userId, status: 'ACKNOWLEDGED' },
    });
  }

  async markRenewed(id: string, auth: AuthContext) {
    return (prisma as any).immigrationRenewalAlert.update({
      where: { id },
      data: { renewedAt: new Date(), renewedBy: auth.userId, status: 'RENEWED' },
    });
  }

  async list(
    tenantId: string,
    filter: { status?: string; window?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.window ? { window: filter.window } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).immigrationRenewalAlert.findMany({
        where,
        orderBy: [{ window: 'asc' }, { expiresAt: 'asc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).immigrationRenewalAlert.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async openCountsByWindow(tenantId: string): Promise<Record<string, number>> {
    const rows: Array<{ window: string }> = await (prisma as any).immigrationRenewalAlert.findMany({
      where: { tenantId, status: 'OPEN' },
      select: { window: true },
    });
    return rows.reduce<Record<string, number>>(
      (acc, r) => ({ ...acc, [r.window]: (acc[r.window] ?? 0) + 1 }),
      {}
    );
  }

  async expiredCount(tenantId: string): Promise<number> {
    return (prisma as any).immigrationRenewalAlert.count({
      where: { tenantId, status: 'OPEN', window: 'EXPIRED' },
    });
  }
}

export const renewalAlertService = new RenewalAlertService();

class TransferCaseService {
  async raise(
    input: {
      caseNumber: string;
      employeeId: string;
      transferType: string;
      fromCountry?: string;
      toCountry?: string;
      fromEntity?: string;
      toEntity?: string;
      fromLocation?: string;
      toLocation?: string;
      notes?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).immigrationTransferCase.upsert({
      where: {
        aura_immigration_transfer_case_unique: {
          tenantId: auth.tenantId,
          caseNumber: input.caseNumber,
        },
      },
      update: { ...input, status: 'REQUESTED' },
      create: {
        tenantId: auth.tenantId,
        ...input,
        requestedAt: new Date(),
        status: 'REQUESTED',
      },
    });
  }

  async approve(id: string, auth: AuthContext) {
    return (prisma as any).immigrationTransferCase.update({
      where: { id },
      data: { approvedAt: new Date(), approvedBy: auth.userId, status: 'APPROVED' },
    });
  }

  async complete(id: string, auth: AuthContext) {
    const row = await (prisma as any).immigrationTransferCase.findUnique({ where: { id } });
    if (!row || row.tenantId !== auth.tenantId) throw new Error('transfer case not found');
    if (row.status !== 'APPROVED') throw new Error('transfer must be APPROVED before completion');
    return (prisma as any).immigrationTransferCase.update({
      where: { id },
      data: { completedAt: new Date(), status: 'COMPLETED' },
    });
  }

  async list(
    tenantId: string,
    filter: { status?: string; transferType?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.transferType ? { transferType: filter.transferType } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).immigrationTransferCase.findMany({
        where,
        orderBy: { requestedAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).immigrationTransferCase.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async openOverdueCount(
    tenantId: string,
    overdueDays: number = IMMIGRATION_COMPLIANCE_CONSTANTS.TRANSFER_OVERDUE_DAYS,
    now: Date = new Date()
  ): Promise<number> {
    const rows: Array<{ requestedAt: Date }> = await (
      prisma as any
    ).immigrationTransferCase.findMany({
      where: { tenantId, status: { in: ['REQUESTED', 'APPROVED'] } },
      select: { requestedAt: true },
    });
    return rows.filter((r) => {
      const days = Math.floor((now.getTime() - new Date(r.requestedAt).getTime()) / 86_400_000);
      return days > overdueDays;
    }).length;
  }
}

export const transferCaseService = new TransferCaseService();

class ImmigrationAuditChecklistService {
  async upsert(
    input: {
      itemCode: string;
      label: string;
      category: string;
      country?: string;
      expectation?: string;
      severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    },
    auth: AuthContext
  ) {
    return (prisma as any).immigrationAuditChecklistItem.upsert({
      where: {
        aura_immigration_audit_checklist_item_unique: {
          tenantId: auth.tenantId,
          itemCode: input.itemCode,
        },
      },
      update: {
        label: input.label,
        category: input.category,
        country: input.country ?? null,
        expectation: input.expectation ?? null,
        severity: input.severity ?? 'MEDIUM',
      },
      create: {
        tenantId: auth.tenantId,
        itemCode: input.itemCode,
        label: input.label,
        category: input.category,
        country: input.country ?? null,
        expectation: input.expectation ?? null,
        severity: input.severity ?? 'MEDIUM',
      },
    });
  }

  async record(
    id: string,
    result: 'PASS' | 'FAIL' | 'OBSERVATION',
    notes: string | undefined,
    auth: AuthContext
  ) {
    return (prisma as any).immigrationAuditChecklistItem.update({
      where: { id },
      data: {
        lastReviewedAt: new Date(),
        lastReviewedBy: auth.userId,
        lastResult: result,
        notes: notes ?? null,
      },
    });
  }

  async list(
    tenantId: string,
    filter: { category?: string; country?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      status: 'ACTIVE',
      ...(filter.category ? { category: filter.category } : {}),
      ...(filter.country ? { country: filter.country } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).immigrationAuditChecklistItem.findMany({
        where,
        orderBy: [{ category: 'asc' }, { itemCode: 'asc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).immigrationAuditChecklistItem.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async overdueCount(tenantId: string, now: Date = new Date()): Promise<number> {
    const rows = await (prisma as any).immigrationAuditChecklistItem.findMany({
      where: { tenantId, status: 'ACTIVE' },
      select: { lastReviewedAt: true },
    });
    return rows.filter((r: any) => {
      const last = r.lastReviewedAt ? new Date(r.lastReviewedAt).getTime() : 0;
      return (now.getTime() - last) / 86_400_000 > 35;
    }).length;
  }

  async failingHighOrCriticalCount(tenantId: string): Promise<number> {
    return (prisma as any).immigrationAuditChecklistItem.count({
      where: {
        tenantId,
        status: 'ACTIVE',
        lastResult: { in: ['FAIL', 'OBSERVATION'] },
        severity: { in: ['HIGH', 'CRITICAL'] },
      },
    });
  }
}

export const immigrationAuditChecklistService = new ImmigrationAuditChecklistService();

class ImmigrationRiskService {
  async upsert(
    input: {
      riskCode: string;
      title: string;
      category: string;
      country?: string;
      likelihood: number;
      impact: number;
      ownerId?: string;
      mitigation?: string;
    },
    auth: AuthContext
  ) {
    const score =
      Math.max(1, Math.min(5, input.likelihood)) * Math.max(1, Math.min(5, input.impact));
    return (prisma as any).immigrationRiskEntry.upsert({
      where: {
        aura_immigration_risk_entry_unique: {
          tenantId: auth.tenantId,
          riskCode: input.riskCode,
        },
      },
      update: { ...input, score, band: riskBand(score) },
      create: { tenantId: auth.tenantId, ...input, score, band: riskBand(score) },
    });
  }

  async close(id: string, _auth: AuthContext) {
    return (prisma as any).immigrationRiskEntry.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
  }

  async list(
    tenantId: string,
    filter: { status?: string; band?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.band ? { band: filter.band } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).immigrationRiskEntry.findMany({
        where,
        orderBy: { score: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).immigrationRiskEntry.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const immigrationRiskService = new ImmigrationRiskService();

class ImmigrationComplianceCertificateService {
  async generate(period: string, auth: AuthContext) {
    const tenantId = auth.tenantId;
    const [
      expiredDocsTotal,
      windowCounts,
      transfersOverdue,
      checklistTotal,
      checklistFailing,
      checklistOverdue,
      criticalRisksOpen,
      matrix,
    ] = await Promise.all([
      renewalAlertService.expiredCount(tenantId),
      renewalAlertService.openCountsByWindow(tenantId),
      transferCaseService.openOverdueCount(tenantId),
      (prisma as any).immigrationAuditChecklistItem.count({
        where: { tenantId, status: 'ACTIVE' },
      }),
      immigrationAuditChecklistService.failingHighOrCriticalCount(tenantId),
      immigrationAuditChecklistService.overdueCount(tenantId),
      (prisma as any).immigrationRiskEntry.count({
        where: { tenantId, status: 'OPEN', band: { in: ['HIGH', 'CRITICAL'] } },
      }),
      authorizationMatrixService.list(tenantId),
    ]);
    const countriesCovered = new Set(
      (matrix.items as Array<{ country: string }>).map((m) => m.country)
    ).size;
    const alerts7d = windowCounts.WINDOW_7 ?? 0;
    const alerts30d = windowCounts.WINDOW_30 ?? 0;
    const alerts60d = windowCounts.WINDOW_60 ?? 0;
    const gating = immigrationGatingReason({
      expiredDocsTotal,
      alerts7dOpen: alerts7d,
      transfersOpenOverdue: transfersOverdue,
      checklistFailingHighOrCritical: checklistFailing,
      checklistOverdue,
      criticalRisksOpen,
    });
    return (prisma as any).immigrationComplianceCertificate.upsert({
      where: { aura_immigration_compliance_certificate_unique: { tenantId, period } },
      update: {
        expiredDocsTotal,
        alerts7dOpen: alerts7d,
        alerts30dOpen: alerts30d,
        alerts60dOpen: alerts60d,
        transfersOpenOverdue: transfersOverdue,
        checklistTotal,
        checklistFailing,
        checklistOverdue,
        criticalRisksOpen,
        countriesCovered,
        gatingReason: gating,
        metricsJson: { period } as any,
        generatedAt: new Date(),
      },
      create: {
        tenantId,
        period,
        status: 'DRAFT',
        expiredDocsTotal,
        alerts7dOpen: alerts7d,
        alerts30dOpen: alerts30d,
        alerts60dOpen: alerts60d,
        transfersOpenOverdue: transfersOverdue,
        checklistTotal,
        checklistFailing,
        checklistOverdue,
        criticalRisksOpen,
        countriesCovered,
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
    const cert = await (prisma as any).immigrationComplianceCertificate.findUnique({
      where: {
        aura_immigration_compliance_certificate_unique: { tenantId: auth.tenantId, period },
      },
    });
    if (!cert) throw new Error('certificate not found');
    if (cert.gatingReason) throw new Error('cannot sign while gated');
    return (prisma as any).immigrationComplianceCertificate.update({
      where: {
        aura_immigration_compliance_certificate_unique: { tenantId: auth.tenantId, period },
      },
      data: {
        status: 'SIGNED',
        attestationsJson: attestations as any,
        signedAt: new Date(),
        signedBy: auth.userId,
      },
    });
  }

  async list(tenantId: string) {
    return (prisma as any).immigrationComplianceCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const immigrationComplianceCertificateService =
  new ImmigrationComplianceCertificateService();
