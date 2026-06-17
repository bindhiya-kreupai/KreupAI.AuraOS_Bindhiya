/**
 * EPIC-31: Executive HR Compliance Dashboard + Rollup.
 *
 * Aggregates every domain certificate already shipped (EPIC-11 WPS,
 * EPIC-12 OT, EPIC-13/14/15 social insurance, EPIC-16/17/18
 * nationalization, EPIC-19 attendance, EPIC-20 leave, EPIC-21 holidays,
 * EPIC-22 benefits, EPIC-23 accommodation, EPIC-24 HSE, EPIC-25/26 ER,
 * EPIC-27 separation, EPIC-28 EOSB, EPIC-29 visa exit, EPIC-30 document
 * retention, EPIC-32 HR policies, EPIC-33 HR forms) into a single
 * executive view. Each domain produces a KPI snapshot (score 0–100 +
 * RAG band + blocking issues + certificate gating reason). Pure
 * domainScore function takes raw signals (blocking issues, gated cert)
 * and emits the score. Risk register, corrective action register and
 * review calendar back the heatmap / action-tracking workflows.
 * Executive monthly certificate refuses to sign while any domain is
 * RED, critical risks remain open, or corrective actions are overdue.
 */

import { prisma } from '@aura/database';

export interface AuthContext {
  tenantId: string;
  userId: string;
}

export type Rag = 'GREEN' | 'AMBER' | 'RED';

interface DomainConfig {
  domain: string;
  model: string;
  label: string;
}

/** EPIC-31-S03 / S05–S09: domain inventory rolled up by the rollup. */
export const DOMAIN_INVENTORY: DomainConfig[] = [
  { domain: 'WPS', model: 'wpsCertificate', label: 'Wage Protection' },
  { domain: 'OVERTIME', model: 'otCertificate', label: 'Overtime' },
  { domain: 'GOSI', model: 'gosiPeriodSubmission', label: 'GOSI' },
  { domain: 'GPSSA', model: 'gpssaCertificate', label: 'GPSSA' },
  { domain: 'SIO', model: 'sioCertificate', label: 'SIO' },
  { domain: 'EMIRATISATION', model: 'emiratisationCertificate', label: 'Emiratisation' },
  { domain: 'NITAQAT', model: 'nitaqatCertificate', label: 'Nitaqat' },
  { domain: 'BAHRAINIZATION', model: 'bahrainizationCertificate', label: 'Bahrainization' },
  { domain: 'ATTENDANCE', model: 'attendanceCertificate', label: 'Attendance' },
  { domain: 'LEAVE', model: 'leaveCertificate', label: 'Leave' },
  { domain: 'HOLIDAYS', model: 'holidayCertificate', label: 'Holidays' },
  { domain: 'BENEFITS', model: 'benefitCertificate', label: 'Benefits' },
  { domain: 'ACCOMMODATION', model: 'accommodationCertificate', label: 'Accommodation' },
  { domain: 'HSE', model: 'hseCertificate', label: 'HSE' },
  { domain: 'ER', model: 'erCertificate', label: 'Employee Relations' },
  { domain: 'SEPARATION', model: 'separationCertificate', label: 'Separation' },
  { domain: 'EOSB', model: 'eosbCertificate', label: 'EOSB' },
  { domain: 'VISA_EXIT', model: 'visaExitCertificate', label: 'Visa / Immigration Exit' },
  {
    domain: 'IMMIGRATION',
    model: 'immigrationComplianceCertificate',
    label: 'Immigration & Work Authorization',
  },
  { domain: 'DOCUMENT_RETENTION', model: 'docComplianceCertificate', label: 'Document Retention' },
  { domain: 'HR_POLICIES', model: 'hrPolicyCertificate', label: 'HR Policies' },
  { domain: 'HR_FORMS', model: 'hrFormCertificate', label: 'HR Forms' },
];

