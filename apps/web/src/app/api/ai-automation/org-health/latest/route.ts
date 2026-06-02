import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, notFound, serverError, successItem } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('ai-automation:read')) return forbidden('ai-automation:read');
    const row = await prisma.aIRunRecord.findFirst({
      where: { tenantId: user.tenantId, runType: 'org_health' },
      orderBy: { startedAt: 'desc' },
    });
    if (!row) return notFound('Org health snapshot');
    return successItem(row);
  } catch (error: any) {
    return serverError(error, 'fetch latest org-health');
  }
});
