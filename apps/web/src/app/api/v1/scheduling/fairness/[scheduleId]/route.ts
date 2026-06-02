import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';

// Fairness = standard deviation of hours assigned across employees in the schedule
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('scheduling:read')) return forbidden('scheduling:read');
    const rosters = await prisma.shiftRoster.findMany({
      where: { tenantId: user.tenantId, id: params.scheduleId } as any,
    });
    const byEmployee: Record<string, number> = {};
    for (const r of rosters) {
      const id = (r as any).employeeId;
      byEmployee[id] = (byEmployee[id] || 0) + 1;
    }
    const counts = Object.values(byEmployee);
    const mean = counts.length ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;
    const variance = counts.length
      ? counts.reduce((sum, c) => sum + (c - mean) ** 2, 0) / counts.length
      : 0;
    const stdDev = Math.sqrt(variance);
    return successItem({
      scheduleId: params.scheduleId,
      employees: counts.length,
      meanShiftsPerEmployee: mean,
      stdDev,
      fairnessScore: counts.length ? Math.max(0, 100 - stdDev * 20) : 100,
    });
  } catch (error: any) {
    return serverError(error, 'compute fairness');
  }
});
