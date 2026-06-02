import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, notFound, serverError, successItem } from '@/lib/api/crud-helpers';

export const POST = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('core-hr/mass-updates:execute'))
      return forbidden('core-hr/mass-updates:execute');
    const job = await prisma.massUpdateJob.findFirst({
      where: { id: params.updateId, tenantId: user.tenantId },
    });
    if (!job) return notFound('Mass update job');
    const updated = await prisma.massUpdateJob.update({
      where: { id: job.id },
      data: {
        status: 'RUNNING',
        executedAt: new Date(),
        executedBy: user.userId,
      },
    });
    return successItem(updated, { status: 202 });
  } catch (error: any) {
    return serverError(error, 'execute mass update');
  }
});
