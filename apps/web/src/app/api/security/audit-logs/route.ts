import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, parsePagination, serverError, successList } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security:audit:read')) return forbidden('security:audit:read');
    const { page, limit, skip } = parsePagination(new URL(request.url).searchParams);
    const sp = new URL(request.url).searchParams;
    const action = sp.get('action') || undefined;
    const userId = sp.get('userId') || undefined;
    const where: any = { tenantId: user.tenantId };
    if (action) where.action = action;
    if (userId) where.userId = userId;
    const [rows, total] = await Promise.all([
      (prisma as any).auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).auditLog.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list audit logs');
  }
});
