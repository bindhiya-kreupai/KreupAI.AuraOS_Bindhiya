/**
 * DB-backed agent session and message persistence
 */

import { prisma } from '@aura/database';
import type { AgentTypeValue } from './agent-types';
import type { ChatHistoryItem } from './llm-client';

export type AgentSession = {
  id: string;
  sessionId: string;
  tenantId: string;
  userId: string;
  agentType: AgentTypeValue;
  title: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function getOrCreateSession(
  tenantId: string,
  userId: string,
  agentType: AgentTypeValue,
  sessionId?: string
): Promise<AgentSession> {
  const sid = sessionId || crypto.randomUUID();

  if (sessionId) {
    const existing = await prisma.aIAgentConversation.findFirst({
      where: { tenantId, userId, agentType, sessionId: sid, isDeleted: false },
    });
    if (existing) {
      return {
        id: existing.id,
        sessionId: existing.sessionId,
        tenantId: existing.tenantId,
        userId: existing.userId,
        agentType: existing.agentType as AgentTypeValue,
        title: existing.title,
        status: existing.status,
        createdAt: existing.createdAt,
        updatedAt: existing.updatedAt,
      };
    }
  }

  const created = await prisma.aIAgentConversation.create({
    data: {
      tenantId,
      userId,
      agentType,
      sessionId: sid,
      title: `${agentType} session`,
      createdBy: userId,
    },
  });

  return {
    id: created.id,
    sessionId: created.sessionId,
    tenantId: created.tenantId,
    userId: created.userId,
    agentType: created.agentType as AgentTypeValue,
    title: created.title,
    status: created.status,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  };
}

export async function listSessions(
  tenantId: string,
  userId: string,
  agentType?: AgentTypeValue
): Promise<AgentSession[]> {
  const rows = await prisma.aIAgentConversation.findMany({
    where: {
      tenantId,
      userId,
      isDeleted: false,
      ...(agentType ? { agentType } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    take: 30,
  });

  return rows.map((r) => ({
    id: r.id,
    sessionId: r.sessionId,
    tenantId: r.tenantId,
    userId: r.userId,
    agentType: r.agentType as AgentTypeValue,
    title: r.title,
    status: r.status,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

export async function getSessionById(
  tenantId: string,
  userId: string,
  sessionId: string
): Promise<
  | (AgentSession & {
      messages: Array<{
        role: string;
        content: string;
        actionTaken?: string | null;
        createdAt: Date;
      }>;
    })
  | null
> {
  const conv = await prisma.aIAgentConversation.findFirst({
    where: { tenantId, userId, sessionId, isDeleted: false },
    include: {
      messages: {
        where: { isDeleted: false },
        orderBy: { createdAt: 'asc' },
        take: 50,
      },
    },
  });
  if (!conv) return null;

  return {
    id: conv.id,
    sessionId: conv.sessionId,
    tenantId: conv.tenantId,
    userId: conv.userId,
    agentType: conv.agentType as AgentTypeValue,
    title: conv.title,
    status: conv.status,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
    messages: conv.messages.map((m) => ({
      role: m.role,
      content: m.content,
      actionTaken: m.actionTaken,
      createdAt: m.createdAt,
    })),
  };
}

export async function deleteSession(
  tenantId: string,
  userId: string,
  sessionId: string
): Promise<boolean> {
  const conv = await prisma.aIAgentConversation.findFirst({
    where: { tenantId, userId, sessionId, isDeleted: false },
  });
  if (!conv) return false;
  await prisma.aIAgentConversation.update({
    where: { id: conv.id },
    data: { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
  });
  return true;
}

export async function loadChatHistory(conversationId: string): Promise<ChatHistoryItem[]> {
  const messages = await prisma.aIAgentMessage.findMany({
    where: { conversationId, isDeleted: false },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
}

export async function persistChatTurn(
  conversationId: string,
  userId: string,
  userMessage: string,
  assistantMessage: string,
  actionTaken?: string,
  actionResult?: unknown
): Promise<void> {
  await prisma.aIAgentMessage.createMany({
    data: [
      { conversationId, role: 'user', content: userMessage, createdBy: userId },
      {
        conversationId,
        role: 'assistant',
        content: assistantMessage,
        actionTaken: actionTaken ?? null,
        actionResult: actionResult != null ? JSON.parse(JSON.stringify(actionResult)) : undefined,
        createdBy: userId,
      },
    ],
  });
  await prisma.aIAgentConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date(), updatedBy: userId },
  });
}

export async function getAgentMetricsSummary(tenantId: string, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const agentTypes = ['HR_AGENT', 'RECRUITMENT_AGENT', 'ANALYTICS_AGENT'];

  const conversations = await prisma.aIAgentConversation.findMany({
    where: { tenantId, isDeleted: false, createdAt: { gte: since }, agentType: { in: agentTypes } },
    select: { agentType: true, id: true },
  });

  const convByType = new Map<string, string[]>();
  for (const t of agentTypes) convByType.set(t, []);
  for (const c of conversations) {
    convByType.get(c.agentType)?.push(c.id);
  }

  const byAgent: Record<
    string,
    { total: number; success: number; topActions: Record<string, number> }
  > = {};
  let totalTasks = 0;

  for (const t of agentTypes) {
    const ids = convByType.get(t) || [];
    const messages = ids.length
      ? await prisma.aIAgentMessage.findMany({
          where: { conversationId: { in: ids }, role: 'assistant', isDeleted: false },
          select: { actionTaken: true },
        })
      : [];
    const topActions: Record<string, number> = {};
    for (const m of messages) {
      if (m.actionTaken) topActions[m.actionTaken] = (topActions[m.actionTaken] || 0) + 1;
    }
    byAgent[t] = { total: ids.length, success: messages.length, topActions };
    totalTasks += messages.length;
  }

  return {
    totalTasks,
    avgResponseTimeMs: 0,
    successRate: totalTasks > 0 ? 1 : 0,
    activeAgents: 3,
    byAgent,
    periodDays: days,
  };
}

export async function getAgentMetricsByType(
  tenantId: string,
  agentType: AgentTypeValue,
  days = 30
) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const conversations = await prisma.aIAgentConversation.findMany({
    where: { tenantId, agentType, isDeleted: false, createdAt: { gte: since } },
    select: { id: true },
  });
  const convIds = conversations.map((c) => c.id);
  const messages = convIds.length
    ? await prisma.aIAgentMessage.findMany({
        where: { conversationId: { in: convIds }, role: 'assistant', isDeleted: false },
        select: { actionTaken: true },
      })
    : [];

  const topActions: Record<string, number> = {};
  for (const m of messages) {
    if (m.actionTaken) {
      topActions[m.actionTaken] = (topActions[m.actionTaken] || 0) + 1;
    }
  }

  const topActionsList = Object.entries(topActions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([action, count]) => ({ action, count }));

  return {
    agentType,
    totalRequests: messages.length,
    successful: messages.length,
    failed: 0,
    avgResponseTime: 0,
    uptime: 0,
    topActions: topActionsList,
  };
}
