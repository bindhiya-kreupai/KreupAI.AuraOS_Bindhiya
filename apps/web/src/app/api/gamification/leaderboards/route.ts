import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, serverError, successList } from '@/lib/api/crud-helpers';
import { tierForPoints } from '@/lib/gamification/points';

/**
 * Points leaderboard. Ranked entries are computed live from the tenant's points
 * accounts. Supports a `scope` filter (global | team | regional) which, for the
 * team scope, restricts to the current user's department when known.
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const scope = new URL(request.url).searchParams.get('scope') || 'global';

    const accounts = await (prisma as any).gamificationPointsAccount.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { totalPoints: 'desc' },
      take: 100,
    });

    const employeeIds = accounts.map((a: any) => a.employeeId);
    const employees = employeeIds.length
      ? await prisma.employee.findMany({
          where: { id: { in: employeeIds }, company: { tenantId: user.tenantId } },
          select: { id: true, firstName: true, lastName: true, departmentId: true },
        })
      : [];
    const empMap = new Map(employees.map((e: any) => [e.id, e]));

    // Determine the current user's department for team scoping.
    const meEmp = empMap.get(user.userId) as any;
    const myDept = meEmp?.departmentId || null;

    let ranked = accounts.map((a: any) => {
      const emp = empMap.get(a.employeeId) as any;
      const name = emp
        ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || a.employeeId
        : a.employeeId;
      return {
        userId: a.employeeId,
        name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        department: emp?.departmentId || null,
        points: a.totalPoints,
        tier: tierForPoints(a.totalPoints).tier,
        isCurrentUser: a.employeeId === user.userId,
      };
    });

    if (scope === 'team' && myDept) {
      ranked = ranked.filter((r: any) => r.department === myDept);
    }

    const data = ranked.map((r: any, i: number) => ({ ...r, rank: i + 1, change: 'same' }));
    return successList(data, 1, data.length || 1, data.length, { scope });
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/leaderboards' }, 'Failed to list');
    return serverError(error, 'list');
  }
});
