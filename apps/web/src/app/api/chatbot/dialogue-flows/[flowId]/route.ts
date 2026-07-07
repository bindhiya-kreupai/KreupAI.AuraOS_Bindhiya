import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  safeJson,
  serverError,
  successItem,
  notFound,
  validationError,
} from '@/lib/api/crud-helpers';

async function getFlow(tenantId: string, flowId: string) {
  return prisma.chatbotDialogueFlow.findFirst({
    where: { id: flowId, tenantId, isDeleted: false },
  });
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId } = context.user;
    const flowId = context.params.flowId;
    const record = await getFlow(tenantId, flowId);
    if (!record) return notFound('DialogueFlow');
    return successItem(record);
  } catch (error: any) {
    return serverError(error, 'get dialogue flow');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const flowId = context.params.flowId;
    const existing = await getFlow(tenantId, flowId);
    if (!existing) return notFound('DialogueFlow');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Request body required' });
    const record = await prisma.chatbotDialogueFlow.update({
      where: { id: flowId },
      data: {
        ...(body.flowName !== undefined && { flowName: body.flowName }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.nodes !== undefined && { nodes: body.nodes }),
        ...(body.connections !== undefined && { connections: body.connections }),
        ...(body.variables !== undefined && { variables: body.variables }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.version !== undefined && { version: body.version }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.triggerIntents !== undefined && { triggerIntents: body.triggerIntents }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.status === 'published' && { publishedAt: new Date() }),
        updatedBy: userId,
      },
    });
    return successItem(record);
  } catch (error: any) {
    return serverError(error, 'update dialogue flow');
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const flowId = context.params.flowId;
    const existing = await getFlow(tenantId, flowId);
    if (!existing) return notFound('DialogueFlow');
    await prisma.chatbotDialogueFlow.update({
      where: { id: flowId },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
    });
    return successItem({ deleted: true });
  } catch (error: any) {
    return serverError(error, 'delete dialogue flow');
  }
});
