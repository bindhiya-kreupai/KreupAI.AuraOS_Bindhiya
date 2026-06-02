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
    const where = { tenantId: user.tenantId, runType: 'workflow' };
    const [rows, total] = await Promise.all([
      prisma.aIRunRecord.findMany({ where, orderBy: { startedAt: 'desc' }, skip, take: limit }),
      prisma.aIRunRecord.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list workflow runs');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('ai-automation:write')) return forbidden('ai-automation:write');
    const body = await safeJson(request);
    const record = await prisma.aIRunRecord.create({
      data: {
        tenantId: user.tenantId,
        runType: 'workflow',
        inputContext: body as any,
        output: { queued: true } as any,
        completedAt: null,
      },
    });
    return successItem({ id: record.id, status: 'STARTED' }, { status: 202 });
  } catch (error: any) {
    return serverError(error, 'start workflow');
  }
});
