/**
 * EPIC-08: Employee Records Management compliance overlay.
 *
 *   S04        - RecordsDocumentMatrix: per (country, documentCode) the
 *                mandatory document expectations, retention years,
 *                renewal cadence months, sensitivity, regulator ref.
 *   S05 / S12  - RecordsCompletenessSnapshot: per (period, employeeId)
 *                evaluation against the matrix — present, missing,
 *                expiring within 30 days, expired. Pure
 *                completenessScore() derives 0-100 score with RAG
 *                band GREEN (≥90), AMBER (70-89), RED (<70).
 *   S11        - RecordsAuditChecklistItem registry (severity, last
 *                result PASS/FAIL/OBSERVATION).
 *   S14        - RecordsRiskEntry L×I risk register.
 *   S13 / S17  - RecordsComplianceCertificate. Pure
 *                recordsGatingReason() refuses sign while:
 *                  - red employees > 0
 *                  - HIGH/CRITICAL checklist failures > 0
 *                  - checklist overdue > 0
 *                  - CRITICAL/HIGH risks open > 0
 *                  - expired mandatory docs total > 0
 */

import { prisma } from '@aura/database';

export interface AuthContext {
  tenantId: string;
  userId: string;
}

export type Band = 'GREEN' | 'AMBER' | 'RED';
export type RiskBand = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export function riskBand(score: number): RiskBand {
  if (score >= 20) return 'CRITICAL';
  if (score >= 12) return 'HIGH';
  if (score >= 6) return 'MEDIUM';
  return 'LOW';
}

export interface CompletenessInput {
  mandatoryTotal: number;
  mandatoryPresent: number;
  expired: number;
  expiringWithin30: number;
}

export function completenessScore(input: CompletenessInput): { score: number; band: Band } {
  const base =
    input.mandatoryTotal === 0 ? 100 : (input.mandatoryPresent / input.mandatoryTotal) * 100;
  const penalty = input.expired * 5 + Math.min(10, input.expiringWithin30 * 2);
  const score = Math.max(0, Math.min(100, Math.round((base - penalty) * 100) / 100));
  let band: Band = 'GREEN';
  if (score < 70) band = 'RED';
  else if (score < 90) band = 'AMBER';
  return { score, band };
}

export interface RecordsGatingInput {
  redEmployees: number;
  checklistFailingHighOrCritical: number;
  checklistOverdue: number;
  criticalRisksOpen: number;
  expiredDocsTotal: number;
}

export function recordsGatingReason(input: RecordsGatingInput): string | null {
  const reasons: string[] = [];
  if (input.redEmployees > 0)
    reasons.push(`${input.redEmployees} employee(s) RED on records completeness`);
  if (input.checklistFailingHighOrCritical > 0)
    reasons.push(`${input.checklistFailingHighOrCritical} HIGH/CRITICAL checklist item(s) failing`);
  if (input.checklistOverdue > 0)
    reasons.push(`${input.checklistOverdue} checklist item(s) overdue`);
  if (input.criticalRisksOpen > 0)
    reasons.push(`${input.criticalRisksOpen} CRITICAL/HIGH risk(s) open`);
  if (input.expiredDocsTotal > 0)
    reasons.push(`${input.expiredDocsTotal} expired mandatory document(s)`);
  return reasons.length === 0 ? null : reasons.join('; ');
}

export const RECORDS_COMPLIANCE_CONSTANTS = {
  CATEGORIES: [
    'IDENTITY',
    'CONTRACT',
    'VISA',
    'WORK_PERMIT',
    'EDUCATION',
    'EXPERIENCE',
    'MEDICAL',
    'PERSONAL',
    'BENEFITS',
    'COMPENSATION',
    'POLICY_ACK',
    'OTHER',
  ],
  SENSITIVITIES: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'],
  EXPIRING_WINDOW_DAYS: 30,
};

class RecordsDocumentMatrixService {
  async upsert(
    input: {
      country: string;
      documentCode: string;
      label: string;
      category: string;
      isMandatory?: boolean;
      appliesWhen?: string;
      retentionYears?: number;
      renewalCadenceMonths?: number;
      sensitivity?: string;
      regulatorRef?: string;
      notes?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).recordsDocumentMatrix.upsert({
      where: {
        aura_records_document_matrix_unique: {
          tenantId: auth.tenantId,
          country: input.country,
          documentCode: input.documentCode,
        },
      },
      update: {
        label: input.label,
        category: input.category,
        isMandatory: input.isMandatory ?? true,
        appliesWhen: input.appliesWhen ?? null,
        retentionYears: input.retentionYears ?? 7,
        renewalCadenceMonths: input.renewalCadenceMonths ?? null,
        sensitivity: input.sensitivity ?? 'CONFIDENTIAL',
        regulatorRef: input.regulatorRef ?? null,
        notes: input.notes ?? null,
      },
      create: {
        tenantId: auth.tenantId,
        country: input.country,
        documentCode: input.documentCode,
        label: input.label,
        category: input.category,
        isMandatory: input.isMandatory ?? true,
        appliesWhen: input.appliesWhen ?? null,
        retentionYears: input.retentionYears ?? 7,
        renewalCadenceMonths: input.renewalCadenceMonths ?? null,
        sensitivity: input.sensitivity ?? 'CONFIDENTIAL',
        regulatorRef: input.regulatorRef ?? null,
        notes: input.notes ?? null,
      },
    });
  }

