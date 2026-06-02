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

// Trigger statutory report generation as a DataImportJob-style run.
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('compliance:reports:generate'))
      return forbidden('compliance:reports:generate');
    const body = await safeJson(request);
    if (!body?.reportType) return validationError({ message: 'reportType required' });
    const job = await prisma.scheduledJobRun.create({
      data: {
        tenantId: user.tenantId,
        jobName: `statutory_report:${body.reportType}`,
        status: 'STARTED',
        startedAt: new Date(),
        output: body as any,
      },
    });
    // The worker pool picks up STARTED rows and produces COMPLETED with the report payload
    return successItem(
      { jobId: job.id, status: 'STARTED', reportType: body.reportType },
      { status: 202 }
    );
  } catch (error: any) {
    return serverError(error, 'queue report');
  }
});
