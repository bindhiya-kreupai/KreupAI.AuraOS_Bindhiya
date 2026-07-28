import { prisma } from '@aura/database';
export const FLOW_AGENT_TYPE = 'CANDIDATE_CHATBOT';
export async function getCandidateFlow(tenantId: string) {
  return prisma.aIAgentConversation
    .findFirst({
      where: { tenantId, agentType: FLOW_AGENT_TYPE, sessionId: 'flow', isDeleted: false },
      orderBy: { updatedAt: 'desc' },
    })
    .catch(() => null);
}
