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

    const [conversations, intents, totalEntities, totalFlows, channels, handoffs] =
      await Promise.all([
        prisma.aIAgentConversation.findMany({
          where: { tenantId, createdAt: { gte: start, lte: end }, isDeleted: false },
          select: {
            id: true,
            status: true,
            _count: { select: { messages: true } },
          },
        }),
        prisma.chatbotIntent.findMany({
          where: { tenantId, isDeleted: false },
          select: { id: true, intentName: true, usageCount: true, averageConfidence: true },
          orderBy: { usageCount: 'desc' },
        }),
        prisma.chatbotEntity.count({
          where: { tenantId, isDeleted: false },
        }),
        prisma.chatbotDialogueFlow.count({
          where: { tenantId, isDeleted: false },
        }),
        prisma.chatbotChannel.findMany({
          where: { tenantId, isDeleted: false },
          select: { channelType: true, isEnabled: true },
        }),
        prisma.chatbotHandoffRule.count({
          where: { tenantId, isDeleted: false, isActive: true },
        }),
      ]);

    const totalConversations = conversations.length;
    const totalIntents = intents.length;
    const totalUsed = intents.reduce((sum, i) => sum + (i.usageCount ?? 0), 0);

    const intentDistribution = intents.map((i) => ({
      intentName: i.intentName,
      count: i.usageCount ?? 0,
      percentage: totalUsed > 0 ? Math.round(((i.usageCount ?? 0) / totalUsed) * 10000) / 100 : 0,
      averageConfidence: i.averageConfidence ?? 0,
    }));

    const topIntents = intentDistribution.slice(0, 5).map((i) => ({
      intentName: i.intentName,
      count: i.count,
      successRate: Math.min(100, Math.round(i.averageConfidence * 100)),
      averageConfidence: i.averageConfidence,
    }));

    const channelBreakdown = channels.map((c) => ({
      channelType: c.channelType,
      conversationCount: 0,
      messageCount: 0,
    }));

    // -- Real computations from conversation + message data --

    const totalMessages = conversations.reduce((sum, c) => sum + c._count.messages, 0);

    const averageConversationLength =
      totalConversations > 0 ? Math.round((totalMessages / totalConversations) * 10) / 10 : 0;

    const completedCount = conversations.filter((c) => c.status !== 'ACTIVE').length;

    const abandonedCount = conversations.filter((c) => c._count.messages <= 1).length;

    const completionRate =
      totalConversations > 0 ? Math.round((completedCount / totalConversations) * 100) : 0;

    const abandonmentRate =
      totalConversations > 0 ? Math.round((abandonedCount / totalConversations) * 100) : 0;

    const averageTurns =
      totalConversations > 0 ? Math.round((totalMessages / totalConversations) * 10) / 10 : 0;

    // -- Response time: avg seconds between first user msg and first assistant response --
    let averageResponseTime = 0;
    if (totalConversations > 0) {
      const conversationIds = conversations.map((c) => c.id);
      const firstMsgs = await prisma.aIAgentMessage.groupBy({
        by: ['conversationId', 'role'],
        _min: { createdAt: true },
        where: {
          conversationId: { in: conversationIds },
          isDeleted: false,
          role: { in: ['user', 'assistant'] },
        },
      });

      const userTimes = new Map<string, Date>();
      const assistantTimes = new Map<string, Date>();
      for (const m of firstMsgs) {
        if (m.role === 'user') userTimes.set(m.conversationId, m._min.createdAt!);
        if (m.role === 'assistant') assistantTimes.set(m.conversationId, m._min.createdAt!);
      }

      let totalSecs = 0;
      let pairs = 0;
      for (const [convId, userTime] of userTimes) {
        const asstTime = assistantTimes.get(convId);
        if (asstTime && asstTime > userTime) {
          totalSecs += (asstTime.getTime() - userTime.getTime()) / 1000;
          pairs++;
        }
      }
      averageResponseTime = pairs > 0 ? Math.round(totalSecs / pairs) : 0;
    }

    const analytics = {
      period: { start, end },
      totalConversations,
      totalMessages,
      totalIntents,
      totalEntities,
      totalFlows,
      averageConversationLength,
      averageResponseTime,
      userSatisfactionScore: undefined,
      intentDistribution,
      topIntents,
      failedIntents: [],
      conversationMetrics: {
        completionRate,
        abandonmentRate,
        handoffRate: totalConversations > 0 ? Math.round((handoffs / totalConversations) * 100) : 0,
        averageTurns,
        resolutionRate: undefined,
      },
      channelBreakdown,
      peakHours: [],
      generatedDate: new Date(),
    };

    return successItem(analytics);
  } catch (error: any) {
    return serverError(error, 'get analytics');
  }
});
