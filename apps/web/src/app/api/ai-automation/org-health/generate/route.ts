import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';

// Real org-health snapshot: combine attrition signals + recognition activity +
// pending leave/review backlogs into a composite score.
export const POST = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('ai-automation:write')) return forbidden('ai-automation:write');
    const start = Date.now();
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [activeEmployees, recognitions, pendingLeaves, openTickets] = await Promise.all([
      (prisma as any).employee.count({
        where: { tenantId: user.tenantId, status: 'ACTIVE' as any },
      }),
      prisma.recognition.count({ where: { tenantId: user.tenantId, createdAt: { gte: since } } }),
      prisma.leaveRequest.count({
        where: { tenantId: user.tenantId, status: 'PENDING' as any } as any,
      }),
      prisma.helpdeskTicket.count({
        where: { tenantId: user.tenantId, status: { in: ['OPEN', 'IN_PROGRESS'] } as any },
      }),
    ]);
    const recognitionRate = activeEmployees ? recognitions / activeEmployees : 0;
    const score = Math.max(
      0,
      Math.min(100, Math.round(50 + recognitionRate * 50 - pendingLeaves / 5 - openTickets / 10))
    );
    const output = {
      activeEmployees,
      recognitionsLast30Days: recognitions,
      pendingLeaves,
      openHelpdeskTickets: openTickets,
      recognitionRatePerEmployee: recognitionRate,
      healthScore: score,
      level: score > 75 ? 'HEALTHY' : score > 50 ? 'WARNING' : 'CRITICAL',
    };
    const record = await prisma.aIRunRecord.create({
      data: {
        tenantId: user.tenantId,
        runType: 'org_health',
        output: output as any,
        completedAt: new Date(),
        durationMs: Date.now() - start,
      },
    });
    return successItem({ ...output, id: record.id }, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'generate org-health');
  }
});
