/**
 * EPIC-10: Payroll Governance, Maker-Checker, Period-Lock,
 * Reconciliation, GL/Bank-File audit, Multi-Country, Risk Matrix,
 * and Monthly Payroll Compliance Certificate.
 *
 * Layered overlay on the existing PayrollRun / Payslip engine:
 *   - PayrollGovernanceControl: catalogue of control activities
 *     (approval gates, period locks, GL postings, bank-file
 *     reconciliation, statutory remittance checks) with required
 *     evidence, owner and review cadence.
 *   - PayrollAuditFinding: per-period findings raised against a
 *     control, with severity, evidence and remediation.
 *   - PayrollRiskEntry: payroll-specific risk register (likelihood ×
 *     impact, banded LOW/MEDIUM/HIGH/CRITICAL).
 *   - PayrollComplianceCertificate: monthly aggregate signed off by
 *     the payroll governance owner. Refuses to sign while critical
 *     findings remain open, maker-checker breaches >0, GL postings
 *     missing, bank-file mismatches >0, or reconciliation variance
 *     above 0.5%.
 *
 * Pure derivation: `riskBand`, `payrollGatingReason` so the gating
 * logic can be unit tested without Prisma.
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

export interface PayrollGatingInput {
  runsCount: number;
  runsApproved: number;
  runsLocked: number;
  runsMakerCheckerBreaches: number;
  openFindingsCritical: number;
  criticalRisksOpen: number;
  controlsOverdue: number;
  reconciliationVariancePct: number;
  bankFileMismatches: number;
  glPostingsMissing: number;
}

/** Returns a semicolon-joined gating reason or null. */
export function payrollGatingReason(input: PayrollGatingInput): string | null {
  const reasons: string[] = [];
  if (input.runsCount > 0 && input.runsApproved < input.runsCount)
    reasons.push(`${input.runsCount - input.runsApproved} payroll run(s) not approved`);
  if (input.runsCount > 0 && input.runsLocked < input.runsCount)
    reasons.push(`${input.runsCount - input.runsLocked} payroll run(s) not period-locked`);
  if (input.runsMakerCheckerBreaches > 0)
    reasons.push(`${input.runsMakerCheckerBreaches} maker-checker breach(es)`);
  if (input.openFindingsCritical > 0)
    reasons.push(`${input.openFindingsCritical} CRITICAL audit finding(s) open`);
  if (input.criticalRisksOpen > 0)
    reasons.push(`${input.criticalRisksOpen} CRITICAL/HIGH risk(s) open`);
  if (input.controlsOverdue > 0)
    reasons.push(`${input.controlsOverdue} governance control(s) overdue`);
  if (input.reconciliationVariancePct > 0.5)
    reasons.push(`Reconciliation variance ${input.reconciliationVariancePct.toFixed(2)}% > 0.5%`);
  if (input.bankFileMismatches > 0)
    reasons.push(`${input.bankFileMismatches} bank-file mismatch(es)`);
  if (input.glPostingsMissing > 0) reasons.push(`${input.glPostingsMissing} GL posting(s) missing`);
  return reasons.length === 0 ? null : reasons.join('; ');
}

export const PAYROLL_COMPLIANCE_CONSTANTS = {
  SEVERITIES: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
  CATEGORIES: [
    'APPROVAL',
    'PERIOD_LOCK',
    'GL_POSTING',
    'BANK_FILE',
    'RECONCILIATION',
    'STATUTORY',
    'AUDIT_TRAIL',
    'SOD',
  ],
  RECONCILIATION_THRESHOLD_PCT: 0.5,
};

// In-memory fallback stores when Prisma delegates are not present
const memGovernanceControls = new Map<string, any>();
const memAuditFindings = new Map<string, any>();
const memRiskEntries = new Map<string, any>();
const memCertificates = new Map<string, any>();

function hasModel(name: string): boolean {
  return typeof (prisma as any)[name] !== 'undefined';
}

