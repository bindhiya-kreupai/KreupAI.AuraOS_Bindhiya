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
  successList,
  validationError,
} from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('helpdesk:read')) return forbidden('helpdesk:read');
    const rows = await (prisma as any).helpdeskCaseNote.findMany({
      where: { tenantId: user.tenantId, caseId: params.id },
      orderBy: { createdAt: 'asc' },
    });
    return successList(rows, 1, rows.length || 1, rows.length);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/cases/[id]/notes' }, 'Failed to list');
    return serverError(error, 'list case notes');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('helpdesk:update')) return forbidden('helpdesk:update');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const content = String(body.content ?? '').trim();
    if (!content) return validationError({ message: 'content is required', field: 'content' });
    const found = await (prisma as any).helpdeskCase.findFirst({
      where: { id: params.id, tenantId: user.tenantId, isDeleted: false },
      select: { id: true },
    });
    if (!found) return notFound('Case');
    const created = await (prisma as any).helpdeskCaseNote.create({
      data: {
        tenantId: user.tenantId,
        caseId: params.id,
        authorId: user.userId,
        authorName: body.authorName ?? null,
        noteType: body.noteType === 'system' ? 'system' : 'internal',
        content,
      },
    });
    await (prisma as any).helpdeskCase.update({
      where: { id: params.id },
      data: { updatedBy: user.userId },
    });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/cases/[id]/notes' }, 'Failed to add note');
    return serverError(error, 'add case note');
  }
});
