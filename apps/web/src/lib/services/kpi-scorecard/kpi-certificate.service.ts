import { prisma } from '@aura/database';
import type { AuthContext } from './types';
import { kpiScorecardService } from './kpi-scorecard.service';

/**
 * EPIC-38-S08: monthly KPI certificate.
 *
 * Generate gathers KPIs computed, DQ failures, red KPIs and actioned-red count.
 * Cannot sign while DQ failures or unactioned red KPIs remain.
 */
export class KpiCertificateService {
  async list(tenantId: string, filter: { period?: string } = {}) {
    return (prisma as any).kpiCertificate.findMany({
      where: { tenantId, ...(filter.period ? { period: filter.period } : {}) },
      orderBy: { period: 'desc' },
    });
  }

  async generate(period: string, auth: AuthContext) {
    const values = await (prisma as any).kpiValue.findMany({
      where: { tenantId: auth.tenantId, period },
    });
    const kpisComputed = values.length;
    const redKpis = values.filter((v: { ragStatus: string }) => v.ragStatus === 'RED').length;
    const actionedRedKpis = 0; // wired in when remediation workflow integrates
    const dqFailures = await (prisma as any).kpiDataQualityCheck.count({
      where: { tenantId: auth.tenantId, period, passed: false },
    });
    const reasons: string[] = [];
    if (dqFailures > 0) reasons.push(`${dqFailures} DQ failures`);
    if (redKpis > 0 && actionedRedKpis < redKpis) {
      reasons.push(`${redKpis - actionedRedKpis} red KPI(s) unactioned`);
    }
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).kpiCertificate.upsert({
      where: { aura_kpi_certificate_unique: { tenantId: auth.tenantId, period } },
      update: {
        kpisComputed,
        dqFailures,
        redKpis,
        actionedRedKpis,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
      create: {
        tenantId: auth.tenantId,
        period,
        kpisComputed,
        dqFailures,
        redKpis,
        actionedRedKpis,
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
    const cert = await (prisma as any).kpiCertificate.findUnique({
      where: { aura_kpi_certificate_unique: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).kpiCertificate.update({
      where: { id: cert.id },
      data: {
        status: 'SIGNED',
        signedAt: new Date(),
        signedBy: auth.userId,
        attestationsJson: attestations,
      },
    });
  }

  async snapshotScorecard(period: string, tenantId: string) {
    return kpiScorecardService.compute(tenantId, period);
  }
}

export const kpiCertificateService = new KpiCertificateService();
