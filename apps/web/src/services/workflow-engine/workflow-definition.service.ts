// @ts-nocheck — Prisma schema drift tolerance. Tracked under #29.
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

export class WorkflowDefinitionService {
  async list(
    tenantId: string,
    filters?: { processType?: string; status?: string; isActive?: boolean }
  ) {
    const where: any = { tenantId, isDeleted: false };
    if (filters?.processType) where.processType = filters.processType;
    if (filters?.status) where.status = filters.status;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    const definitions = await prisma.workflowDefinition.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { instances: true } } },
    });

    return { success: true, data: definitions };
  }

  async getById(id: string, tenantId: string) {
    const definition = await prisma.workflowDefinition.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: { instances: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
    if (!definition) return null;
    return definition;
  }

  async create(data: {
    tenantId: string;
    processType: string;
    name: string;
    description?: string;
    trigger: string;
    triggerEvent?: string;
    nodes: any;
    edges: any;
    createdBy: string;
  }) {
    try {
      const definition = await prisma.workflowDefinition.create({
        data: {
          tenantId: data.tenantId,
          processType: data.processType,
          name: data.name,
          description: data.description,
          trigger: data.trigger,
          triggerEvent: data.triggerEvent,
          nodes: data.nodes,
          edges: data.edges,
          status: 'DRAFT',
          createdBy: data.createdBy,
        },
      });
      return { success: true, data: definition };
    } catch (error: any) {
      logger.error({ error, tenantId: data.tenantId }, 'Failed to create workflow definition');
      return {
        success: false,
        message: 'Failed to create workflow definition',
        error: error.message,
      };
    }
  }

  async update(
    id: string,
    tenantId: string,
    data: {
      name?: string;
      description?: string;
      trigger?: string;
      triggerEvent?: string;
      nodes?: any;
      edges?: any;
      processType?: string;
      updatedBy: string;
    }
  ) {
    try {
      const existing = await prisma.workflowDefinition.findFirst({
        where: { id, tenantId, isDeleted: false },
      });
      if (!existing) return { success: false, message: 'Workflow definition not found' };

      const updated = await prisma.workflowDefinition.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
      return { success: true, data: updated };
    } catch (error: any) {
      logger.error({ error, id, tenantId }, 'Failed to update workflow definition');
      return {
        success: false,
        message: 'Failed to update workflow definition',
        error: error.message,
      };
    }
  }

  async activate(id: string, tenantId: string, userId: string) {
    try {
      const existing = await prisma.workflowDefinition.findFirst({
        where: { id, tenantId, isDeleted: false },
      });
      if (!existing) return { success: false, message: 'Workflow definition not found' };

      const updated = await prisma.workflowDefinition.update({
        where: { id },
        data: { status: 'ACTIVE', isActive: true, updatedBy: userId, updatedAt: new Date() },
      });
      return { success: true, data: updated };
    } catch (error: any) {
      logger.error({ error, id, tenantId }, 'Failed to activate workflow definition');
      return {
        success: false,
        message: 'Failed to activate workflow definition',
        error: error.message,
      };
    }
  }

  async deactivate(id: string, tenantId: string, userId: string) {
    try {
      const existing = await prisma.workflowDefinition.findFirst({
        where: { id, tenantId, isDeleted: false },
      });
      if (!existing) return { success: false, message: 'Workflow definition not found' };

      const updated = await prisma.workflowDefinition.update({
        where: { id },
        data: { status: 'DEPRECATED', isActive: false, updatedBy: userId, updatedAt: new Date() },
      });
      return { success: true, data: updated };
    } catch (error: any) {
      logger.error({ error, id, tenantId }, 'Failed to deactivate workflow definition');
      return {
        success: false,
        message: 'Failed to deactivate workflow definition',
        error: error.message,
      };
    }
  }

  async remove(id: string, tenantId: string) {
    try {
      const existing = await prisma.workflowDefinition.findFirst({
        where: { id, tenantId, isDeleted: false },
      });
      if (!existing) return { success: false, message: 'Workflow definition not found' };

      await prisma.workflowDefinition.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() },
      });
      return { success: true, message: 'Workflow definition deleted' };
    } catch (error: any) {
      logger.error({ error, id, tenantId }, 'Failed to delete workflow definition');
      return {
        success: false,
        message: 'Failed to delete workflow definition',
        error: error.message,
      };
    }
  }

  async getActiveByProcessType(processType: string, tenantId: string) {
    return prisma.workflowDefinition.findFirst({
      where: { processType, tenantId, status: 'ACTIVE', isActive: true, isDeleted: false },
      orderBy: { version: 'desc' },
    });
  }

  async getStats(tenantId: string) {
    const [total, active, draft, deprecated] = await Promise.all([
      prisma.workflowDefinition.count({ where: { tenantId, isDeleted: false } }),
      prisma.workflowDefinition.count({ where: { tenantId, isDeleted: false, status: 'ACTIVE' } }),
      prisma.workflowDefinition.count({ where: { tenantId, isDeleted: false, status: 'DRAFT' } }),
      prisma.workflowDefinition.count({
        where: { tenantId, isDeleted: false, status: 'DEPRECATED' },
      }),
    ]);
    return { total, active, draft, deprecated };
  }
}

export const workflowDefinitionService = new WorkflowDefinitionService();
export default workflowDefinitionService;
