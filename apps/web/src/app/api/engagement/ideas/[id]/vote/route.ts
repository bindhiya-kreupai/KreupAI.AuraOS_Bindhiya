import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, notFound, safeJson, serverError, successItem } from '@/lib/api/crud-helpers';

/**
 * Toggle a vote on an idea for the current user. Re-posting removes the vote
 * (upvote toggle). The idea's cached voteCount is recomputed after each change.
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const ideaId = params?.id as string;
    if (!ideaId) return notFound('Idea');

    const idea = await (prisma as any).engagementIdea.findFirst({
      where: { id: ideaId, tenantId: user.tenantId, isDeleted: false },
    });
    if (!idea) return notFound('Idea');

    const body = (await safeJson(request)) || {};
    const voteType = body.voteType === 'down' ? 'down' : 'up';

    const existing = await (prisma as any).engagementIdeaVote.findFirst({
      where: { tenantId: user.tenantId, ideaId, voterId: user.userId },
    });

    if (existing) {
      // Same vote again -> toggle off; different -> switch.
      if (existing.voteType === voteType) {
        await (prisma as any).engagementIdeaVote.delete({ where: { id: existing.id } });
      } else {
        await (prisma as any).engagementIdeaVote.update({
          where: { id: existing.id },
          data: { voteType },
        });
      }
    } else {
      await (prisma as any).engagementIdeaVote.create({
        data: { tenantId: user.tenantId, ideaId, voterId: user.userId, voteType },
      });
    }

    const [ups, downs] = await Promise.all([
      (prisma as any).engagementIdeaVote.count({
        where: { tenantId: user.tenantId, ideaId, voteType: 'up' },
      }),
      (prisma as any).engagementIdeaVote.count({
        where: { tenantId: user.tenantId, ideaId, voteType: 'down' },
      }),
    ]);
    const voteCount = ups - downs;
    const updated = await (prisma as any).engagementIdea.update({
      where: { id: ideaId },
      data: { voteCount },
    });
    return successItem(updated);
  } catch (error: any) {
    logger.error({ err: error, route: 'engagement/ideas/[id]/vote' }, 'Failed to vote');
    return serverError(error, 'vote');
  }
});
