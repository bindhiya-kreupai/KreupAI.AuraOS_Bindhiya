import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, notFound, serverError, successItem } from '@/lib/api/crud-helpers';

// GET a single mass-update job (used by the preview flow to show parsed rows).
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('core-hr/mass-updates:read'))
      return forbidden('core-hr/mass-updates:read');
    const job = await (prisma as any).massUpdateJob.findFirst({
      where: { id: params.updateId, tenantId: user.tenantId },
    });
    if (!job) return notFound('Mass update job');
    return successItem(job, { status: 200 });
  } catch (error: any) {
    return serverError(error, 'get mass update');
  }
});
