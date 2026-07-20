import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  safeJson,
  serverError,
  successItem,
  successList,
  validationError,
} from '@/lib/api/crud-helpers';

const DEFAULT_CHANNELS = [
  { channelType: 'email', name: 'Email Support' },
  { channelType: 'slack', name: 'Slack Integration' },
  { channelType: 'teams', name: 'Microsoft Teams' },
  { channelType: 'phone', name: 'Phone System' },
];

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('helpdesk:read')) return forbidden('helpdesk:read');
    let rows = await (prisma as any).helpdeskChannel.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { channelType: 'asc' },
    });
    // Seed the standard channel set on first access so the omnichannel grid
    // always shows the manageable channels for this tenant.
    if (rows.length === 0) {
      await (prisma as any).helpdeskChannel.createMany({
        data: DEFAULT_CHANNELS.map((c) => ({
          ...c,
          tenantId: user.tenantId,
          status: 'DISCONNECTED',
          createdBy: user.userId,
        })),
        skipDuplicates: true,
      });
      rows = await (prisma as any).helpdeskChannel.findMany({
        where: { tenantId: user.tenantId },
        orderBy: { channelType: 'asc' },
      });
    }
    return successList(rows, 1, rows.length || 1, rows.length);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/channels' }, 'Failed to list');
    return serverError(error, 'list channels');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('helpdesk:create')) return forbidden('helpdesk:create');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    if (!String(body.channelType ?? '').trim())
      return validationError({ message: 'channelType is required', field: 'channelType' });
    const created = await (prisma as any).helpdeskChannel.create({
      data: {
        tenantId: user.tenantId,
        channelType: body.channelType,
        name: body.name ?? body.channelType,
        config: body.config ?? null,
        status: body.status ?? 'DISCONNECTED',
        createdBy: user.userId,
      },
    });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/channels' }, 'Failed to create');
    return serverError(error, 'create channel');
  }
});
