// @ts-nocheck — Prisma schema drift tolerance. Tracked under #29.
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

export class WorkflowAuditService {
  async getByInstance(instanceId: string, options?: { limit?: number; offset?: number }) {
    try {
      const limit = options?.limit || 100;
      const offset = options?.offset || 0;

      const [logs, total] = await Promise.all([
        prisma.workflowAuditLog.findMany({
          where: { instanceId },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        prisma.workflowAuditLog.count({ where: { instanceId } }),
      ]);

      return { success: true, data: logs, total };
    } catch (error: any) {
      logger.error({ error, instanceId }, 'Failed to get audit logs');
      return { success: false, data: [], total: 0, error: error.message };
    }
  }

  async list(
    tenantId: string,
    filters?: {
      eventType?: string;
      actorId?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const skip = (page - 1) * limit;

    const where: any = {
      instance: { tenantId, isDeleted: false },
    };
    if (filters?.eventType) where.eventType = filters.eventType;
    if (filters?.actorId) where.actorId = filters.actorId;
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    try {
      const [logs, total] = await Promise.all([
        prisma.workflowAuditLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            instance: {
              select: { referenceNumber: true, processType: true },
            },
          },
        }),
        prisma.workflowAuditLog.count({ where }),
      ]);

      return {
        success: true,
        data: logs,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error: any) {
      logger.error({ error, tenantId }, 'Failed to list audit logs');
      return {
        success: false,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        error: error.message,
      };
    }
  }
}

export const workflowAuditService = new WorkflowAuditService();
export default workflowAuditService;
