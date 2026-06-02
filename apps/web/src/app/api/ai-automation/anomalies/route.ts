import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, parsePagination, serverError, successList } from '@/lib/api/crud-helpers';

// Detect simple anomalies: attendance records exceeding 2 stddev above the
// employee's 30-day mean of worked hours.
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('ai-automation:read')) return forbidden('ai-automation:read');
    const { page, limit, skip } = parsePagination(new URL(request.url).searchParams);
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const records = await prisma.attendanceRecord.findMany({
      where: { tenantId: user.tenantId, date: { gte: since } },
      orderBy: { date: 'desc' },
    });
    const byEmp = new Map<string, number[]>();
    for (const r of records) {
      const id = (r as any).employeeId as string;
      const h = Number((r as any).workedHours || 0);
      if (!byEmp.has(id)) byEmp.set(id, []);
      byEmp.get(id)!.push(h);
    }
    const anomalies: any[] = [];
    byEmp.forEach((hours, employeeId) => {
      const mean = hours.reduce((a, b) => a + b, 0) / hours.length;
      const variance = hours.reduce((s, h) => s + (h - mean) ** 2, 0) / hours.length;
      const stdDev = Math.sqrt(variance);
      const threshold = mean + 2 * stdDev;
      for (const h of hours) {
        if (h > threshold && stdDev > 0) {
          anomalies.push({ employeeId, hours: h, mean, stdDev, threshold });
        }
      }
    });
    await prisma.aIRunRecord.create({
      data: {
        tenantId: user.tenantId,
        runType: 'anomaly_detection',
        output: { anomalyCount: anomalies.length } as any,
        completedAt: new Date(),
        durationMs: 0,
      },
    });
    return successList(anomalies.slice(skip, skip + limit), page, limit, anomalies.length);
  } catch (error: any) {
    return serverError(error, 'detect anomalies');
  }
});