class PayrollGovernanceService {
  async upsert(
    input: {
      controlCode: string;
      label: string;
      category: string;
      country?: string;
      description?: string;
      requiredEvidence?: string;
      owner?: string;
      frequency?: string;
    },
    auth: AuthContext
  ) {
    if (hasModel('payrollGovernanceControl')) {
      return (prisma as any).payrollGovernanceControl.upsert({
        where: {
          tenantId_controlCode: {
            tenantId: auth.tenantId,
            controlCode: input.controlCode,
          },
        },
        update: {
          label: input.label,
          category: input.category,
          country: input.country ?? null,
          description: input.description ?? null,
          requiredEvidence: input.requiredEvidence ?? null,
          owner: input.owner ?? null,
          frequency: input.frequency ?? 'MONTHLY',
        },
        create: {
          tenantId: auth.tenantId,
          controlCode: input.controlCode,
          label: input.label,
          category: input.category,
          country: input.country ?? null,
          description: input.description ?? null,
          requiredEvidence: input.requiredEvidence ?? null,
          owner: input.owner ?? null,
          frequency: input.frequency ?? 'MONTHLY',
        },
      });
    }

    const key = `${auth.tenantId}:${input.controlCode}`;
    const existing = memGovernanceControls.get(key);
    const item = {
      id: existing?.id ?? `ctrl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tenantId: auth.tenantId,
      controlCode: input.controlCode,
      label: input.label,
      category: input.category,
      country: input.country ?? null,
      description: input.description ?? null,
      requiredEvidence: input.requiredEvidence ?? null,
      owner: input.owner ?? null,
      frequency: input.frequency ?? 'MONTHLY',
      status: 'ACTIVE',
      lastReviewedAt: existing?.lastReviewedAt ?? null,
      lastReviewedBy: existing?.lastReviewedBy ?? null,
    };
    memGovernanceControls.set(key, item);
    return item;
  }

  async review(id: string, auth: AuthContext) {
    if (hasModel('payrollGovernanceControl')) {
      return (prisma as any).payrollGovernanceControl.update({
        where: { id },
        data: { lastReviewedAt: new Date(), lastReviewedBy: auth.userId },
      });
    }

    for (const [key, item] of memGovernanceControls.entries()) {
      if (item.id === id) {
        const updated = { ...item, lastReviewedAt: new Date(), lastReviewedBy: auth.userId };
        memGovernanceControls.set(key, updated);
        return updated;
      }
    }
    throw new Error('control not found');
  }

  async list(
    tenantId: string,
    filter: { category?: string; country?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const page = normalisePaging(paging);

    if (hasModel('payrollGovernanceControl')) {
      const where = {
        tenantId,
        status: 'ACTIVE',
        ...(filter.category ? { category: filter.category } : {}),
        ...(filter.country ? { country: filter.country } : {}),
      };
      const [items, total] = await Promise.all([
        (prisma as any).payrollGovernanceControl.findMany({
          where,
          orderBy: [{ category: 'asc' }, { controlCode: 'asc' }],
          ...prismaPageArgs(page),
        }),
        (prisma as any).payrollGovernanceControl.count({ where }),
      ]);
      return buildPaginatedResult(items, total, page);
    }

    const items = Array.from(memGovernanceControls.values()).filter(
      (r) =>
        r.tenantId === tenantId &&
        r.status === 'ACTIVE' &&
        (!filter.category || r.category === filter.category) &&
        (!filter.country || r.country === filter.country)
    );
    const total = items.length;
    const paged = items.slice((page.page - 1) * page.pageSize, page.page * page.pageSize);
    return buildPaginatedResult(paged, total, page);
  }

  /** Count controls past their review cadence (≥ 35 days since lastReviewedAt). */
  async overdueCount(tenantId: string, now: Date = new Date()) {
    const daysFor = (f: string) =>
      f === 'WEEKLY' ? 7 : f === 'QUARTERLY' ? 95 : f === 'ANNUAL' ? 370 : 35;

    if (hasModel('payrollGovernanceControl')) {
      const rows = await (prisma as any).payrollGovernanceControl.findMany({
        where: { tenantId, status: 'ACTIVE' },
        select: { lastReviewedAt: true, frequency: true },
      });
      return rows.filter((r: any) => {
        const last = r.lastReviewedAt ? new Date(r.lastReviewedAt).getTime() : 0;
        const ageDays = (now.getTime() - last) / 86_400_000;
        return ageDays > daysFor(r.frequency);
      }).length;
    }

    const rows = Array.from(memGovernanceControls.values()).filter(
      (r) => r.tenantId === tenantId && r.status === 'ACTIVE'
    );
    return rows.filter((r) => {
      const last = r.lastReviewedAt ? new Date(r.lastReviewedAt).getTime() : 0;
      const ageDays = (now.getTime() - last) / 86_400_000;
      return ageDays > daysFor(r.frequency);
    }).length;
  }
}

export const payrollGovernanceService = new PayrollGovernanceService();

class PayrollAuditFindingService {
  async raise(
    input: {
      findingNumber: string;
      period: string;
      country?: string;
      category: string;
      controlCode?: string;
      title: string;
      description?: string;
      severity?: RiskBand;
      evidence?: string;
      ownerId?: string;
      dueAt?: Date;
    },
    auth: AuthContext
  ) {
    if (hasModel('payrollAuditFinding')) {
      return (prisma as any).payrollAuditFinding.upsert({
        where: {
          tenantId_findingNumber: {
            tenantId: auth.tenantId,
            findingNumber: input.findingNumber,
          },
        },
        update: { ...input, status: 'OPEN' },
        create: {
          tenantId: auth.tenantId,
          ...input,
          severity: input.severity ?? 'MEDIUM',
          status: 'OPEN',
        },
      });
    }

    const key = `${auth.tenantId}:${input.findingNumber}`;
    const existing = memAuditFindings.get(key);
    const item = {
      id: existing?.id ?? `fnd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tenantId: auth.tenantId,
      findingNumber: input.findingNumber,
      period: input.period,
      country: input.country ?? null,
      category: input.category,
      controlCode: input.controlCode ?? null,
      title: input.title,
      description: input.description ?? null,
      severity: input.severity ?? 'MEDIUM',
      evidence: input.evidence ?? null,
      ownerId: input.ownerId ?? null,
      dueAt: input.dueAt ?? null,
      status: 'OPEN',
      createdAt: existing?.createdAt ?? new Date(),
    };
    memAuditFindings.set(key, item);
    return item;
  }

