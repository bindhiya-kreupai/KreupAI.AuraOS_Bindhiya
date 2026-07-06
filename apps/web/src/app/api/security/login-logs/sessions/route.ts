import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, parsePagination, serverError, successList } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/login-logs:read')) {
      return forbidden('security/login-logs:read');
    }
    const tenantId = user.tenantId;
    const sp = new URL(request.url).searchParams;
    const { page, limit, skip } = parsePagination(sp);

    // UserSession has no tenantId column — scope via the tenant's users.
    const tenantUsers = await (prisma as any).user.findMany({
      where: { tenantId },
      select: { id: true },
    });
    const tenantUserIds = tenantUsers.map((u: any) => u.id);
    if (tenantUserIds.length === 0) return successList([], page, limit, 0);

    const where: any = { status: 'Active', userId: { in: tenantUserIds } };

    const [rows, total] = await Promise.all([
      (prisma as any).userSession.findMany({
        where,
        orderBy: { lastActive: 'desc' },
        skip,
        take: limit,
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
      }),
      (prisma as any).userSession.count({ where }),
    ]);

    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list active sessions');
  }
});
