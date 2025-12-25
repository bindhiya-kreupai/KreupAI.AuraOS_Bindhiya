import type { NextRequest} from 'next/server';
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

// GET - Fetch approval workflows
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const requestType = searchParams.get('requestType');
      const isActive = searchParams.get('isActive');

      const mockWorkflows = [
        {
          id: '1',
          name: 'Standard Leave Approval',
          description: 'Two-level approval for leave requests',
          requestType: 'LEAVE',
          applicableTo: 'ALL',
          approvalLevels: [
            {
              level: 1,
              approverType: 'REPORTING_MANAGER',
              isRequired: true,
              canSkip: false,
            },
            {
              level: 2,
              approverType: 'HR',
              approvers: ['hr-1', 'hr-2'],
              isRequired: true,
              canSkip: false,
            },
          ],
          escalationRules: {
            enabled: true,
            escalateAfterDays: 3,
            escalateTo: ['hr-manager'],
          },
          isActive: true,
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00',
        },
        {
          id: '2',
          name: 'Quick Overtime Approval',
          description: 'Single-level approval for overtime',
          requestType: 'OVERTIME',
          applicableTo: 'ALL',
          approvalLevels: [
            {
              level: 1,
              approverType: 'REPORTING_MANAGER',
              isRequired: true,
              canSkip: false,
              autoApproveAfterDays: 2,
            },
          ],
          escalationRules: {
            enabled: false,
          },
          isActive: true,
          createdAt: '2024-01-15T00:00:00',
          updatedAt: '2024-01-15T00:00:00',
        },
        {
          id: '3',
          name: 'Engineering WFH Approval',
          description: 'Department-specific WFH approval workflow',
          requestType: 'WFH',
          applicableTo: 'DEPARTMENT',
          departments: ['Engineering', 'Product'],
          approvalLevels: [
            {
              level: 1,
              approverType: 'REPORTING_MANAGER',
              isRequired: true,
              canSkip: false,
            },
          ],
          escalationRules: {
            enabled: true,
            escalateAfterDays: 1,
            escalateTo: ['dept-head'],
          },
          isActive: true,
          createdAt: '2024-02-01T00:00:00',
          updatedAt: '2024-02-01T00:00:00',
        },
        {
          id: '4',
          name: 'Executive Regularization',
          description: 'Fast-track approval for executives',
          requestType: 'REGULARIZATION',
          applicableTo: 'DESIGNATION',
          designations: ['VP', 'Director', 'C-Level'],
          approvalLevels: [
            {
              level: 1,
              approverType: 'HR',
              approvers: ['hr-manager'],
              isRequired: false,
              canSkip: true,
              autoApproveAfterDays: 1,
            },
          ],
          escalationRules: {
            enabled: false,
          },
          isActive: true,
          createdAt: '2024-03-01T00:00:00',
          updatedAt: '2024-03-01T00:00:00',
        },
      ];

      let filteredData = mockWorkflows;
      if (requestType) filteredData = filteredData.filter(w => w.requestType === requestType);
      if (isActive !== null) filteredData = filteredData.filter(w => w.isActive === (isActive === 'true'));

      const summary = {
        total: filteredData.length,
        active: filteredData.filter(w => w.isActive).length,
        inactive: filteredData.filter(w => !w.isActive).length,
        byRequestType: {
          leave: filteredData.filter(w => w.requestType === 'LEAVE').length,
          overtime: filteredData.filter(w => w.requestType === 'OVERTIME').length,
          compOff: filteredData.filter(w => w.requestType === 'COMP_OFF').length,
          wfh: filteredData.filter(w => w.requestType === 'WFH').length,
          shiftSwap: filteredData.filter(w => w.requestType === 'SHIFT_SWAP').length,
          regularization: filteredData.filter(w => w.requestType === 'REGULARIZATION').length,
          timesheet: filteredData.filter(w => w.requestType === 'TIMESHEET').length,
        },
      };

      return NextResponse.json({
        success: true,
        data: { workflows: filteredData, summary },
        meta: { total: filteredData.length },
      });
    } catch {
      logger.error('Error fetching approval workflows:', error);
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

      const newWorkflow = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.userId,
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Attendance - Approval Workflow',
          details: `Created approval workflow: ${data.name} for ${data.requestType}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newWorkflow }, { status: 201 });
    } catch {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating approval workflow:', error);
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

      const updated = {
        id,
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: user.userId,
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'UPDATE',
          module: 'Attendance - Approval Workflow',
          details: `Updated approval workflow: ${id}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } catch {
      logger.error('Error updating approval workflow:', error);
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

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'DELETE',
          module: 'Attendance - Approval Workflow',
          details: `Deleted approval workflow: ${id}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, message: 'Approval workflow deleted successfully' });
    } catch {
      logger.error('Error deleting approval workflow:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete approval workflow' },
        { status: 500 }
      );
    }
  }
);
