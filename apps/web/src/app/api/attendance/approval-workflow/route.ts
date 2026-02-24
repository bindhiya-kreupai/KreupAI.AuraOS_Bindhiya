import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const WorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  requestType: z.enum([
    'LEAVE',
    'OVERTIME',
    'COMP_OFF',
    'WFH',
    'SHIFT_SWAP',
    'REGULARIZATION',
    'TIMESHEET',
  ]),
  applicableTo: z.enum(['ALL', 'DEPARTMENT', 'DESIGNATION', 'CUSTOM']),
  departments: z.array(z.string()).optional(),
  designations: z.array(z.string()).optional(),
  employees: z.array(z.string()).optional(),
  approvalLevels: z.array(
    z.object({
      level: z.number(),
      approverType: z.enum(['REPORTING_MANAGER', 'DEPARTMENT_HEAD', 'HR', 'CUSTOM']),
      approvers: z.array(z.string()).optional(),
      isRequired: z.boolean().default(true),
      canSkip: z.boolean().default(false),
      autoApproveAfterDays: z.number().optional(),
    })
  ),
  escalationRules: z.object({
    enabled: z.boolean().default(false),
    escalateAfterDays: z.number().optional(),
    escalateTo: z.array(z.string()).optional(),
  }).optional(),
  isActive: z.boolean().default(true),
});

