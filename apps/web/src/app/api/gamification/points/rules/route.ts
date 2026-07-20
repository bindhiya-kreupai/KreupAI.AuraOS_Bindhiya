import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, serverError, successList } from '@/lib/api/crud-helpers';

/**
 * Points earning rules. Rules are not yet persisted as first-class rows; the
 * award endpoint applies them inline. Returns an empty list so consumers (the
 * useGamification hook) render cleanly instead of 404-ing.
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    return successList([], 1, 1, 0);
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/points/rules' }, 'Failed to list');
    return serverError(error, 'list');
  }
});
