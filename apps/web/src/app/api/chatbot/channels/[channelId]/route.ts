import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  safeJson,
  serverError,
  successItem,
  notFound,
  validationError,
} from '@/lib/api/crud-helpers';

async function getChannel(tenantId: string, channelId: string) {
  return prisma.chatbotChannel.findFirst({
    where: { id: channelId, tenantId, isDeleted: false },
  });
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId } = context.user;
    const record = await getChannel(tenantId, context.params.channelId);
    if (!record) return notFound('Channel');
    return successItem(record);
  } catch (error: any) {
    return serverError(error, 'get channel');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const channelId = context.params.channelId;
    const existing = await getChannel(tenantId, channelId);
    if (!existing) return notFound('Channel');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Request body required' });
    const data: any = { updatedBy: userId };
    if (body.channelType !== undefined) data.channelType = body.channelType;
    if (body.channelName !== undefined) data.channelName = body.channelName;
    if (body.isEnabled !== undefined) data.isEnabled = body.isEnabled;
    if (body.configuration !== undefined) data.configuration = body.configuration;
    if (body.features !== undefined) data.features = body.features;
    if (body.status !== undefined) data.status = body.status;
    if (body.action === 'test') {
      data.lastSyncAt = new Date();
    }
    const record = await prisma.chatbotChannel.update({
      where: { id: channelId },
      data,
    });
    return successItem(record);
  } catch (error: any) {
    return serverError(error, 'update channel');
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const channelId = context.params.channelId;
    const existing = await getChannel(tenantId, channelId);
    if (!existing) return notFound('Channel');
    await prisma.chatbotChannel.update({
      where: { id: channelId },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
    });
    return successItem({ deleted: true });
  } catch (error: any) {
    return serverError(error, 'delete channel');
  }
});
