import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, parsePagination, serverError, successList } from '@/lib/api/crud-helpers';

const LOGIN_ACTIONS = ['USER_LOGIN', 'USER_LOGOUT', 'USER_LOGIN_FAILED'];

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/login-logs:read')) {
      return forbidden('security/login-logs:read');
    }
    const tenantId = user.tenantId;
    const sp = new URL(request.url).searchParams;
    const { page, limit, skip } = parsePagination(sp);
    const actionFilter = sp.get('action') || undefined;

    // Restrict to the login action set (enum-as-text safe).
    const actions =
      actionFilter && LOGIN_ACTIONS.includes(actionFilter) ? [actionFilter] : LOGIN_ACTIONS;

    const where: any = { tenantId, action: { in: actions } };

    const [rows, total] = await Promise.all([
      (prisma as any).auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).auditLog.count({ where }),
    ]);

    // Summary meta (across all login events for the tenant, not just this page).
    const [totalLogins, failedLogins, distinctUsers] = await Promise.all([
      (prisma as any).auditLog.count({
        where: { tenantId, action: { in: ['USER_LOGIN'] } },
      }),
      (prisma as any).auditLog.count({
        where: { tenantId, action: { in: ['USER_LOGIN_FAILED'] } },
      }),
      (prisma as any).auditLog.findMany({
        where: { tenantId, action: { in: LOGIN_ACTIONS } },
        select: { userId: true },
        distinct: ['userId'],
      }),
    ]);

    // Active sessions for the tenant's users (UserSession has no tenantId column).
    const tenantUsers = await (prisma as any).user.findMany({
      where: { tenantId },
      select: { id: true },
    });
    const tenantUserIds = tenantUsers.map((u: any) => u.id);
    const activeSessions =
      tenantUserIds.length > 0
        ? await (prisma as any).userSession.count({
            where: { status: 'Active', userId: { in: tenantUserIds } },
          })
        : 0;

    const uniqueUsers = distinctUsers.filter((r: any) => r.userId).length;

    return successList(rows, page, limit, total, {
      summary: {
        totalLogins,
        failedLogins,
        activeSessions,
        uniqueUsers,
      },
    });
  } catch (error: any) {
    return serverError(error, 'list login logs');
  }
});
