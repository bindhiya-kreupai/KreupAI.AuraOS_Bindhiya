import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';
import { applyPointsDelta } from '@/lib/gamification/points';

/** Award (earn) points to an employee. Requires engagement:create. */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:create')) return forbidden('engagement:create');
    const body = await safeJson(request);
    const points = Number(body?.points);
    if (!body || !Number.isFinite(points) || points <= 0) {
      return validationError({
        message: 'points must be a positive number',
        messageAr: 'يجب أن تكون النقاط رقمًا موجبًا',
      });
    }
    // Employee id from body (admin awarding to a colleague) but tenant is always
    // derived from the authenticated context, never trusted from the client.
    const employeeId = body.userId ? String(body.userId) : user.userId;
    const { transaction } = await applyPointsDelta({
      tenantId: user.tenantId,
      employeeId,
      amount: Math.round(points),
      type: 'earn',
      category: body.category ? String(body.category) : 'engagement',
      source: body.source ? String(body.source) : 'manual_award',
      reason: body.reason ? String(body.reason) : undefined,
    });
    return successItem(transaction, { status: 201 });
  } catch (error: any) {
    logger.error(
      { err: error, route: 'gamification/points/transactions/award' },
      'Failed to award'
    );
    return serverError(error, 'award');
  }
});
