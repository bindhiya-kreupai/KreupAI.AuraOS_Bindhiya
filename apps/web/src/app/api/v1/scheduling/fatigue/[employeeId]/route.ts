import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';

// Real fatigue calculation from the actual ShiftRoster + AttendanceRecord rows
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('scheduling:read')) return forbidden('scheduling:read');
    const employeeId = params.employeeId;
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const records = await prisma.attendanceRecord.findMany({
      where: { tenantId: user.tenantId, employeeId, date: { gte: since } },
    });
    const totalHours = records.reduce((sum, r) => sum + Number((r as any).workedHours || 0), 0);
    const avgPerDay = totalHours / 14;
    const consecutiveDays = records.length;
    const fatigueScore = Math.min(
      100,
      Math.round((avgPerDay / 10) * 50 + (consecutiveDays / 14) * 50)
    );
    return successItem({
      employeeId,
      windowDays: 14,
      totalHoursLast14Days: totalHours,
      averageHoursPerDay: avgPerDay,
      consecutiveDays,
      fatigueScore,
      riskLevel: fatigueScore > 80 ? 'HIGH' : fatigueScore > 60 ? 'MEDIUM' : 'LOW',
    });
  } catch (error: any) {
    return serverError(error, 'compute fatigue');
  }
});
