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

async function getRule(tenantId: string, ruleId: string) {
  return prisma.chatbotHandoffRule.findFirst({
    where: { id: ruleId, tenantId, isDeleted: false },
  });
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId } = context.user;
    const record = await getRule(tenantId, context.params.ruleId);
    if (!record) return notFound('HandoffRule');
    return successItem(record);
  } catch (error: any) {
    return serverError(error, 'get handoff rule');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const ruleId = context.params.ruleId;
    const existing = await getRule(tenantId, ruleId);
    if (!existing) return notFound('HandoffRule');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Request body required' });
    const record = await prisma.chatbotHandoffRule.update({
      where: { id: ruleId },
      data: {
        ...(body.ruleName !== undefined && { ruleName: body.ruleName }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.triggers !== undefined && { triggers: body.triggers }),
        ...(body.conditions !== undefined && { conditions: body.conditions }),
        ...(body.action !== undefined && { action: body.action }),
        updatedBy: userId,
      },
    });
    return successItem(record);
  } catch (error: any) {
    return serverError(error, 'update handoff rule');
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const ruleId = context.params.ruleId;
    const existing = await getRule(tenantId, ruleId);
    if (!existing) return notFound('HandoffRule');
    await prisma.chatbotHandoffRule.update({
      where: { id: ruleId },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
    });
    return successItem({ deleted: true });
  } catch (error: any) {
    return serverError(error, 'delete handoff rule');
  }
});
