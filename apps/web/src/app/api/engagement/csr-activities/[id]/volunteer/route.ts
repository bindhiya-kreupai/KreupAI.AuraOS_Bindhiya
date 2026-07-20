import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  notFound,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';

/**
 * Register the current user as a volunteer for a CSR activity. Increments the
 * registered count (respecting slot capacity when set).
 */
export const POST = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const id = params?.id as string;
    if (!id) return notFound('CSR activity');

    const activity = await (prisma as any).engagementCsrActivity.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!activity) return notFound('CSR activity');

    if (
      typeof activity.volunteerSlots === 'number' &&
      activity.volunteersRegistered >= activity.volunteerSlots
    ) {
      return validationError({
        message: 'No volunteer slots remaining',
        messageAr: 'لا توجد أماكن تطوع متبقية',
      });
    }

    const updated = await (prisma as any).engagementCsrActivity.update({
      where: { id },
      data: { volunteersRegistered: { increment: 1 } },
    });
    return successItem(updated);
  } catch (error: any) {
    logger.error({ err: error, route: 'engagement/csr-activities/[id]/volunteer' }, 'Failed');
    return serverError(error, 'volunteer');
  }
});
