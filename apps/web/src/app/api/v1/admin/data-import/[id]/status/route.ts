import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, notFound, serverError, successItem } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('admin/data-import:read')) return forbidden('admin/data-import:read');
    const job = await prisma.dataImportJob.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (!job) return notFound('Data import job');
    return successItem(job);
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to fetch import status');
    return serverError(error, 'fetch import status');
  }
});
