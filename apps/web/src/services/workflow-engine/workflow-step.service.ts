// @ts-nocheck — Prisma schema drift tolerance. Tracked under #29.
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

export class WorkflowStepService {
  async createSteps(instanceId: string, definitionId: string, nodes: any[]) {
    const steps = await Promise.all(
      nodes.map((node, index) =>
        prisma.workflowStep.create({
          data: {
            instanceId,
            definitionId,
            stepId: node.id,
            stepType: node.type || 'SYSTEM_AUTOMATED',
            stepName: node.name || node.id,
            status: index === 0 ? 'IN_PROGRESS' : 'PENDING',
            sequenceNumber: index,
          },
        })
      )
    );
    return steps;
  }

  async advanceToStep(instanceId: string, stepId: string) {
    try {
      const step = await prisma.workflowStep.findFirst({
        where: { id: stepId, instanceId },
      });
      if (!step) return { success: false, message: 'Step not found' };

      const updated = await prisma.workflowStep.update({
        where: { id: stepId },
        data: { status: 'IN_PROGRESS', startedAt: new Date() },
      });

      await prisma.workflowInstance.update({
        where: { id: instanceId },
        data: { currentStepId: stepId, status: 'IN_PROGRESS', updatedAt: new Date() },
      });

      return { success: true, data: updated };
    } catch (error: any) {
      logger.error({ error, instanceId, stepId }, 'Failed to advance to step');
      return { success: false, message: 'Failed to advance step', error: error.message };
    }
  }

  async completeStep(
    stepId: string,
    outcome: string,
    options?: {
      outcomeReasonCode?: string;
      outcomeComment?: string;
      outcomeBy?: string;
    }
  ) {
    try {
      const updated = await prisma.workflowStep.update({
        where: { id: stepId },
        data: {
          status: 'COMPLETED',
          outcome,
          outcomeReasonCode: options?.outcomeReasonCode,
          outcomeComment: options?.outcomeComment,
          outcomeBy: options?.outcomeBy,
          completedAt: new Date(),
        },
      });
      return { success: true, data: updated };
    } catch (error: any) {
      logger.error({ error, stepId }, 'Failed to complete step');
      return { success: false, message: 'Failed to complete step', error: error.message };
    }
  }

  async failStep(stepId: string, errorDetails: any) {
    try {
      const updated = await prisma.workflowStep.update({
        where: { id: stepId },
        data: {
          status: 'FAILED',
          errorDetails,
          completedAt: new Date(),
        },
      });
      return { success: true, data: updated };
    } catch (error: any) {
      logger.error({ error, stepId }, 'Failed to mark step as failed');
      return { success: false, message: 'Failed to mark step as failed', error: error.message };
    }
  }

  async getStepsByInstance(instanceId: string) {
    try {
      return await prisma.workflowStep.findMany({
        where: { instanceId },
        orderBy: { sequenceNumber: 'asc' },
        include: { tasks: true },
      });
    } catch (error: any) {
      logger.error({ error, instanceId }, 'Failed to get steps');
      return [];
    }
  }
}

export const workflowStepService = new WorkflowStepService();
export default workflowStepService;