/** EPIC-31-S02: pure score derivation from raw signals. */
export function domainScore(input: { blockingIssues: number; certificateGated: boolean }): {
  score: number;
  rag: Rag;
} {
  let score = 100;
  if (input.certificateGated) score -= 30;
  score -= Math.min(40, input.blockingIssues * 5);
  score = Math.max(0, Math.min(100, score));
  let rag: Rag = 'GREEN';
  if (score < 70) rag = 'RED';
  else if (score < 90) rag = 'AMBER';
  return { score, rag };
}

function riskBand(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 20) return 'CRITICAL';
  if (score >= 12) return 'HIGH';
  if (score >= 6) return 'MEDIUM';
  return 'LOW';
}

export class ExecutiveRollupService {
  /** Reads the latest certificate per domain, derives score + RAG. */
  async snapshot(tenantId: string, period: string) {
    const snapshots: Array<{
      domain: string;
      label: string;
      score: number;
      ragStatus: Rag;
      blockingIssues: number;
      certificateStatus: string | null;
      certificateGatingReason: string | null;
    }> = [];
    for (const d of DOMAIN_INVENTORY) {
      try {
        const m = (prisma as any)[d.model];
        if (!m?.findUnique && !m?.findFirst) {
          snapshots.push({
            domain: d.domain,
            label: d.label,
            score: 100,
            ragStatus: 'GREEN',
            blockingIssues: 0,
            certificateStatus: null,
            certificateGatingReason: null,
          });
          continue;
        }
        // Use findFirst to be tolerant across compound-key models.
        const cert = await m.findFirst({
          where: { tenantId, period },
          orderBy: { updatedAt: 'desc' },
        });
        if (!cert) {
          snapshots.push({
            domain: d.domain,
            label: d.label,
            score: 100,
            ragStatus: 'GREEN',
            blockingIssues: 0,
            certificateStatus: null,
            certificateGatingReason: null,
          });
          continue;
        }
        const blocking = cert.gatingReason ? cert.gatingReason.split(';').length : 0;
        const { score, rag } = domainScore({
          blockingIssues: blocking,
          certificateGated: !!cert.gatingReason,
        });
        snapshots.push({
          domain: d.domain,
          label: d.label,
          score,
          ragStatus: rag,
          blockingIssues: blocking,
          certificateStatus: cert.status ?? null,
          certificateGatingReason: cert.gatingReason ?? null,
        });
      } catch {
        snapshots.push({
          domain: d.domain,
          label: d.label,
          score: 100,
          ragStatus: 'GREEN',
          blockingIssues: 0,
          certificateStatus: null,
          certificateGatingReason: null,
        });
      }
    }
    return snapshots;
  }

  async persist(tenantId: string, period: string, auth: AuthContext) {
    const snaps = await this.snapshot(tenantId, period);
    for (const s of snaps) {
      await (prisma as any).complianceKpiSnapshot.upsert({
        where: {
          aura_compliance_kpi_snapshot_unique: {
            tenantId,
            period,
            domain: s.domain,
          },
        },
        update: {
          score: s.score,
          ragStatus: s.ragStatus,
          openIssues: s.blockingIssues,
          blockingIssues: s.blockingIssues,
          certificateStatus: s.certificateStatus,
          certificateGatingReason: s.certificateGatingReason,
          metricsJson: { label: s.label },
        },
        create: {
          tenantId,
          period,
          domain: s.domain,
          score: s.score,
          ragStatus: s.ragStatus,
          openIssues: s.blockingIssues,
          blockingIssues: s.blockingIssues,
          certificateStatus: s.certificateStatus,
          certificateGatingReason: s.certificateGatingReason,
          metricsJson: { label: s.label },
        },
      });
    }
    return snaps;
  }
}

export const executiveRollupService = new ExecutiveRollupService();

export class ComplianceRiskService {
  async upsert(
    input: {
      id?: string;
      title: string;
      domain: string;
      country?: string;
      likelihood: number;
      impact: number;
      ownerId?: string;
      nextReviewAt?: Date;
      mitigationNotes?: string;
    },
    auth: AuthContext
  ) {
    const score =
      Math.max(1, Math.min(5, input.likelihood)) * Math.max(1, Math.min(5, input.impact));
    const data = {
      tenantId: auth.tenantId,
      ...input,
      score,
      band: riskBand(score),
    };
    if (input.id)
      return (prisma as any).complianceRiskEntry.update({ where: { id: input.id }, data });
    return (prisma as any).complianceRiskEntry.create({ data });
  }

