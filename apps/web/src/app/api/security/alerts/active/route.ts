import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, parsePagination, serverError, successList } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security:read')) return forbidden('security:read');
    const { page, limit, skip } = parsePagination(new URL(request.url).searchParams);
    const where = { tenantId: user.tenantId, status: { in: ['OPEN', 'INVESTIGATING'] } };
    const [rows, total] = await Promise.all([
      prisma.securityAlert.findMany({ where, orderBy: { detectedAt: 'desc' }, skip, take: limit }),
      prisma.securityAlert.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list active security alerts');
  }
});
