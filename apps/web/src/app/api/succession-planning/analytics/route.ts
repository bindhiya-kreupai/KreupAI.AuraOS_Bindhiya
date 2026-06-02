import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('succession-planning:read'))
      return forbidden('succession-planning:read');
    const activeEmployees = await (prisma as any).employee.count({
      where: { tenantId: user.tenantId, status: 'ACTIVE' as any },
    });
    const probations = await prisma.probationTracking.count({
      where: { tenantId: user.tenantId, status: 'ACTIVE' },
    });
    return successItem({
      activeEmployees,
      employeesOnProbation: probations,
      successionReadyPercentage: 0, // populated once SuccessionPlan model is added
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return serverError(error, 'compute succession analytics');
  }
});
