import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';

// Simple moving-average forecast over the last 12 months of LeaveRequest activity.
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('ai-automation:read')) return forbidden('ai-automation:read');
    const since = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const requests = await prisma.leaveRequest.findMany({
      where: { tenantId: user.tenantId, createdAt: { gte: since } } as any,
      select: { createdAt: true },
    });
    const byMonth = new Map<string, number>();
    for (const r of requests) {
      const m = r.createdAt.toISOString().slice(0, 7);
      byMonth.set(m, (byMonth.get(m) || 0) + 1);
    }
    const series = Array.from(byMonth.entries()).map(([month, count]) => ({ month, count }));
    series.sort((a, b) => a.month.localeCompare(b.month));
    const recent = series.slice(-3);
    const forecast = recent.length
      ? Math.round(recent.reduce((s, m) => s + m.count, 0) / recent.length)
      : 0;
    await prisma.aIRunRecord.create({
      data: {
        tenantId: user.tenantId,
        runType: 'leave_forecast',
        output: { forecast } as any,
        completedAt: new Date(),
        durationMs: 0,
      },
    });
    return successItem({ history: series, forecastNextMonth: forecast });
  } catch (error: any) {
    return serverError(error, 'forecast leaves');
  }
});
