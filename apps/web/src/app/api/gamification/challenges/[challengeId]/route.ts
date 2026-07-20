import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, notFound, serverError, successItem } from '@/lib/api/crud-helpers';

/** Get a single challenge (tenant-scoped). */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const challenge = await (prisma as any).gamificationChallenge.findFirst({
      where: { id: params?.challengeId as string, tenantId: user.tenantId },
    });
    if (!challenge) return notFound('Challenge');
    return successItem(challenge);
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/challenges/[challengeId]' }, 'Failed to get');
    return serverError(error, 'get');
  }
});