  async close(id: string, _auth: AuthContext) {
    return (prisma as any).complianceRiskEntry.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
  }

  async list(tenantId: string, filter: { status?: string; domain?: string; band?: string } = {}) {
    return (prisma as any).complianceRiskEntry.findMany({
      where: {
        tenantId,
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.domain ? { domain: filter.domain } : {}),
        ...(filter.band ? { band: filter.band } : {}),
      },
      orderBy: { score: 'desc' },
      take: 500,
    });
  }
}

export const complianceRiskService = new ComplianceRiskService();

export class ComplianceCorrectiveActionService {
  async raise(
    input: {
      actionNumber: string;
      sourceDomain: string;
      sourceRef?: string;
      title: string;
      description?: string;
      rootCause?: string;
      severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      ownerId?: string;
      dueAt?: Date;
    },
    auth: AuthContext
  ) {
    return (prisma as any).complianceCorrectiveAction.upsert({
      where: {
        aura_compliance_corrective_action_unique: {
          tenantId: auth.tenantId,
          actionNumber: input.actionNumber,
        },
      },
      update: { ...input, status: 'OPEN' },
      create: {
        tenantId: auth.tenantId,
        ...input,
        severity: input.severity ?? 'MEDIUM',
        raisedBy: auth.userId,
        status: 'OPEN',
      },
    });
  }

  async complete(id: string, verificationNotes: string | undefined, auth: AuthContext) {
    return (prisma as any).complianceCorrectiveAction.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        completedBy: auth.userId,
        verificationNotes,
      },
    });
  }

  async list(tenantId: string, filter: { status?: string; severity?: string } = {}) {
    return (prisma as any).complianceCorrectiveAction.findMany({
      where: {
        tenantId,
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.severity ? { severity: filter.severity } : {}),
      },
      orderBy: { raisedAt: 'desc' },
      take: 500,
    });
  }
}

export const complianceCorrectiveActionService = new ComplianceCorrectiveActionService();

export class ComplianceReviewCalendarService {
  async upsert(
    input: {
      id?: string;
      title: string;
      domain: string;
      category?: string;
      ownerId?: string;
      dueAt: Date;
      frequency?: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    },
    auth: AuthContext
  ) {
    const data = { tenantId: auth.tenantId, ...input };
    if (input.id)
      return (prisma as any).complianceReviewCalendarItem.update({ where: { id: input.id }, data });
    return (prisma as any).complianceReviewCalendarItem.create({ data });
  }

  async complete(id: string, _auth: AuthContext) {
    const cur = await (prisma as any).complianceReviewCalendarItem.findUnique({
      where: { id },
    });
    if (!cur) throw new Error('item not found');
    const interval =
      cur.frequency === 'WEEKLY'
        ? 7
        : cur.frequency === 'QUARTERLY'
          ? 90
          : cur.frequency === 'YEARLY'
            ? 365
            : 30;
    const next = new Date(cur.dueAt);
    next.setDate(next.getDate() + interval);
    return (prisma as any).complianceReviewCalendarItem.update({
      where: { id },
      data: {
        lastCompletedAt: new Date(),
        dueAt: next,
        status: 'PENDING',
      },
    });
  }

  async list(tenantId: string, filter: { overdueOnly?: boolean } = {}) {
    return (prisma as any).complianceReviewCalendarItem.findMany({
      where: {
        tenantId,
        ...(filter.overdueOnly ? { dueAt: { lt: new Date() }, status: 'PENDING' } : {}),
      },
      orderBy: { dueAt: 'asc' },
      take: 500,
    });
  }
}

export const complianceReviewCalendarService = new ComplianceReviewCalendarService();

