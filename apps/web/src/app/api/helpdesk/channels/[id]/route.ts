import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  notFound,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('helpdesk:update')) return forbidden('helpdesk:update');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const existing = await (prisma as any).helpdeskChannel.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
      select: { id: true },
    });
    if (!existing) return notFound('Channel');
    const { tenantId: _t, id: _i, ...data } = body as Record<string, unknown>;
    if (data.status === 'CONNECTED') data.connectedAt = new Date();
    const updated = await (prisma as any).helpdeskChannel.update({
      where: { id: params.id },
      data: { ...data, updatedBy: user.userId },
    });
    return successItem(updated);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/channels/[id]' }, 'Failed to update');
    return serverError(error, 'update channel');
  }
});