// In-memory storage for approval workflows (per-tenant)
// Since there is no ApprovalWorkflow Prisma model, we store workflows in memory
// with sensible defaults. In production, this should be backed by a database table.
interface StoredWorkflow {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  requestType: string;
  applicableTo: string;
  departments?: string[];
  designations?: string[];
  employees?: string[];
  approvalLevels: Array<{
    level: number;
    approverType: string;
    approvers?: string[];
    isRequired: boolean;
    canSkip: boolean;
    autoApproveAfterDays?: number;
  }>;
  escalationRules?: {
    enabled: boolean;
    escalateAfterDays?: number;
    escalateTo?: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

const workflowStore = new Map<string, StoredWorkflow[]>();

function getDefaultWorkflows(tenantId: string): StoredWorkflow[] {
  const now = new Date().toISOString();
  return [
    {
      id: `default-leave-${tenantId}`,
      tenantId,
      name: 'Standard Leave Approval',
      description: 'Two-level approval for leave requests',
      requestType: 'LEAVE',
      applicableTo: 'ALL',
      approvalLevels: [
        { level: 1, approverType: 'REPORTING_MANAGER', isRequired: true, canSkip: false },
        { level: 2, approverType: 'HR', isRequired: true, canSkip: false },
      ],
      escalationRules: { enabled: true, escalateAfterDays: 3 },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `default-overtime-${tenantId}`,
      tenantId,
      name: 'Overtime Approval',
      description: 'Single-level approval for overtime requests',
      requestType: 'OVERTIME',
      applicableTo: 'ALL',
      approvalLevels: [
        { level: 1, approverType: 'REPORTING_MANAGER', isRequired: true, canSkip: false, autoApproveAfterDays: 2 },
      ],
      escalationRules: { enabled: false },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `default-regularization-${tenantId}`,
      tenantId,
      name: 'Regularization Approval',
      description: 'Manager approval for attendance regularization',
      requestType: 'REGULARIZATION',
      applicableTo: 'ALL',
      approvalLevels: [
        { level: 1, approverType: 'REPORTING_MANAGER', isRequired: true, canSkip: false },
      ],
      escalationRules: { enabled: true, escalateAfterDays: 2 },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `default-compoff-${tenantId}`,
      tenantId,
      name: 'Comp-Off Approval',
      description: 'Manager approval for compensatory off requests',
      requestType: 'COMP_OFF',
      applicableTo: 'ALL',
      approvalLevels: [
        { level: 1, approverType: 'REPORTING_MANAGER', isRequired: true, canSkip: false },
      ],
      escalationRules: { enabled: false },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `default-wfh-${tenantId}`,
      tenantId,
      name: 'WFH Approval',
      description: 'Manager approval for work from home requests',
      requestType: 'WFH',
      applicableTo: 'ALL',
      approvalLevels: [
        { level: 1, approverType: 'REPORTING_MANAGER', isRequired: true, canSkip: false },
      ],
      escalationRules: { enabled: true, escalateAfterDays: 1 },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `default-shiftswap-${tenantId}`,
      tenantId,
      name: 'Shift Swap Approval',
      description: 'Peer and manager approval for shift swaps',
      requestType: 'SHIFT_SWAP',
      applicableTo: 'ALL',
      approvalLevels: [
        { level: 1, approverType: 'REPORTING_MANAGER', isRequired: true, canSkip: false },
      ],
      escalationRules: { enabled: false },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function getTenantWorkflows(tenantId: string): StoredWorkflow[] {
  if (!workflowStore.has(tenantId)) {
    workflowStore.set(tenantId, getDefaultWorkflows(tenantId));
  }
  return workflowStore.get(tenantId)!;
}

// GET - Fetch approval workflows
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const requestType = searchParams.get('requestType');
      const isActive = searchParams.get('isActive');

      let workflows = getTenantWorkflows(user.tenantId);

      if (requestType) {
        workflows = workflows.filter(w => w.requestType === requestType);
      }
      if (isActive !== null && isActive !== undefined && isActive !== '') {
        workflows = workflows.filter(w => w.isActive === (isActive === 'true'));
      }

      const summary = {
        total: workflows.length,
        active: workflows.filter(w => w.isActive).length,
        inactive: workflows.filter(w => !w.isActive).length,
        byRequestType: {
          leave: workflows.filter(w => w.requestType === 'LEAVE').length,
          overtime: workflows.filter(w => w.requestType === 'OVERTIME').length,
          compOff: workflows.filter(w => w.requestType === 'COMP_OFF').length,
          wfh: workflows.filter(w => w.requestType === 'WFH').length,
          shiftSwap: workflows.filter(w => w.requestType === 'SHIFT_SWAP').length,
          regularization: workflows.filter(w => w.requestType === 'REGULARIZATION').length,
          timesheet: workflows.filter(w => w.requestType === 'TIMESHEET').length,
        },
      };

      return NextResponse.json({
        success: true,
        data: { workflows, summary },
        meta: { total: workflows.length },
      });
    } catch (error) {
      logger.error({ error }, 'Error fetching approval workflows:');
      return NextResponse.json(
        { success: false, error: 'Failed to fetch approval workflows' },
        { status: 500 }
      );
    }
  }
);

// POST - Create approval workflow
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = WorkflowSchema.parse(body);

      const now = new Date().toISOString();
      const newWorkflow: StoredWorkflow = {
        id: crypto.randomUUID(),
        tenantId: user.tenantId,
        ...data,
        createdAt: now,
        updatedAt: now,
        createdBy: user.userId,
      };

      const workflows = getTenantWorkflows(user.tenantId);
      workflows.push(newWorkflow);
      workflowStore.set(user.tenantId, workflows);

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'CREATE',
          entityType: 'Attendance - Approval Workflow',
          details: `Created approval workflow: ${data.name} for ${data.requestType}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newWorkflow }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error({ error }, 'Error creating approval workflow:');
      return NextResponse.json(
        { success: false, error: 'Failed to create approval workflow' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update approval workflow
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { id, ...updates } = body;

      if (!id) {
        return NextResponse.json(
          { success: false, error: 'Workflow ID is required' },
          { status: 400 }
        );
      }

      const workflows = getTenantWorkflows(user.tenantId);
      const index = workflows.findIndex(w => w.id === id);

      if (index === -1) {
        return NextResponse.json(
          { success: false, error: 'Workflow not found' },
          { status: 404 }
        );
      }

      const updated: StoredWorkflow = {
        ...workflows[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      workflows[index] = updated;
      workflowStore.set(user.tenantId, workflows);

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'UPDATE',
          entityType: 'Attendance - Approval Workflow',
          details: `Updated approval workflow: ${id}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } catch (error) {
      logger.error({ error }, 'Error updating approval workflow:');
      return NextResponse.json(
        { success: false, error: 'Failed to update approval workflow' },
        { status: 500 }
      );
    }
  }
);

// DELETE - Delete approval workflow
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.DELETE, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: 'Workflow ID is required' },
          { status: 400 }
        );
      }

      const workflows = getTenantWorkflows(user.tenantId);
      const index = workflows.findIndex(w => w.id === id);

      if (index === -1) {
        return NextResponse.json(
          { success: false, error: 'Workflow not found' },
          { status: 404 }
        );
      }

      workflows.splice(index, 1);
      workflowStore.set(user.tenantId, workflows);

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'DELETE',
          entityType: 'Attendance - Approval Workflow',
          details: `Deleted approval workflow: ${id}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, message: 'Approval workflow deleted successfully' });
    } catch (error) {
      logger.error({ error }, 'Error deleting approval workflow:');
      return NextResponse.json(
        { success: false, error: 'Failed to delete approval workflow' },
        { status: 500 }
      );
    }
  }
);
