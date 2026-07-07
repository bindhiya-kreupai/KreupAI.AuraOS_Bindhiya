import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, serverError, successList } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { permissions } = context;
    if (!permissions.includes('security/roles:read')) return forbidden('security/roles:read');
    const rows = await (prisma as any).permission.findMany({
      where: { isDeleted: false },
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
      select: { id: true, resource: true, action: true, description: true },
    });
    const shaped = rows.map((p: any) => ({
      resource: p.resource,
      action: p.action,
      accessLevel: p.action,
      description: p.description ?? '',
    }));
    return successList(shaped, 1, shaped.length || 1, shaped.length);
  } catch (error: any) {
    logger.error({ err: error, route: 'security/permissions/route.ts' }, 'Failed to list');
    return serverError(error, 'list permissions');
  }
});
