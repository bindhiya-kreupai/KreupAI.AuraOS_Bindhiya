import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  parsePagination,
  safeJson,
  serverError,
  successItem,
  successList,
  validationError,
} from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const { page, limit, skip } = parsePagination(new URL(request.url).searchParams);
    // A user sees their own referrals.
    const where = { tenantId: user.tenantId, referrerId: user.userId };
    const [rows, total] = await Promise.all([
      (prisma as any).engagementReferral.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).engagementReferral.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    logger.error({ err: error, route: 'engagement/referrals' }, 'Failed to list');
    return serverError(error, 'list');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:create')) return forbidden('engagement:create');
    const body = await safeJson(request);
    if (!body || !body.candidateName) {
      return validationError({
        message: 'candidateName is required',
        messageAr: 'اسم المرشح مطلوب',
      });
    }
    const created = await (prisma as any).engagementReferral.create({
      data: {
        tenantId: user.tenantId,
        referrerId: user.userId,
        candidateName: String(body.candidateName),
        candidateEmail: body.candidateEmail ? String(body.candidateEmail) : null,
        role: body.role ? String(body.role) : null,
        status: 'SUBMITTED',
        referralCode: body.referralCode
          ? String(body.referralCode)
          : `REF-${user.userId.slice(0, 8)}`,
      },
    });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'engagement/referrals' }, 'Failed to create');
    return serverError(error, 'create');
  }
});
