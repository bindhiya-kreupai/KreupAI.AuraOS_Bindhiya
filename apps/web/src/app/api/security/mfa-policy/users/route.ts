import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, parsePagination, serverError, successList } from '@/lib/api/crud-helpers';

/**
 * GET /api/security/mfa-policy/users — lists tenant users with their MFA status.
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/mfa:read')) return forbidden('security/mfa:read');

    const { page, limit, skip } = parsePagination(new URL(request.url).searchParams);
    const where = { tenantId: user.tenantId, isDeleted: false };

    const [rows, total] = await Promise.all([
      (prisma as any).user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          status: true,
          mfaEnabled: true,
          lastLogin: true,
        },
      }),
      (prisma as any).user.count({ where }),
    ]);

    const items = rows.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email,
      status: u.status,
      mfaEnabled: u.mfaEnabled,
      lastLogin: u.lastLogin,
    }));

    return successList(items, page, limit, total);
  } catch (error: any) {
    logger.error(
      { err: error, route: 'security/mfa-policy/users/route.ts' },
      'Failed to list MFA users'
    );
    return serverError(error, 'list MFA users');
  }
});