  async list(tenantId: string, filter: { country?: string; category?: string } = {}) {
    return (prisma as any).recordsDocumentMatrix.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        ...(filter.country ? { country: filter.country } : {}),
        ...(filter.category ? { category: filter.category } : {}),
      },
      orderBy: [{ country: 'asc' }, { category: 'asc' }, { documentCode: 'asc' }],
      take: 500,
    });
  }
}

export const recordsDocumentMatrixService = new RecordsDocumentMatrixService();

class RecordsCompletenessService {
  async upsert(
    input: {
      period: string;
      employeeId: string;
      country?: string;
      mandatoryTotal: number;
      mandatoryPresent: number;
      expiringWithin30?: number;
      expired?: number;
      missingCodes?: string[];
    },
    auth: AuthContext
  ) {
    const mandatoryMissing = Math.max(0, input.mandatoryTotal - input.mandatoryPresent);
    const { score, band } = completenessScore({
      mandatoryTotal: input.mandatoryTotal,
      mandatoryPresent: input.mandatoryPresent,
      expired: input.expired ?? 0,
      expiringWithin30: input.expiringWithin30 ?? 0,
    });
    return (prisma as any).recordsCompletenessSnapshot.upsert({
      where: {
        aura_records_completeness_snapshot_unique: {
          tenantId: auth.tenantId,
          period: input.period,
          employeeId: input.employeeId,
        },
      },
      update: {
        country: input.country ?? null,
        mandatoryTotal: input.mandatoryTotal,
        mandatoryPresent: input.mandatoryPresent,
        mandatoryMissing,
        expiringWithin30: input.expiringWithin30 ?? 0,
        expired: input.expired ?? 0,
        score,
        band,
        missingCodes: (input.missingCodes ?? []) as any,
      },
      create: {
        tenantId: auth.tenantId,
        period: input.period,
        employeeId: input.employeeId,
        country: input.country ?? null,
        mandatoryTotal: input.mandatoryTotal,
        mandatoryPresent: input.mandatoryPresent,
        mandatoryMissing,
        expiringWithin30: input.expiringWithin30 ?? 0,
        expired: input.expired ?? 0,
        score,
        band,
        missingCodes: (input.missingCodes ?? []) as any,
      },
    });
  }

  async list(tenantId: string, period: string, filter: { band?: Band } = {}) {
    return (prisma as any).recordsCompletenessSnapshot.findMany({
      where: {
        tenantId,
        period,
        ...(filter.band ? { band: filter.band } : {}),
      },
      orderBy: { score: 'asc' },
      take: 500,
    });
  }

  async aggregate(tenantId: string, period: string) {
    const rows: Array<{
      band: Band;
      score: any;
      mandatoryMissing: number;
      expired: number;
    }> = await (prisma as any).recordsCompletenessSnapshot.findMany({
      where: { tenantId, period },
      select: { band: true, score: true, mandatoryMissing: true, expired: true },
    });
    let green = 0;
    let amber = 0;
    let red = 0;
    let scoreSum = 0;
    let missingTotal = 0;
    let expiredTotal = 0;
    for (const r of rows) {
      if (r.band === 'GREEN') green += 1;
      else if (r.band === 'AMBER') amber += 1;
      else red += 1;
      scoreSum += Number(r.score);
      missingTotal += r.mandatoryMissing;
      expiredTotal += r.expired;
    }
    const avg = rows.length === 0 ? 0 : Number((scoreSum / rows.length).toFixed(2));
    return {
      employeesEvaluated: rows.length,
      greenEmployees: green,
      amberEmployees: amber,
      redEmployees: red,
      averageScore: avg,
      mandatoryMissingTotal: missingTotal,
      expiredDocsTotal: expiredTotal,
    };
  }
}

export const recordsCompletenessService = new RecordsCompletenessService();

class RecordsAuditChecklistService {
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
    return (prisma as any).recordsAuditChecklistItem.upsert({
      where: {
        aura_records_audit_checklist_item_unique: {
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
    return (prisma as any).recordsAuditChecklistItem.update({
      where: { id },
      data: {
        lastReviewedAt: new Date(),
        lastReviewedBy: auth.userId,
        lastResult: result,
        notes: notes ?? null,
      },
    });
  }

  async list(tenantId: string, filter: { category?: string } = {}) {
    return (prisma as any).recordsAuditChecklistItem.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        ...(filter.category ? { category: filter.category } : {}),
      },
      orderBy: [{ category: 'asc' }, { itemCode: 'asc' }],
      take: 500,
    });
  }

