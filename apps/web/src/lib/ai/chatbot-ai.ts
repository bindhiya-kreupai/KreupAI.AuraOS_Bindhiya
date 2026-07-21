import { prisma } from '@aura/database';
import { emptyCandidateFlow } from './chatbot-fallback';
import { getCandidateFlow, FLOW_AGENT_TYPE } from './chatbot-retrieval';
import { answerCandidateIntent } from './chatbot-rules';

export async function loadCandidateFlow(tenantId: string) {
  const flow = await getCandidateFlow(tenantId);
  if (!flow?.metadata || typeof flow.metadata !== 'object') {
    return emptyCandidateFlow();
  }
  const metadata = flow.metadata as { nodes?: unknown[]; edges?: unknown[] };
  return {
    nodes: Array.isArray(metadata.nodes) ? metadata.nodes : [],
    edges: Array.isArray(metadata.edges) ? metadata.edges : [],
    updatedAt: flow.updatedAt.toISOString(),
  };
}
export async function saveCandidateFlow(
  tenantId: string,
  userId: string,
  nodes: unknown[],
  edges: unknown[],
  name?: string
) {
  const existing = await getCandidateFlow(tenantId);
  const metadata = JSON.parse(JSON.stringify({ nodes, edges }));
  const flow = existing
    ? await prisma.aIAgentConversation.update({
        where: { id: existing.id },
        data: { metadata, title: name || existing.title, updatedBy: userId },
      })
    : await prisma.aIAgentConversation.create({
        data: {
          tenantId,
          userId,
          agentType: FLOW_AGENT_TYPE,
          sessionId: 'flow',
          title: name || 'Candidate chatbot flow',
          metadata,
          createdBy: userId,
        },
      });
  return { nodes, edges, updatedAt: flow.updatedAt.toISOString() };
}
export async function chatWithCandidateBot(
  tenantId: string,
  userId: string,
  message: string,
  sessionId?: string
) {
  const sid = sessionId || crypto.randomUUID();
  let conversation = await prisma.aIAgentConversation
    .findFirst({
      where: { tenantId, userId, agentType: FLOW_AGENT_TYPE, sessionId: sid, isDeleted: false },
    })
    .catch(() => null);
  if (!conversation) {
    conversation = await prisma.aIAgentConversation
      .create({
        data: {
          tenantId,
          userId,
          agentType: FLOW_AGENT_TYPE,
          sessionId: sid,
          title: 'Candidate chat',
          createdBy: userId,
        },
      })
      .catch(() => null);
  }
  const flow = await getCandidateFlow(tenantId);
  const metadata = (flow?.metadata ?? {}) as { nodes?: unknown[] };
  const reply = answerCandidateIntent(message, Array.isArray(metadata.nodes) ? metadata.nodes : []);
  if (conversation) {
    await prisma.aIAgentMessage
      .createMany({
        data: [
          { conversationId: conversation.id, role: 'user', content: message, createdBy: userId },
          {
            conversationId: conversation.id,
            role: 'assistant',
            content: reply.response,
            actionResult: JSON.parse(JSON.stringify(reply.actions ?? null)),
            createdBy: userId,
          },
        ],
      })
      .catch(() => undefined);
  }
  return {
    sessionId: sid,
    messageId: crypto.randomUUID(),
    ...reply,
    timestamp: new Date().toISOString(),
  };
}
export async function getCandidateSessions(tenantId: string, userId: string) {
  return prisma.aIAgentConversation
    .findMany({
      where: {
        tenantId,
        userId,
        agentType: FLOW_AGENT_TYPE,
        sessionId: { not: 'flow' },
        isDeleted: false,
      },
      orderBy: { updatedAt: 'desc' },
      take: 30,
      select: { id: true, sessionId: true, title: true, updatedAt: true },
    })
    .catch(() => []);
}
