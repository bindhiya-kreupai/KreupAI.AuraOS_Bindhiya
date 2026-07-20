import type { NextRequest } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';

const SETTINGS_KEY = 'workflow_engine_settings';

const DEFAULT_SETTINGS = {
  defaultExecutionTimeout: 60,
  maxConcurrentExecutions: 10,
  enableAutoRetry: true,
  defaultRetryAttempts: 3,
  defaultRetryDelay: 30,
  defaultApprovalTimeout: 48,
  enableAutoEscalation: true,
  defaultEscalationTime: 24,
  allowDelegation: true,
  enableNotifications: true,
  notifyOnApprovalRequest: true,
  notifyOnApprovalDecision: true,
  notifyOnTaskAssignment: true,
  notifyOnWorkflowCompletion: true,
  notifyOnWorkflowFailure: true,
  requireApprovalForPublish: false,
  enableAuditLog: true,
  dataRetentionDays: 365,
  allowExternalIntegrations: true,
  enableVersionControl: true,
  enableDraftMode: true,
  enableTesting: true,
  maxWorkflowNodes: 100,
};

export const GET = createProtectedRoute(
  async (_request: NextRequest, { auth }) => {
    const tenantId = auth!.tenantId;

    const existing = await prisma.workflowDefinition.findFirst({
      where: { tenantId, processType: SETTINGS_KEY, isDeleted: false },
    });

    if (existing && existing.triggerEvent) {
      try {
        const settings = JSON.parse(existing.triggerEvent as string);
        return {
          success: true,
          data: {
            ...DEFAULT_SETTINGS,
            ...settings,
            createdDate: existing.createdAt,
            lastModified: existing.updatedAt,
          },
        };
      } catch {
        return {
          success: true,
          data: {
            ...DEFAULT_SETTINGS,
            createdDate: existing.createdAt,
            lastModified: existing.updatedAt,
          },
        };
      }
    }

    return {
      success: true,
      data: {
        ...DEFAULT_SETTINGS,
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  },
  { requiredPermissions: ['workflow:read'], rateLimit: 'API_USER' }
);

export const PUT = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const tenantId = auth!.tenantId;
    const body = await request.json();
    const settings = { ...DEFAULT_SETTINGS, ...body };

    const existing = await prisma.workflowDefinition.findFirst({
      where: { tenantId, processType: SETTINGS_KEY, isDeleted: false },
    });

    if (existing) {
      await prisma.workflowDefinition.update({
        where: { id: existing.id },
        data: {
          triggerEvent: JSON.stringify(settings),
          updatedAt: new Date(),
          updatedBy: auth!.userId,
        },
      });
    } else {
      await prisma.workflowDefinition.create({
        data: {
          tenantId,
          processType: SETTINGS_KEY,
          name: 'Workflow Engine Settings',
          description: 'System settings for workflow engine',
          trigger: 'SYSTEM',
          triggerEvent: JSON.stringify(settings),
          nodes: [],
          edges: [],
          status: 'ACTIVE',
          isActive: true,
          createdBy: auth!.userId,
        },
      });
    }

    return { success: true, data: settings };
  },
  { requiredPermissions: ['workflow:write'], rateLimit: 'API_USER' }
);
