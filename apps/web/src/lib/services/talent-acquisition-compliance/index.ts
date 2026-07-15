/**
 * EPIC-03 (Workforce Planning) + EPIC-04 (Recruitment) + EPIC-05 (Offer
 * Management & Pre-Employment): a shared compliance overlay across the
 * talent-acquisition lifecycle.
 *
 *   - TaAuditChecklistItem: per (itemCode) catalogued by stage
 *     (PLANNING / SOURCING / SELECTION / OFFER / PRE_EMPLOYMENT) and
 *     category (workforce_planning, requisition, sourcing, agency,
 *     screening, interview, anti_bias, bgv, immigration, privacy,
 *     offer_approval, offer_letter, medical_visa, nationalization).
 *     Severity LOW/MEDIUM/HIGH/CRITICAL with PASS/FAIL/OBSERVATION
 *     result tracking. overdueCount() flags items > 35d since review.
 *   - TaRiskEntry: L×I scored, banded LOW/MEDIUM/HIGH/CRITICAL via
 *     riskBand() pure helper.
 *   - TaComplianceCertificate: monthly aggregate. Pure
 *     taGatingReason() refuses sign while:
 *       - HIGH/CRITICAL checklist items failing
 *       - checklist items overdue
 *       - CRITICAL/HIGH risks open
 *
 * EPIC-02 (regulatory framework) is covered by:
 *   - HRMS Configuration (EPIC-34): versioned country rule sets
 *     fulfil S01 rule engine core + S02 rule change governance.
 *   - WPS / GOSI / GPSSA / SIO / Emiratisation / Nitaqat /
 *     Bahrainization / Qatar WPS / Oman SPF / Kuwait PIFSS epics
 *     fulfil S03-S18 country-specific labour-law / wage-protection /
 *     social-insurance / nationalization rule sets.
 *   - EPIC-31 Executive Compliance Rollup surfaces a 21-domain RAG
 *     status grid which doubles as the S19 GCC regulatory comparison
 *     matrix.
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

export interface TaGatingInput {
  checklistFailingHighOrCritical: number;
  checklistOverdue: number;
  criticalRisksOpen: number;
}

export function taGatingReason(input: TaGatingInput): string | null {
  const reasons: string[] = [];
  if (input.checklistFailingHighOrCritical > 0)
    reasons.push(`${input.checklistFailingHighOrCritical} HIGH/CRITICAL checklist item(s) failing`);
  if (input.checklistOverdue > 0)
    reasons.push(`${input.checklistOverdue} checklist item(s) overdue`);
  if (input.criticalRisksOpen > 0)
    reasons.push(`${input.criticalRisksOpen} CRITICAL/HIGH risk(s) open`);
  return reasons.length === 0 ? null : reasons.join('; ');
}

export const TA_COMPLIANCE_CONSTANTS = {
  STAGES: ['PLANNING', 'SOURCING', 'SELECTION', 'OFFER', 'PRE_EMPLOYMENT'],
  CATEGORIES: [
    // EPIC-03 workforce planning
    'WORKFORCE_PLAN',
    'NATIONALIZATION_PLAN',
    'HEADCOUNT_BUDGET',
    'SUCCESSION_PLAN',
    'CONTRACTOR_PLAN',
    'WORKFORCE_RISK',
    // EPIC-04 recruitment
    'REQUISITION',
    'JOB_DESCRIPTION',
    'SOURCING_AUTHORITY',
    'AGENCY_VENDOR',
    'NATIONALIZATION_RECRUIT',
    'SCREENING',
    'INTERVIEW',
    'ANTI_BIAS',
    'ASSESSMENT',
    'BGV',
    'IMMIGRATION_ELIGIBILITY',
    'COMPENSATION_BENCHMARK',
    'PRIVACY_CONSENT',
    // EPIC-05 offer & pre-employment
    'OFFER_APPROVAL',
    'OFFER_LETTER',
    'OFFER_NEGOTIATION',
    'PRE_EMPLOYMENT',
    'MEDICAL_VISA',
    'RIGHT_TO_WORK',
    'CONTRACT_GENERATION',
  ],
  RESULTS: ['PASS', 'FAIL', 'OBSERVATION'],
};

class TaAuditChecklistService {
  async upsert(
    input: {
      itemCode: string;
      label: string;
      stage: string;
      category: string;
      country?: string;
      expectation?: string;
      severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    },
    auth: AuthContext
  ) {
    return prisma.taAuditChecklistItem.upsert({
      where: {
        tenantId_itemCode: {
          tenantId: auth.tenantId,
          itemCode: input.itemCode,
        },
      },
      update: {
        label: input.label,
        stage: input.stage,
        category: input.category,
        country: input.country ?? null,
        expectation: input.expectation ?? null,
        severity: input.severity ?? 'MEDIUM',
      },
      create: {
        tenantId: auth.tenantId,
        itemCode: input.itemCode,
        label: input.label,
        stage: input.stage,
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
    return prisma.taAuditChecklistItem.update({
      where: { id },
      data: {
        lastReviewedAt: new Date(),
        lastReviewedBy: auth.userId,
        lastResult: result,
        notes: notes ?? null,
      },
    });
  }

  async list(tenantId: string, filter: { stage?: string; category?: string } = {}) {
    return prisma.taAuditChecklistItem.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        ...(filter.stage ? { stage: filter.stage } : {}),
        ...(filter.category ? { category: filter.category } : {}),
      },
      orderBy: [{ stage: 'asc' }, { category: 'asc' }, { itemCode: 'asc' }],
      take: 1000,
    });
  }

  async overdueCount(tenantId: string, now: Date = new Date()): Promise<number> {
    const rows = await prisma.taAuditChecklistItem.findMany({
      where: { tenantId, status: 'ACTIVE' },
      select: { lastReviewedAt: true },
    });
    return rows.filter((r) => {
      const last = r.lastReviewedAt ? new Date(r.lastReviewedAt).getTime() : 0;
      return (now.getTime() - last) / 86_400_000 > 35;
    }).length;
  }

  async failingHighOrCriticalCount(tenantId: string): Promise<number> {
    return prisma.taAuditChecklistItem.count({
      where: {
        tenantId,
        status: 'ACTIVE',
        lastResult: { in: ['FAIL', 'OBSERVATION'] },
        severity: { in: ['HIGH', 'CRITICAL'] },
      },
    });
  }

  async stageBreakdown(tenantId: string) {
    const rows = await prisma.taAuditChecklistItem.findMany({
      where: { tenantId, status: 'ACTIVE' },
      select: { stage: true, lastResult: true },
    });
    const map: Record<
      string,
      { total: number; pass: number; fail: number; obs: number; unchecked: number }
    > = {};
    for (const r of rows) {
      const k = r.stage;
      if (!map[k]) map[k] = { total: 0, pass: 0, fail: 0, obs: 0, unchecked: 0 };
      map[k].total += 1;
      if (r.lastResult === 'PASS') map[k].pass += 1;
      else if (r.lastResult === 'FAIL') map[k].fail += 1;
      else if (r.lastResult === 'OBSERVATION') map[k].obs += 1;
      else map[k].unchecked += 1;
    }
    return Object.entries(map).map(([stage, v]) => ({ stage, ...v }));
  }
}

export const taAuditChecklistService = new TaAuditChecklistService();

class TaRiskService {
  async upsert(
    input: {
      riskCode: string;
      title: string;
      stage: string;
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
    return prisma.taRiskEntry.upsert({
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

  async close(id: string, _auth: AuthContext) {
    return prisma.taRiskEntry.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
  }

  async list(
    tenantId: string,
    filter: { status?: string; band?: string; stage?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.band ? { band: filter.band } : {}),
      ...(filter.stage ? { stage: filter.stage } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      prisma.taRiskEntry.findMany({
        where,
        orderBy: { score: 'desc' },
        ...prismaPageArgs(page),
      }),
      prisma.taRiskEntry.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const taRiskService = new TaRiskService();

class TaComplianceCertificateService {
  async generate(period: string, auth: AuthContext) {
    const tenantId = auth.tenantId;
    const [checklistTotal, checklistFailing, checklistOverdue, criticalRisksOpen, stageBreakdown] =
      await Promise.all([
        prisma.taAuditChecklistItem.count({ where: { tenantId, status: 'ACTIVE' } }),
        taAuditChecklistService.failingHighOrCriticalCount(tenantId),
        taAuditChecklistService.overdueCount(tenantId),
        prisma.taRiskEntry.count({
          where: { tenantId, status: 'OPEN', band: { in: ['HIGH', 'CRITICAL'] } },
        }),
        taAuditChecklistService.stageBreakdown(tenantId),
      ]);
    const gating = taGatingReason({
      checklistFailingHighOrCritical: checklistFailing,
      checklistOverdue,
      criticalRisksOpen,
    });
    return prisma.taComplianceCertificate.upsert({
      where: { tenantId_period: { tenantId, period } },
      update: {
        checklistTotal,
        checklistFailing,
        checklistOverdue,
        criticalRisksOpen,
        stagesCovered: stageBreakdown.length,
        stageBreakdownJson: stageBreakdown as any,
        gatingReason: gating,
        metricsJson: { period } as any,
        generatedAt: new Date(),
      },
      create: {
        tenantId,
        period,
        status: 'DRAFT',
        checklistTotal,
        checklistFailing,
        checklistOverdue,
        criticalRisksOpen,
        stagesCovered: stageBreakdown.length,
        stageBreakdownJson: stageBreakdown as any,
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
    const cert = await prisma.taComplianceCertificate.findUnique({
      where: { tenantId_period: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not found');
    if (cert.gatingReason) throw new Error('cannot sign while gated');
    return prisma.taComplianceCertificate.update({
      where: { tenantId_period: { tenantId: auth.tenantId, period } },
      data: {
        status: 'SIGNED',
        attestationsJson: attestations as any,
        signedAt: new Date(),
        signedBy: auth.userId,
      },
    });
  }

  async list(tenantId: string) {
    return prisma.taComplianceCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const taComplianceCertificateService = new TaComplianceCertificateService();
