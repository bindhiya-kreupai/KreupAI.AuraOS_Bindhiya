import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { serverError, successItem } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId } = context.user;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [totalConversations, totalIntents, totalEntities, totalFlows] = await Promise.all([
      prisma.aIAgentConversation.count({
        where: { tenantId, createdAt: { gte: start, lte: end }, isDeleted: false },
      }),
      prisma.chatbotIntent.count({
        where: { tenantId, isDeleted: false },
      }),
      prisma.chatbotEntity.count({
        where: { tenantId, isDeleted: false },
      }),
      prisma.chatbotDialogueFlow.count({
        where: { tenantId, isDeleted: false },
      }),
    ]);

    const recentMessages = await prisma.aIAgentMessage.findMany({
      where: {
        conversation: { tenantId, isDeleted: false },
        createdAt: { gte: start, lte: end },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    const analytics = {
      period: { start, end },
      totalConversations,
      totalMessages: recentMessages.length,
      totalIntents,
      totalEntities,
      totalFlows,
      averageConversationLength:
        totalConversations > 0
          ? Math.round((recentMessages.length / totalConversations) * 10) / 10
          : 0,
      generatedDate: new Date(),
    };

    return successItem(analytics);
  } catch (error: any) {
    return serverError(error, 'get analytics');
  }
});
