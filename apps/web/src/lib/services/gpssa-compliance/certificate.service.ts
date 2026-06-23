import { prisma } from '@aura/database';
import type { AuthContext } from './types';

/**
 * EPIC-14-S15 / S19 / S20: dashboard, monthly compliance pack +
 * monthly compliance certificate.
 */
export class GpssaCertificateService {
  async dashboard(tenantId: string, period: string) {
    const subs = await (prisma as any).gpssaPeriodSubmission.findMany({
      where: { tenantId, period },
    });
    const submissions = subs.length;
    const submitted = subs.filter((s: { status: string }) =>
      ['SUBMITTED', 'ACKNOWLEDGED'].includes(s.status)
    ).length;
    const late = subs.filter(
      (s: { submittedAt: Date | null; dueDate: Date | null }) =>
        s.submittedAt &&
        s.dueDate &&
        new Date(s.submittedAt).getTime() > new Date(s.dueDate).getTime()
    ).length;
    const openVariances = await (prisma as any).gpssaVariance.count({
      where: { tenantId, period, status: 'OPEN' },
    });
    const criticalVariances = await (prisma as any).gpssaVariance.count({
      where: { tenantId, period, status: 'OPEN', severity: 'CRITICAL' },
    });
    return { period, submissions, submitted, late, openVariances, criticalVariances };
  }

  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.criticalVariances > 0)
      reasons.push(`${stats.criticalVariances} critical variance(s) open`);
    if (stats.late > 0) reasons.push(`${stats.late} late submission(s)`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).gpssaCertificate.upsert({
      where: { aura_gpssa_certificate_unique: { tenantId: auth.tenantId, period } },
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
    const cert = await (prisma as any).gpssaCertificate.findUnique({
      where: { aura_gpssa_certificate_unique: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).gpssaCertificate.update({
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
    return (prisma as any).gpssaCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const gpssaCertificateService = new GpssaCertificateService();