  async overdueCount(tenantId: string, now: Date = new Date()): Promise<number> {
    const rows = await (prisma as any).recordsAuditChecklistItem.findMany({
      where: { tenantId, status: 'ACTIVE' },
      select: { lastReviewedAt: true },
    });
    return rows.filter((r: any) => {
      const last = r.lastReviewedAt ? new Date(r.lastReviewedAt).getTime() : 0;
      return (now.getTime() - last) / 86_400_000 > 35;
    }).length;
  }

  async failingHighOrCriticalCount(tenantId: string): Promise<number> {
    return (prisma as any).recordsAuditChecklistItem.count({
      where: {
        tenantId,
        status: 'ACTIVE',
        lastResult: { in: ['FAIL', 'OBSERVATION'] },
        severity: { in: ['HIGH', 'CRITICAL'] },
      },
    });
  }
}

export const recordsAuditChecklistService = new RecordsAuditChecklistService();

class RecordsRiskService {
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
    return (prisma as any).recordsRiskEntry.upsert({
      where: {
        aura_records_risk_entry_unique: {
          tenantId: auth.tenantId,
          riskCode: input.riskCode,
        },
      },
      update: { ...input, score, band: riskBand(score) },
      create: { tenantId: auth.tenantId, ...input, score, band: riskBand(score) },
    });
  }

  async close(id: string, _auth: AuthContext) {
    return (prisma as any).recordsRiskEntry.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
  }

  async list(tenantId: string, filter: { status?: string; band?: string } = {}) {
    return (prisma as any).recordsRiskEntry.findMany({
      where: {
        tenantId,
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.band ? { band: filter.band } : {}),
      },
      orderBy: { score: 'desc' },
      take: 500,
    });
  }
}

export const recordsRiskService = new RecordsRiskService();

class RecordsComplianceCertificateService {
  async generate(period: string, auth: AuthContext) {
    const tenantId = auth.tenantId;
    const [agg, checklistFailing, checklistOverdue, criticalRisksOpen] = await Promise.all([
      recordsCompletenessService.aggregate(tenantId, period),
      recordsAuditChecklistService.failingHighOrCriticalCount(tenantId),
      recordsAuditChecklistService.overdueCount(tenantId),
      (prisma as any).recordsRiskEntry.count({
        where: { tenantId, status: 'OPEN', band: { in: ['HIGH', 'CRITICAL'] } },
      }),
    ]);
    const gating = recordsGatingReason({
      redEmployees: agg.redEmployees,
      checklistFailingHighOrCritical: checklistFailing,
      checklistOverdue,
      criticalRisksOpen,
      expiredDocsTotal: agg.expiredDocsTotal,
    });
    return (prisma as any).recordsComplianceCertificate.upsert({
      where: { aura_records_compliance_certificate_unique: { tenantId, period } },
      update: {
        employeesEvaluated: agg.employeesEvaluated,
        averageScore: agg.averageScore,
        greenEmployees: agg.greenEmployees,
        amberEmployees: agg.amberEmployees,
        redEmployees: agg.redEmployees,
        mandatoryMissingTotal: agg.mandatoryMissingTotal,
        expiredDocsTotal: agg.expiredDocsTotal,
        checklistFailing,
        checklistOverdue,
        criticalRisksOpen,
        gatingReason: gating,
        metricsJson: { period } as any,
        generatedAt: new Date(),
      },
      create: {
        tenantId,
        period,
        status: 'DRAFT',
        employeesEvaluated: agg.employeesEvaluated,
        averageScore: agg.averageScore,
        greenEmployees: agg.greenEmployees,
        amberEmployees: agg.amberEmployees,
        redEmployees: agg.redEmployees,
        mandatoryMissingTotal: agg.mandatoryMissingTotal,
        expiredDocsTotal: agg.expiredDocsTotal,
        checklistFailing,
        checklistOverdue,
        criticalRisksOpen,
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
    const cert = await (prisma as any).recordsComplianceCertificate.findUnique({
      where: { aura_records_compliance_certificate_unique: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not found');
    if (cert.gatingReason) throw new Error('cannot sign while gated');
    return (prisma as any).recordsComplianceCertificate.update({
      where: { aura_records_compliance_certificate_unique: { tenantId: auth.tenantId, period } },
      data: {
        status: 'SIGNED',
        attestationsJson: attestations as any,
        signedAt: new Date(),
        signedBy: auth.userId,
      },
    });
  }

  async list(tenantId: string) {
    return (prisma as any).recordsComplianceCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const recordsComplianceCertificateService = new RecordsComplianceCertificateService();
