// @ts-nocheck — Prisma schema drift tolerance. Tracked under #29.
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

export class WorkflowInstanceService {
  async list(
    tenantId: string,
    filters?: {
      processType?: string;
      status?: string;
      submittedBy?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = { tenantId, isDeleted: false };
    if (filters?.processType) where.processType = filters.processType;
    if (filters?.status) where.status = filters.status;
    if (filters?.submittedBy) where.submittedBy = filters.submittedBy;

    const [instances, total] = await Promise.all([
      prisma.workflowInstance.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          definition: { select: { name: true, processType: true } },
          _count: { select: { steps: true, tasks: true } },
        },
      }),
      prisma.workflowInstance.count({ where }),
    ]);

    return {
      success: true,
      data: instances,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, tenantId: string) {
    const instance = await prisma.workflowInstance.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        definition: true,
        steps: { orderBy: { sequenceNumber: 'asc' } },
        tasks: { orderBy: { createdAt: 'asc' } },
        auditLogs: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!instance) return null;
    return instance;
  }

  async start(data: {
    tenantId: string;
    definitionId: string;
    processType: string;
    submittedBy: string;
    snapshotData?: Record<string, any>;
    variables?: Record<string, any>;
    documentRef?: string;
    documentType?: string;
  }) {
    try {
      const definition = await prisma.workflowDefinition.findFirst({
        where: {
          id: data.definitionId,
          tenantId: data.tenantId,
          status: 'ACTIVE',
          isDeleted: false,
        },
      });
      if (!definition) {
        return { success: false, message: 'Active workflow definition not found' };
      }

      const refNumber = `WF-${data.processType}-${Date.now().toString(36).toUpperCase()}`;

      const instance = await prisma.workflowInstance.create({
        data: {
          definitionId: data.definitionId,
          tenantId: data.tenantId,
          processType: data.processType,
          definitionVersion: definition.version,
          referenceNumber: refNumber,
          documentRef: data.documentRef,
          documentType: data.documentType,
          status: 'INITIATED',
          submittedBy: data.submittedBy,
          submittedAt: new Date(),
          snapshotData: data.snapshotData || {},
          variables: data.variables || {},
          triggeredBy: data.submittedBy,
          createdBy: data.submittedBy,
        },
      });

      await this.writeAuditLog({
        instanceId: instance.id,
        eventType: 'WORKFLOW_STARTED',
        action: 'START',
        actorId: data.submittedBy,
        newState: { status: 'INITIATED', processType: data.processType },
      });

      return { success: true, data: instance };
    } catch (error: any) {
      logger.error({ error, tenantId: data.tenantId }, 'Failed to start workflow instance');
      return { success: false, message: 'Failed to start workflow', error: error.message };
    }
  }

  async updateStatus(
    id: string,
    tenantId: string,
    status: string,
    options?: {
      outcome?: string;
      error?: string;
      currentStepId?: string;
      completedAt?: Date;
    }
  ) {
    try {
      const instance = await prisma.workflowInstance.findFirst({
        where: { id, tenantId, isDeleted: false },
      });
      if (!instance) return { success: false, message: 'Instance not found' };

      const updated = await prisma.workflowInstance.update({
        where: { id },
        data: {
          status,
          ...(options?.outcome && { outcome: options.outcome }),
          ...(options?.error && { error: options.error }),
          ...(options?.currentStepId && { currentStepId: options.currentStepId }),
          ...(options?.completedAt && { completedAt: options.completedAt }),
          updatedAt: new Date(),
        },
      });
      return { success: true, data: updated };
    } catch (error: any) {
      logger.error({ error, id, tenantId }, 'Failed to update instance status');
      return { success: false, message: 'Failed to update status', error: error.message };
    }
  }

  async cancel(id: string, tenantId: string, userId: string, reason: string) {
    try {
      const instance = await prisma.workflowInstance.findFirst({
        where: { id, tenantId, isDeleted: false },
      });
      if (!instance) return { success: false, message: 'Instance not found' };
      if (['APPROVED', 'REJECTED', 'CANCELLED'].includes(instance.status)) {
        return { success: false, message: 'Instance cannot be cancelled in current status' };
      }

      const updated = await prisma.workflowInstance.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          outcome: 'CANCELLED',
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await this.writeAuditLog({
        instanceId: id,
        eventType: 'WORKFLOW_CANCELLED',
        action: 'CANCEL',
        actorId: userId,
        previousState: { status: instance.status },
        newState: { status: 'CANCELLED', reason },
        comment: reason,
      });

      return { success: true, data: updated };
    } catch (error: any) {
      logger.error({ error, id, tenantId }, 'Failed to cancel workflow instance');
      return { success: false, message: 'Failed to cancel instance', error: error.message };
    }
  }

  async getStats(tenantId: string) {
    const [total, initiated, inProgress, pendingApproval, approved, rejected, cancelled, failed] =
      await Promise.all([
        prisma.workflowInstance.count({ where: { tenantId, isDeleted: false } }),
        prisma.workflowInstance.count({
          where: { tenantId, isDeleted: false, status: 'INITIATED' },
        }),
        prisma.workflowInstance.count({
          where: { tenantId, isDeleted: false, status: 'IN_PROGRESS' },
        }),
        prisma.workflowInstance.count({
          where: { tenantId, isDeleted: false, status: 'PENDING_APPROVAL' },
        }),
        prisma.workflowInstance.count({
          where: { tenantId, isDeleted: false, status: 'APPROVED' },
        }),
        prisma.workflowInstance.count({
          where: { tenantId, isDeleted: false, status: 'REJECTED' },
        }),
        prisma.workflowInstance.count({
          where: { tenantId, isDeleted: false, status: 'CANCELLED' },
        }),
        prisma.workflowInstance.count({ where: { tenantId, isDeleted: false, status: 'FAILED' } }),
      ]);
    return { total, initiated, inProgress, pendingApproval, approved, rejected, cancelled, failed };
  }

  private async writeAuditLog(data: {
    instanceId: string;
    stepId?: string;
    taskId?: string;
    eventType: string;
    action: string;
    actorId?: string;
    actorType?: string;
    previousState?: any;
    newState?: any;
    reasonCode?: string;
    comment?: string;
  }) {
    try {
      await prisma.workflowAuditLog.create({
        data: {
          instanceId: data.instanceId,
          stepId: data.stepId,
          taskId: data.taskId,
          eventType: data.eventType,
          action: data.action,
          actorId: data.actorId,
          actorType: data.actorType || 'USER',
          previousState: data.previousState,
          newState: data.newState,
          reasonCode: data.reasonCode,
          comment: data.comment,
        },
      });
    } catch (error: any) {
      logger.warn({ error, instanceId: data.instanceId }, 'Failed to write audit log');
    }
  }
}

export const workflowInstanceService = new WorkflowInstanceService();
export default workflowInstanceService;