  async remediate(id: string, remediation: string, auth: AuthContext) {
    if (hasModel('payrollAuditFinding')) {
      return (prisma as any).payrollAuditFinding.update({
        where: { id },
        data: {
          status: 'REMEDIATED',
          remediation,
          remediatedAt: new Date(),
          remediatedBy: auth.userId,
        },
      });
    }

    for (const [key, item] of memAuditFindings.entries()) {
      if (item.id === id) {
        const updated = {
          ...item,
          status: 'REMEDIATED',
          remediation,
          remediatedAt: new Date(),
          remediatedBy: auth.userId,
        };
        memAuditFindings.set(key, updated);
        return updated;
      }
    }
    throw new Error('finding not found');
  }

  async list(
    tenantId: string,
    filter: { period?: string; status?: string; severity?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const page = normalisePaging(paging);

    if (hasModel('payrollAuditFinding')) {
      const where = {
        tenantId,
        ...(filter.period ? { period: filter.period } : {}),
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.severity ? { severity: filter.severity } : {}),
      };
      const [items, total] = await Promise.all([
        (prisma as any).payrollAuditFinding.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          ...prismaPageArgs(page),
        }),
        (prisma as any).payrollAuditFinding.count({ where }),
      ]);
      return buildPaginatedResult(items, total, page);
    }

    const items = Array.from(memAuditFindings.values()).filter(
      (r) =>
        r.tenantId === tenantId &&
        (!filter.period || r.period === filter.period) &&
        (!filter.status || r.status === filter.status) &&
        (!filter.severity || r.severity === filter.severity)
    );
    const total = items.length;
    const paged = items.slice((page.page - 1) * page.pageSize, page.page * page.pageSize);
    return buildPaginatedResult(paged, total, page);
  }
}

export const payrollAuditFindingService = new PayrollAuditFindingService();

