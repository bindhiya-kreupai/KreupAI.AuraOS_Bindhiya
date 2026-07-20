import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  notFound,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';

/**
 * Join a challenge as the current user. Idempotent per (tenant, challenge,
 * employee) — a second join returns a validation error rather than duplicating.
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const body = await safeJson(request);
    if (!body || !body.challengeId) {
      return validationError({
        message: 'challengeId is required',
        messageAr: 'معرّف التحدي مطلوب',
      });
    }
    const challenge = await (prisma as any).gamificationChallenge.findFirst({
      where: { id: String(body.challengeId), tenantId: user.tenantId, status: 'active' },
    });
    if (!challenge) return notFound('Challenge');

    const existing = await (prisma as any).gamificationChallengeParticipation.findFirst({
      where: { tenantId: user.tenantId, challengeId: challenge.id, employeeId: user.userId },
    });
    if (existing) {
      return validationError({
        message: 'Already joined this challenge',
        messageAr: 'لقد انضممت لهذا التحدي بالفعل',
      });
    }

    const participation = await (prisma as any).gamificationChallengeParticipation.create({
      data: {
        tenantId: user.tenantId,
        challengeId: challenge.id,
        employeeId: user.userId,
      },
    });
    return successItem(participation, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/challenges/join' }, 'Failed to join');
    return serverError(error, 'join');
  }
});
