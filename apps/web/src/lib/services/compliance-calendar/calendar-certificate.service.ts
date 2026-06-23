import { prisma } from '@aura/database';
import type { AuthContext } from './types';

const CRITICAL_CATEGORIES = ['WPS', 'SOCIAL_INSURANCE', 'IMMIGRATION'];

/**
 * EPIC-35-S10: monthly calendar dashboard + certificate.
 */
export class CalendarCertificateService {
  async dashboard(tenantId: string, period: string) {
    const [year, month] = period.split('-').map((n) => Number(n));
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const all = await (prisma as any).complianceTask.findMany({
      where: { tenantId, dueDate: { gte: start, lte: end } },
    });
    const total = all.length;
    const completed = all.filter((t: { status: string }) => t.status === 'COMPLETED').length;
    const deferred = all.filter((t: { status: string }) => t.status === 'DEFERRED').length;
    const overdue = all.filter((t: { status: string }) => t.status === 'OVERDUE').length;
    const criticalOverdue = all.filter(
      (t: { status: string; categoryCode: string }) =>
        t.status === 'OVERDUE' && CRITICAL_CATEGORIES.includes(t.categoryCode)
    ).length;
    const onTimePct = total === 0 ? 0 : Math.round((completed / total) * 10000) / 100;

    const byCategory = new Map<string, { total: number; completed: number; overdue: number }>();
    for (const t of all as Array<{ categoryCode: string; status: string }>) {
      const b = byCategory.get(t.categoryCode) ?? { total: 0, completed: 0, overdue: 0 };
      b.total += 1;
      if (t.status === 'COMPLETED') b.completed += 1;
      if (t.status === 'OVERDUE') b.overdue += 1;
      byCategory.set(t.categoryCode, b);
    }
    return {
      period,
      total,
      completed,
      deferred,
      overdue,
      criticalOverdue,
      onTimePct,
      byCategory: Array.from(byCategory.entries()).map(([categoryCode, v]) => ({
        categoryCode,
        ...v,
      })),
    };
  }

  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const gatingReason =
      stats.criticalOverdue > 0
        ? `Blocked: ${stats.criticalOverdue} critical task(s) overdue`
        : null;
    return (prisma as any).calendarCertificate.upsert({
      where: { aura_calendar_certificate_unique: { tenantId: auth.tenantId, period } },
      update: {
        tasksDue: stats.total,
        tasksCompleted: stats.completed,
        tasksDeferred: stats.deferred,
        tasksOverdue: stats.overdue,
        criticalOverdue: stats.criticalOverdue,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
      create: {
        tenantId: auth.tenantId,
        period,
        tasksDue: stats.total,
        tasksCompleted: stats.completed,
        tasksDeferred: stats.deferred,
        tasksOverdue: stats.overdue,
        criticalOverdue: stats.criticalOverdue,
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
    const cert = await (prisma as any).calendarCertificate.findUnique({
      where: { aura_calendar_certificate_unique: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).calendarCertificate.update({
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
    return (prisma as any).calendarCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const calendarCertificateService = new CalendarCertificateService();