class PayrollRiskService {
  async upsert(
    input: {
      riskCode: string;
      title: string;
      category: string;
      country?: string;
      likelihood: number;
      impact: number;
      controlCode?: string;
      ownerId?: string;
      mitigation?: string;
    },
    auth: AuthContext
  ) {
    const score =
      Math.max(1, Math.min(5, input.likelihood)) * Math.max(1, Math.min(5, input.impact));

    if (hasModel('payrollRiskEntry')) {
      return (prisma as any).payrollRiskEntry.upsert({
        where: {
          tenantId_riskCode: {
            tenantId: auth.tenantId,
            riskCode: input.riskCode,
          },
        },
        update: { ...input, score, band: riskBand(score) },
        create: { tenantId: auth.tenantId, ...input, score, band: riskBand(score) },
      });
    }

    const key = `${auth.tenantId}:${input.riskCode}`;
    const existing = memRiskEntries.get(key);
    const item = {
      id: existing?.id ?? `rsk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tenantId: auth.tenantId,
      riskCode: input.riskCode,
      title: input.title,
      category: input.category,
      country: input.country ?? null,
      likelihood: input.likelihood,
      impact: input.impact,
      score,
      band: riskBand(score),
      controlCode: input.controlCode ?? null,
      ownerId: input.ownerId ?? null,
      mitigation: input.mitigation ?? null,
      status: 'OPEN',
    };
    memRiskEntries.set(key, item);
    return item;
  }

  async close(id: string, _auth: AuthContext) {
    if (hasModel('payrollRiskEntry')) {
      return (prisma as any).payrollRiskEntry.update({
        where: { id },
        data: { status: 'CLOSED' },
      });
    }

    for (const [key, item] of memRiskEntries.entries()) {
      if (item.id === id) {
        const updated = { ...item, status: 'CLOSED' };
        memRiskEntries.set(key, updated);
        return updated;
      }
    }
    throw new Error('risk entry not found');
  }

  async list(
    tenantId: string,
    filter: { status?: string; band?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const page = normalisePaging(paging);

    if (hasModel('payrollRiskEntry')) {
      const where = {
        tenantId,
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.band ? { band: filter.band } : {}),
      };
      const [items, total] = await Promise.all([
        (prisma as any).payrollRiskEntry.findMany({
          where,
          orderBy: { score: 'desc' },
          ...prismaPageArgs(page),
        }),
        (prisma as any).payrollRiskEntry.count({ where }),
      ]);
      return buildPaginatedResult(items, total, page);
    }

    const items = Array.from(memRiskEntries.values()).filter(
      (r) =>
        r.tenantId === tenantId &&
        (!filter.status || r.status === filter.status) &&
        (!filter.band || r.band === filter.band)
    );
    const total = items.length;
    const paged = items.slice((page.page - 1) * page.pageSize, page.page * page.pageSize);
    return buildPaginatedResult(paged, total, page);
  }
}

export const payrollRiskService = new PayrollRiskService();

class PayrollComplianceCertificateService {
  async generate(period: string, auth: AuthContext) {
    const tenantId = auth.tenantId;

    let openFindingsCritical = 0;
    let openFindingsHigh = 0;
    let criticalRisksOpen = 0;

    if (hasModel('payrollAuditFinding')) {
      [openFindingsCritical, openFindingsHigh] = await Promise.all([
        (prisma as any).payrollAuditFinding.count({
          where: { tenantId, period, status: 'OPEN', severity: 'CRITICAL' },
        }),
        (prisma as any).payrollAuditFinding.count({
          where: { tenantId, period, status: 'OPEN', severity: 'HIGH' },
        }),
      ]);
    } else {
      const findings = Array.from(memAuditFindings.values()).filter(
        (f) => f.tenantId === tenantId && f.period === period && f.status === 'OPEN'
      );
      openFindingsCritical = findings.filter((f) => f.severity === 'CRITICAL').length;
      openFindingsHigh = findings.filter((f) => f.severity === 'HIGH').length;
    }

    if (hasModel('payrollRiskEntry')) {
      criticalRisksOpen = await (prisma as any).payrollRiskEntry.count({
        where: { tenantId, status: 'OPEN', band: { in: ['HIGH', 'CRITICAL'] } },
      });
    } else {
      criticalRisksOpen = Array.from(memRiskEntries.values()).filter(
        (r) =>
          r.tenantId === tenantId && r.status === 'OPEN' && ['HIGH', 'CRITICAL'].includes(r.band)
      ).length;
    }

    const [runsCount, runsApproved, runsLocked, runsMakerCheckerBreaches] = await Promise.all([
      this.countRuns(tenantId, period),
      this.countRuns(tenantId, period, 'APPROVED'),
      this.countRuns(tenantId, period, 'LOCKED'),
      this.countMakerCheckerBreaches(tenantId, period),
    ]);

    const controlsOverdue = await payrollGovernanceService.overdueCount(tenantId);
    const recon = await this.reconciliationVariancePct(tenantId, period);
    const bankFileMismatches = await this.countBankFileMismatches(tenantId, period);
    const glPostingsMissing = await this.countGlMissing(tenantId, period);

    const metrics: PayrollGatingInput = {
      runsCount,
      runsApproved,
      runsLocked,
      runsMakerCheckerBreaches,
      openFindingsCritical,
      criticalRisksOpen,
      controlsOverdue,
      reconciliationVariancePct: recon,
      bankFileMismatches,
      glPostingsMissing,
    };
    const gating = payrollGatingReason(metrics);

    if (hasModel('payrollComplianceCertificate')) {
      return (prisma as any).payrollComplianceCertificate.upsert({
        where: {
          tenantId_period: { tenantId, period },
        },
        update: {
          ...metrics,
          openFindingsHigh,
          reconciliationVariancePct: recon,
          gatingReason: gating,
          metricsJson: { period, generatedBy: auth.userId } as any,
          generatedAt: new Date(),
        },
        create: {
          tenantId,
          period,
          status: 'DRAFT',
          ...metrics,
          openFindingsHigh,
          reconciliationVariancePct: recon,
          gatingReason: gating,
          metricsJson: { period, generatedBy: auth.userId } as any,
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
      ...metrics,
      openFindingsHigh,
      reconciliationVariancePct: recon,
      gatingReason: gating,
      metricsJson: { period, generatedBy: auth.userId },
      generatedAt: new Date(),
    };
    memCertificates.set(key, cert);
    return cert;
  }

  async sign(
    period: string,
    attestations: Array<{ field: string; value: string }>,
    auth: AuthContext
  ) {
    if (hasModel('payrollComplianceCertificate')) {
      const cert = await (prisma as any).payrollComplianceCertificate.findUnique({
        where: { tenantId_period: { tenantId: auth.tenantId, period } },
      });
      if (!cert) throw new Error('certificate not found');
      if (cert.gatingReason) throw new Error('cannot sign while gated');
      return (prisma as any).payrollComplianceCertificate.update({
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
    const cert = memCertificates.get(key);
    if (!cert) throw new Error('certificate not found');
    if (cert.gatingReason) throw new Error('cannot sign while gated');
    cert.status = 'SIGNED';
    cert.attestationsJson = attestations;
    cert.signedAt = new Date();
    cert.signedBy = auth.userId;
    memCertificates.set(key, cert);
    return cert;
  }

  async list(tenantId: string) {
    if (hasModel('payrollComplianceCertificate')) {
      return (prisma as any).payrollComplianceCertificate.findMany({
        where: { tenantId },
        orderBy: { period: 'desc' },
        take: 24,
      });
    }

    return Array.from(memCertificates.values()).filter((r) => r.tenantId === tenantId);
  }

  private async countRuns(tenantId: string, period: string, status?: string) {
    try {
      if (!hasModel('payrollRun')) return 0;
      return (await (prisma as any).payrollRun.count({
        where: {
          tenantId,
          payrollMonth: period,
          ...(status ? { status } : {}),
        },
      })) as number;
    } catch {
      return 0;
    }
  }

  private async countMakerCheckerBreaches(tenantId: string, period: string) {
    try {
      if (!hasModel('payrollRun')) return 0;
      return (await (prisma as any).payrollRun.count({
        where: {
          tenantId,
          payrollMonth: period,
          createdBy: { equals: (prisma as any).payrollRun.fields?.approvedBy },
        },
      })) as number;
    } catch {
      return 0;
    }
  }

  private async reconciliationVariancePct(tenantId: string, period: string): Promise<number> {
    try {
      if (!hasModel('payrollRun')) return 0;
      const runs = await (prisma as any).payrollRun.findMany({
        where: { tenantId, payrollMonth: period },
        select: { totalGross: true, totalNet: true, totalDeductions: true },
      });
      let max = 0;
      for (const r of runs) {
        const gross = Number(r.totalGross ?? 0);
        const ded = Number(r.totalDeductions ?? 0);
        const net = Number(r.totalNet ?? 0);
        if (gross === 0) continue;
        const expected = gross - ded;
        const variance = (Math.abs(expected - net) / gross) * 100;
        if (variance > max) max = variance;
      }
      return Number(max.toFixed(4));
    } catch {
      return 0;
    }
  }

  private async countBankFileMismatches(tenantId: string, period: string) {
    try {
      if (!hasModel('bankPaymentFile')) return 0;
      return (await (prisma as any).bankPaymentFile.count({
        where: { tenantId, payrollPeriod: period, status: 'MISMATCH' },
      })) as number;
    } catch {
      return 0;
    }
  }

  private async countGlMissing(tenantId: string, period: string) {
    try {
      if (!hasModel('payrollRun') || !hasModel('glPosting')) return 0;
      const runs = await (prisma as any).payrollRun.findMany({
        where: { tenantId, payrollMonth: period, status: { in: ['APPROVED', 'LOCKED'] } },
        select: { id: true },
      });
      let missing = 0;
      for (const r of runs) {
        const has = await (prisma as any).glPosting.count({
          where: { tenantId, payrollRunId: r.id },
        });
        if (has === 0) missing += 1;
      }
      return missing;
    } catch {
      return 0;
    }
  }
}

export const payrollComplianceCertificateService = new PayrollComplianceCertificateService();
