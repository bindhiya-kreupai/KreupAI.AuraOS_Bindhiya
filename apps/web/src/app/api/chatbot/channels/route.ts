import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  parsePagination,
  safeJson,
  serverError,
  successItem,
  successList,
  validationError,
} from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId } = context.user;
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);
    const channelType = searchParams.get('channelType');
    const status = searchParams.get('status');
    const where: any = { tenantId, isDeleted: false };
    if (channelType) where.channelType = channelType;
    if (status) where.status = status;
    const [rows, total] = await Promise.all([
      prisma.chatbotChannel.findMany({ where, orderBy: { updatedAt: 'desc' }, skip, take: limit }),
      prisma.chatbotChannel.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list channels');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const body = await safeJson(request);
    if (!body?.channelName || !body?.channelType)
      return validationError({ message: 'channelName and channelType are required' });
    const record = await prisma.chatbotChannel.create({
      data: {
        tenantId,
        createdBy: userId,
        channelType: body.channelType,
        channelName: body.channelName,
        isEnabled: body.isEnabled ?? false,
        configuration: body.configuration ?? null,
        features: body.features ?? [],
        status: body.status ?? 'inactive',
      },
    });
    return successItem(record, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'create channel');
  }
});
