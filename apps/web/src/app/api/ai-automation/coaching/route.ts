import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  forbidden,
  parsePagination,
  safeJson,
  serverError,
  successItem,
  successList,
} from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('ai-automation:read')) return forbidden('ai-automation:read');
    const { page, limit, skip } = parsePagination(new URL(request.url).searchParams);
    const where = { tenantId: user.tenantId, agentType: 'COACHING' as any };
    const [rows, total] = await Promise.all([
      prisma.aIAgentConversation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.aIAgentConversation.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list coaching sessions');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('ai-automation:write')) return forbidden('ai-automation:write');
    const body = await safeJson(request);
    const session = await prisma.aIAgentConversation.create({
      data: {
        tenantId: user.tenantId,
        userId: body?.employeeId || user.userId,
        agentType: 'COACHING' as any,
        status: 'ACTIVE' as any,
        metadata: body?.context || null,
      } as any,
    });
    return successItem(session, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'start coaching session');
  }
});