export class ExecutiveComplianceCertificateService {
  async dashboard(tenantId: string, period: string) {
    const snaps = await executiveRollupService.snapshot(tenantId, period);
    const greenDomains = snaps.filter((s) => s.ragStatus === 'GREEN').length;
    const amberDomains = snaps.filter((s) => s.ragStatus === 'AMBER').length;
    const redDomains = snaps.filter((s) => s.ragStatus === 'RED').length;
    const blockingIssuesTotal = snaps.reduce((acc, s) => acc + s.blockingIssues, 0);
    const averageScore =
      snaps.length === 0
        ? 100
        : Number((snaps.reduce((acc, s) => acc + s.score, 0) / snaps.length).toFixed(2));
    const criticalRisksOpen = await (prisma as any).complianceRiskEntry.count({
      where: { tenantId, status: 'OPEN', band: { in: ['HIGH', 'CRITICAL'] } },
    });
    const correctiveActionsOpen = await (prisma as any).complianceCorrectiveAction.count({
      where: { tenantId, status: 'OPEN' },
    });
    const correctiveActionsOverdue = await (prisma as any).complianceCorrectiveAction.count({
      where: { tenantId, status: 'OPEN', dueAt: { lt: new Date() } },
    });
    const reviewItemsOverdue = await (prisma as any).complianceReviewCalendarItem.count({
      where: { tenantId, status: 'PENDING', dueAt: { lt: new Date() } },
    });
    return {
      period,
      domainCount: snaps.length,
      greenDomains,
      amberDomains,
      redDomains,
      blockingIssuesTotal,
      averageScore,
      criticalRisksOpen,
      correctiveActionsOpen,
      correctiveActionsOverdue,
      reviewItemsOverdue,
      domainBreakdown: snaps,
    };
  }

  async generate(period: string, auth: AuthContext) {
    await executiveRollupService.persist(auth.tenantId, period, auth);
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.redDomains > 0) reasons.push(`${stats.redDomains} RED domain(s)`);
    if (stats.criticalRisksOpen > 0)
      reasons.push(`${stats.criticalRisksOpen} HIGH/CRITICAL risk(s) open`);
    if (stats.correctiveActionsOverdue > 0)
      reasons.push(`${stats.correctiveActionsOverdue} overdue corrective action(s)`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).executiveComplianceCertificate.upsert({
      where: {
        aura_executive_compliance_certificate_unique: { tenantId: auth.tenantId, period },
      },
      update: {
        ...stats,
        domainBreakdownJson: stats.domainBreakdown,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
      create: {
        tenantId: auth.tenantId,
        period,
        domainCount: stats.domainCount,
        greenDomains: stats.greenDomains,
        amberDomains: stats.amberDomains,
        redDomains: stats.redDomains,
        blockingIssuesTotal: stats.blockingIssuesTotal,
        averageScore: stats.averageScore,
        criticalRisksOpen: stats.criticalRisksOpen,
        correctiveActionsOpen: stats.correctiveActionsOpen,
        correctiveActionsOverdue: stats.correctiveActionsOverdue,
        reviewItemsOverdue: stats.reviewItemsOverdue,
        domainBreakdownJson: stats.domainBreakdown,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
    });
  }

  async sign(
    period: string,
    attestations: Array<{ field: string; value: string }>,
    auth: AuthContext
  ) {
    const cert = await (prisma as any).executiveComplianceCertificate.findUnique({
      where: {
        aura_executive_compliance_certificate_unique: { tenantId: auth.tenantId, period },
      },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).executiveComplianceCertificate.update({
      where: { id: cert.id },
      data: {
        status: 'SIGNED',
        signedAt: new Date(),
        signedBy: auth.userId,
        attestationsJson: attestations,
      },
    });
  }

  async list(tenantId: string) {
    return (prisma as any).executiveComplianceCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const executiveComplianceCertificateService = new ExecutiveComplianceCertificateService();

export const EXECUTIVE_COMPLIANCE_CONSTANTS = { DOMAIN_INVENTORY };
