import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  forbidden,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';

// Queue a schedule-generation run; the scheduler worker picks it up.
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('scheduling:write')) return forbidden('scheduling:write');
    const body = await safeJson(request);
    if (!body?.startDate || !body?.endDate)
      return validationError({ message: 'startDate + endDate required' });
    const job = await prisma.scheduledJobRun.create({
      data: {
        tenantId: user.tenantId,
        jobName: 'schedule:generate',
        status: 'STARTED',
        startedAt: new Date(),
        output: body as any,
      },
    });
    return successItem({ jobId: job.id, status: 'STARTED' }, { status: 202 });
  } catch (error: any) {
    return serverError(error, 'queue schedule generation');
  }
});
