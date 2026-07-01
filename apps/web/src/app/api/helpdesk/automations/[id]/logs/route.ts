import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, notFound, serverError, successList } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('helpdesk:read')) return forbidden('helpdesk:read');
    const automation = await (prisma as any).helpdeskAutomation.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
      select: { id: true },
    });
    if (!automation) return notFound('Automation');
    const rows = await (prisma as any).helpdeskAutomationLog.findMany({
      where: { tenantId: user.tenantId, automationId: params.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return successList(rows, 1, rows.length || 1, rows.length);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/automations/[id]/logs' }, 'Failed to list');
    return serverError(error, 'list automation logs');
  }
});
