import { prisma } from '@aura/database';
import type { AuthContext } from './types';

/**
 * EPIC-11-S14 / S21: WPS document library + monthly certificate.
 */
export class WpsCertificateService {
  async list(tenantId: string) {
    return (prisma as any).wpsMonthlyCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }

  async dashboard(tenantId: string, period: string) {
    const subs = await (prisma as any).wpsPeriodSubmission.findMany({
      where: { tenantId, period },
    });
    const submissions = subs.length;
    const ackd = subs.filter(
      (s: { status: string }) => s.status === 'ACKNOWLEDGED' || s.status === 'RECONCILED'
    ).length;
    const reconciled = subs.filter(
      (s: { reconciliationStatus: string }) => s.reconciliationStatus === 'MATCH'
    ).length;
    const delayFlags = await (prisma as any).salaryDelayFlag.count({
      where: { tenantId, period, status: 'OPEN' },
    });
    const criticalDelays = await (prisma as any).salaryDelayFlag.count({
      where: { tenantId, period, status: 'OPEN', severity: 'CRITICAL' },
    });
    const openExceptions = await (prisma as any).wpsException.count({
      where: { tenantId, status: 'OPEN' },
    });
    const openPenalties = await (prisma as any).wpsPenalty.count({
      where: { tenantId, period, status: 'OPEN' },
    });
    return {
      period,
      submissions,
      acknowledged: ackd,
      reconciled,
      delayFlags,
      criticalDelays,
      openExceptions,
      openPenalties,
    };
  }

  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.criticalDelays > 0) reasons.push(`${stats.criticalDelays} critical salary delays`);
    if (stats.openPenalties > 0) reasons.push(`${stats.openPenalties} open penalties`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).wpsMonthlyCertificate.upsert({
      where: {
        tenantId_period: {
          tenantId: auth.tenantId,
          period,
        },
      },
      update: {
        submissionsCount: stats.submissions,
        delayFlagsCount: stats.delayFlags,
        openExceptionsCount: stats.openExceptions,
        openPenaltiesCount: stats.openPenalties,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
      create: {
        tenantId: auth.tenantId,
        period,
        submissionsCount: stats.submissions,
        delayFlagsCount: stats.delayFlags,
        openExceptionsCount: stats.openExceptions,
        openPenaltiesCount: stats.openPenalties,
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
    const cert = await (prisma as any).wpsMonthlyCertificate.findUnique({
      where: { tenantId_period: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).wpsMonthlyCertificate.update({
      where: { id: cert.id },
      data: {
        status: 'SIGNED',
        signedAt: new Date(),
        signedBy: auth.userId,
        attestationsJson: attestations,
      },
    });
  }

  async seedDocuments(auth: AuthContext) {
    const docs = [
      {
        code: 'WPS_POLICY',
        name: 'WPS Compliance Policy',
        category: 'POLICY',
        content:
          'AuraOS tenants shall submit WPS files within the country statutory window. Salary delays > statutory window require root-cause and corrective action.',
      },
      {
        code: 'WPS_PROCEDURE',
        name: 'WPS Submission Procedure',
        category: 'PROCEDURE',
        content:
          '1. Lock payroll. 2. Generate WPS file. 3. Validate control totals. 4. Submit to authority channel. 5. Capture acknowledgement. 6. Reconcile against paid wages. 7. Sign monthly certificate.',
      },
    ];
    const created: string[] = [];
    for (const d of docs) {
      const existing = await (prisma as any).wpsDocument.findFirst({
        where: { tenantId: auth.tenantId, code: d.code },
      });
      if (existing) continue;
      await (prisma as any).wpsDocument.create({
        data: { tenantId: auth.tenantId, version: 1, isActive: true, ...d },
      });
      created.push(d.code);
    }
    return { created };
  }

  async listDocuments(tenantId: string) {
    return (prisma as any).wpsDocument.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}

export const wpsCertificateService = new WpsCertificateService();
