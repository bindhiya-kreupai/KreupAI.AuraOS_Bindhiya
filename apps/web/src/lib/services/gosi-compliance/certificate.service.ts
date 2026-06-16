import { prisma } from '@aura/database';
import type { AuthContext } from './types';

/**
 * EPIC-13-S18 / S19 / S20: GOSI dashboard, monthly compliance pack +
 * monthly compliance certificate.
 */
export class GosiCertificateService {
  async dashboard(tenantId: string, period: string) {
    const submissions = await (prisma as any).gosiPeriodSubmission.findMany({
      where: { tenantId, period },
    });
    const subCount = submissions.length;
    const submitted = submissions.filter((s: { status: string }) =>
      ['SUBMITTED', 'ACKNOWLEDGED'].includes(s.status)
    ).length;
    const lateCount = submissions.filter(
      (s: { submittedAt: Date | null; dueDate: Date | null }) =>
        s.submittedAt &&
        s.dueDate &&
        new Date(s.submittedAt).getTime() > new Date(s.dueDate).getTime()
    ).length;
    const openVariances = await (prisma as any).gosiVariance.count({
      where: { tenantId, period, status: 'OPEN' },
    });
    const criticalVariances = await (prisma as any).gosiVariance.count({
      where: { tenantId, period, status: 'OPEN', severity: 'CRITICAL' },
    });
    return {
      period,
      submissions: subCount,
      submitted,
      late: lateCount,
      openVariances,
      criticalVariances,
    };
  }

  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.criticalVariances > 0)
      reasons.push(`${stats.criticalVariances} critical variance(s) open`);
    if (stats.late > 0) reasons.push(`${stats.late} late submission(s)`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).gosiCertificate.upsert({
      where: { aura_gosi_certificate_unique: { tenantId: auth.tenantId, period } },
      update: {
        submissionsCount: stats.submissions,
        openVariancesCount: stats.openVariances,
        criticalVariancesCount: stats.criticalVariances,
        lateSubmissionsCount: stats.late,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
      create: {
        tenantId: auth.tenantId,
        period,
        submissionsCount: stats.submissions,
        openVariancesCount: stats.openVariances,
        criticalVariancesCount: stats.criticalVariances,
        lateSubmissionsCount: stats.late,
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
    const cert = await (prisma as any).gosiCertificate.findUnique({
      where: { aura_gosi_certificate_unique: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).gosiCertificate.update({
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
    return (prisma as any).gosiCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const gosiCertificateService = new GosiCertificateService();
