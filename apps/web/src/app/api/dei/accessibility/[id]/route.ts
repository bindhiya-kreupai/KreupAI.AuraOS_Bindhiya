import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { DEI_ERRORS } from '../../_shared';

const db = prisma as any;

const VALID_STATUS = ['pending', 'processing', 'approved', 'rejected', 'fulfilled'];

/**
 * PATCH /api/dei/accessibility/:id — review an accommodation request
 * (approve/reject/process). Reviewer id is taken from the auth context.
 */
export const PATCH = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, employeeId, params } = context;
    if (
      Array.isArray(permissions) &&
      permissions.length > 0 &&
      !permissions.includes('dei:write') &&
      !permissions.includes('hr:write')
    ) {
      return DEI_ERRORS.forbidden();
    }

    const existing = await db.deiAccessibilityRequest.findFirst({
      where: { id: params?.id, tenantId: user.tenantId },
    });
    if (!existing) return DEI_ERRORS.notFound('Request');

    const body = await request.json().catch(() => ({}));
    if (body.status && !VALID_STATUS.includes(body.status)) {
      return DEI_ERRORS.badRequest('Invalid status', 'حالة غير صالحة');
    }

    const updated = await db.deiAccessibilityRequest.update({
      where: { id: existing.id },
      data: {
        status: body.status || existing.status,
        reviewNote: body.reviewNote ?? existing.reviewNote,
        reviewedBy: employeeId || user.userId,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Request reviewed',
      messageAr: 'تمت مراجعة الطلب',
    });
  } catch (error) {
    console.error('DEI accessibility PATCH error:', error);
    return DEI_ERRORS.server();
  }
});
